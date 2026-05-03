// Динамические эффекты для приложения "Прощай лень"
class DynamicEffects {
    constructor() {
        this.particles = [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.createInteractiveBackground();
        this.createFloatingParticles();
        this.addDynamicTransitions();
        this.addMicroInteractions();
        this.createProgressBars();
        this.addCounterAnimations();
        this.isInitialized = true;
        console.log('Dynamic effects initialized');
    }

    // Создание интерактивного фона
    createInteractiveBackground() {
        const bg = document.createElement('div');
        bg.className = 'interactive-bg';
        
        // Создаем светящиеся сферы
        for (let i = 0; i < 3; i++) {
            const orb = document.createElement('div');
            orb.className = 'bg-orb';
            bg.appendChild(orb);
        }
        
        document.body.insertBefore(bg, document.body.firstChild);
    }

    // Создание плавающих частиц
    createFloatingParticles() {
        setInterval(() => {
            if (this.particles.length < 10) {
                this.createParticle();
            }
        }, 2000);
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайная позиция
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.bottom = '0px';
        
        // Случайный цвет
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(particle);
        this.particles.push(particle);
        
        // Удаляем частицу после анимации
        setTimeout(() => {
            particle.remove();
            this.particles = this.particles.filter(p => p !== particle);
        }, 3000);
    }

    // Динамические переходы между экранами
    addDynamicTransitions() {
        const originalShowScreen = window.showScreen;
        
        window.showScreen = (screenName) => {
            const currentScreen = document.querySelector('.screen.active');
            const nextScreen = document.getElementById(screenName);
            
            if (currentScreen && nextScreen) {
                // Анимация выхода
                currentScreen.classList.remove('active');
                currentScreen.style.opacity = '0';
                currentScreen.style.transform = 'translateX(-20px)';
                
                // Анимация входа
                setTimeout(() => {
                    nextScreen.classList.add('active');
                    nextScreen.style.opacity = '1';
                    nextScreen.style.transform = 'translateX(0)';
                    
                    // Обновляем активную навигацию
                    this.updateActiveNav(screenName);
                }, 150);
            }
            
            // Вызываем оригинальную функцию
            if (originalShowScreen) {
                originalShowScreen(screenName);
            }
        };
    }

    // Обновление активной навигации
    updateActiveNav(screenName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="showScreen('${screenName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Микро-взаимодействия
    addMicroInteractions() {
        // Анимация карточек при наведении
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.card')) {
                const card = e.target.closest('.card');
                card.style.transform = 'translateY(-5px) scale(1.02)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.card')) {
                const card = e.target.closest('.card');
                card.style.transform = 'translateY(0) scale(1)';
            }
        });

        // Эффект пульсации при клике на кнопки
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                this.createRippleEffect(e.target, e);
            }
        });

        // Анимация значений при обновлении
        this.observeValueChanges();
    }

    // Создание эффекта ряби при клике
    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Наблюдение за изменениями значений
    observeValueChanges() {
        const values = document.querySelectorAll('.value');
        
        values.forEach(value => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(() => {
                    value.classList.add('updating');
                    setTimeout(() => {
                        value.classList.remove('updating');
                    }, 500);
                });
            });
            
            observer.observe(value, { childList: true, characterData: true, subtree: true });
        });
    }

    // Создание прогресс-баров
    createProgressBars() {
        // Прогресс привычек
        this.updateHabitsProgress();
        
        // Прогресс ежедневных целей
        this.updateDailyProgress();
    }

    updateHabitsProgress() {
        const habitsCompleted = window.state?.habits?.filter(h => h.completed).length || 0;
        const totalHabits = window.state?.habits?.length || 1;
        const percentage = (habitsCompleted / totalHabits) * 100;
        
        this.createProgressBar('habits-progress', percentage, 'Привычки');
    }

    updateDailyProgress() {
        const steps = window.state?.steps || 0;
        const dailyGoal = 10000; // Цель 10к шагов
        const percentage = Math.min((steps / dailyGoal) * 100, 100);
        
        this.createProgressBar('daily-steps-progress', percentage, 'Шаги');
    }

    createProgressBar(id, percentage, label) {
        let container = document.getElementById(id);
        
        if (!container) {
            container = document.createElement('div');
            container.id = id;
            container.className = 'progress-container';
            container.style.cssText = `
                margin: 10px 0;
                text-align: left;
            `;
            
            const labelEl = document.createElement('div');
            labelEl.textContent = label;
            labelEl.style.cssText = `
                font-size: 12px;
                margin-bottom: 5px;
                color: #666;
            `;
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = percentage + '%';
            
            progressBar.appendChild(progressFill);
            container.appendChild(labelEl);
            container.appendChild(progressBar);
            
            // Добавляем в подходящее место
            const lifeScreen = document.getElementById('life');
            if (lifeScreen) {
                const firstSection = lifeScreen.querySelector('.section');
                if (firstSection) {
                    firstSection.appendChild(container);
                }
            }
        } else {
            // Обновляем существующий прогресс-бар
            const progressFill = container.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = percentage + '%';
            }
        }
    }

    // Анимированные счетчики
    addCounterAnimations() {
        this.animateCounter('life-steps');
        this.animateCounter('life-km');
        this.animateCounter('life-stars');
        this.animateCounter('life-rub');
        this.animateCounter('total-steps');
        this.animateCounter('total-km');
        this.animateCounter('total-earned');
    }

    animateCounter(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const oldValue = parseInt(mutation.oldValue.replace(/[^\d]/g, '')) || 0;
                const newValue = parseInt(mutation.target.textContent.replace(/[^\d]/g, '')) || 0;
                
                if (oldValue !== newValue) {
                    this.animateNumber(element, oldValue, newValue);
                }
            });
        });
        
        observer.observe(element, { 
            childList: true, 
            characterData: true, 
            subtree: true,
            characterDataOldValue: true
        });
    }

    animateNumber(element, start, end) {
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            
            // Форматируем число в зависимости от типа
            let formatted = current.toString();
            if (element.id.includes('km') || element.id.includes('earned')) {
                formatted = (current / 100).toFixed(2);
                if (element.id.includes('km')) {
                    formatted = formatted.replace('.', ',');
                } else {
                    formatted = formatted + '₽';
                }
            } else if (element.id.includes('rub')) {
                formatted = current.toLocaleString();
            } else {
                formatted = current.toLocaleString();
            }
            
            element.textContent = formatted;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Анимация достижений
    animateAchievement(type, message) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement notification';
        achievement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 300px;
        `;
        
        achievement.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🏆 Достижение!</div>
            <div>${message}</div>
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            achievement.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => achievement.remove(), 500);
        }, 3000);
    }

    // Эффект трекинга
    setTrackingEffect(active) {
        const trackerScreen = document.getElementById('tracker');
        if (trackerScreen) {
            if (active) {
                trackerScreen.classList.add('tracking-active');
            } else {
                trackerScreen.classList.remove('tracking-active');
            }
        }
    }

    // Анимация привычек
    animateHabitCompletion(habitId, completed) {
        const habitElement = document.querySelector(`[data-habit-id="${habitId}"]`);
        if (habitElement) {
            if (completed) {
                habitElement.classList.add('completed');
                this.animateAchievement('habit', 'Привычка выполнена! 🎯');
            } else {
                habitElement.classList.remove('completed');
            }
        }
    }

    // Создание волнистого фона
    createWaveEffect() {
        const waves = document.querySelector('.waves');
        if (waves) {
            for (let i = 0; i < 3; i++) {
                const wave = document.createElement('div');
                wave.className = 'wave';
                wave.style.animationDelay = `${i * 2}s`;
                waves.appendChild(wave);
            }
        }
    }

    // Интерактивные эффекты при прокрутке
    addScrollEffects() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.interactive-bg');
            
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
            
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }

    // Инициализация всех эффектов
    initializeAll() {
        this.createWaveEffect();
        this.addScrollEffects();
        this.addCounterAnimations();
        this.createProgressBars();
        
        // Обновляем прогресс каждые 5 секунд
        setInterval(() => {
            this.updateHabitsProgress();
            this.updateDailyProgress();
        }, 5000);
        
        console.log('All dynamic effects initialized');
    }
}

// Глобальный экземпляр
window.dynamicEffects = new DynamicEffects();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.dynamicEffects.initializeAll();
});

// Расширенные функции для интеграции с существующим кодом
function showDynamicNotification(message, type = 'info') {
    window.dynamicEffects.animateAchievement(type, message);
}

function setDynamicTracking(active) {
    window.dynamicEffects.setTrackingEffect(active);
}

function animateHabitDynamic(habitId, completed) {
    window.dynamicEffects.animateHabitCompletion(habitId, completed);
}

console.log('Dynamic effects module loaded');
