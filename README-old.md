# VeloPath - Telegram Mini App

Приложение для отслеживания физической активности с наградами в Telegram.

## 🚀 Возможности

- 🚴 **Трекинг активности**: Отслеживание прогулок, пробежек, велопоездок
- 📍 **GPS трекинг**: Построение маршрутов с использованием геолокации
- 👟 **Шагомер**: Автоматический подсчет шагов
- ⭐ **Награды**: Заработок Telegram Stars и рублей за активность
- 💳 **Кошелек**: Конвертация шагов в Stars и километров в рубли
- 📊 **Статистика**: Детальная статистика маршрутов и достижений
- 🏅 **Достижения**: Система бейджей за выполнение целей
- 💸 **Вывод средств**: Возможность вывода заработанных средств
- 📱 **Telegram интеграция**: Полная интеграция с Telegram WebApp API
- 💰 **Монетизация**: Rewarded Ads, Offer Wall, Affiliate, Premium, Referral

## 🛠 Технологии

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Telegram**: Telegram WebApp API
- **Хранение**: localStorage
- **Геолокация**: Geolocation API
- **Деплой**: Vercel (статический сайт)
- **Монетизация**: Telegram Rewarded Ads + Affiliate Marketing

## 🚀 Быстрый запуск

### 1. Развертывание на Vercel
1. Перейдите: https://vercel.com/new
2. GitHub → DmitriyDzhambek/Mini-appYacht
3. Настройки:
   - Name: `mini-app-yacht`
   - Framework: `Other`
   - Root: `/`
4. Deploy

### 2. Готовые URL
- **Основной**: https://mini-app-yacht.vercel.app
- **Telegram**: https://t.me/MiniYacht_Bot?startapp=mini-app-yacht

## 📱 Telegram Bot Configuration

### BotFather настройки:
```
/start - https://mini-app-yacht.vercel.app
```

### Команды бота:
- `/start` - Запустить Mini App
- `/help` - Помощь
- `/stats` - Статистика
- `/wallet` - Кошелек

## 💰 Монетизация

### Доходные потоки:
- **Rewarded Ads**: $0.05-0.15 за просмотр
- **Offer Wall**: $0.10-0.30 за задание
- **Affiliate**: 5-30% комиссия
- **Premium**: $2-10 в месяц
- **Referral**: 10-20% от друзей

### Прогноз доходов:
- **100 пользователей/день**: $50-200
- **1000 пользователей/день**: $500-2000

## Структура проекта

```
Mini-appYacht/
├── index.html          # Основной HTML файл с монетизацией
├── vercel.json         # Конфигурация Vercel
├── README.md           # Документация
├── deploy-fix.md       # Инструкция по развертыванию
├── monetization-guide.md # Гайд по монетизации
└── assets/             # Изображения и ресурсы
```

## 🎯 Особенности

- ✅ **Полная монетизация** без бюджета
- ✅ **Оптимизированный код** (~15KB)
- ✅ **Адаптивный дизайн** для всех устройств
- ✅ **Telegram WebApp** интеграция
- ✅ **GPS трекинг** и шагомер
- ✅ **Система достижений** и статистика
- ✅ **Вывод средств** в Stars и рублях

## 📞 Поддержка

GitHub: https://github.com/DmitriyDzhambek/Mini-appYacht

---

GitHub: https://github.com/DmitriyDzhambek/Mini-appYacht

## API Эндпоинты

### Пользователи
- `GET /api/user/:telegramId` - Получить данные пользователя
- `PUT /api/user/:telegramId` - Обновить данные пользователя

### Маршруты
- `GET /api/routes/:telegramId` - Получить маршруты пользователя
- `POST /api/routes/:telegramId` - Сохранить новый маршрут

### Конвертация
- `POST /api/convert/stars/:telegramId` - Конвертировать шаги в Stars
- `POST /api/convert/rub/:telegramId` - Конвертировать км в рубли

### Вывод средств
- `POST /api/withdraw/:telegramId` - Создать заявку на вывод

### Статистика
- `GET /api/stats/:telegramId` - Получить статистику пользователя

## Функции приложения

### Трекинг активности
- Поддержка 4 типов активности: велосипед, бег, ходьба, ролики
- GPS трекинг с построением маршрута
- Расчет расстояния, времени и средней скорости
- Сохранение маршрутов в истории

### Шагомер
- Автоматический подсчет шагов с использованием DeviceMotion API
- Имитация для тестирования на десктопе
- Проверка достижений за шаги

### Система наград
- **Конвертация шагов**: 1000 шагов = 1 ⭐ (Telegram Stars)
- **Конвертация километров**: 1 км = 10 ₽
- **Вывод средств**: Поддержка Telegram Stars, ЮМани, FK Wallet

### Достижения
- 🌱 Первый маршрут
- 🏃 10 км
- 🚀 100 км
- 👟 1000 шагов
- 💰 Вывод денег

## 📱 Telegram WebApp Интеграция

Приложение использует Telegram WebApp API для:
- Получения данных пользователя
- Адаптации под тему Telegram
- Показа нативных уведомлений
- Интеграции с платежами Telegram Stars
- MainButton и BackButton управления
- Динамических заголовков

## 🎯 Монетизация

### Rewarded Interstitial Ads

Реклама показывается в стратегических местах:
- **Конвертация валюты** - Перед обменом шагов/км
- **Сохранение маршрутов** - Для маршрутов > 1км
- **Разблокировка достижений** - При получении бейджей

```javascript
// Rewarded interstitial
show_10942535().then(() => {
    // Функция вознаграждения пользователя
    alert('You have seen an ad!');
})
```

## Безопасность

- Валидация Telegram init data
- CORS защита
- Проверка прав доступа к геолокации
- Fallback на localStorage при ошибках API

## 🚀 Деплой

Приложение развернуто на:
- **Vercel**: https://vercel.com/dmitriydzhambeks-projects/mini-app-yacht-4hva-
- **GitHub**: https://github.com/DmitriyDzhambek/Mini-appYacht.git

### Структура деплоя:
- **Frontend**: Статические файлы (HTML, CSS, JS)
- **Backend**: Serverless функции в `api/index.js`
- **API**: Все эндпоинты доступны через `/api/*`
- **Маршрутизация**: Автоматическая через Vercel

## Тулстек

- **Frontend**: Vanilla JavaScript (без фреймворков)
- **Backend**: Express.js
- **Стили**: CSS с переменными темы Telegram
- **Сборка**: Не требуется (статические файлы)

## Лицензия

MIT License
