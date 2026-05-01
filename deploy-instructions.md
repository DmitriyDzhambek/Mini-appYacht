# VeloPath - Deployment Instructions

## 📁 Создание нового GitHub репозитория

### Шаг 1: Создание репозитория
1. Перейдите на https://github.com/DmitriyDzhambek?tab=repositories
2. Нажмите "New repository"
3. Название репозитория: `velopath-mini-app`
4. Описание: `VeloPath - Telegram Mini App для заработка наград за активность`
5. Сделайте репозиторий Public
6. Не добавляйте README, .gitignore или license (у нас уже есть)
7. Нажмите "Create repository"

### Шаг 2: Загрузка кода
```bash
# В терминале в папке проекта
git remote add new-origin https://github.com/DmitriyDzhambek/velopath-mini-app.git
git push -u new-origin master
```

## 🚀 Создание проекта в Vercel

### Шаг 1: Импорт проекта
1. Перейдите на https://vercel.com/dmitriydzhambeks-projects
2. Нажмите "Add New..." → "Project"
3. Импортируйте GitHub репозиторий `velopath-mini-app`
4. Название проекта: `velopath-mini-app`
5. Framework Preset: `Other`
6. Root Directory: `/`
7. Build Command: (оставить пустым)
8. Output Directory: `public`
9. Install Command: (оставить пустым)

### Шаг 2: Переменные окружения
Добавьте переменные окружения (Environment Variables):
```
NODE_ENV=production
```

### Шаг 3: Деплой
1. Нажмите "Deploy"
2. Дождитесь завершения развертывания
3. Проект будет доступен по URL: `https://velopath-mini-app.vercel.app`

## 📱 Обновление Telegram бота

### Новые ссылки для @MiniYacht_Bot:
```
Основная ссылка: https://velopath-mini-app.vercel.app
Telegram ссылка: https://t.me/MiniYacht_Bot?startapp=velopath-mini-app
WebApp кнопка: https://t.me/MiniYacht_Bot/velopath-mini-app
```

### Обновление в боте:
1. Измените WebApp URL в настройках бота
2. Обновите кнопки и команды
3. Протестируйте новую ссылку

## 🔧 Конфигурация проекта

### Структура файлов:
```
velopath-mini-app/
├── 📄 index.html              # Главный HTML файл
├── 📄 src/
│   ├── 📄 js/app.js          # JavaScript логика
│   └── 📄 css/styles.css     # Стили
├── 📄 api/
│   └── 📄 index.js           # Serverless функции
├── 📄 assets/                # Статические файлы
├── 📄 vercel.json            # Конфигурация Vercel
├── 📄 package.json           # Зависимости
└── 📄 README.md              # Документация
```

### Vercel конфигурация:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/src/(.*)",
      "destination": "/src/$1"
    },
    {
      "source": "/assets/(.*)",
      "destination": "/assets/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🎯 Проверка развертывания

### Тестирование:
1. Откройте `https://velopath-mini-app.vercel.app`
2. Проверьте все экраны приложения
3. Протестируйте Telegram интеграцию
4. Проверьте API эндпоинты

### Telegram тест:
1. Откройте `https://t.me/MiniYacht_Bot?startapp=velopath-mini-app`
2. Убедитесь что все функции работают
3. Проверьте платежи и вывод средств

## 📊 Мониторинг

### Vercel Analytics:
- Переходите в проект на Vercel
- Вкладка "Analytics" для статистики
- "Speed Insights" для производительности

### GitHub Actions:
- Автоматический деплой при push в master
- Проверьте вкладку "Actions" в GitHub

## 🔒 Безопасность

### API безопасность:
- Все API эндпоинты защищены
- CORS настроен корректно
- Валидация Telegram init data

### Переменные окружения:
- Секретные данные в Environment Variables
- Никогда не храните токены в коде

## 🚀 Готовые ссылки

После развертывания у вас будут:

### GitHub:
```
https://github.com/DmitriyDzhambek/velopath-mini-app
```

### Vercel:
```
https://velopath-mini-app.vercel.app
```

### Telegram:
```
https://t.me/MiniYacht_Bot?startapp=velopath-mini-app
```

---

**🎉 После выполнения этих шагов у вас будет полностью работающий VeloPath Mini App на новой инфраструктуре!**
