import asyncio
import logging
import sys
import sqlite3
import json
from os import getenv
from datetime import datetime, timedelta

from aiogram import Bot, Dispatcher, html
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# Bot token
TOKEN = "8677953174:AAFo2stidzYABtiG_43W_zFWFlKh1TtxzYA"

# Mini App URL
MINI_APP_URL = "https://dmitriydzhambek.github.io/Mini-appYacht"

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Инициализация бота
bot = Bot(
    token=TOKEN,
    default=DefaultBotProperties(
        parse_mode=ParseMode.HTML,
        disable_web_page_preview=True
    )
)

# Инициализация диспетчера
dp = Dispatcher()

# Инициализация базы данных
def init_db():
    conn = sqlite3.connect('premium_users.db')
    cursor = conn.cursor()
    
    # Создание таблицы пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            is_premium BOOLEAN DEFAULT 0,
            premium_start_date TEXT,
            premium_end_date TEXT,
            total_steps INTEGER DEFAULT 0,
            total_km REAL DEFAULT 0,
            total_earned REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Создание таблицы подписок
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subscription_type TEXT,
            amount REAL,
            currency TEXT,
            start_date TEXT,
            end_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Создание таблицы платежей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            currency TEXT,
            payment_date TEXT,
            payment_type TEXT,
            telegram_payment_charge_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Классы состояний для FSM
class PremiumStates(StatesGroup):
    choosing_payment = State()

# Функция для получения информации о пользователе
def get_user_info(telegram_id):
    conn = sqlite3.connect('premium_users.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM users WHERE telegram_id = ?
    ''', (telegram_id,))
    
    user = cursor.fetchone()
    conn.close()
    
    return user

# Функция для активации премиум подписки
def activate_premium(telegram_id, amount, currency, payment_type):
    conn = sqlite3.connect('premium_users.db')
    cursor = conn.cursor()
    
    # Обновляем или создаем пользователя
    cursor.execute('''
        INSERT OR REPLACE INTO users 
        (telegram_id, is_premium, premium_start_date, premium_end_date)
        VALUES (?, 1, ?, ?)
    ''', (telegram_id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 
          (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')))
    
    # Получаем ID пользователя
    cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (telegram_id,))
    user_id = cursor.fetchone()[0]
    
    # Добавляем запись о подписке
    cursor.execute('''
        INSERT INTO subscriptions 
        (user_id, subscription_type, amount, currency, start_date, end_date)
        VALUES (?, 'premium', ?, ?, ?, ?)
    ''', (user_id, amount, currency, datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
          (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')))
    
    conn.commit()
    conn.close()

# Обработчик команды /start
@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    """Обработчик команды /start"""
    
    # Сохраняем пользователя в базу данных
    conn = sqlite3.connect('premium_users.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO users 
        (telegram_id, username, first_name, last_name)
        VALUES (?, ?, ?, ?)
    ''', (message.from_user.id, message.from_user.username, 
          message.from_user.first_name, message.from_user.last_name))
    
    conn.commit()
    conn.close()
    
    # Получаем информацию о пользователе
    user_info = get_user_info(message.from_user.id)
    
    if user_info and user_info[4]:  # is_premium
        premium_status = f"👑 Премиум активен до {user_info[6]}"
        premium_text = "✨ Премиум пользователь"
    else:
        premium_status = "🆓 Бесплатный аккаунт"
        premium_text = "🔓 Обычный пользователь"
    
    welcome_text = f"""
🚴‍♂️ Добро пожаловать в <b>VeloPath</b>!

{premium_status}

🎯 <b>Что вы можете делать:</b>
• 📊 Отслеживать активность (шаги, км)
• ⭐ Зарабатывать Stars и рубли
• 🎯 Управлять привычками
• 🌟 Вести сферы жизни
• 👑 Покупать премиум подписку

{premium_text}
    """
    
    # Создаем клавиатуру
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Запустить VeloPath", web_app={"url": MINI_APP_URL})],
            [InlineKeyboardButton(text="👑 Премиум подписка", callback_data="premium_info")],
            [InlineKeyboardButton(text="📊 Моя статистика", callback_data="my_stats")],
            [InlineKeyboardButton(text="❓ Помощь", callback_data="help")]
        ]
    )
    
    await message.answer(welcome_text, reply_markup=keyboard)

# Обработчик команды /premium
@dp.message(Command("premium"))
async def premium_command_handler(message: Message) -> None:
    """Обработчик команды /premium"""
    
    user_info = get_user_info(message.from_user.id)
    
    if user_info and user_info[4]:  # is_premium
        premium_text = f"""
👑 <b>Ваша премиум подписка активна!</b>

📅 Дата активации: {user_info[5]}
📅 Окончание: {user_info[6]}

💎 <b>Преимущества премиум:</b>
• 🚫 Без рекламы
• ⚡ Приоритетная поддержка
• 🎯 Расширенные функции привычек
• 📊 Продвинутая статистика

Спасибо за поддержку проекта! ❤️
        """
    else:
        premium_text = """
👑 <b>VeloPath Premium</b>

💎 <b>Преимущества подписки:</b>
• 🚫 Полностью без рекламы
• ⚡ Приоритетная поддержка 24/7
• 🎯 Расширенные функции привычек
• 📊 Детальная статистика активности
• 🌟 Эксклюзивные достижения

💳 <b>Стоимость:</b>
• Telegram Stars: <b>99⭐/месяц</b>
• YooKassa: <b>99₽/месяц</b>
• Карта, СБП, QIWI

🎁 <b>Специальное предложение:</b>
Попробуйте премиум бесплатно в первый месяц!
        """
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Запустить VeloPath", web_app={"url": MINI_APP_URL})],
            [InlineKeyboardButton(text="💳 Купить премиум", callback_data="buy_premium")],
            [InlineKeyboardButton(text="🔙 Назад", callback_data="back_to_main")]
        ]
    )
    
    await message.answer(premium_text, reply_markup=keyboard)

# Обработчик команды /stats
@dp.message(Command("stats"))
async def stats_command_handler(message: Message) -> None:
    """Обработчик команды /stats"""
    
    user_info = get_user_info(message.from_user.id)
    
    if user_info:
        stats_text = f"""
📊 <b>Ваша статистика VeloPath</b>

👟 <b>Всего шагов:</b> {user_info[7] or 0:,}
📍 <b>Всего км:</b> {user_info[8] or 0:.2f}
💰 <b>Всего заработано:</b> {user_info[9] or 0} ⭐

{'👑 ' if user_info[4] else '🆓 '}<b>Статус:</b> {'Премиум' if user_info[4] else 'Бесплатный'}
{f'📅 Премиум до: {user_info[6]}' if user_info[4] else ''}

🚀 <b>Улучшить результаты:</b> Используйте премиум функции!
        """
    else:
        stats_text = """
📊 <b>Ваша статистика VeloPath</b>

👟 <b>Всего шагов:</b> 0
📍 <b>Всего км:</b> 0.00
💰 <b>Всего заработано:</b> 0 ⭐

🆓 <b>Статус:</b> Бесплатный аккаунт

🚀 <b>Начните отслеживать активность!</b>
        """
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Запустить VeloPath", web_app={"url": MINI_APP_URL})],
            [InlineKeyboardButton(text="👑 Премиум подписка", callback_data="premium_info")]
        ]
    )
    
    await message.answer(stats_text, reply_markup=keyboard)

# Обработчик команды /help
@dp.message(Command("help"))
async def help_command_handler(message: Message) -> None:
    """Обработчик команды /help"""
    
    help_text = """
📖 <b>Справка по VeloPath</b>

🎯 <b>Основные функции:</b>
• 📊 Трекинг активности - отслеживайте шаги и километры
• ⭐ Заработок - конвертируйте активность в Stars и рубли
• 🎯 Привычки - создавайте и отслеживайте полезные привычки
• 🌟 Сферы жизни - управляйте разными аспектами жизни
• 👑 Премиум - расширенные функции без рекламы

💳 <b>Платежи:</b>
• Telegram Stars - 99⭐/месяц
• YooKassa - 99₽/месяц (карта, СБП)

🔄 <b>Конвертация:</b>
• 1000 шагов = 1 ⭐
• 1 км = 10 ₽

📝 <b>Команды:</b>
/start - запуск приложения
/premium - информация о премиум
/stats - ваша статистика
/help - эта справка

🚀 <b>Начать:</b> Нажмите "Запустить VeloPath" ниже
    """
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Запустить VeloPath", web_app={"url": MINI_APP_URL})],
            [InlineKeyboardButton(text="👑 Премиум подписка", callback_data="premium_info")]
        ]
    )
    
    await message.answer(help_text, reply_markup=keyboard)

# Обработчик callback'ов
@dp.callback_query()
async def callback_handler(callback: CallbackQuery) -> None:
    """Обработчик нажатий на inline кнопки"""
    
    if callback.data == "premium_info":
        await premium_command_handler(callback.message)
        await callback.answer()
    
    elif callback.data == "buy_premium":
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⭐ Telegram Stars", callback_data="pay_stars")],
                [InlineKeyboardButton(text="💳 YooKassa (карта)", callback_data="pay_yookassa")],
                [InlineKeyboardButton(text="🔙 Назад", callback_data="premium_info")]
            ]
        )
        
        await callback.message.edit_text(
            "💳 <b>Выберите способ оплаты:</b>\n\n"
            "⭐ <b>Telegram Stars</b> - быстрая оплата через Telegram\n"
            "💳 <b>YooKassa</b> - оплата картой, СБП, QIWI",
            reply_markup=keyboard
        )
        await callback.answer()
    
    elif callback.data == "pay_stars":
        # Создаем инвойс для Telegram Stars
        await bot.send_invoice(
            chat_id=callback.from_user.id,
            title="VeloPath Premium",
            description="👑 Премиум подписка на 1 месяц\n\n• Без рекламы\n• Приоритетная поддержка\n• Расширенные функции",
            payload="premium_subscription_stars",
            provider_token="",  # Не нужен для цифровых товаров
            currency="XTR",
            prices=[
                {"label": "Премиум подписка", "amount": 990}  # 99 Stars
            ],
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="👑 Оплатить", pay=True)]
                ]
            )
        )
        await callback.answer()
    
    elif callback.data == "pay_yookassa":
        await callback.message.edit_text(
            "💳 <b>Оплата через YooKassa</b>\n\n"
            "Для оплаты картой, СБП или QIWI:\n"
            "1. Нажмите кнопку ниже\n"
            "2. Выберите удобный способ оплаты\n"
            "3. Завершите платеж\n\n"
            "🔒 Безопасная оплата через YooKassa",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="💳 Оплатить 99₽", url=f"{MINI_APP_URL}?payment=yookassa")],
                    [InlineKeyboardButton(text="🔙 Назад", callback_data="buy_premium")]
                ]
            )
        )
        await callback.answer()
    
    elif callback.data == "my_stats":
        await stats_command_handler(callback.message)
        await callback.answer()
    
    elif callback.data == "help":
        await help_command_handler(callback.message)
        await callback.answer()
    
    elif callback.data == "back_to_main":
        await command_start_handler(callback.message)
        await callback.answer()

# Обработчик успешных платежей
@dp.message()
async def payment_handler(message: Message) -> None:
    """Обработчик успешных платежей"""
    
    if message.successful_payment:
        user_id = message.from_user.id
        amount = message.successful_payment.total_amount / 100  # Конвертируем из копеек
        currency = message.successful_payment.currency
        
        # Активируем премиум
        activate_premium(user_id, amount, currency, "telegram_stars")
        
        # Отправляем подтверждение
        await message.answer(
            f"🎉 <b>Оплата успешно завершена!</b>\n\n"
            f"💳 Сумма: {amount} {currency}\n"
            f"👑 Ваша премиум подписка активирована!\n"
            f"📅 Действует до: {(datetime.now() + timedelta(days=30)).strftime('%d.%m.%Y')}\n\n"
            f"Спасибо за поддержку VeloPath! ❤️\n\n"
            f"🚀 <b>Запустите приложение чтобы начать:</b>",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="🚀 Запустить VeloPath", web_app={"url": MINI_APP_URL})]
                ]
            )
        )

# Обработчик всех остальных сообщений
@dp.message()
async def echo_handler(message: Message) -> None:
    """Эхо-обработчик для остальных сообщений"""
    
    await message.answer(
        f"👋 Привет, {html.bold(message.from_user.full_name)}!\n\n"
        f"Используйте команды:\n"
        f"/start - запуск приложения\n"
        f"/premium - информация о подписке\n"
        f"/stats - ваша статистика\n"
        f"/help - помощь\n\n"
        f"🚀 Или нажмите кнопку ниже:",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🚀 Запустить VeloPath", web_app={"url": MINI_APP_URL})]
            ]
        )
    )

async def main() -> None:
    """Основная функция"""
    
    # Инициализируем базу данных
    init_db()
    
    # Запускаем бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен")
