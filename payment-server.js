const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const PORT = process.env.PORT || 3000;

// Инициализация бота
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Инициализация базы данных
const db = new sqlite3.Database('premium_users.db');

// Создание таблиц
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        is_premium BOOLEAN DEFAULT 0,
        premium_start_date TEXT,
        premium_end_date TEXT,
        telegram_payment_charge_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        telegram_payment_charge_id TEXT UNIQUE,
        amount INTEGER,
        currency TEXT,
        payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        subscription_type TEXT,
        amount INTEGER,
        currency TEXT,
        start_date TEXT,
        end_date TEXT,
        is_active BOOLEAN DEFAULT 1,
        telegram_payment_charge_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// Express приложение
const app = express();
app.use(express.json());

// API эндпоинты
app.get('/api/premium-users', (req, res) => {
    db.all(`
        SELECT u.*, p.amount, p.payment_date
        FROM users u
        LEFT JOIN payments p ON u.id = p.user_id
        WHERE u.is_premium = 1
        ORDER BY u.premium_start_date DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/user-stats', (req, res) => {
    db.all(`
        SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN is_premium = 1 THEN 1 END) as premium_users,
            COUNT(CASE WHEN is_premium = 0 THEN 1 END) as free_users
        FROM users
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows[0]);
    });
});

app.post('/api/premium-payment', (req, res) => {
    const { telegram_id, amount, payment_charge_id } = req.body;
    
    // Добавляем или обновляем пользователя
    db.run(`
        INSERT OR REPLACE INTO users 
        (telegram_id, is_premium, premium_start_date, premium_end_date, telegram_payment_charge_id)
        VALUES (?, 1, datetime('now'), datetime('now', '+1 month'), ?)
    `, [telegram_id, payment_charge_id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Добавляем запись о платеже
        db.run(`
            INSERT INTO payments (user_id, telegram_payment_charge_id, amount, currency)
            VALUES (?, ?, ?, 'XTR')
        `, [this.lastID, payment_charge_id, amount]);
        
        // Добавляем подписку
        db.run(`
            INSERT INTO subscriptions (user_id, subscription_type, amount, currency, start_date, end_date, telegram_payment_charge_id)
            VALUES (?, 'premium', ?, ?, datetime('now'), datetime('now', '+1 month'), ?)
        `, [this.lastID, amount, 'XTR', payment_charge_id]);
        
        res.json({ success: true, message: 'Premium activated' });
    });
});

// Обработка платежей от Telegram
app.post('/webhook/telegram', (req, res) => {
    const update = req.body;
    
    // Обработка успешного платежа
    if (update.message && update.message.successful_payment) {
        const payment = update.message.successful_payment;
        const user = update.message.from;
        
        console.log('Successful payment:', payment);
        
        // Активируем премиум
        db.run(`
            INSERT OR REPLACE INTO users 
            (telegram_id, username, first_name, last_name, is_premium, premium_start_date, premium_end_date, telegram_payment_charge_id)
            VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now', '+1 month'), ?)
        `, [user.id, user.username, user.first_name, user.last_name, payment.telegram_payment_charge_id]);
        
        // Отправляем подтверждение
        bot.sendMessage(user.id, '🎉 Премиум активирован! Спасибо за покупку!\n\nВаш премиум статус действителен до: ' + 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString());
    }
    
    // Обработка pre-checkout query
    if (update.pre_checkout_query) {
        const query = update.pre_checkout_query;
        
        // Подтверждаем платеж
        bot.answerPreCheckoutQuery(query.id).catch(err => {
            console.error('Error answering pre-checkout query:', err);
        });
    }
    
    res.sendStatus(200);
});

// Админ панель (простая)
app.get('/admin', (req, res) => {
    fs.readFile(path.join(__dirname, 'admin.html'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading admin panel');
            return;
        }
        res.send(data);
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Payment server running on port ${PORT}`);
    console.log(`Webhook URL: https://your-domain.com/webhook/telegram`);
});

// Установка вебхука
bot.setWebHook(`https://your-domain.com/webhook/telegram`).then(() => {
    console.log('Webhook set successfully');
}).catch(err => {
    console.error('Error setting webhook:', err);
});

module.exports = app;
