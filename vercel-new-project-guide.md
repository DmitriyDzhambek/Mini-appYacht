# 🚀 Создание нового проекта Vercel

## 📋 Пошаговая инструкция

### Шаг 1: Удалите старый проект (уже сделано)
- ✅ Проект `mini-app-yacht-346c` удален

### Шаг 2: Создайте новый проект Vercel

1. **Перейдите на Vercel:** https://vercel.com
2. **Войдите в аккаунт**
3. **Нажмите "Add New..." → "Project"**
4. **Импортируйте GitHub репозиторий:**
   - Найдите: `DmitriyDzhambek/Mini-appYacht`
   - Нажмите "Import"

### Шаг 3: Настройте проект

**Project Settings:**
- **Project Name:** `mini-app-yacht` (без суффиксов)
- **Framework Preset:** `Other`
- **Root Directory:** `.` (корневая папка)
- **Build Command:** (оставьте пустым)
- **Output Directory:** (оставьте пустым)
- **Install Command:** (оставьте пустым)

**Environment Variables (необязательно):**
- Нет переменных окружения нужно

### Шаг 4: Развертывание

1. **Нажмите "Deploy"**
2. **Ожидайте 1-2 минуты**
3. **Проверьте URL**

## 🎯 Ожидаемый URL

После развертывания вы получите:
```
https://mini-app-yacht.vercel.app
```

## 🔧 Текущая конфигурация

**vercel.json уже готов:**
```json
{
  "version": 2,
  "name": "mini-app-yacht",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## ✅ Что готово в проекте

- ✅ **index.html** - полный Mini App
- ✅ **background.jpg** - фоновое изображение
- ✅ **vercel.json** - правильная конфигурация
- ✅ **.nojekyll** - для GitHub Pages
- ✅ **Все функции** работают

## 🎨 Функции Mini App

- ✅ **Анимированные пальмы** сверху
- ✅ **Многослойные волны** внизу
- ✅ **Фоновое изображение** с оверлеем
- ✅ **Реклама** с наградой +5 Stars
- ✅ **Трекер активности** с GPS
- ✅ **Кошелек** с конвертацией
- ✅ **Статистика** и достижения

## 📱 Для BotFather

**После успешного развертывания:**
```
https://mini-app-yacht.vercel.app
```

## 🔄 Альтернатива: GitHub Pages

Если Vercel снова не сработает:
```
https://dmitriydzhambek.github.io/Mini-appYacht
```

---

**🎉 Следуйте инструкции выше для создания нового проекта Vercel!**
