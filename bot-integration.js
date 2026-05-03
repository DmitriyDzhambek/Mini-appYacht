// Интеграция с Telegram ботом MiniYacht_Bot
class BotIntegration {
    constructor() {
        this.botToken = 'YOUR_BOT_TOKEN'; // Нужно заменить на реальный токен
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.userId = null;
        this.isInitialized = false;
    }

    // Инициализация с данными Telegram WebApp
    init() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
            this.isInitialized = true;
            console.log('Bot integration initialized for user:', this.userId);
        }
    }

    // Отправка уведомления в бот
    async sendNotification(message, data = {}) {
        if (!this.isInitialized || !this.userId) {
            console.warn('Bot integration not initialized');
            return false;
        }

        try {
            // Формируем красивое сообщение
            const formattedMessage = this.formatMessage(message, data);
            
            // Отправляем в бот для уведомления пользователя
            const response = await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.userId,
                    text: formattedMessage,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            });

            if (response.ok) {
                console.log('Notification sent successfully');
                return true;
            } else {
                console.error('Failed to send notification:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    }

    // Форматирование сообщения с эмодзи и HTML
    formatMessage(message, data) {
        let formatted = `🏃‍♂️ <b>Прощай лень</b>\n\n`;
        
        // Добавляем временную метку
        const now = new Date().toLocaleString('ru-RU');
        formatted += `📅 <i>${now}</i>\n\n`;
        
        // Основное сообщение
        formatted += `${message}\n\n`;
        
        // Добавляем дополнительную информацию если есть
        if (Object.keys(data).length > 0) {
            formatted += `📊 <b>Детали:</b>\n`;
            Object.entries(data).forEach(([key, value]) => {
                const emoji = this.getDataEmoji(key);
                formatted += `${emoji} ${this.formatKey(key)}: <b>${value}</b>\n`;
            });
        }
        
        // Добавляем призыв к действию
        formatted += `\n💡 <i>Откройте приложение чтобы увидеть детали</i>`;
        
        return formatted;
    }

    // Получение эмодзи для типа данных
    getDataEmoji(key) {
        const emojis = {
            steps: '👟',
            km: '🚴',
            stars: '⭐',
            rub: '💰',
            habit_name: '🎯',
            snack_name: '🥪',
            diary_title: '📝',
            bike_status: '🔧',
            referral_count: '👥',
            premium_status: '👑'
        };
        return emojis[key] || '📋';
    }

    // Форматирование ключа для читаемости
    formatKey(key) {
        const translations = {
            steps: 'Шаги',
            km: 'Километры',
            stars: 'Stars',
            rub: 'Рубли',
            habit_name: 'Привычка',
            snack_name: 'Перекус',
            diary_title: 'Запись в дневнике',
            bike_status: 'Состояние велосипеда',
            referral_count: 'Приглашено друзей',
            premium_status: 'Premium статус'
        };
        return translations[key] || key;
    }

    // Отправка статистики пользователя
    async sendUserStats() {
        if (!window.state) return;

        const stats = {
            '📊 Ваша статистика:': '',
            '👟 Шаги:': state.steps,
            '🚴 Километры:': state.km.toFixed(2),
            '⭐ Stars:': state.stars,
            '💰 Рубли:': state.rub,
            '🎯 Привычек выполнено:': state.habits.filter(h => h.completed).length + '/' + state.habits.length,
            '🥪 Перекусов:': state.snacks.length,
            '📝 Записей в дневнике:': state.diary.length,
            '👥 Приглашено друзей:': state.referral.totalReferrals,
            '👑 Premium:': state.premium ? 'Активен' : 'Не активен'
        };

        let message = '📈 <b>Ваша текущая статистика</b>\n\n';
        Object.entries(stats).forEach(([key, value]) => {
            if (key.includes(':')) {
                message += `${key} <b>${value}</b>\n`;
            }
        });

        return await this.sendNotification(message);
    }

    // Отправка уведомления о достижении
    async sendAchievementNotification(achievement) {
        const message = `🎉 <b>Новое достижение!</b>\n\n${achievement}`;
        return await this.sendNotification(message);
    }

    // Отправка уведомления о привычке
    async sendHabitNotification(habitName, completed) {
        const status = completed ? '✅ Выполнена' : '❌ Не выполнена';
        const message = `🎯 <b>Привычка обновлена</b>\n\n${habitName}: ${status}`;
        return await this.sendNotification(message, { habit_name: habitName });
    }

    // Отправка уведомления о перекусе
    async sendSnackNotification(snackName, calories) {
        const message = `🥪 <b>Добавлен перекус</b>\n\n${snackName} (${calories} ккал)`;
        return await this.sendNotification(message, { snack_name: snackName, calories: calories });
    }

    // Отправка уведомления о записи в дневнике
    async sendDiaryNotification(title) {
        const message = `📝 <b>Новая запись в дневнике</b>\n\n${title}`;
        return await this.sendNotification(message, { diary_title: title });
    }

    // Отправка уведомления о состоянии велосипеда
    async sendBikeStatusNotification(status) {
        const message = `🔧 <b>Обновлено состояние велосипеда</b>`;
        return await this.sendNotification(message, { bike_status: status });
    }

    // Отправка уведомления о реферале
    async sendReferralNotification(friendCount) {
        const message = `👥 <b>Новый друг приглашен!</b>\n\nВсего друзей: ${friendCount}`;
        return await this.sendNotification(message, { referral_count: friendCount });
    }

    // Отправка уведомления о Premium
    async sendPremiumNotification(status) {
        const message = `👑 <b>Premium статус</b>\n\n${status}`;
        return await this.sendNotification(message, { premium_status: status });
    }

    // Отправка ежедневного отчета
    async sendDailyReport() {
        if (!window.state) return;

        const today = new Date().toLocaleDateString('ru-RU');
        const message = `📊 <b>Ежедневный отчет</b>\n\n📅 ${today}\n\n` +
            `👟 Шагов за день: ${state.steps}\n` +
            `🚴 Километров: ${state.km.toFixed(2)}\n` +
            `⭐ Stars заработано: ${state.stars}\n` +
            `💰 Рубли заработаны: ${state.rub}\n` +
            `🎯 Привычек выполнено: ${state.habits.filter(h => h.completed).length}`;

        return await this.sendNotification(message);
    }

    // Отправка еженедельного отчета
    async sendWeeklyReport() {
        if (!window.state) return;

        const message = `📈 <b>Еженедельный отчет</b>\n\n` +
            `🏃‍♂️ <b>Активность:</b>\n` +
            `👟 Всего шагов: ${state.totalSteps}\n` +
            `🚴 Всего километров: ${state.totalKm.toFixed(2)}\n` +
            `💰 Всего заработано: ${state.totalEarned}₽\n\n` +
            `📊 <b>Прогресс:</b>\n` +
            `⭐ Stars: ${state.stars}\n` +
            `🎯 Привычек: ${state.habits.length}\n` +
            `🥪 Перекусов: ${state.snacks.length}\n` +
            `📝 Записей в дневнике: ${state.diary.length}\n` +
            `👥 Друзей приглашено: ${state.referral.totalReferrals}`;

        return await this.sendNotification(message);
    }
}

// Глобальный экземпляр интеграции с ботом
window.botIntegration = new BotIntegration();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.botIntegration.init();
});

// Расширенная функция sendBotNotification для совместимости
function sendBotNotification(message, data = {}) {
    if (window.botIntegration && window.botIntegration.isInitialized) {
        return window.botIntegration.sendNotification(message, data);
    } else {
        // Fallback для старого кода
        console.log('Bot notification (fallback):', message, data);
        return Promise.resolve(false);
    }
}

console.log('Bot integration module loaded');
