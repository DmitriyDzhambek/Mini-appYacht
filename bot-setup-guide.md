# Руководство по настройке Telegram бота MiniYacht_Bot

## Что нужно сделать для полной интеграции:

### 1. Создание Telegram бота

1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Введите имя бота: `MiniYacht Bot`
4. Введите username бота: `MiniYacht_Bot`
5. Сохраните полученный токен бота

### 2. Настройка бота

Замените `YOUR_BOT_TOKEN` в файлах:
- `bot-integration.js` (строка 4)
- `bot-commands.js` (строка 4)

на реальный токен от BotFather.

### 3. Размещение бота на сервере

Создайте файл `bot-server.js`:

```javascript
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const BotCommands = require('./bot-commands.js');

const app = express();
app.use(express.json());

// Замените на реальный токен
const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });
const commands = new BotCommands();

// Обработка команд
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const messageId = msg.message_id;
    
    await commands.handleCommand(chatId, text, messageId);
});

// Обработка кнопок
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    switch (data) {
        case 'stats':
            await commands.handleStats(chatId);
            break;
        case 'habits':
            await commands.handleHabits(chatId);
            break;
        case 'snacks':
            await commands.handleSnacks(chatId);
            break;
        case 'diary':
            await commands.handleDiary(chatId);
            break;
        case 'bike':
            await commands.handleBike(chatId);
            break;
        case 'referral':
            await commands.handleReferral(chatId);
            break;
        case 'premium':
            await commands.handlePremium(chatId);
            break;
        case 'report':
            await commands.handleReport(chatId);
            break;
    }
    
    await bot.answerCallbackQuery(query.id);
});

// API эндпоинт для получения данных пользователя
app.get('/api/user/:telegramId', async (req, res) => {
    // Здесь должна быть логика получения данных из базы данных
    res.json({ data: null });
});

// API эндпоинт для сохранения действий пользователя
app.post('/api/save-user-action', async (req, res) => {
    const { telegram_id, action_type, data } = req.body;
    
    // Здесь должна быть логика сохранения в базу данных
    console.log('User action saved:', { telegram_id, action_type, data });
    
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bot server running on port ${PORT}`);
});
```

### 4. Установка зависимостей

```bash
npm install express node-telegram-bot-api
```

### 5. Запуск бота

```bash
node bot-server.js
```

## Функционал бота

### Команды бота:
- `/start` - Главное меню с кнопками
- `/stats` - Статистика пользователя
- `/habits` - Привычки пользователя
- `/snacks` - Перекусы пользователя
- `/diary` - Записи в дневнике
- `/bike` - Состояние велосипеда
- `/referral` - Реферальная программа
- `/premium` - Premium статус
- `/report` - Подробный отчет
- `/help` - Помощь

### Уведомления от приложения:
- 🎯 Изменение привычек
- 🥪 Добавление перекусов
- 📝 Записи в дневнике
- 🔧 Обновление состояния велосипеда
- 👥 Новые рефералы
- 👑 Активация Premium
- 🎉 Заработок Stars и рублей

### Интеграция с приложением:
- Автоматическая отправка уведомлений о важных действиях
- Синхронизация данных между ботом и приложением
- Красивое форматирование сообщений с эмодзи
- HTML-разметка для лучшей читаемости

## База данных

Для полноценной работы нужна база данных для хранения:
- Данных пользователей (шаги, привычки, перекусы и т.д.)
- Истории действий
- Реферальных данных
- Premium статусов

## Пример сообщения от бота

```
🏃‍♂️ Прощай лень

📅 03.05.2026, 23:15:00

🎯 Привычка обновлена

📊 Детали:
🎯 Привычка: Утренняя пробежка
✅ Выполнена: true

💡 Откройте приложение чтобы увидеть детали
```

## Безопасность

- Храните токен бота в безопасном месте
- Используйте переменные окружения для токена
- Валидируйте все входящие данные
- Ограничьте доступ к API эндпоинтам

## Тестирование

1. Запустите бота на сервере
2. Откройте приложение
3. Выполните различные действия
4. Проверьте получение уведомлений в боте
5. Протестируйте команды бота

## Развертывание

Для продакшена рекомендуется:
- Использовать VPS или облачный хостинг
- Настроить SSL сертификат
- Использовать process manager (PM2)
- Настроить логирование
- Мониторить работу бота
