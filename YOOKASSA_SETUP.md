# YooKassa Integration Guide

## 🚀 Настройка YooKassa для VeloPath Premium

### 1. Регистрация в YooKassa
1. Перейдите на https://yookassa.ru
2. Зарегистрируйтесь как юридическое лицо или ИП
3. Подключите магазин и получите:
   - **Shop ID** (Идентификатор магазина)
   - **Secret Key** (Секретный ключ)

### 2. Конфигурация сервера

#### Переменные окружения:
```bash
# YooKassa настройки
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_секретный_ключ
YOOKASSA_RETURN_URL=https://your-domain.com/payment/success

# Telegram Bot
BOT_TOKEN=ваш_токен_бота

# Порт сервера
PORT=3000
```

#### Или установите напрямую в `payment-server.js`:
```javascript
const YOOKASSA_SHOP_ID = 'YOUR_SHOP_ID';
const YOOKASSA_SECRET_KEY = 'YOUR_SECRET_KEY';
const YOOKASSA_RETURN_URL = 'https://your-domain.com/payment/success';
```

### 3. Настройка вебхуков

В настройках YooKassa установите URL для вебхуков:
```
https://your-domain.com/webhook/yookassa
```

### 4. Тестирование

#### Тестовый режим:
YooKassa автоматически работает в тестовом режиме для новых магазинов.

#### Тестовые карты:
- Карта для успешной оплаты: `1111111111111111`
- Карта для отказа: `4000000000000002`

### 5. API эндпоинты

#### Создание платежа:
```
POST /api/yookassa/create-payment
```

#### Вебхук YooKassa:
```
POST /webhook/yookassa
```

#### Страница успеха:
```
GET /payment/success
```

### 6. Процесс оплаты

1. Пользователь нажимает "Премиум"
2. Выбирает способ оплаты (YooKassa или Telegram Stars)
3. Для YooKassa:
   - Создается платеж через API
   - Пользователь перенаправляется на страницу оплаты
   - После оплаты перенаправляется на страницу успеха
   - Вебхук подтверждает платеж и активирует премиум

### 7. Безопасность

- Все запросы к YooKassa используют Basic Authentication
- Используются ключи идемпотентности
- Вебхуки должны быть проверены на подлинность

### 8. Мониторинг

Проверяйте логи сервера для отслеживания:
- Созданных платежей
- Статусов вебхуков
- Ошибок API

### 9. Комиссии

YooKassa комиссии:
- Банковские карты: 2.7% + 15₽
- СБП: 2.5%
- YooPay: 2.5%
- Qiwi: 4.5%

### 10. Поддержка

- YooKassa поддержка: https://yookassa.ru/support
- Документация API: https://yookassa.ru/developers/api
