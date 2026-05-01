#!/bin/bash

echo "🚀 Подготовка VeloPath для нового репозитория..."

# Шаг 1: Создание нового удаленного репозитория
echo "📁 Создание нового GitHub репозитория..."
echo "1. Перейдите на: https://github.com/DmitriyDzhambek?tab=repositories"
echo "2. Нажмите 'New repository'"
echo "3. Название: velopath-mini-app"
echo "4. Описание: VeloPath - Telegram Mini App для заработка наград за активность"
echo "5. Public: Yes"
echo "6. Нажмите 'Create repository'"
echo ""

# Шаг 2: Подключение нового репозитория
echo "🔗 Подключение нового репозитория..."
git remote add velopath-new https://github.com/DmitriyDzhambek/velopath-mini-app.git

# Шаг 3: Загрузка в новый репозиторий
echo "📤 Загрузка кода в новый репозиторий..."
git push -u velopath-new master

echo ""
echo "✅ GitHub репозиторий готов!"
echo "🔗 Ссылка: https://github.com/DmitriyDzhambek/velopath-mini-app"
echo ""

# Шаг 4: Инструкции для Vercel
echo "🚀 Инструкции для Vercel:"
echo "1. Перейдите на: https://vercel.com/dmitriydzhambeks-projects"
echo "2. Нажмите 'Add New...' → 'Project'"
echo "3. Импортируйте репозиторий 'velopath-mini-app'"
echo "4. Название проекта: velopath-mini-app"
echo "5. Framework Preset: Other"
echo "6. Root Directory: /"
echo "7. Output Directory: (оставить пустым)"
echo "8. Нажмите 'Deploy'"
echo ""

# Шаг 5: Новые ссылки
echo "📱 Новые ссылки после развертывания:"
echo "Основная: https://velopath-mini-app.vercel.app"
echo "Telegram: https://t.me/MiniYacht_Bot?startapp=velopath-mini-app"
echo "GitHub: https://github.com/DmitriyDzhambek/velopath-mini-app"
echo ""

echo "🎉 Готово! Следуйте инструкциям выше для полного развертывания."
