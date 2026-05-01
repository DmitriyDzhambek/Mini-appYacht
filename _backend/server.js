const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Временное хранилище данных (в реальном проекте использовать базу данных)
const users = new Map();
const routes = new Map();

// Middleware для проверки Telegram WebApp init data
function validateTelegramInitData(req, res, next) {
    const initData = req.headers['telegram-web-app-init-data'];
    
    if (!initData) {
        return res.status(401).json({ error: 'Telegram init data missing' });
    }
    
    try {
        // В реальном проекте здесь должна быть проверка подписи
        // Сейчас просто пропускаем для демонстрации
        req.telegramData = parseInitData(initData);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid telegram data' });
    }
}

function parseInitData(initData) {
    const params = new URLSearchParams(initData);
    const data = {};
    
    for (const [key, value] of params) {
        if (key === 'user') {
            data.user = JSON.parse(value);
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

// Получение данных пользователя
app.get('/api/user/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    
    if (!users.has(telegramId)) {
        // Создание нового пользователя
        const newUser = {
            telegramId,
            todaySteps: 0,
            todayKm: 0,
            starsBalance: 0,
            rubBalance: 0,
            totalKm: 0,
            totalSteps: 0,
            totalEarned: 0,
            routes: [],
            transactions: [],
            badges: {
                'first-route': false,
                '10km': false,
                '100km': false,
                '1000steps': false,
                'money': false
            },
            createdAt: new Date().toISOString()
        };
        
        users.set(telegramId, newUser);
        return res.json(newUser);
    }
    
    res.json(users.get(telegramId));
});

// Обновление данных пользователя
app.put('/api/user/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    const updates = req.body;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users.get(telegramId);
    Object.assign(user, updates);
    user.updatedAt = new Date().toISOString();
    
    users.set(telegramId, user);
    res.json(user);
});

// Сохранение маршрута
app.post('/api/routes/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    const routeData = req.body;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const route = {
        id: Date.now(),
        telegramId,
        date: new Date().toISOString(),
        ...routeData
    };
    
    routes.set(route.id, route);
    
    // Обновление данных пользователя
    const user = users.get(telegramId);
    user.routes.push(route.id);
    user.todayKm += route.distance / 1000;
    user.totalKm += route.distance / 1000;
    
    // Проверка достижений
    if (user.routes.length >= 1) user.badges['first-route'] = true;
    if (user.totalKm >= 10) user.badges['10km'] = true;
    if (user.totalKm >= 100) user.badges['100km'] = true;
    
    users.set(telegramId, user);
    
    res.json(route);
});

// Получение маршрутов пользователя
app.get('/api/routes/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users.get(telegramId);
    const userRoutes = user.routes.map(routeId => routes.get(routeId)).filter(Boolean);
    
    res.json(userRoutes);
});

// Конвертация шагов в Stars
app.post('/api/convert/stars/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    const { steps } = req.body;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (steps < 1000) {
        return res.status(400).json({ error: 'Minimum 1000 steps required' });
    }
    
    const user = users.get(telegramId);
    const stars = Math.floor(steps / 1000);
    
    user.todaySteps -= stars * 1000;
    user.starsBalance += stars;
    user.totalSteps += stars * 1000;
    
    user.transactions.unshift({
        type: 'stars',
        amount: stars,
        date: new Date().toISOString()
    });
    
    if (user.totalSteps >= 1000) user.badges['1000steps'] = true;
    
    users.set(telegramId, user);
    
    res.json({ stars, newBalance: user.starsBalance });
});

// Конвертация км в рубли
app.post('/api/convert/rub/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    const { km } = req.body;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (km < 1) {
        return res.status(400).json({ error: 'Minimum 1 km required' });
    }
    
    const user = users.get(telegramId);
    const rub = Math.floor(km) * 10;
    
    user.todayKm -= Math.floor(km);
    user.rubBalance += rub;
    user.totalEarned += rub;
    
    user.transactions.unshift({
        type: 'rub',
        amount: rub,
        date: new Date().toISOString()
    });
    
    if (user.rubBalance > 0) user.badges['money'] = true;
    
    users.set(telegramId, user);
    
    res.json({ rub, newBalance: user.rubBalance });
});

// Запрос на вывод средств
app.post('/api/withdraw/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    const { amount, method, wallet } = req.body;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users.get(telegramId);
    
    if (method === 'stars' && user.starsBalance < amount) {
        return res.status(400).json({ error: 'Insufficient stars balance' });
    }
    
    if (method === 'rub' && user.rubBalance < amount) {
        return res.status(400).json({ error: 'Insufficient rubles balance' });
    }
    
    // В реальном проекте здесь будет интеграция с платёжными системами
    const withdrawal = {
        id: Date.now(),
        telegramId,
        amount,
        method,
        wallet,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Списываем средства
    if (method === 'stars') {
        user.starsBalance -= amount;
    } else {
        user.rubBalance -= amount;
    }
    
    user.transactions.unshift({
        type: 'withdrawal',
        amount,
        method,
        status: 'pending',
        date: new Date().toISOString()
    });
    
    users.set(telegramId, user);
    
    res.json({ success: true, withdrawal });
});

// Получение статистики
app.get('/api/stats/:telegramId', validateTelegramInitData, (req, res) => {
    const { telegramId } = req.params;
    
    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users.get(telegramId);
    const userRoutes = user.routes.map(routeId => routes.get(routeId)).filter(Boolean);
    
    const stats = {
        totalRoutes: userRoutes.length,
        totalKm: user.totalKm,
        totalSteps: user.totalSteps,
        totalEarned: user.totalEarned,
        currentStreak: calculateStreak(userRoutes),
        badges: user.badges
    };
    
    res.json(stats);
});

function calculateStreak(routes) {
    if (routes.length === 0) return 0;
    
    const sortedRoutes = routes.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const route of sortedRoutes) {
        const routeDate = new Date(route.date);
        routeDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate - routeDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
            currentDate = new Date(routeDate);
        } else {
            break;
        }
    }
    
    return streak;
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});