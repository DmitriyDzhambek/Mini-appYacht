const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const PORT = process.env.PORT || 3000;

// YooKassa конфигурация
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || 'YOUR_SHOP_ID';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'YOUR_SECRET_KEY';
const YOOKASSA_RETURN_URL = process.env.YOOKASSA_RETURN_URL || 'https://your-domain.com/payment/success';

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
    
    db.run(`CREATE TABLE IF NOT EXISTS yookassa_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        payment_id TEXT UNIQUE,
        status TEXT,
        amount REAL,
        currency TEXT,
        description TEXT,
        confirmation_url TEXT,
        created_at TEXT,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS user_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER,
        action_type TEXT,
        data TEXT,
        message TEXT,
        timestamp TEXT,
        FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
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
        ORDER BY p.payment_date DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/create-invoice', (req, res) => {
    const { user_id, invoice_data } = req.body;
    
    if (!user_id || !invoice_data) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing user_id or invoice_data' 
        });
    }
    
    // Создаем инвойс через Telegram Bot API
    bot.sendInvoice(user_id, 
        invoice_data.title,
        invoice_data.description,
        invoice_data.payload,
        '', // provider_token не нужен для цифровых товаров
        invoice_data.currency,
        invoice_data.prices,
        {
            reply_markup: {
                inline_keyboard: [[
                    { text: '👑 Оплатить', pay: true }
                ]]
            }
        }
    ).then(invoice => {
        res.json({ 
            success: true, 
            invoice_url: invoice.invoice_url 
        });
    }).catch(error => {
        console.error('Invoice creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create invoice' 
        });
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

// YooKassa создание платежа
app.post('/api/yookassa/create-payment', async (req, res) => {
    const { telegram_id, amount, description } = req.body;
    
    try {
        // Генерируем ключ идемпотентности
        const idempotenceKey = crypto.randomUUID();
        
        // Создаем платеж в YooKassa
        const paymentData = {
            amount: {
                value: amount.toString(),
                currency: "RUB"
            },
            capture: true,
            confirmation: {
                type: "redirect",
                return_url: `${YOOKASSA_RETURN_URL}?telegram_id=${telegram_id}`
            },
            description: description || "VeloPath Premium подписка"
        };
        
        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64'),
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        const payment = await response.json();
        
        if (response.ok) {
            // Сохраняем информацию о платеже в базу
            db.run(`
                INSERT INTO yookassa_payments 
                (user_id, payment_id, status, amount, currency, description, confirmation_url, created_at, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [telegram_id, payment.id, payment.status, payment.amount.value, payment.amount.currency, 
                payment.description, payment.confirmation.confirmation_url, payment.created_at, 
                JSON.stringify(payment.metadata)]);
            
            res.json({
                success: true,
                payment_id: payment.id,
                status: payment.status,
                confirmation_url: payment.confirmation.confirmation_url,
                amount: payment.amount.value,
                currency: payment.amount.currency
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: payment.description || 'Payment creation failed' 
            });
        }
    } catch (error) {
        console.error('YooKassa payment creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// YooKassa вебхук для обработки статусов платежей
app.post('/webhook/yookassa', (req, res) => {
    const event = req.body;
    
    console.log('YooKassa webhook:', event);
    
    if (event.event === 'payment.succeeded') {
        const payment = event.object;
        
        // Обновляем статус платежа в базе
        db.run(`
            UPDATE yookassa_payments 
            SET status = ? 
            WHERE payment_id = ?
        `, ['succeeded', payment.id]);
        
        // Активируем премиум для пользователя
        db.get(`
            SELECT user_id FROM yookassa_payments WHERE payment_id = ?
        `, [payment.id], (err, row) => {
            if (!err && row) {
                db.run(`
                    INSERT OR REPLACE INTO users 
                    (telegram_id, is_premium, premium_start_date, premium_end_date)
                    VALUES (?, 1, datetime('now'), datetime('now', '+1 month'))
                `, [row.user_id]);
                
                // Добавляем запись о подписке
                db.run(`
                    INSERT INTO subscriptions 
                    (user_id, subscription_type, amount, currency, start_date, end_date)
                    VALUES (?, 'premium', ?, ?, datetime('now'), datetime('now', '+1 month'))
                `, [row.user_id, payment.amount.value, payment.amount.currency]);
                
                // Добавляем реальную транзакцию для пользователя
                db.run(`
                    INSERT INTO payments 
                    (user_id, amount, currency, payment_date, type)
                    VALUES (?, ?, ?, datetime('now'), 'premium_purchase')
                `, [row.user_id, payment.amount.value, payment.amount.currency]);
            }
        });
    }
    
    res.sendStatus(200);
});

// API для отправки уведомлений в бот
app.post('/api/bot-notification', (req, res) => {
    const { telegram_id, message } = req.body;
    
    if (!telegram_id || !message) {
        return res.status(400).json({ error: 'Missing telegram_id or message' });
    }
    
    // Сохраняем действие пользователя в базу
    db.run(`
        INSERT INTO user_actions 
        (telegram_id, action_type, message, timestamp)
        VALUES (?, ?, ?, datetime('now'))
    `, [telegram_id, 'notification', message]);
    
    // Отправляем уведомление пользователю в Telegram
    bot.sendMessage(telegram_id, `🔔 VeloPath уведомление:\n\n${message}`)
        .then(() => {
            res.json({ success: true, message: 'Notification sent' });
        })
        .catch(err => {
            console.error('Bot notification error:', err);
            res.status(500).json({ error: 'Failed to send notification' });
        });
});

// API для сохранения действий пользователя
app.post('/api/save-user-action', (req, res) => {
    const { telegram_id, action_type, data } = req.body;
    
    if (!telegram_id || !action_type) {
        return res.status(400).json({ error: 'Missing telegram_id or action_type' });
    }
    
    // Сохраняем действие в базу
    db.run(`
        INSERT INTO user_actions 
        (telegram_id, action_type, data, timestamp)
        VALUES (?, ?, ?, datetime('now'))
    `, [telegram_id, action_type, JSON.stringify(data)]);
    
    res.json({ success: true, message: 'Action saved' });
});

// API для получения истории действий пользователя
app.get('/api/user-actions/:telegram_id', (req, res) => {
    const telegram_id = req.params.telegram_id;
    
    db.all(`
        SELECT * FROM user_actions 
        WHERE telegram_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
    `, [telegram_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Страница успешного платежа
app.get('/payment/success', (req, res) => {
    const telegram_id = req.query.telegram_id;
    
    if (telegram_id) {
        res.send(`
            <html>
                <head>
                    <title>Платеж успешен</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="success">✅ Платеж успешно обработан!</div>
                    <p>Ваша премиум подписка активирована.</p>
                    <p>Вернитесь в Telegram для продолжения.</p>
                    <script>
                        setTimeout(() => {
                            window.close();
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
    } else {
        res.status(400).send('Ошибка: отсутствует telegram_id');
    }
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
        `, [user.id, user.username, user.first_name, user.last_name, payment.telegram_payment_charge_id], function(err) {
            if (!err) {
                // Добавляем реальную транзакцию
                db.run(`
                    INSERT INTO payments 
                    (user_id, telegram_payment_charge_id, amount, currency, payment_date, type)
                    VALUES (?, ?, ?, ?, datetime('now'), 'premium_purchase')
                `, [this.lastID, payment.telegram_payment_charge_id, payment.total_amount / 100, 'XTR']);
                
                // Добавляем подписку
                db.run(`
                    INSERT INTO subscriptions 
                    (user_id, subscription_type, amount, currency, start_date, end_date, telegram_payment_charge_id)
                    VALUES (?, 'premium', ?, ?, datetime('now'), datetime('now', '+1 month'), ?)
                `, [this.lastID, payment.total_amount / 100, 'XTR', payment.telegram_payment_charge_id]);
            }
        });
        
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
