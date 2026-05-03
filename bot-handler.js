const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const MINI_APP_URL = 'https://dmitriydzhambek.github.io/Mini-appYacht';

// Инициализация бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// База данных
const db = new sqlite3.Database('premium_users.db');

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    // Сохраняем пользователя в базу данных
    db.run(`
        INSERT OR REPLACE INTO users 
        (telegram_id, username, first_name, last_name, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    `, [user.id, user.username, user.first_name, user.last_name]);
    
    // Получаем статистику пользователя
    db.get(`
        SELECT is_premium, premium_end_date 
        FROM users 
        WHERE telegram_id = ?
    `, [user.id], (err, row) => {
        if (!err && row) {
            const premiumStatus = row.is_premium ? 
                `👑 Премиум активен до ${new Date(row.premium_end_date).toLocaleDateString()}` : 
                '🆓 Бесплатный аккаунт';
            
            const welcomeMessage = `
🚴‍♂️ Добро пожаловать в VeloPath!

${premiumStatus}

🎯 Что вы можете делать:
• 📊 Отслеживать активность (шаги, км)
• ⭐ Зарабатывать Stars и рубли
• 🎯 Управлять привычками
• 🌟 Вести сферы жизни
• 👑 Покупать премиум подписку

🚀 Нажмите кнопку ниже чтобы начать:
            `;
            
            const keyboard = {
                inline_keyboard: [[
                    { text: '🚀 Запустить VeloPath', web_app: { url: MINI_APP_URL } }
                ]]
            };
            
            bot.sendMessage(chatId, welcomeMessage, {
                reply_markup: keyboard,
                parse_mode: 'HTML'
            });
        }
    });
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
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
/help - эта справка
/stats - ваша статистика
/premium - информация о премиум

🚀 <b>Начать:</b> Нажмите "Запустить VeloPath" ниже
    `;
    
    const keyboard = {
        inline_keyboard: [[
            { text: '🚀 Запустить VeloPath', web_app: { url: MINI_APP_URL } }
        ]]
    };
    
    bot.sendMessage(chatId, helpMessage, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
});

// Обработчик команды /stats
bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    db.get(`
        SELECT total_steps, total_km, total_earned, is_premium, premium_end_date
        FROM users u
        LEFT JOIN user_stats us ON u.telegram_id = us.telegram_id
        WHERE u.telegram_id = ?
    `, [userId], (err, row) => {
        if (!err && row) {
            const statsMessage = `
📊 <b>Ваша статистика VeloPath</b>

👟 <b>Всего шагов:</b> ${row.total_steps || 0}
📍 <b>Всего км:</b> ${row.total_km || 0}
💰 <b>Всего заработано:</b> ${row.total_earned || 0} ⭐

${row.is_premium ? 
    `👑 <b>Премиум статус:</b> Активен до ${new Date(row.premium_end_date).toLocaleDateString()}` : 
    '🆓 <b>Статус:</b> Бесплатный аккаунт'
}

🚀 <b>Улучшить результаты:</b> Используйте премиум функции!
            `;
            
            const keyboard = {
                inline_keyboard: [[
                    { text: '🚀 Запустить VeloPath', web_app: { url: MINI_APP_URL } }
                ]]
            };
            
            bot.sendMessage(chatId, statsMessage, {
                reply_markup: keyboard,
                parse_mode: 'HTML'
            });
        }
    });
});

// Обработчик команды /premium
bot.onText(/\/premium/, (msg) => {
    const chatId = msg.chat.id;
    
    const premiumMessage = `
👑 <b>VeloPath Premium</b>

💎 <b>Преимущества премиум:</b>
• 🚫 Без рекламы
• 🗺️ Эксклюзивные маршруты
• 📊 Продвинутая статистика
• ⚡ Приоритетная поддержка
• 🎯 Расширенные функции привычек

💳 <b>Стоимость:</b>
• Telegram Stars: 99⭐/месяц
• YooKassa: 99₽/месяц

🚀 <b>Как получить:</b>
1. Откройте приложение
2. Нажмите "Премиум"
3. Выберите способ оплаты

🎁 <b>Специальное предложение:</b>
Попробуйте премиум бесплатно в первый месяц!
    `;
    
    const keyboard = {
        inline_keyboard: [[
            { text: '👑 Получить премиум', web_app: { url: MINI_APP_URL } },
            { text: 'ℹ️ Подробнее', url: 'https://github.com/DmitriyDzhambek/Mini-appYacht' }
        ]]
    };
    
    bot.sendMessage(chatId, premiumMessage, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
});

// Обработчик callback-кнопок
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    
    // Обработка различных callback действий
    if (data === 'open_app') {
        bot.answerCallbackQuery(callbackQuery.id);
        bot.sendMessage(chatId, '🚀 Открываю VeloPath...', {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🚀 Запустить VeloPath', web_app: { url: MINI_APP_URL } }
                ]]
            }
        });
    }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('Telegram bot polling error:', error);
});

// Запуск бота
console.log('VeloPath Bot запущен...');
console.log(`Mini App URL: ${MINI_APP_URL}`);

module.exports = bot;
