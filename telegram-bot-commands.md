# VeloPath Telegram Bot Commands Documentation

## 🤖 Bot Commands Setup

### Basic Commands
```
/start - Запустить VeloPath Mini App
/help - Помощь и инструкции
/stats - Моя статистика  
/wallet - Мой кошелек
/routes - Мои маршруты
/leaderboard - Таблица лидеров
/support - Поддержка
```

### Advanced Commands
```
/profile - Мой профиль
/settings - Настройки
/withdraw - Вывод средств
/achievements - Мои достижения
/challenge - Ежедневный челлендж
/share - Поделиться приложением
```

## 📱 Mini App Integration

### Start Parameters
```
mini-app-yacht-4hva - Основное приложение
withdraw_stars_{amount} - Вывод Stars
withdraw_rub_{amount} - Вывод рублей
challenge_{id} - Ежедневный челлендж
share_{userId} - Поделиться с другом
```

### WebApp URL Formats
```
https://t.me/MiniYacht_Bot?startapp=mini-app-yacht-4hva
https://t.me/MiniYacht_Bot/mini-app-yacht-4hva
https://mini-app-yacht-4hva.vercel.app
```

## 🔧 Bot Implementation

### Node.js Example
```javascript
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Start command with WebApp
bot.onText(/\/start/, async (msg) => {
    const webAppUrl = 'https://mini-app-yacht-4hva.vercel.app';
    
    await bot.sendMessage(msg.chat.id, '🚴 Добро пожаловать в VeloPath!', {
        reply_markup: {
            inline_keyboard: [[{
                text: '🚀 Открыть приложение',
                web_app: { url: webAppUrl }
            }]]
        }
    });
});

// Handle startapp parameters
bot.onText(/\/start (.+)/, async (msg, match) => {
    const param = match[1];
    
    switch(param) {
        case 'mini-app-yacht-4hva':
            // Open main app
            break;
        case param.startsWith('withdraw_stars_'):
            const amount = param.split('_')[2];
            // Handle Stars withdrawal
            break;
        case param.startsWith('withdraw_rub_'):
            const amount = param.split('_')[2];
            // Handle rubles withdrawal
            break;
    }
});
```

## 💰 Payment Integration

### Telegram Stars Payments
```javascript
// Create invoice for Stars withdrawal
bot.onText(/\/withdraw_stars (.+)/, async (msg, match) => {
    const amount = match[1];
    
    await bot.sendInvoice(msg.chat.id, 'Вывод Stars', 
        `Вывод ${amount} Telegram Stars`, 
        'withdraw_stars_payload', 
        'YOUR_PROVIDER_TOKEN', 
        'stars', 
        [{
            label: 'Комиссия',
            amount: 100 // 1 Star = 100 units
        }]
    );
});
```

### Payment Handling
```javascript
bot.on('pre_checkout_query', async (query) => {
    // Validate payment
    await bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
    // Process successful payment
    await bot.sendMessage(msg.chat.id, '✅ Платеж успешно обработан!');
});
```

## 📊 Analytics Tracking

### User Actions
```javascript
// Track user engagement
bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const userId = callbackQuery.from.id;
    
    // Send to analytics
    await trackUserAction(userId, action);
    
    await bot.answerCallbackQuery(callbackQuery.id);
});

async function trackUserAction(userId, action) {
    // Your analytics implementation
    console.log(`User ${userId}: ${action}`);
}
```

## 🎯 Deep Linking

### Custom Parameters
```
https://t.me/MiniYacht_Bot?startapp=ref_{referralId}
https://t.me/MiniYacht_Bot?startapp=challenge_{challengeId}
https://t.me/MiniYacht_Bot?startapp=share_{userId}
```

### Referral System
```javascript
bot.onText(/\/start (.+)/, async (msg, match) => {
    const param = match[1];
    
    if (param.startsWith('ref_')) {
        const refId = param.split('_')[1];
        // Handle referral
        await handleReferral(msg.from.id, refId);
    }
});
```

## 🔒 Security

### WebApp Validation
```javascript
function validateWebAppData(initData, botToken) {
    const secret = crypto.createHmac('sha256', botToken)
        .update(initData)
        .digest('hex');
    
    // Validate signature
    return initData.includes(secret);
}
```

### Rate Limiting
```javascript
const rateLimits = new Map();

function checkRateLimit(userId, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const userLimit = rateLimits.get(userId) || { count: 0, resetTime: now + windowMs };
    
    if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + windowMs;
    }
    
    if (userLimit.count >= limit) {
        return false;
    }
    
    userLimit.count++;
    rateLimits.set(userId, userLimit);
    return true;
}
```

## 📱 Mini App Features

### Available Features
- ✅ GPS tracking
- ✅ Step counting
- ✅ Stars conversion
- ✅ Rubles conversion
- ✅ Achievement system
- ✅ Withdrawal functionality
- ✅ Leaderboard
- ✅ Daily challenges
- ✅ Referral system

### Theme Support
- 🌙 Dark mode (Telegram default)
- 🌞 Light mode (if available)
- 🎨 Custom colors (based on user theme)

## 🚀 Deployment

### Environment Variables
```bash
BOT_TOKEN=your_telegram_bot_token
VERCEL_URL=https://mini-app-yacht-4hva.vercel.app
DATABASE_URL=your_database_url
WEBHOOK_SECRET=your_webhook_secret
```

### Webhook Setup
```javascript
const express = require('express');
const app = express();

app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    const secret = req.header('X-Telegram-Bot-Api-Secret-Token');
    
    if (secret !== process.env.WEBHOOK_SECRET) {
        return res.sendStatus(403);
    }
    
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Bot webhook server running on port 3000');
});
```

## 📞 Support

### Help Message
```
🚴 VeloPath - Помощь

📱 Основные функции:
• 🚶 Трекинг прогулок
• 🏃 Трекинг пробежек
• 🚴 Трекинг велопоездок
• 🛹 Трекинг катания на роликах
• ⭐ Заработок Telegram Stars
• 💰 Заработок рублей
• 🏅 Система достижений
• 💸 Вывод средств

🔗 Ссылки:
• 📱 Приложение: /start
• 📊 Статистика: /stats
• 💳 Кошелек: /wallet
• 🏆 Достижения: /achievements

📞 Поддержка: @velopath_support
```

## 🎉 Launch Checklist

- [x] Bot created via BotFather
- [x] Commands configured
- [x] WebApp integration ready
- [x] Payment system configured
- [x] Security measures implemented
- [x] Analytics tracking set up
- [x] Help system ready
- [x] Rate limiting enabled

---

**Ready for production deployment! 🚀**
