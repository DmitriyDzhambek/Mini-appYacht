# VeloPath - Telegram Mini App

Приложение для отслеживания физической активности с наградами в Telegram.

## 🚀 Возможности

- 🚴 **Трекинг активности**: Отслеживание прогулок, пробежек, велопоездок
- 📍 **GPS трекинг**: Построение маршрутов с использованием геолокации
- 👟 **Шагомер**: Автоматический подсчет шагов
- ⭐ **Награды**: Заработок Telegram Stars и рублей за активность
- 💳 **Кошелек**: Конвертация шагов в Stars и километров в рубли
- 📊 **Статистика**: Детальная статистика маршрутов и достижений
- 🏅 **Достижения**: Система бейджей за выполнение целей
- 💸 **Вывод средств**: Возможность вывода заработанных средств
- 📱 **Telegram интеграция**: Полная интеграция с Telegram WebApp API
- 💰 **Монетизация**: Rewarded Ads, Offer Wall, Affiliate, Premium, Referral
- 👑 **Premium подписка**: 99 Stars/месяц с расширенными функциями
- 🌟 **Сферы жизни**: Управление мыслями и привычками
- 💳 **Telegram Stars**: Реальные платежи через Telegram

## 🛠 Технологии

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js + Express
- **Telegram**: Telegram WebApp API + Bot API
- **База данных**: SQLite3
- **Платежи**: Telegram Stars API
- **Хранение**: localStorage + SQLite
- **Геолокация**: Geolocation API
- **Деплой**: Vercel (статический сайт) + Heroku (payment server)
- **Монетизация**: Telegram Stars + Rewarded Ads + Affiliate Marketing

## 🚀 Быстрый запуск

### 1. Развертывание на Vercel
1. Перейдите: https://vercel.com/new
2. GitHub → DmitriyDzhambek/Mini-appYacht
3. Настройки:
   - Name: `mini-app-yacht`
   - Framework: `Other`
   - Root: `/`
4. Deploy

### 2. Настройка платежного сервера
```bash
# Установка зависимостей
npm install

# Запуск платежного сервера
npm run payment

# Или
node payment-server.js
```

### 3. Настройка Telegram Bot
1. Создайте бота через @BotFather
2. Получите токен и установите в `BOT_TOKEN`
3. Настройте вебхук: `https://your-domain.com/webhook/telegram`
4. Включите платежи в настройках бота

### 4. Готовые URL
- **Основной**: https://dmitriydzhambek.github.io/Mini-appYacht
- **Админ панель**: https://your-domain.com/admin
- **Telegram**: https://t.me/MiniYacht_Bot?startapp=mini-app-yacht

## 📱 Telegram Bot Configuration

### BotFather настройки:
```
/start - https://mini-app-yacht.vercel.app
```

### Команды бота:
- `/start` - Запустить Mini App
- `/help` - Помощь
- `/stats` - Статистика
- `/wallet` - Кошелек

## 💰 Монетизация

### Доходные потоки:
- **Rewarded Ads**: $0.05-0.15 за просмотр
- **Offer Wall**: $0.10-0.30 за задание
- **Affiliate**: 5-30% комиссия
- **Premium**: $2-10 в месяц
- **Referral**: 10-20% от друзей

### Прогноз доходов:
- **100 пользователей/день**: $50-200
- **1000 пользователей/день**: $500-2000

## Структура проекта

```
Mini-appYacht/
├── index.html              # Основной HTML файл Mini App
├── payment-server.js       # Платежный сервер Node.js
├── admin.html             # Админ панель для управления
├── package.json           # Зависимости проекта
├── vercel.json            # Конфигурация Vercel
├── README.md              # Документация
├── monetization-guide.md  # Гайд по монетизации
├── premium_users.db       # База данных SQLite
└── assets/                # Изображения и ресурсы
```

## 💳 Платежная система

### Двойная интеграция платежей
- **Telegram Stars**: 99 Stars/месяц
- **YooKassa**: 99 рублей/месяц (карта, СБП, YooPay)
- **Выбор способа**: Пользователь выбирает при покупке

### Telegram Stars Integration
- **Валюта**: XTR (Telegram Stars)
- **Стоимость Premium**: 99 Stars/месяц
- **Обработка**: Telegram Bot API
- **Преимущества**: Мгновенная оплата внутри Telegram

### YooKassa Integration
- **Валюта**: RUB (рубли)
- **Стоимость Premium**: 99 рублей/месяц
- **Способы оплаты**: Карта, СБП, YooPay, QIWI
- **Обработка**: YooKassa API с вебхуками
- **Комиссии**: 2.5-4.5% в зависимости от способа

### API эндпоинты
- `GET /api/premium-users` - Список премиум пользователей
- `GET /api/user-stats` - Статистика пользователей
- `POST /api/premium-payment` - Обработка платежа Telegram Stars
- `POST /api/yookassa/create-payment` - Создание платежа YooKassa
- `POST /webhook/telegram` - Вебхук Telegram
- `POST /webhook/yookassa` - Вебхук YooKassa
- `GET /payment/success` - Страница успешного платежа

### Админ панель
- **URL**: `/admin`
- **Функции**: Просмотр пользователей, статистика, управление подписками
- **Обновление**: Автообновление каждые 30 секунд
- **Отслеживание**: Оба способа оплаты в одной таблице

### Настройка YooKassa
1. Регистрация на https://yookassa.ru
2. Получение Shop ID и Secret Key
3. Настройка вебхуков
4. Тестирование в песочнице
*Подробности в файле `YOOKASSA_SETUP.md`*

### Рекомендуемые сервисы для управления пользователями
1. **Supabase** - Бесплатная PostgreSQL база с API
2. **Firebase** - Google сервис с реалтайм базой данных
3. **MongoDB Atlas** - Бесплатный MongoDB хостинг
4. **Airtable** - Визуальная база данных с API
5. **Notion API** - База данных с интеграцией

## 🎯 Особенности

- ✅ **Полная монетизация** без бюджета
- ✅ **Оптимизированный код** (~15KB)
- ✅ **Адаптивный дизайн** для всех устройств
- ✅ **Telegram WebApp** интеграция
- ✅ **GPS трекинг** и шагомер
- ✅ **Система достижений** и статистика
- ✅ **Вывод средств** в Stars и рублях

## 📞 Поддержка

GitHub: https://github.com/DmitriyDzhambek/Mini-appYacht

---

**🎉 Разверните за 5 минут и начните зарабатывать $50-2000 в день!**
