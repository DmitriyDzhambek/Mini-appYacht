// Система логирования действий пользователей
class UserActionsLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Максимальное количество логов
        this.storageKey = 'proshaylen_user_logs';
        this.loadLogs();
    }

    // Загрузка логов из localStorage
    loadLogs() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.logs = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Ошибка загрузки логов:', error);
            this.logs = [];
        }
    }

    // Сохранение логов в localStorage
    saveLogs() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (error) {
            console.error('Ошибка сохранения логов:', error);
        }
    }

    // Добавление нового лога
    log(action, data = {}) {
        const logEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action: action,
            data: data,
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logs.unshift(logEntry);
        
        // Ограничиваем количество логов
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        this.saveLogs();
        console.log('User action logged:', logEntry);
    }

    // Получение ID сессии
    getSessionId() {
        let sessionId = sessionStorage.getItem('proshaylen_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('proshaylen_session_id', sessionId);
        }
        return sessionId;
    }

    // Получение всех логов
    getAllLogs() {
        return this.logs;
    }

    // Получение логов по действию
    getLogsByAction(action) {
        return this.logs.filter(log => log.action === action);
    }

    // Получение логов за период
    getLogsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= start && logDate <= end;
        });
    }

    // Получение статистики
    getStats() {
        const stats = {};
        this.logs.forEach(log => {
            if (!stats[log.action]) {
                stats[log.action] = 0;
            }
            stats[log.action]++;
        });
        return stats;
    }

    // Очистка логов
    clearLogs() {
        this.logs = [];
        this.saveLogs();
    }

    // Экспорт логов
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `user_logs_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// Глобальный экземпляр логгера
window.userLogger = new UserActionsLogger();

// Улучшенная функция для логирования действий
function saveUserAction(action, data = {}) {
    window.userLogger.log(action, data);
    
    // Дополнительное сохранение в основной state для совместимости
    if (typeof state !== 'undefined' && state.userActions) {
        state.userActions.push({
            id: Date.now(),
            action: action,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        // Ограничиваем количество действий в state
        if (state.userActions.length > 100) {
            state.userActions = state.userActions.slice(-100);
        }
    }
}

// Автоматическое логирование важных событий
window.addEventListener('load', () => {
    saveUserAction('app_loaded', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`
    });
});

window.addEventListener('beforeunload', () => {
    saveUserAction('app_unloaded', {
        session_duration: Date.now() - (window.sessionStartTime || Date.now())
    });
});

window.addEventListener('error', (event) => {
    saveUserAction('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null
    });
});

// Логирование кликов по кнопкам
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'BUTTON' || target.onclick) {
        saveUserAction('button_click', {
            button_text: target.textContent,
            button_class: target.className,
            button_id: target.id
        });
    }
});

// Логирование изменений в полях ввода
document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        saveUserAction('input_changed', {
            input_type: target.tagName,
            input_name: target.name || target.id,
            input_class: target.className
        });
    }
});

console.log('User actions logger initialized');
