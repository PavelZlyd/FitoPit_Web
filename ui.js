// ui.js — Интерфейс и управление питанием

let weeklyPlan = [];

// === Переводы ===
const translations = {
  ru: {
    title: "Твой план питания",
    calories: "Ежедневные калории",
    statusHigh: "(Высококалорийно)",
    statusLow: "(Низкокалорийно)",
    statusBalanced: "(Сбалансировано)",
    copy: "📋 Копировать план",
    copied: "✅ Скопировано",
    day: "День",
    total: "Итого за день:",
    breakfast: "🌅 Завтрак",
    secondBreakfast: "☕ Второй завтрак",
    lunch: "🍽 Обед",
    snack: "🍏 Полдник",
    dinner: "🌙 Ужин",
    secondDinner: "🍵 Второй ужин"
  },
  en: {
    title: "Your Meal Plan",
    calories: "Daily Calories",
    statusHigh: "(High-calorie)",
    statusLow: "(Low-calorie)",
    statusBalanced: "(Balanced)",
    copy: "📋 Copy Plan",
    copied: "✅ Copied",
    day: "Day",
    total: "Total for day:",
    breakfast: "🌅 Breakfast",
    secondBreakfast: "☕ Snack",
    lunch: "🍽 Lunch",
    snack: "🍏 Afternoon Snack",
    dinner: "🌙 Dinner",
    secondDinner: "🍵 Late Dinner"
  }
};

// === Текущий язык ===
let currentLang = 'ru';

// === Переключение языка ===
function switchLang(lang) {
  if (!translations[lang]) return;

  currentLang = lang;
  localStorage.setItem("lang", lang); // Сохраняем выбранный язык

  const t = translations[lang];

  // Подсвечиваем активную кнопку
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Обновляем текстовые метки
  document.querySelector("#result h2").textContent = t.title;
  document.querySelector("label[for='age']").textContent = lang === 'ru' ? 'Возраст' : 'Age';
  document.querySelector("label[for='gender']").textContent = lang === 'ru' ? 'Пол' : 'Gender';
  document.querySelector("label[for='weight']").textContent = lang === 'ru' ? 'Вес (кг)' : 'Weight (kg)';
  document.querySelector("label[for='height']").textContent = lang === 'ru' ? 'Рост (см)' : 'Height (cm)';
  document.querySelector("label[for='activity']").textContent = lang === 'ru' ? 'Активность' : 'Activity';
  document.querySelector("label[for='goal']").textContent = lang === 'ru' ? 'Цель' : 'Goal';
  document.querySelector("label[for='diet']").textContent = lang === 'ru' ? 'Диета' : 'Diet';
  document.querySelector("label[for='breakfastType']").textContent = lang === 'ru' ? 'Завтрак' : 'Breakfast';
  document.getElementById("copyPlan").textContent = t.copy;

  // Обновляем статус калорий
  const dailyCalories = parseInt(document.getElementById("calories")?.textContent || 0);
  if (dailyCalories > 0) {
    updateCalorieStatus(dailyCalories);
  }

  // Если план уже есть — перерисуем с новым языком
  if (weeklyPlan.length > 0) {
    displayWeeklyPlan(weeklyPlan, dailyCalories);
  }
}

// === Расчёт калорий ===
function calculateCalories(weight, height, age, gender, activity, goal) {
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  let calories = bmr * activity;
  if (goal === "lose") calories *= 0.8;
  if (goal === "gain") calories *= 1.2;
  return Math.round(calories);
}

// === Получение данных формы ===
function getFormData(form) {
  return {
    age: parseInt(form.age.value),
    gender: form.gender.value,
    weight: parseFloat(form.weight.value),
    height: parseFloat(form.height.value),
    activity: parseFloat(form.activity.value),
    goal: form.goal.value,
    diet: form.diet.value,
    breakfastType: form.breakfastType.value
  };
}

function getSelectedAllergies() {
  return Array.from(document.querySelectorAll("#allergies input:checked")).map(cb => cb.value);
}

// === Отображение статуса калорий ===
function updateCalorieStatus(dailyCalories) {
  const statusSpan = document.getElementById("calorieStatus");
  if (!statusSpan) return;

  const t = translations[currentLang];
  if (dailyCalories > 2500) {
    statusSpan.textContent = t.statusHigh;
    statusSpan.style.color = "#e53e3e";
  } else if (dailyCalories < 1600) {
    statusSpan.textContent = t.statusLow;
    statusSpan.style.color = "#d69e2e";
  } else {
    statusSpan.textContent = t.statusBalanced;
    statusSpan.style.color = "#38a169";
  }
}

// === Эмодзи для блюд ===
function getEmoji(title) {
  const lowerTitle = title.toLowerCase();
  for (const [key, emoji] of Object.entries(window.emojiMap || {})) {
    if (lowerTitle.includes(key)) return emoji;
  }
  return '🍽️';
}

function getMealLabel(type) {
  const labels = {
    breakfast: translations[currentLang].breakfast,
    secondBreakfast: translations[currentLang].secondBreakfast,
    lunch: translations[currentLang].lunch,
    snack: translations[currentLang].snack,
    dinner: translations[currentLang].dinner,
    secondDinner: translations[currentLang].secondDinner
  };
  return labels[type] || type;
}

function sumProperty(dayMeals, prop) {
  return Object.values(dayMeals)
    .flat()
    .reduce((sum, meal) => sum + (meal[prop] || 0), 0);
}

// === Перегенерация дня ===
function regenerateDay(dayIndex) {
  const form = document.getElementById("nutritionForm");
  if (!form) return;

  const userData = getFormData(form);
  userData.dailyCalories = calculateCalories(
    userData.weight,
    userData.height,
    userData.age,
    userData.gender,
    userData.activity,
    userData.goal
  );

  const constraints = { diet: userData.diet, allergies: getSelectedAllergies() };
  weeklyPlan[dayIndex] = generateDayMeals(constraints, userData);
  displayWeeklyPlan(weeklyPlan, userData.dailyCalories);
}

// === Перегенерация приёма пищи ===
function regenerateMeal(dayIndex, mealType) {
  const form = document.getElementById("nutritionForm");
  if (!form) return;

  const userData = getFormData(form);
  userData.dailyCalories = calculateCalories(
    userData.weight,
    userData.height,
    userData.age,
    userData.gender,
    userData.activity,
    userData.goal
  );

  const constraints = { diet: userData.diet, allergies: getSelectedAllergies() };
  const meal = generateMeal(mealType, constraints, userData);

  if (!weeklyPlan[dayIndex]) {
    console.warn(`День ${dayIndex} не существует`);
    return;
  }

  weeklyPlan[dayIndex][mealType] = Array.isArray(meal) ? meal : [meal];
  displayWeeklyPlan(weeklyPlan, userData.dailyCalories);
}

// === Отображение недельного плана ===
function displayWeeklyPlan(plan, dailyCalories) {
  const resultDiv = document.getElementById("result");
  const tabsContainer = document.getElementById("tabs-container");
  const mealPlanDiv = document.getElementById("mealPlan");
  const t = translations[currentLang];

  resultDiv.style.display = "block";
  document.getElementById("calories").textContent = Math.round(dailyCalories);

  // Вкладки дней
  tabsContainer.innerHTML = `
    <div class="tab-buttons">
      ${plan.map((_, i) => `
        <div class="tab-item">
          <button class="tab-button" data-day="${i}">${t.day} ${i + 1}</button>
          <button type="button" class="mini-btn regen-day-btn" title="Regenerate day" onclick="regenerateDay(${i})">🔄</button>
        </div>
      `).join("")}
    </div>
  `;

  // Контент дней
  mealPlanDiv.innerHTML = plan.map((day, dayIndex) => `
    <div class="day-plan" data-day-content="${dayIndex}" style="display: none;">
      ${Object.entries(day).map(([mealType, meals]) => {
        if (!meals || meals.length === 0) return "";
        return `
          <div class="meal-section">
            <div class="meal-header">
              ${getMealLabel(mealType)}
              <button type="button" class="mini-btn" title="Regenerate"
                      onclick="regenerateMeal(${dayIndex}, '${mealType}')">
                🔄
              </button>
            </div>
            ${meals.map(meal => `
              <div class="meal-item">
                <span class="emoji">${getEmoji(meal.title)}</span>
                <span class="title">${meal.title}</span>
                <span class="info">
                  ${meal.weight}г • ${meal.calories}ккал •
                  Б:${meal.protein.toFixed(1)}г Ж:${meal.fat.toFixed(1)}г У:${meal.carbs.toFixed(1)}г
                </span>
              </div>
            `).join("")}
          </div>
        `;
      }).join("")}

      <div class="daily-summary">
        <strong>${t.total}</strong><br>
        Калории: ${sumProperty(day, 'calories')} ккал<br>
        Б: ${sumProperty(day, 'protein').toFixed(1)}г,
        Ж: ${sumProperty(day, 'fat').toFixed(1)}г,
        У: ${sumProperty(day, 'carbs').toFixed(1)}г
      </div>
    </div>
  `).join("");

  // Показываем первый день
  const firstTab = document.querySelector('[data-day="0"]');
  const firstContent = document.querySelector('[data-day-content="0"]');
  if (firstTab && firstContent) {
    firstTab.classList.add("active");
    firstContent.style.display = "block";
  }

  // Переключение дней
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const dayIndex = btn.getAttribute("data-day");
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".day-plan").forEach(d => d.style.display = "none");
      btn.classList.add("active");
      document.querySelector(`[data-day-content="${dayIndex}"]`).style.display = "block";
    });
  });

  updateCalorieStatus(dailyCalories);
}

// === Копирование плана в буфер обмена ===
document.getElementById("copyPlan").addEventListener("click", function () {
  const copyText = generateCopyText(weeklyPlan);
  navigator.clipboard.writeText(copyText).then(() => {
    this.textContent = translations[currentLang].copied;
    setTimeout(() => {
      this.textContent = translations[currentLang].copy;
    }, 2000);
  }).catch(err => {
    console.error("Не удалось скопировать: ", err);
  });
});

function generateCopyText(plan) {
  const t = translations[currentLang];
  let text = `🍽 FitoPit — ${t.title}\n\n`;
  plan.forEach((day, i) => {
    text += `${t.day} ${i + 1}\n`;
    Object.entries(day).forEach(([type, meals]) => {
      if (!meals || meals.length === 0) return;
      text += `\n${getMealLabel(type)}:\n`;
      meals.forEach(meal => {
        text += `- ${meal.title}, ${meal.weight}г, ${meal.calories}ккал\n`;
      });
    });
    text += "\n";
  });
  return text;
}

// === Инициализация при загрузке страницы ===
document.addEventListener("DOMContentLoaded", () => {
  // Устанавливаем сохранённую тему
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Устанавливаем сохранённый язык
  const savedLang = localStorage.getItem("lang") || "ru";
  switchLang(savedLang);

  // Привязка событий к кнопкам языка
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang) switchLang(lang);
    });
  });

  // Обработка формы
  const form = document.getElementById("nutritionForm");
  if (!form) {
    console.error("Форма с id='nutritionForm' не найдена.");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const userData = getFormData(this);
    userData.dailyCalories = calculateCalories(
      userData.weight,
      userData.height,
      userData.age,
      userData.gender,
      userData.activity,
      userData.goal
    );

    const constraints = {
      diet: userData.diet,
      allergies: getSelectedAllergies()
    };

    // Генерируем план на 7 дней
    weeklyPlan = [];
    for (let i = 0; i < 7; i++) {
      weeklyPlan.push(generateDayMeals(constraints, userData));
    }

    displayWeeklyPlan(weeklyPlan, userData.dailyCalories);
  });
});