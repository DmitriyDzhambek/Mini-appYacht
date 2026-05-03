// Команды для Telegram бота MiniYacht_Bot
// Этот файл содержит обработчики команд для бота

class BotCommands {
    constructor() {
        this.botToken = 'YOUR_BOT_TOKEN'; // Нужно заменить на реальный токен
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.userStates = new Map(); // Хранение состояний пользователей
    }

    // Основной обработчик команд
    async handleCommand(chatId, text, messageId) {
        const command = text.toLowerCase().split(' ')[0];
        
        switch (command) {
            case '/start':
                return await this.handleStart(chatId, messageId);
            case '/stats':
                return await this.handleStats(chatId, messageId);
            case '/habits':
                return await this.handleHabits(chatId, messageId);
            case '/snacks':
                return await this.handleSnacks(chatId, messageId);
            case '/diary':
                return await this.handleDiary(chatId, messageId);
            case '/bike':
                return await this.handleBike(chatId, messageId);
            case '/referral':
                return await this.handleReferral(chatId, messageId);
            case '/premium':
                return await this.handlePremium(chatId, messageId);
            case '/report':
                return await this.handleReport(chatId, messageId);
            case '/help':
                return await this.handleHelp(chatId, messageId);
            default:
                return await this.handleUnknown(chatId, messageId);
        }
    }

    // Обработка /start
    async handleStart(chatId, messageId) {
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '📊 Моя статистика', callback_data: 'stats' },
                    { text: '🎯 Привычки', callback_data: 'habits' }
                ],
                [
                    { text: '🥪 Перекусы', callback_data: 'snacks' },
                    { text: '📝 Дневник', callback_data: 'diary' }
                ],
                [
                    { text: '🚴 Велосипед', callback_data: 'bike' },
                    { text: '👥 Рефералы', callback_data: 'referral' }
                ],
                [
                    { text: '📈 Отчет', callback_data: 'report' },
                    { text: '👑 Premium', callback_data: 'premium' }
                ]
            ]
        };

        const message = `🏃‍♂️ <b>Добро пожаловать в Прощай лень!</b>\n\n` +
            `Я помогу вам отслеживать вашу активность и достижения.\n\n` +
            `📱 <b>Доступные команды:</b>\n` +
            `/stats - Ваша статистика\n` +
            `/habits - Ваши привычки\n` +
            `/snacks - Ваши перекусы\n` +
            `/diary - Ваш дневник\n` +
            `/bike - Состояние велосипеда\n` +
            `/referral - Реферальная программа\n` +
            `/premium - Premium статус\n` +
            `/report - Подробный отчет\n` +
            `/help - Помощь\n\n` +
            `💡 <i>Используйте кнопки ниже для быстрого доступа</i>`;

        return await this.sendMessage(chatId, message, keyboard);
    }

    // Обработка /stats
    async handleStats(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData) {
            return await this.sendMessage(chatId, '❌ Данные не найдены. Откройте приложение чтобы начать.');
        }

        const message = `📊 <b>Ваша статистика</b>\n\n` +
            `🏃‍♂️ <b>Активность:</b>\n` +
            `👟 Шаги: ${userData.steps || 0}\n` +
            `🚴 Километры: ${(userData.km || 0).toFixed(2)}\n\n` +
            `💰 <b>Награды:</b>\n` +
            `⭐ Stars: ${userData.stars || 0}\n` +
            `💰 Рубли: ${userData.rub || 0}\n\n` +
            `📈 <b>Общая статистика:</b>\n` +
            `👟 Всего шагов: ${userData.totalSteps || 0}\n` +
            `🚴 Всего километров: ${(userData.totalKm || 0).toFixed(2)}\n` +
            `💰 Всего заработано: ${userData.totalEarned || 0}₽`;

        return await this.sendMessage(chatId, message);
    }

    // Обработка /habits
    async handleHabits(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData || !userData.habits) {
            return await this.sendMessage(chatId, '❌ Привычки не найдены. Добавьте их в приложении.');
        }

        const completed = userData.habits.filter(h => h.completed).length;
        const total = userData.habits.length;
        
        let message = `🎯 <b>Ваши привычки</b>\n\n` +
            `✅ Выполнено: ${completed}/${total}\n\n`;

        userData.habits.forEach((habit, index) => {
            const status = habit.completed ? '✅' : '❌';
            message += `${status} ${habit.name}\n`;
        });

        return await this.sendMessage(chatId, message);
    }

    // Обработка /snacks
    async handleSnacks(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData || !userData.snacks) {
            return await this.sendMessage(chatId, '❌ Перекусы не найдены. Добавьте их в приложении.');
        }

        let message = `🥪 <b>Ваши перекусы</b>\n\n`;
        
        userData.snacks.forEach((snack, index) => {
            message += `🔹 ${snack.name} - ${snack.calories} ккал\n`;
            message += `   📅 ${snack.date}\n\n`;
        });

        return await this.sendMessage(chatId, message);
    }

    // Обработка /diary
    async handleDiary(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData || !userData.diary) {
            return await this.sendMessage(chatId, '❌ Записи в дневнике не найдены. Добавьте их в приложении.');
        }

        let message = `📝 <b>Ваш дневник</b>\n\n`;
        
        userData.diary.slice(0, 5).forEach((entry, index) => {
            message += `📖 ${entry.title}\n`;
            message += `   📅 ${entry.date}\n`;
            if (entry.photo) {
                message += `   📸 С фото\n`;
            }
            message += `\n`;
        });

        if (userData.diary.length > 5) {
            message += `... и еще ${userData.diary.length - 5} записей`;
        }

        return await this.sendMessage(chatId, message);
    }

    // Обработка /bike
    async handleBike(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData || !userData.bikeStatus) {
            return await this.sendMessage(chatId, '❌ Данные о велосипеде не найдены. Обновите их в приложении.');
        }

        const bike = userData.bikeStatus;
        const statusIcons = {
            good: '✅',
            needs_air: '⚠️',
            needs_lubrication: '⚠️',
            needs_bulbs: '⚠️',
            needs_repair: '❌',
            worn: '❌',
            needs_replacement: '❌',
            broken: '❌'
        };

        let message = `🚴 <b>Состояние велосипеда</b>\n\n` +
            `🔧 <b>Техническое состояние:</b>\n` +
            `🛑 Тормоза: ${statusIcons[bike.brakes] || '❓'}\n` +
            `🛞 Шины: ${statusIcons[bike.tires] || '❓'}\n` +
            `⛓️ Цепь: ${statusIcons[bike.chain] || '❓'}\n` +
            `💡 Свет: ${statusIcons[bike.lights] || '❓'}\n\n` +
            `📊 <b>Статистика:</b>\n` +
            `📏 Пробег: ${userData.totalKm || 0} км\n` +
            `🎂 Возраст: ${bike.bikeAge || 0} года\n` +
            `🔧 Последнее ТО: ${bike.lastMaintenance ? new Date(bike.lastMaintenance).toLocaleDateString() : 'Не проводилось'}`;

        return await this.sendMessage(chatId, message);
    }

    // Обработка /referral
    async handleReferral(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData || !userData.referral) {
            return await this.sendMessage(chatId, '❌ Реферальные данные не найдены.');
        }

        const referral = userData.referral;
        
        let message = `👥 <b>Реферальная программа</b>\n\n` +
            `🏷️ <b>Ваш код:</b> <code>${referral.code || 'Не создан'}</code>\n` +
            `🔗 <b>Ваша ссылка:</b>\n` +
            `<code>${referral.link || 'Не создана'}</code>\n\n` +
            `📊 <b>Статистика:</b>\n` +
            `👥 Приглашено друзей: ${referral.totalReferrals || 0}\n` +
            `🎁 Получено бонусов: ${referral.rewardsReceived?.length || 0}\n\n` +
            `💎 <b>Ваши бонусы:</b>\n` +
            `⭐ 50 Stars за каждого друга\n` +
            `👑 Premium на 1 месяц за 3 друзей`;

        return await this.sendMessage(chatId, message);
    }

    // Обработка /premium
    async handlePremium(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData) {
            return await this.sendMessage(chatId, '❌ Данные не найдены.');
        }

        const isPremium = userData.premium || false;
        const endDate = userData.premiumEndDate;
        
        let message = `👑 <b>Premium статус</b>\n\n` +
            `📊 <b>Текущий статус:</b> ${isPremium ? '✅ Активен' : '❌ Не активен'}\n`;
        
        if (isPremium && endDate) {
            const expiryDate = new Date(endDate);
            message += `📅 <b>Действует до:</b> ${expiryDate.toLocaleDateString('ru-RU')}\n`;
            message += `⏰ <b>Осталось дней:</b> ${Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))}\n`;
        } else {
            message += `\n💡 <b>Как получить Premium:</b>\n` +
                `💳 Оплатить 99₽ в месяц\n` +
                `⭐ Оплатить 99 Stars в месяц\n` +
                `👥 Пригласить 3 друзей\n\n` +
                `🎁 <b>Преимущества Premium:</b>\n` +
                `📊 Расширенная статистика\n` +
                `🎯 Безлимитные привычки\n` +
                `📝 Безлимитные записи в дневнике\n` +
                `🚴 Детальный трекинг велосипеда`;
        }

        return await this.sendMessage(chatId, message);
    }

    // Обработка /report
    async handleReport(chatId, messageId) {
        const userData = await this.getUserData(chatId);
        if (!userData) {
            return await this.sendMessage(chatId, '❌ Данные не найдены.');
        }

        const today = new Date().toLocaleDateString('ru-RU');
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU');
        
        let message = `📈 <b>Подробный отчет</b>\n\n` +
            `📅 <b>Период:</b> ${weekAgo} - ${today}\n\n` +
            `🏃‍♂️ <b>Активность:</b>\n` +
            `👟 Шаги сегодня: ${userData.steps || 0}\n` +
            `🚴 Километры сегодня: ${(userData.km || 0).toFixed(2)}\n` +
            `👟 Всего шагов: ${userData.totalSteps || 0}\n` +
            `🚴 Всего километров: ${(userData.totalKm || 0).toFixed(2)}\n\n` +
            `💰 <b>Финансы:</b>\n` +
            `⭐ Текущий баланс: ${userData.stars || 0}\n` +
            `💰 Текущий баланс: ${userData.rub || 0}₽\n` +
            `💰 Всего заработано: ${userData.totalEarned || 0}₽\n\n` +
            `📊 <b>Прогресс:</b>\n` +
            `🎯 Привычек: ${userData.habits?.filter(h => h.completed).length || 0}/${userData.habits?.length || 0}\n` +
            `🥪 Перекусов: ${userData.snacks?.length || 0}\n` +
            `📝 Записей в дневнике: ${userData.diary?.length || 0}\n` +
            `👥 Друзей приглашено: ${userData.referral?.totalReferrals || 0}\n\n` +
            `🏆 <b>Достижения:</b>\n` +
            `👑 Premium: ${userData.premium ? '✅ Активен' : '❌ Не активен'}`;

        return await this.sendMessage(chatId, message);
    }

    // Обработка /help
    async handleHelp(chatId, messageId) {
        const message = `🏃‍♂️ <b>Помощь - Прощай лень</b>\n\n` +
            `📱 <b>Основные команды:</b>\n` +
            `/start - Главное меню\n` +
            `/stats - Ваша статистика\n` +
            `/habits - Ваши привычки\n` +
            `/snacks - Ваши перекусы\n` +
            `/diary - Ваш дневник\n` +
            `/bike - Состояние велосипеда\n` +
            `/referral - Реферальная программа\n` +
            `/premium - Premium статус\n` +
            `/report - Подробный отчет\n` +
            `/help - Эта помощь\n\n` +
            `💡 <b>Как это работает:</b>\n` +
            `1. Используйте приложение для отслеживания активности\n` +
            `2. Получайте уведомления о важных событиях\n` +
            `3. Просматривайте статистику в боте\n` +
            `4. Зарабатывайте награды за активность\n\n` +
            `❓ <b>Нужна помощь?</b>\n` +
            `Используйте команду /start для возвращения в главное меню`;

        return await this.sendMessage(chatId, message);
    }

    // Обработка неизвестной команды
    async handleUnknown(chatId, messageId) {
        const message = `❓ <b>Неизвестная команда</b>\n\n` +
            `Используйте /help чтобы увидеть все доступные команды.`;
        
        return await this.sendMessage(chatId, message);
    }

    // Получение данных пользователя (эмуляция для демонстрации)
    async getUserData(chatId) {
        // В реальном приложении здесь будет запрос к базе данных
        // Для демонстрации возвращаем null
        return null;
    }

    // Отправка сообщения
    async sendMessage(chatId, text, keyboard = null) {
        try {
            const payload = {
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            };

            if (keyboard) {
                payload.reply_markup = keyboard;
            }

            const response = await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error('Failed to send message:', await response.text());
                return null;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BotCommands;
}

console.log('Bot commands module loaded');
