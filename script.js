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
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp
    tg.expand()
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
function saveRoute() {
    if (tracking.distance < 10) {
        alert('Маршрут слишком короткий')
        return
    }
    
    const route = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        distance: tracking.distance,
        time: tracking.elapsedTime,
        positions: [...tracking.positions]
    }
    
    state.routes.unshift(route)
    state.todayKm += tracking.distance / 1000
    state.totalKm += tracking.distance / 1000
    
    // Проверка достижений
    checkBadges()
    
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
function checkBadges() {
    const badges = document.querySelectorAll('.badge-item')
    
    // Первый маршрут
    if (state.routes.length >= 1) {
        state.badges['first-route'] = true
    }
    
    // 10 км
    if (state.totalKm >= 10) {
        state.badges['10km'] = true
    }
    
    // 100 км
    if (state.totalKm >= 100) {
        state.badges['100km'] = true
    }
    
    // 1000 шагов
    if (state.totalSteps >= 1000) {
        state.badges['1000steps'] = true
    }
    
    // Вывод денег
    if (state.rubBalance > 0) {
        state.badges['money'] = true
    }
    
    // Обновить UI
    badges.forEach(badge => {
        const badgeId = badge.dataset.badge
        if (state.badges[badgeId]) {
            badge.classList.remove('locked')
        }
    })
}

// Конвертация шагов в Stars
document.getElementById('convertToStars').addEventListener('click', () => {
    if (state.todaySteps < 1000) {
        alert('Нужно минимум 1000 шагов для обмена!')
        return
    }
    
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
    updateDisplay()
    updateTransactionsList()
    
    alert(`Обменяно! Получено ${stars} ⭐`)
})

// Конвертация км в рубли
document.getElementById('convertToRub').addEventListener('click', () => {
    if (state.todayKm < 1) {
        alert('Нужно минимум 1 км для обмена!')
        return
    }
    
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
    updateDisplay()
    updateTransactionsList()
    
    alert(`Обменяно! Получено ${rub} ₽`)
})

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

// Шагомер (имитация)
let stepCounter = 0
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', event => {
        const acc = event.accelerationIncludingGravity
        if (acc && (Math.abs(acc.x) > 15 || Math.abs(acc.y) > 15 || Math.abs(acc.z) > 15)) {
            stepCounter++
            if (stepCounter >= 10) {
                state.todaySteps++
                state.totalSteps++
                stepCounter = 0
                updateDisplay()
            }
        }
    })
}

// Обновление времени каждую секунду
setInterval(() => {
    if (tracking.active && !tracking.paused) {
        updateTrackerDisplay()
    }
}, 1000)

// Инициализация
updateDisplay()
updateRoutesList()
updateTransactionsList()
updateTrackerButtons()