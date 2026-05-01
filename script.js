// VeloPath — Велоприложение с наградами

// Состояние приложения
let state = {
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
    }
}

// Трекер
let tracking = {
    active: false,
    paused: false,
    startTime: null,
    elapsedTime: 0,
    distance: 0,
    watchId: null,
    positions: []
}

// DOM элементы
const screens = {
    home: document.getElementById('homeScreen'),
    tracker: document.getElementById('trackerScreen'),
    wallet: document.getElementById('walletScreen'),
    routes: document.getElementById('routesScreen')
}

// Инициализация Telegram WebApp
let tg, user;

if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp
    user = tg.initDataUnsafe?.user
    
    // Настройка WebApp
    tg.expand()
    tg.ready()
    
    // Установка темы
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e')
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#007bff')
    }
    
    // Показываем информацию о пользователе
    console.log('Telegram user:', user)
} else {
    console.log('Telegram WebApp не найден, используем демо-режим')
    // Демо пользователь для тестирования
    user = {
        id: 12345,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user'
    }
}

// Навигация между экранами
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const screenName = btn.dataset.screen
        showScreen(screenName)
    })
})

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('home')
    })
})

function showScreen(screenName) {
    // Скрыть все экраны
    Object.values(screens).forEach(s => s.classList.remove('active'))
    
    // Показать нужный экран
    screens[screenName].classList.add('active')
    
    // Обновить навигацию
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active')
        if (btn.dataset.screen === screenName) {
            btn.classList.add('active')
        }
    })
}

// Кнопка "Начать трекинг"
document.getElementById('startTracking').addEventListener('click', () => {
    showScreen('tracker')
})

// Переключатель активности
const activityToggle = document.getElementById('activityToggle')
const activitySelector = document.getElementById('activitySelector')
const currentActivityIcon = document.getElementById('currentActivityIcon')

// Состояние активности
let currentActivity = 'bike'
const activityIcons = {
    bike: '🚴',
    run: '🏃',
    walk: '🚶',
    rollers: '🛼'
}

// Показать/скрыть селектор активности
activityToggle.addEventListener('click', () => {
    activitySelector.classList.toggle('show')
})

// Выбор активности
document.querySelectorAll('.activity-option').forEach(option => {
    option.addEventListener('click', () => {
        // Убрать активность со всех
        document.querySelectorAll('.activity-option').forEach(o => {
            o.classList.remove('active')
        })
        // Добавить активность выбранной
        option.classList.add('active')
        
        // Обновить текущую активность
        currentActivity = option.dataset.activity
        currentActivityIcon.textContent = activityIcons[currentActivity]
        
        // Скрыть селектор
        activitySelector.classList.remove('show')
        
        console.log('Выбрана активность:', currentActivity)
    })
})

// Управление трекером
document.getElementById('btnStart').addEventListener('click', startTracking)
document.getElementById('btnPause').addEventListener('click', pauseTracking)
document.getElementById('btnStop').addEventListener('click', stopTracking)
document.getElementById('saveRoute').addEventListener('click', saveRoute)

function startTracking() {
    if (tracking.active && !tracking.paused) return;

    // Проверка разрешения на геолокацию
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
            if (result.state === 'denied') {
                alert('Для работы трекинга необходимо разрешить доступ к геолокации.');
                return;
            } else {
                startTrackingInternal();
            }
        });
    } else {
        // Старые браузеры
        startTrackingInternal();
    }
}

function startTrackingInternal() {
    tracking.active = true;
    tracking.paused = false;

    if (!tracking.startTime) {
        tracking.startTime = Date.now();
    }

    // Запуск GPS
    if (navigator.geolocation) {
        tracking.watchId = navigator.geolocation.watchPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const speed = position.coords.speed || 0;

                tracking.positions.push({ lat, lon, speed, time: Date.now() });

                // Расчёт расстояния
                if (tracking.positions.length > 1) {
                    const prev = tracking.positions[tracking.positions.length - 2];
                    const curr = tracking.positions[tracking.positions.length - 1];
                    const dist = getDistance(prev.lat, prev.lon, curr.lat, curr.lon);
                    tracking.distance += dist;
                }

                updateTrackerDisplay();
            },
            error => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Доступ к геолокации запрещён. Для работы трекинга разрешите доступ в настройках браузера.');
                } else {
                    alert('Ошибка GPS: ' + error.message);
                }
            },
            { enableHighAccuracy: true }
        );
    }

    updateTrackerButtons();
}

function pauseTracking() {
    tracking.paused = !tracking.paused
    
    if (tracking.paused) {
        tracking.elapsedTime += Date.now() - tracking.startTime
    } else {
        tracking.startTime = Date.now()
    }
    
    updateTrackerButtons()
}

function stopTracking() {
    if (tracking.watchId) {
        navigator.geolocation.clearWatch(tracking.watchId)
    }
    
    tracking.active = false
    tracking.paused = false
    updateTrackerButtons()
}

function updateTrackerDisplay() {
    // Время
    let totalTime = tracking.elapsedTime
    if (tracking.active && !tracking.paused && tracking.startTime) {
        totalTime += Date.now() - tracking.startTime
    }
    
    const hours = Math.floor(totalTime / 3600000)
    const minutes = Math.floor((totalTime % 3600000) / 60000)
    const seconds = Math.floor((totalTime % 60000) / 1000)
    
    document.getElementById('trackerTime').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    // Километры
    document.getElementById('trackerKm').textContent = (tracking.distance / 1000).toFixed(2)
    
    // Скорость (средняя)
    const avgSpeed = totalTime > 0 ? (tracking.distance / 1000) / (totalTime / 3600000) : 0
    document.getElementById('trackerSpeed').textContent = avgSpeed.toFixed(1)
}

function updateTrackerButtons() {
    const btnStart = document.getElementById('btnStart')
    const btnPause = document.getElementById('btnPause')
    const btnStop = document.getElementById('btnStop')
    
    if (!tracking.active) {
        btnStart.style.display = 'block'
        btnPause.style.display = 'none'
        btnStop.style.display = 'none'
    } else if (tracking.paused) {
        btnStart.style.display = 'none'
        btnPause.style.display = 'block'
        btnPause.textContent = 'Продолжить'
        btnStop.style.display = 'block'
    } else {
        btnStart.style.display = 'none'
        btnPause.style.display = 'block'
        btnPause.textContent = 'Пауза'
        btnStop.style.display = 'block'
    }
}

// Функция расчёта расстояния между точками
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Радиус Земли в метрах
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
    return R * c
}

// Сохранение маршрута
async function saveRoute() {
    if (tracking.distance < 10) {
        if (tg && tg.showAlert) {
            tg.showAlert('Маршрут слишком короткий')
        } else {
            alert('Маршрут слишком короткий')
        }
        return
    }
    
    // Показываем рекламу для маршрутов длиннее 1 км
    if (tracking.distance >= 1000) {
        try {
            if (typeof show_10942535 === 'function') {
                await show_10942535()
            }
        } catch (error) {
            console.log('Ad not available, proceeding with route save')
        }
    }
    
    const route = {
        distance: tracking.distance,
        time: tracking.elapsedTime,
        positions: [...tracking.positions],
        activity: currentActivity
    }
    
    try {
        const savedRoute = await api.saveRoute(route)
        
        // Обновляем локальное состояние
        state.routes.unshift(savedRoute.id)
        state.todayKm += tracking.distance / 1000
        state.totalKm += tracking.distance / 1000
        
        // Проверка достижений
        checkBadges()
        
        // Сохранение данных
        await saveUserData()
        
        // Сброс трекера
        tracking = {
            active: false,
            paused: false,
            startTime: null,
            elapsedTime: 0,
            distance: 0,
            watchId: null,
            positions: []
        }
        
        updateDisplay()
        updateRoutesList()
        showScreen('home')
        
        const message = `Маршрут сохранён! ${(route.distance/1000).toFixed(2)} км`
        if (tg && tg.showAlert) {
            tg.showAlert(message)
        } else {
            alert(message)
        }
    } catch (error) {
        console.error('Failed to save route:', error)
        // Fallback - сохраняем локально
        saveRouteLocally(route)
    }
}

function saveRouteLocally(route) {
    // Локальное сохранение как fallback
    route.id = Date.now()
    route.date = new Date().toLocaleDateString()
    
    state.routes.unshift(route)
    state.todayKm += tracking.distance / 1000
    state.totalKm += tracking.distance / 1000
    
    checkBadges()
    
    tracking = {
        active: false,
        paused: false,
        startTime: null,
        elapsedTime: 0,
        distance: 0,
        watchId: null,
        positions: []
    }
    
    updateDisplay()
    updateRoutesList()
    saveUserData()
    showScreen('home')
    
    alert(`Маршрут сохранён! ${(route.distance/1000).toFixed(2)} км`)
}

// Обновление отображения
function updateDisplay() {
    document.getElementById('todaySteps').textContent = state.todaySteps
    document.getElementById('todayKm').textContent = state.todayKm.toFixed(1)
    document.getElementById('starsBalance').textContent = state.starsBalance
    document.getElementById('rubBalance').textContent = state.rubBalance
    document.getElementById('headerStars').textContent = state.starsBalance
    
    // Кошелёк
    document.getElementById('walletStars').textContent = state.starsBalance
    document.getElementById('walletRub').textContent = state.rubBalance + ' ₽'
    
    // Статистика
    document.getElementById('totalKm').textContent = state.totalKm.toFixed(1)
    document.getElementById('totalSteps').textContent = state.totalSteps
    document.getElementById('totalEarned').textContent = state.totalEarned
}

function updateRoutesList() {
    const routesList = document.getElementById('routesList')
    const allRoutesList = document.getElementById('allRoutesList')
    
    if (state.routes.length === 0) {
        routesList.innerHTML = '<div class="route-item empty">Нет сохранённых маршрутов</div>'
        allRoutesList.innerHTML = '<div class="route-item empty">Нет сохранённых маршрутов</div>'
    } else {
        const routeHTML = state.routes.slice(0, 3).map(r => `
            <div class="route-item">
                <div>
                    <strong>${r.date}</strong>
                    <span>${(r.distance/1000).toFixed(2)} км</span>
                </div>
            </div>
        `).join('')
        
        routesList.innerHTML = routeHTML
        allRoutesList.innerHTML = state.routes.map(r => `
            <div class="route-item">
                <div>
                    <strong>${r.date}</strong>
                    <span>${(r.distance/1000).toFixed(2)} км</span>
                </div>
            </div>
        `).join('')
    }
}

// Проверка достижений
async function checkBadges() {
    const badges = document.querySelectorAll('.badge-item')
    const previousBadges = { ...state.badges }
    
    // Первый маршрут
    if (state.routes.length >= 1 && !state.badges['first-route']) {
        state.badges['first-route'] = true
        await showAchievementAd('first-route', '🌱', 'Первый маршрут!')
    }
    
    // 10 км
    if (state.totalKm >= 10 && !state.badges['10km']) {
        state.badges['10km'] = true
        await showAchievementAd('10km', '🏃', '10 км пройдено!')
    }
    
    // 100 км
    if (state.totalKm >= 100 && !state.badges['100km']) {
        state.badges['100km'] = true
        await showAchievementAd('100km', '🚀', '100 км пройдено!')
    }
    
    // 1000 шагов
    if (state.totalSteps >= 1000 && !state.badges['1000steps']) {
        state.badges['1000steps'] = true
        await showAchievementAd('1000steps', '👟', '1000 шагов сделано!')
    }
    
    // Вывод денег
    if (state.rubBalance > 0 && !state.badges['money']) {
        state.badges['money'] = true
        await showAchievementAd('money', '💰', 'Первый вывод денег!')
    }
    
    // Обновить UI
    badges.forEach(badge => {
        const badgeId = badge.dataset.badge
        if (state.badges[badgeId]) {
            badge.classList.remove('locked')
        }
    })
}

// Показ рекламы при достижении
async function showAchievementAd(badgeId, icon, title) {
    try {
        if (typeof show_10942535 === 'function') {
            await show_10942535()
            
            // Показываем уведомление о достижении после рекламы
            const message = `${icon} Поздравляем! Вы разблокировали достижение: ${title}`
            if (tg && tg.showAlert) {
                tg.showAlert(message)
            } else {
                alert(message)
            }
        } else {
            console.log('Ad not available, showing achievement without ad')
            const message = `${icon} Поздравляем! Вы разблокировали достижение: ${title}`
            if (tg && tg.showAlert) {
                tg.showAlert(message)
            } else {
                alert(message)
            }
        }
    } catch (error) {
        console.log('Error showing achievement ad:', error)
        const message = `${icon} Поздравляем! Вы разблокировали достижение: ${title}`
        if (tg && tg.showAlert) {
            tg.showAlert(message)
        } else {
            alert(message)
        }
    }
}

// Конвертация шагов в Stars
document.getElementById('convertToStars').addEventListener('click', async () => {
    if (state.todaySteps < 1000) {
        const message = 'Нужно минимум 1000 шагов для обмена!'
        if (tg && tg.showAlert) {
            tg.showAlert(message)
        } else {
            alert(message)
        }
        return
    }
    
    // Показываем рекламу перед конвертацией
    try {
        if (typeof show_10942535 === 'function') {
            await show_10942535()
        }
    } catch (error) {
        console.log('Ad not available, proceeding with conversion')
    }
    
    try {
        const result = await api.convertToStars(state.todaySteps)
        
        state.todaySteps -= result.stars * 1000
        state.starsBalance += result.stars
        state.totalSteps += result.stars * 1000
        
        state.transactions.unshift({
            type: 'stars',
            amount: result.stars,
            date: new Date().toLocaleDateString()
        })
        
        checkBadges()
        await saveUserData()
        updateDisplay()
        updateTransactionsList()
        
        const message = `Обменяно! Получено ${result.stars} ⭐`
        if (tg && tg.showAlert) {
            tg.showAlert(message)
        } else {
            alert(message)
        }
    } catch (error) {
        console.error('Failed to convert to stars:', error)
        convertToStarsLocally()
    }
})

function convertToStarsLocally() {
    const stars = Math.floor(state.todaySteps / 1000)
    state.todaySteps -= stars * 1000
    state.starsBalance += stars
    state.totalSteps += stars * 1000
    
    state.transactions.unshift({
        type: 'stars',
        amount: stars,
        date: new Date().toLocaleDateString()
    })
    
    checkBadges()
    saveUserData()
    updateDisplay()
    updateTransactionsList()
    
    alert(`Обменяно! Получено ${stars} ⭐`)
}

// Конвертация км в рубли
document.getElementById('convertToRub').addEventListener('click', async () => {
    if (state.todayKm < 1) {
        const message = 'Нужно минимум 1 км для обмена!'
        if (tg && tg.showAlert) {
            tg.showAlert(message)
        } else {
            alert(message)
        }
        return
    }
    
    // Показываем рекламу перед конвертацией
    try {
        if (typeof show_10942535 === 'function') {
            await show_10942535()
        }
    } catch (error) {
        console.log('Ad not available, proceeding with conversion')
    }
    
    try {
        const result = await api.convertToRub(state.todayKm)
        
        state.todayKm -= Math.floor(state.todayKm)
        state.rubBalance += result.rub
        state.totalEarned += result.rub
        
        state.transactions.unshift({
            type: 'rub',
            amount: result.rub,
            date: new Date().toLocaleDateString()
        })
        
        checkBadges()
        await saveUserData()
        updateDisplay()
        updateTransactionsList()
        
        const message = `Обменяно! Получено ${result.rub} ₽`
        if (tg && tg.showAlert) {
            tg.showAlert(message)
        } else {
            alert(message)
        }
    } catch (error) {
        console.error('Failed to convert to rub:', error)
        convertToRubLocally()
    }
})

function convertToRubLocally() {
    const rub = Math.floor(state.todayKm) * 10
    state.todayKm -= Math.floor(state.todayKm)
    state.rubBalance += rub
    state.totalEarned += rub
    
    state.transactions.unshift({
        type: 'rub',
        amount: rub,
        date: new Date().toLocaleDateString()
    })
    
    checkBadges()
    saveUserData()
    updateDisplay()
    updateTransactionsList()
    
    alert(`Обменяно! Получено ${rub} ₽`)
}

function updateTransactionsList() {
    const list = document.getElementById('transactionsList')
    
    if (state.transactions.length === 0) {
        list.innerHTML = '<div class="transaction-item empty">Нет транзакций</div>'
    } else {
        list.innerHTML = state.transactions.map(t => `
            <div class="transaction-item">
                <span>${t.date}</span>
                <strong>${t.type === 'stars' ? '⭐' : '💰'} +${t.amount} ${t.type === 'stars' ? '⭐' : '₽'}</strong>
            </div>
        `).join('')
    }
}

// Шагомер (улучшенная версия)
let stepCounter = 0
let lastStepTime = 0
const STEP_THRESHOLD = 500 // минимальный интервал между шагами в мс

function initStepCounter() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion)
    } else {
        // Имитация шагов для тестирования на десктопе
        setInterval(() => {
            if (Math.random() > 0.7) {
                state.todaySteps++
                state.totalSteps++
                updateDisplay()
                saveUserData()
            }
        }, 3000)
    }
}

function handleMotion(event) {
    const acc = event.accelerationIncludingGravity
    if (!acc) return
    
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z)
    const currentTime = Date.now()
    
    // Проверка порога и интервала
    if (magnitude > 15 && (currentTime - lastStepTime) > STEP_THRESHOLD) {
        stepCounter++
        lastStepTime = currentTime
        
        if (stepCounter >= 2) { // Снижаем порог для более точного подсчета
            state.todaySteps++
            state.totalSteps++
            stepCounter = 0
            updateDisplay()
            saveUserData()
            
            // Проверка достижений
            if (state.totalSteps >= 1000) {
                state.badges['1000steps'] = true
                checkBadges()
            }
        }
    }
}

// Инициализация шагомера
initStepCounter()

// Обработка вывода средств
document.querySelectorAll('.btn-withdraw').forEach(btn => {
    btn.addEventListener('click', async () => {
        const method = btn.textContent.toLowerCase()
        let amount, wallet
        
        if (method === 'telegram') {
            amount = state.starsBalance
            if (amount < 1) {
                const message = 'Недостаточно Stars для вывода!'
                if (tg && tg.showAlert) {
                    tg.showAlert(message)
                } else {
                    alert(message)
                }
                return
            }
            
            // Для Telegram вывода используем встроенный метод
            if (tg && tg.requestInvoice) {
                try {
                    await tg.requestInvoice({
                        currency: 'XTR',
                        amount: amount * 100, // Stars в копейках
                        title: 'Вывод Stars',
                        description: `Вывод ${amount} Stars на ваш аккаунт`,
                        provider_token: '',
                        payload: JSON.stringify({ type: 'withdrawal', amount })
                    })
                } catch (error) {
                    console.error('Invoice request failed:', error)
                }
            } else {
                // Fallback для демо режима
                processWithdrawal(amount, 'stars', 'telegram')
            }
        } else {
            amount = state.rubBalance
            if (amount < 10) {
                const message = 'Минимальная сумма вывода 10 ₽!'
                if (tg && tg.showAlert) {
                    tg.showAlert(message)
                } else {
                    alert(message)
                }
                return
            }
            
            wallet = prompt(`Введите ваш ${method} кошелек для вывода ${amount} ₽:`)
            if (!wallet) return
            
            processWithdrawal(amount, 'rub', method, wallet)
        }
    })
})

async function processWithdrawal(amount, currency, method, wallet = '') {
    try {
        const result = await api.withdraw(amount, currency, method, wallet)
        
        if (result.success) {
            // Обновляем баланс
            if (currency === 'stars') {
                state.starsBalance -= amount
            } else {
                state.rubBalance -= amount
            }
            
            state.transactions.unshift({
                type: 'withdrawal',
                amount,
                method,
                status: 'pending',
                date: new Date().toLocaleDateString()
            })
            
            await saveUserData()
            updateDisplay()
            updateTransactionsList()
            
            const message = `Заявка на вывод создана! Сумма: ${amount} ${currency === 'stars' ? '⭐' : '₽'}`
            if (tg && tg.showAlert) {
                tg.showAlert(message)
            } else {
                alert(message)
            }
        }
    } catch (error) {
        console.error('Withdrawal failed:', error)
        // Fallback
        processWithdrawalLocally(amount, currency, method, wallet)
    }
}

function processWithdrawalLocally(amount, currency, method, wallet) {
    // Локальная обработка как fallback
    if (currency === 'stars') {
        state.starsBalance -= amount
    } else {
        state.rubBalance -= amount
    }
    
    state.transactions.unshift({
        type: 'withdrawal',
        amount,
        method,
        wallet,
        status: 'pending',
        date: new Date().toLocaleDateString()
    })
    
    saveUserData()
    updateDisplay()
    updateTransactionsList()
    
    alert(`Заявка на вывод создана! Сумма: ${amount} ${currency === 'stars' ? '⭐' : '₽'}`)
}

// API класс для работы с бэкендом
class API {
    constructor() {
        this.baseURL = window.location.origin + '/api'
        this.telegramId = user?.id?.toString() || 'demo'
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`
        const headers = {
            'Content-Type': 'application/json',
            'telegram-web-app-init-data': tg?.initData || '',
            ...options.headers
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            return await response.json()
        } catch (error) {
            console.error('API request failed:', error)
            // В случае ошибки бэкенда, используем localStorage
            return this.fallbackRequest(endpoint, options)
        }
    }
    
    fallbackRequest(endpoint, options) {
        console.log('Using fallback localStorage for:', endpoint)
        return new Promise((resolve) => {
            // Имитация ответа API для оффлайн режима
            if (endpoint.includes('/user/')) {
                const userData = localStorage.getItem('velopath_user')
                resolve(userData ? JSON.parse(userData) : this.getDefaultUser())
            } else {
                resolve({ success: true })
            }
        })
    }
    
    getDefaultUser() {
        return {
            telegramId: this.telegramId,
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
            }
        }
    }
    
    async getUser() {
        return this.request(`/user/${this.telegramId}`)
    }
    
    async updateUser(data) {
        return this.request(`/user/${this.telegramId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }
    
    async saveRoute(routeData) {
        return this.request(`/routes/${this.telegramId}`, {
            method: 'POST',
            body: JSON.stringify(routeData)
        })
    }
    
    async getRoutes() {
        return this.request(`/routes/${this.telegramId}`)
    }
    
    async convertToStars(steps) {
        return this.request(`/convert/stars/${this.telegramId}`, {
            method: 'POST',
            body: JSON.stringify({ steps })
        })
    }
    
    async convertToRub(km) {
        return this.request(`/convert/rub/${this.telegramId}`, {
            method: 'POST',
            body: JSON.stringify({ km })
        })
    }
    
    async withdraw(amount, method, wallet) {
        return this.request(`/withdraw/${this.telegramId}`, {
            method: 'POST',
            body: JSON.stringify({ amount, method, wallet })
        })
    }
    
    async getStats() {
        return this.request(`/stats/${this.telegramId}`)
    }
}

const api = new API()

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const userData = await api.getUser()
        Object.assign(state, userData)
        updateDisplay()
        updateRoutesList()
        updateTransactionsList()
        checkBadges()
    } catch (error) {
        console.error('Failed to load user data:', error)
    }
}

// Сохранение данных пользователя
async function saveUserData() {
    try {
        await api.updateUser(state)
        // Также сохраняем в localStorage как бэкап
        localStorage.setItem('velopath_user', JSON.stringify(state))
    } catch (error) {
        console.error('Failed to save user data:', error)
        // Сохраняем только в localStorage
        localStorage.setItem('velopath_user', JSON.stringify(state))
    }
}

// Обновление времени каждую секунду
setInterval(() => {
    if (tracking.active && !tracking.paused) {
        updateTrackerDisplay()
    }
}, 1000)

// Периодическое сохранение данных
setInterval(() => {
    saveUserData()
}, 30000) // Каждые 30 секунд

// Инициализация
loadUserData()