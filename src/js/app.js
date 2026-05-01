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
    },
    settings: {
        notifications: true,
        autoSave: true,
        theme: 'auto'
    },
    stats: {
        weeklyKm: 0,
        monthlyKm: 0,
        avgSpeed: 0,
        bestRoute: null
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
    positions: [],
    currentSpeed: 0,
    maxSpeed: 0,
    elevation: 0,
    calories: 0
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

function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp
        user = tg.initDataUnsafe?.user
        
        // Обработка startapp параметра
        const startParam = tg.initDataUnsafe?.start_param || 'mini-app-yacht-4hva'
        console.log('Start parameter:', startParam)
        
        // Настройка WebApp
        tg.expand()
        tg.ready()
        
        // Установка темы
        if (tg.themeParams) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e')
            document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff')
            document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#007bff')
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#0f0f23')
            document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999')
        }
        
        // Настройка кнопки "Главный экран"
        tg.MainButton.setText('VeloPath')
        tg.MainButton.onClick(() => {
            showScreen('home')
        })
        
        // Настройка кнопки "Назад"
        tg.BackButton.onClick(() => {
            showScreen('home')
        })
        
        // Настройка заголовка
        tg.setHeaderColor('#1a1a2e')
        
        // Поддержка закрытия приложения
        tg.onEvent('viewportChanged', () => {
            console.log('Viewport changed:', tg.viewportHeight)
        })
        
        // Поддержка свайпа назад
        tg.onEvent('backButtonClicked', () => {
            showScreen('home')
        })
        
        // Показываем информацию о пользователе
        console.log('Telegram user:', user)
        console.log('WebApp version:', tg.version)
        console.log('Platform:', tg.platform)
        
        // Отправка данных при необходимости
        if (tg.sendData) {
            window.sendDataToTelegram = (data) => {
                tg.sendData(JSON.stringify(data))
            }
        }
        
        // Поддержка платежей
        if (tg.openInvoice) {
            window.openTelegramInvoice = (url, callback) => {
                tg.openInvoice(url, (status) => {
                    if (callback) callback(status)
                })
            }
        }
        
        return true
    } else {
        console.log('Telegram WebApp не найден, используем демо-режим')
        // Демо пользователь для тестирования
        user = {
            id: 12345,
            first_name: 'Demo',
            last_name: 'User',
            username: 'demo_user',
            language_code: 'ru'
        }
        
        // Эмуляция Telegram API для тестирования
        tg = {
            expand: () => console.log('Demo: expand()'),
            ready: () => console.log('Demo: ready()'),
            themeParams: {
                bg_color: '#1a1a2e',
                text_color: '#ffffff',
                button_color: '#007bff',
                hint_color: '#999999'
            },
            MainButton: {
                setText: () => console.log('Demo: MainButton.setText()'),
                onClick: () => console.log('Demo: MainButton.onClick()'),
                show: () => console.log('Demo: MainButton.show()'),
                hide: () => console.log('Demo: MainButton.hide()')
            },
            BackButton: {
                onClick: () => console.log('Demo: BackButton.onClick()'),
                show: () => console.log('Demo: BackButton.show()'),
                hide: () => console.log('Demo: BackButton.hide()')
            },
            setHeaderColor: () => console.log('Demo: setHeaderColor()'),
            showAlert: (msg) => alert(msg),
            showConfirm: (msg, callback) => {
                if (confirm(msg)) callback(true)
                else callback(false)
            },
            sendData: (data) => console.log('Demo: sendData()', data),
            version: '6.0',
            platform: 'demo'
        }
        
        return false
    }
}

// Инициализация при загрузке
const isTelegram = initTelegramWebApp()

// API класс для взаимодействия с бэкендом
class API {
    constructor() {
        this.baseURL = window.location.origin + '/api'
        this.telegramId = user?.id?.toString() || 'demo'
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'telegram-web-app-init-data': tg?.initData || ''
                },
                ...options
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('API request failed:', error)
            // Fallback на localStorage
            return this.fallbackRequest(endpoint, options)
        }
    }

    async fallbackRequest(endpoint, options = {}) {
        // Имитация ответов API для оффлайн режима
        const fallbackData = localStorage.getItem(`velopath_${endpoint}`)
        if (fallbackData) {
            return JSON.parse(fallbackData)
        }

        // Базовые ответы для демо режима
        switch (endpoint) {
            case `/user/${this.telegramId}`:
                return state
            case `/routes/${this.telegramId}`:
                return state.routes.map(id => ({ id, date: new Date().toISOString(), distance: 1000 }))
            default:
                return { error: 'Offline mode' }
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

// Текущая активность
let currentActivity = 'walk'

// Навигация
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
    
    // Управление кнопками Telegram
    if (tg) {
        if (screenName === 'home') {
            tg.MainButton.hide()
            tg.BackButton.hide()
        } else {
            tg.MainButton.show()
            tg.BackButton.show()
        }
        
        // Обновление заголовка
        if (screenName === 'tracker') {
            tg.setHeaderColor('#007bff')
        } else if (screenName === 'wallet') {
            tg.setHeaderColor('#28a745')
        } else if (screenName === 'routes') {
            tg.setHeaderColor('#ffc107')
        } else {
            tg.setHeaderColor('#1a1a2e')
        }
    }
}

// Кнопка "Начать трекинг"
document.getElementById('startTracking').addEventListener('click', () => {
    showScreen('tracker')
})

// Переключатель активности
const activityToggle = document.getElementById('activityToggle')
const activitySelector = document.getElementById('activitySelector')

activityToggle.addEventListener('change', () => {
    if (activityToggle.checked) {
        activitySelector.style.display = 'flex'
    } else {
        activitySelector.style.display = 'none'
        currentActivity = 'walk'
        document.querySelectorAll('.activity-option').forEach(opt => {
            opt.classList.remove('active')
        })
        document.querySelector('[data-activity="walk"]').classList.add('active')
    }
})

document.querySelectorAll('.activity-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.activity-option').forEach(opt => {
            opt.classList.remove('active')
        })
        option.classList.add('active')
        currentActivity = option.dataset.activity
    })
})

// Функции трекинга
function startTracking() {
    tracking.active = true
    tracking.paused = false
    tracking.startTime = Date.now()
    
    // Запуск GPS
    if (navigator.geolocation) {
        tracking.watchId = navigator.geolocation.watchPosition(
            position => {
                const lat = position.coords.latitude
                const lon = position.coords.longitude
                const speed = position.coords.speed || 0
                const timestamp = Date.now()

                tracking.positions.push({ lat, lon, speed, time: timestamp })
                
                // Расчет текущей скорости
                if (tracking.positions.length > 1) {
                    const prev = tracking.positions[tracking.positions.length - 2]
                    const curr = tracking.positions[tracking.positions.length - 1]
                    const dist = getDistance(prev.lat, prev.lon, curr.lat, curr.lon)
                    const timeDiff = (curr.time - prev.time) / 1000 // в секундах
                    
                    tracking.distance += dist
                    
                    if (timeDiff > 0) {
                        tracking.currentSpeed = (dist / timeDiff) * 3.6 // км/ч
                    }
                } else {
                    tracking.currentSpeed = speed * 3.6 // конвертация м/с в км/ч
                }

                updateTrackerDisplay()
            },
            error => {
                if (error.code === error.PERMISSION_DENIED) {
                    if (tg && tg.showAlert) {
                        tg.showAlert('Доступ к геолокации запрещён. Для работы трекинга разрешите доступ в настройках браузера.')
                    } else {
                        alert('Доступ к геолокации запрещён. Для работы трекинга разрешите доступ в настройках браузера.')
                    }
                } else {
                    if (tg && tg.showAlert) {
                        tg.showAlert('Ошибка GPS: ' + error.message)
                    } else {
                        alert('Ошибка GPS: ' + error.message)
                    }
                }
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        )
    }

    updateTrackerButtons()
}

function pauseTracking() {
    tracking.paused = !tracking.paused
    
    if (tracking.paused) {
        tracking.elapsedTime += Date.now() - tracking.startTime
        tracking.startTime = null
    } else {
        tracking.startTime = Date.now()
    }
    
    updateTrackerButtons()
}

function stopTracking() {
    tracking.active = false
    tracking.paused = false
    
    if (tracking.watchId) {
        navigator.geolocation.clearWatch(tracking.watchId)
        tracking.watchId = null
    }
    
    if (tracking.startTime) {
        tracking.elapsedTime += Date.now() - tracking.startTime
        tracking.startTime = null
    }
    
    updateTrackerButtons()
    saveRoute()
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
    
    // Скорость (текущая и средняя)
    const avgSpeed = totalTime > 0 ? (tracking.distance / 1000) / (totalTime / 3600000) : 0
    const displaySpeed = tracking.currentSpeed > 0 ? tracking.currentSpeed : avgSpeed
    document.getElementById('trackerSpeed').textContent = displaySpeed.toFixed(1)
    
    // Обновление максимальной скорости
    if (tracking.currentSpeed > tracking.maxSpeed) {
        tracking.maxSpeed = tracking.currentSpeed
    }
    
    // Расчет калорий (приблизительно)
    const caloriesPerKm = currentActivity === 'bike' ? 50 : currentActivity === 'run' ? 70 : 40
    tracking.calories = Math.floor((tracking.distance / 1000) * caloriesPerKm)
}

function updateTrackerButtons() {
    const btnStart = document.getElementById('btnStart')
    const btnPause = document.getElementById('btnPause')
    const btnStop = document.getElementById('btnStop')
    
    if (!tracking.active) {
        btnStart.style.display = 'block'
        btnPause.style.display = 'none'
        btnStop.style.display = 'none'
    } else {
        btnStart.style.display = 'none'
        btnStop.style.display = 'block'
        
        if (tracking.paused) {
            btnPause.style.display = 'block'
            btnPause.textContent = 'Продолжить'
        } else {
            btnPause.style.display = 'block'
            btnPause.textContent = 'Пауза'
        }
    }
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
        
        state.routes.push(savedRoute.id)
        state.todayKm += tracking.distance / 1000
        state.totalKm += tracking.distance / 1000
        
        checkBadges()
        await saveUserData()
        updateDisplay()
        updateRoutesList()
        
        if (tg && tg.showAlert) {
            tg.showAlert('Маршрут сохранён!')
        } else {
            alert('Маршрут сохранён!')
        }
        
        showScreen('home')
    } catch (error) {
        console.error('Failed to save route:', error)
        saveRouteLocally(route)
    }
}

function saveRouteLocally(route) {
    // Fallback сохранение в localStorage
    const routes = JSON.parse(localStorage.getItem('velopath_routes') || '[]')
    const newRoute = {
        id: Date.now(),
        ...route,
        date: new Date().toISOString()
    }
    routes.push(newRoute)
    localStorage.setItem('velopath_routes', JSON.stringify(routes))
    
    state.routes.push(newRoute.id)
    state.todayKm += route.distance / 1000
    state.totalKm += route.distance / 1000
    
    checkBadges()
    saveUserData()
    updateDisplay()
    updateRoutesList()
    
    alert('Маршрут сохранён локально!')
}

// Расстояние между двумя точками
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3 // Радиус Земли в метрах
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

// Шагомер
let stepCount = 0
let lastStepTime = 0
let stepThreshold = 500 // минимальный интервал между шагами в мс

function initStepCounter() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion)
    } else {
        // Демо режим для desktop
        setInterval(() => {
            if (Math.random() > 0.7) {
                stepCount++
                state.todaySteps++
                updateDisplay()
            }
        }, 2000)
    }
}

function handleMotion(event) {
    const acceleration = event.accelerationIncludingGravity
    const currentTime = Date.now()
    
    if (currentTime - lastStepTime < stepThreshold) {
        return
    }
    
    const totalAcceleration = Math.sqrt(
        acceleration.x ** 2 + 
        acceleration.y ** 2 + 
        acceleration.z ** 2
    )
    
    if (totalAcceleration > 15) {
        stepCount++
        state.todaySteps++
        lastStepTime = currentTime
        updateDisplay()
    }
}

// Обновление отображения
function updateDisplay() {
    // Главный экран
    document.getElementById('todaySteps').textContent = state.todaySteps.toLocaleString()
    document.getElementById('todayKm').textContent = state.todayKm.toFixed(2)
    document.getElementById('starsBalance').textContent = state.starsBalance
    document.getElementById('rubBalance').textContent = state.rubBalance
    
    // Кошелёк
    document.getElementById('totalSteps').textContent = state.totalSteps.toLocaleString()
    document.getElementById('totalKm').textContent = state.totalKm.toFixed(2)
    document.getElementById('totalEarned').textContent = state.totalEarned
    
    updateTransactionsList()
    updateBadgesList()
}

function updateTransactionsList() {
    const container = document.getElementById('transactionsList')
    if (!container) return
    
    if (state.transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">Пока нет транзакций</p>'
        return
    }
    
    container.innerHTML = state.transactions.slice(0, 10).map(t => `
        <div class="transaction-item">
            <div class="transaction-type ${t.type}">
                ${t.type === 'stars' ? '⭐' : t.type === 'rub' ? '💰' : '💸'} ${t.type}
            </div>
            <div class="transaction-amount">${t.amount}</div>
            <div class="transaction-date">${t.date}</div>
        </div>
    `).join('')
}

function updateBadgesList() {
    const container = document.getElementById('badgesList')
    if (!container) return
    
    container.innerHTML = Object.entries(state.badges).map(([key, unlocked]) => `
        <div class="badge-item ${unlocked ? 'unlocked' : 'locked'}" data-badge="${key}">
            <div class="badge-icon">${getBadgeIcon(key)}</div>
            <div class="badge-name">${getBadgeName(key)}</div>
        </div>
    `).join('')
}

function getBadgeIcon(key) {
    const icons = {
        'first-route': '🌱',
        '10km': '🏃',
        '100km': '🚀',
        '1000steps': '👟',
        'money': '💰'
    }
    return icons[key] || '🏅'
}

function getBadgeName(key) {
    const names = {
        'first-route': 'Первый маршрут',
        '10km': '10 км',
        '100km': '100 км',
        '1000steps': '1000 шагов',
        'money': 'Первый вывод'
    }
    return names[key] || 'Достижение'
}

function updateRoutesList() {
    const container = document.getElementById('routesList')
    if (!container) return
    
    if (state.routes.length === 0) {
        container.innerHTML = '<p class="empty-state">Пока нет маршрутов</p>'
        return
    }
    
    // Получаем данные о маршрутах
    api.getRoutes().then(routes => {
        container.innerHTML = routes.map(r => `
            <div class="route-item">
                <div class="route-activity">${getActivityIcon(r.activity)} ${getActivityName(r.activity)}</div>
                <div>
                    <strong>${r.date}</strong>
                    <span>${(r.distance/1000).toFixed(2)} км</span>
                </div>
            </div>
        `).join('')
    }).catch(error => {
        console.error('Failed to load routes:', error)
        // Fallback на localStorage
        const routes = JSON.parse(localStorage.getItem('velopath_routes') || '[]')
        container.innerHTML = routes.map(r => `
            <div class="route-item">
                <div class="route-activity">${getActivityIcon(r.activity)} ${getActivityName(r.activity)}</div>
                <div>
                    <strong>${r.date}</strong>
                    <span>${(r.distance/1000).toFixed(2)} км</span>
                </div>
            </div>
        `).join('')
    })
}

function getActivityIcon(activity) {
    const icons = {
        walk: '🚶',
        run: '🏃',
        bike: '🚴',
        roller: '🛹'
    }
    return icons[activity] || '🚶'
}

function getActivityName(activity) {
    const names = {
        walk: 'Прогулка',
        run: 'Пробежка',
        bike: 'Велопоездка',
        roller: 'Ролики'
    }
    return names[activity] || 'Активность'
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

// Вывод средств
document.getElementById('withdrawStars').addEventListener('click', async () => {
    const amount = prompt(`Сколько Stars вывести? (Доступно: ${state.starsBalance} ⭐)`, state.starsBalance)
    if (!amount || amount <= 0 || amount > state.starsBalance) return
    
    if (isTelegram && tg.openInvoice) {
        // Используем нативные платежи Telegram
        try {
            const invoiceUrl = `https://t.me/VeloPath_Bot?start=withdraw_stars_${amount}`
            window.openTelegramInvoice(invoiceUrl, (status) => {
                if (status === 'paid') {
                    state.starsBalance -= Number(amount)
                    state.transactions.unshift({
                        type: 'withdrawal',
                        amount: Number(amount),
                        method: 'stars',
                        status: 'completed',
                        date: new Date().toLocaleDateString()
                    })
                    saveUserData()
                    updateDisplay()
                    updateTransactionsList()
                    tg.showAlert('Вывод Stars выполнен успешно!')
                } else if (status === 'cancelled') {
                    tg.showAlert('Операция отменена')
                } else {
                    tg.showAlert('Ошибка при выводе Stars')
                }
            })
        } catch (error) {
            console.error('Telegram invoice error:', error)
            fallbackWithdrawStars(amount)
        }
    } else {
        fallbackWithdrawStars(amount)
    }
})

document.getElementById('withdrawRub').addEventListener('click', async () => {
    const amount = prompt(`Сколько рублей вывести? (Доступно: ${state.rubBalance} ₽)`, state.rubBalance)
    if (!amount || amount <= 0 || amount > state.rubBalance) return
    
    if (isTelegram) {
        // Показываем диалог с выбором способа вывода
        const methods = ['ЮМани', 'FK Wallet', 'QIWI', 'Карта']
        const methodText = methods.join('\n')
        const selectedMethod = prompt(`Выберите способ вывода:\n${methodText}\n\nВведите номер способа (1-${methods.length}):`)
        
        if (!selectedMethod || selectedMethod < 1 || selectedMethod > methods.length) return
        
        const method = methods[selectedMethod - 1]
        const wallet = prompt(`Введите номер ${method}:`)
        if (!wallet) return
        
        try {
            const result = await api.withdraw(Number(amount), 'rub', wallet)
            
            state.rubBalance -= Number(amount)
            state.transactions.unshift({
                type: 'withdrawal',
                amount: Number(amount),
                method: 'rub',
                wallet: wallet,
                status: 'pending',
                date: new Date().toLocaleDateString()
            })
            
            await saveUserData()
            updateDisplay()
            updateTransactionsList()
            
            if (tg && tg.showAlert) {
                tg.showAlert(`Запрос на вывод ${amount} ₽ на ${method} отправлен!`)
            } else {
                alert(`Запрос на вывод ${amount} ₽ на ${method} отправлен!`)
            }
        } catch (error) {
            console.error('Failed to withdraw rub:', error)
            alert('Ошибка вывода. Попробуйте позже.')
        }
    } else {
        fallbackWithdrawRub(amount)
    }
})

function fallbackWithdrawStars(amount) {
    try {
        const result = api.withdraw(Number(amount), 'stars', 'telegram')
        
        state.starsBalance -= Number(amount)
        state.transactions.unshift({
            type: 'withdrawal',
            amount: Number(amount),
            method: 'stars',
            status: 'pending',
            date: new Date().toLocaleDateString()
        })
        
        saveUserData()
        updateDisplay()
        updateTransactionsList()
        
        alert(`Запрос на вывод ${amount} Stars отправлен!`)
    } catch (error) {
        console.error('Failed to withdraw stars:', error)
        alert('Ошибка вывода. Попробуйте позже.')
    }
}

function fallbackWithdrawRub(amount) {
    const wallet = prompt('Номер кошелька (ЮМани, FK Wallet и т.д.):')
    if (!wallet) return
    
    try {
        const result = api.withdraw(Number(amount), 'rub', wallet)
        
        state.rubBalance -= Number(amount)
        state.transactions.unshift({
            type: 'withdrawal',
            amount: Number(amount),
            method: 'rub',
            wallet: wallet,
            status: 'pending',
            date: new Date().toLocaleDateString()
        })
        
        saveUserData()
        updateDisplay()
        updateTransactionsList()
        
        alert(`Запрос на вывод ${amount} ₽ отправлен!`)
    } catch (error) {
        console.error('Failed to withdraw rub:', error)
        alert('Ошибка вывода. Попробуйте позже.')
    }
}

// Сохранение и загрузка данных
async function saveUserData() {
    try {
        await api.updateUser(state)
        localStorage.setItem('velopath_state', JSON.stringify(state))
    } catch (error) {
        console.error('Failed to save user data:', error)
        localStorage.setItem('velopath_state', JSON.stringify(state))
    }
}

async function loadUserData() {
    try {
        const userData = await api.getUser()
        Object.assign(state, userData)
    } catch (error) {
        console.error('Failed to load user data:', error)
        const savedState = localStorage.getItem('velopath_state')
        if (savedState) {
            Object.assign(state, JSON.parse(savedState))
        }
    }
    
    updateDisplay()
    updateRoutesList()
    updateTransactionsList()
    checkBadges()
}

// Периодическое сохранение данных
setInterval(() => {
    if (state.settings.autoSave) {
        saveUserData()
    }
}, 30000) // каждые 30 секунд

// Обработчики кнопок трекинга
document.getElementById('btnStart').addEventListener('click', startTracking)
document.getElementById('btnPause').addEventListener('click', pauseTracking)
document.getElementById('btnStop').addEventListener('click', stopTracking)

// Навигация
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen(btn.dataset.screen)
    })
})

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadUserData()
    initStepCounter()
    updateDisplay()
    
    // Обновление трекера каждую секунду
    setInterval(() => {
        if (tracking.active && !tracking.paused) {
            updateTrackerDisplay()
        }
    }, 1000)
})

// Загрузка данных пользователя
loadUserData()
