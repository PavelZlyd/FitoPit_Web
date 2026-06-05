// ui.js — Интерфейс и управление питанием

let weeklyPlan = [];
let weeklyTargets = [];
let baseDailyCalories = 0;
let profileEditMode = true;
let activeDayIndex = 0;

const MEAL_ORDER = ['breakfast', 'secondBreakfast', 'lunch', 'snack', 'dinner', 'secondDinner'];

const translations = {
  ru: {
    title: "Твой план питания",
    calories: "Ежедневные калории",
    baseCalories: "Базовые калории",
    statusHigh: "(Высококалорийно)",
    statusLow: "(Низкокалорийно)",
    statusBalanced: "(Сбалансировано)",
    copy: "📋 Копировать план",
    copied: "✅ Скопировано",
    close: "Закрыть",
    day: "День",
    total: "Итого за день:",
    target: "Цель дня",
    breakfast: "🌅 Завтрак",
    secondBreakfast: "☕ Второй завтрак",
    lunch: "🍽 Обед",
    snack: "🍏 Полдник",
    dinner: "🌙 Ужин",
    secondDinner: "🍵 Второй ужин",
    cheatDay: "🎉 Читмил",
    addBooster: "Добавить масло, сыр и др.",
    boosterMenuTitle: "Добавить к блюду",
    selectDish: "Выбрать блюдо…",
    regenMeal: "Перегенерировать приём пищи",
    sectionProfile: "Профиль",
    sectionPrefs: "Предпочтения",
    sectionStrategy: "Стратегия недели",
    strategyCaloriesHint: "Ровная неделя — одинаковая норма каждый день. Циклическая — пн–чт чуть меньше, суббота чуть больше.",
    strategyCheatHint: "В этот день вместо обычного меню — разрешённые «вкусняшки».",
    chartTitle: "Калории по дням недели",
    myRecipes: "Моя база блюд",
    editProfile: "✏️ Изменить профиль",
    createPlan: "🎯 Создать план",
    reset: "🗑 Очистить",
    profileSummary: "Профиль сохранён",
    submitQuick: "🎯 Обновить план"
  },
  en: {
    title: "Your Meal Plan",
    calories: "Daily Calories",
    baseCalories: "Base calories",
    statusHigh: "(High-calorie)",
    statusLow: "(Low-calorie)",
    statusBalanced: "(Balanced)",
    copy: "📋 Copy Plan",
    copied: "✅ Copied",
    close: "Close",
    day: "Day",
    total: "Total for day:",
    target: "Day target",
    breakfast: "🌅 Breakfast",
    secondBreakfast: "☕ Second breakfast",
    lunch: "🍽 Lunch",
    snack: "🍏 Afternoon Snack",
    dinner: "🌙 Dinner",
    secondDinner: "🍵 Late Dinner",
    cheatDay: "🎉 Cheat Day",
    addBooster: "Add butter, cheese, etc.",
    boosterMenuTitle: "Add to meal",
    selectDish: "Choose dish…",
    regenMeal: "Regenerate meal",
    sectionProfile: "Profile",
    sectionPrefs: "Preferences",
    sectionStrategy: "Weekly strategy",
    strategyCaloriesHint: "Flat — same calories every day. Cycle — slightly less Mon–Thu, slightly more on Saturday.",
    strategyCheatHint: "On this day, regular meals are replaced with allowed treat options.",
    chartTitle: "Calories by day of the week",
    myRecipes: "My recipe database",
    editProfile: "✏️ Edit profile",
    createPlan: "🎯 Create plan",
    reset: "🗑 Clear",
    profileSummary: "Profile saved",
    submitQuick: "🎯 Refresh plan"
  }
};

let currentLang = 'ru';

function t() {
  return translations[currentLang];
}

function switchLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const tr = translations[lang];
  const resultH2 = document.querySelector("#result h2");
  if (resultH2) resultH2.textContent = tr.title;

  const labels = {
    age: lang === 'ru' ? 'Возраст' : 'Age',
    gender: lang === 'ru' ? 'Пол' : 'Gender',
    weight: lang === 'ru' ? 'Вес (кг)' : 'Weight (kg)',
    height: lang === 'ru' ? 'Рост (см)' : 'Height (cm)',
    activity: lang === 'ru' ? 'Активность' : 'Activity',
    goal: lang === 'ru' ? 'Цель' : 'Goal',
    diet: lang === 'ru' ? 'Диета' : 'Diet',
    breakfastType: lang === 'ru' ? 'Завтрак' : 'Breakfast',
    cookingPref: lang === 'ru' ? 'Каши и крупы' : 'Porridge & grains',
    budget: lang === 'ru' ? 'Бюджет питания' : 'Food Budget',
    weeklyStrategy: lang === 'ru' ? 'Калории по дням' : 'Weekly calories',
    cheatDayChoice: lang === 'ru' ? 'День читмила' : 'Cheat day',
    excludedKeywords: lang === 'ru' ? 'Исключить продукты (через запятую)' : 'Exclude foods (comma-separated)'
  };
  for (const [id, text] of Object.entries(labels)) {
    const label = document.querySelector(`label[for='${id}']`);
    if (label) label.textContent = text;
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (tr[key]) el.textContent = tr[key];
  });

  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const editBtn = document.getElementById('editProfileBtn');
  if (submitBtn) submitBtn.textContent = profileEditMode ? tr.createPlan : tr.submitQuick;
  if (resetBtn) resetBtn.textContent = tr.reset;
  if (editBtn) editBtn.textContent = tr.editProfile;

  const copyBtn = document.getElementById("copyPlan");
  if (copyBtn) copyBtn.textContent = tr.copy;

  const dailyCalories = parseInt(document.getElementById("calories")?.textContent || 0);
  if (dailyCalories > 0) updateCalorieStatus(dailyCalories);
  if (weeklyPlan.length > 0) displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  renderUserRecipesList();
}

function calculateCalories(weight, height, age, gender, activity, goal) {
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  let calories = bmr * activity;
  if (goal === "lose") calories *= 0.8;
  if (goal === "gain") calories *= 1.2;
  return Math.round(calories);
}

function getFormData(form) {
  return {
    age: parseInt(form.age.value, 10),
    gender: form.gender.value,
    weight: parseFloat(form.weight.value),
    height: parseFloat(form.height.value),
    activity: parseFloat(form.activity.value),
    goal: form.goal.value,
    diet: form.diet.value,
    breakfastType: form.breakfastType.value,
    budget: form.budget.value,
    cookingPref: document.getElementById("cookingPref")?.value || 'any',
    cheatDayEnabled: document.getElementById("cheatDay")?.checked || false,
    cheatDayChoice: document.getElementById("cheatDayChoice")?.value || 'random',
    weeklyStrategy: document.getElementById("weeklyStrategy")?.value || 'flat',
    enableSecondBreakfast: document.getElementById("enableSecondBreakfast")?.checked || false,
    enableSecondDinner: document.getElementById("enableSecondDinner")?.checked || false,
    excludedKeywords: document.getElementById("excludedKeywords")?.value || '',
    excludedTitles: []
  };
}

function getSelectedAllergies() {
  return Array.from(document.querySelectorAll("#allergies input:checked")).map(cb => cb.value);
}

function buildConstraints(userData) {
  return {
    diet: userData.diet,
    allergies: getSelectedAllergies(),
    budget: userData.budget,
    cookingPref: userData.cookingPref,
    breakfastType: userData.breakfastType,
    excludedTitles: userData.excludedTitles || [],
    excludedKeywords: userData.excludedKeywords || ''
  };
}

function applyProfileToForm(profile) {
  const form = document.getElementById("nutritionForm");
  if (!form || !profile) return;

  if (profile.age) form.age.value = profile.age;
  if (profile.gender) form.gender.value = profile.gender;
  if (profile.weight) form.weight.value = profile.weight;
  if (profile.height) form.height.value = profile.height;
  if (profile.activity) form.activity.value = profile.activity;
  if (profile.goal) form.goal.value = profile.goal;
  if (profile.diet) form.diet.value = profile.diet;
  if (profile.breakfastType) form.breakfastType.value = profile.breakfastType;
  if (profile.budget) form.budget.value = profile.budget;
  if (profile.cookingPref) document.getElementById("cookingPref").value = profile.cookingPref;
  if (profile.weeklyStrategy) document.getElementById("weeklyStrategy").value = profile.weeklyStrategy;
  if (profile.cheatDayChoice != null) document.getElementById("cheatDayChoice").value = profile.cheatDayChoice;
  document.getElementById("cheatDay").checked = !!profile.cheatDayEnabled;
  document.getElementById("enableSecondBreakfast").checked = !!profile.enableSecondBreakfast;
  document.getElementById("enableSecondDinner").checked = !!profile.enableSecondDinner;
  if (profile.excludedKeywords) document.getElementById("excludedKeywords").value = profile.excludedKeywords;

  document.querySelectorAll("#allergies input").forEach(cb => {
    cb.checked = (profile.allergies || []).includes(cb.value);
  });
}

function profileFromForm() {
  const form = document.getElementById("nutritionForm");
  const data = getFormData(form);
  data.allergies = getSelectedAllergies();
  return data;
}

function updateSurveyVisibility() {
  const profile = loadProfile();
  const complete = isProfileComplete(profile) && !profileEditMode;

  const summary = document.getElementById("profileSummary");
  const form = document.getElementById("nutritionForm");
  if (complete) {
    summary.style.display = "block";
    const tr = t();
    document.getElementById("profileSummaryText").textContent =
      `${tr.profileSummary}: ${profile.age} ${currentLang === 'ru' ? 'лет' : 'y'}, ${profile.weight} кг, ${profile.height} см — ${profile.goal}`;
    ['profileSection', 'prefsSection'].forEach(id => {
      const sec = document.getElementById(id);
      if (sec) sec.classList.add('section-collapsed');
    });
    document.getElementById("strategySection")?.classList.remove('section-collapsed');
    document.getElementById("submitBtn").textContent = t().submitQuick;
  } else {
    summary.style.display = "none";
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('section-collapsed'));
    document.getElementById("submitBtn").textContent = t().createPlan;
  }
}

function updateCalorieStatus(dailyCalories) {
  const statusSpan = document.getElementById("calorieStatus");
  if (!statusSpan) return;
  const tr = t();
  if (dailyCalories > 2500) {
    statusSpan.textContent = tr.statusHigh;
    statusSpan.style.color = "#e53e3e";
  } else if (dailyCalories < 1600) {
    statusSpan.textContent = tr.statusLow;
    statusSpan.style.color = "#d69e2e";
  } else {
    statusSpan.textContent = tr.statusBalanced;
    statusSpan.style.color = "#38a169";
  }
}

function getEmoji(title) {
  const lowerTitle = (title || '').toLowerCase();
  for (const [key, emoji] of Object.entries(window.emojiMap || {})) {
    if (lowerTitle.includes(key)) return emoji;
  }
  return '🍽️';
}

function getMealLabel(type) {
  return t()[type] || type;
}

function sumProperty(day, prop) {
  return MEAL_ORDER.reduce((sum, mealType) => {
    const meals = day[mealType];
    if (!Array.isArray(meals)) return sum;
    return sum + meals.filter(Boolean).reduce((s, m) => s + (m[prop] || 0), 0);
  }, 0);
}

function isCheatDay(day) {
  return !!day.isCheatDay;
}

function getFilteredBoosters() {
  const constraints = buildConstraints(getFormData(document.getElementById("nutritionForm")));
  return (typeof calorieBoosters !== 'undefined' ? calorieBoosters : [])
    .filter(b => typeof isRecipeAllowed === 'function' && isRecipeAllowed(b, constraints));
}

function renderWeeklyKcalChart(targets) {
  const chart = document.getElementById("weeklyKcalChart");
  if (!chart || !targets?.length) return;
  const max = Math.max(...targets);
  const tr = t();
  const cheatIdx = weeklyPlan.cheatDayIndex;
  chart.innerHTML = `
    <p class="chart-label">${tr.chartTitle}</p>
    <div class="chart-bars">
      ${targets.map((kcal, i) => `
        <div class="chart-bar-wrap${cheatIdx === i ? ' chart-bar-cheat' : ''}" title="${tr.day} ${i + 1}: ${kcal} ккал">
          <span class="chart-kcal">${kcal}</span>
          <div class="chart-bar" style="height: ${Math.round((kcal / max) * 100)}%"></div>
          <span class="chart-day">${i + 1}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function regenerateDay(dayIndex) {
  const form = document.getElementById("nutritionForm");
  if (!form) return;
  const userData = getFormData(form);
  userData.dailyCalories = weeklyTargets[dayIndex] ?? calculateCalories(
    userData.weight, userData.height, userData.age, userData.gender, userData.activity, userData.goal
  );
  userData.isCheatDaySlot = weeklyPlan.cheatDayIndex === dayIndex;
  const constraints = buildConstraints(userData);
  weeklyPlan[dayIndex] = generateDayMeals(constraints, userData);
  weeklyPlan[dayIndex].dayCaloriesTarget = userData.dailyCalories;
  activeDayIndex = dayIndex;
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
}

function regenerateMeal(dayIndex, mealType) {
  const form = document.getElementById("nutritionForm");
  if (!form || !weeklyPlan[dayIndex]) return;
  const userData = getFormData(form);
  userData.dailyCalories = weeklyTargets[dayIndex] ?? baseDailyCalories;
  userData.isCheatDaySlot = weeklyPlan.cheatDayIndex === dayIndex;
  const constraints = buildConstraints(userData);
  const day = weeklyPlan[dayIndex];
  const meal = isCheatDay(day)
    ? generateCheatMeal(mealType, constraints, userData.dailyCalories)
    : generateMeal(mealType, constraints, userData);
  weeklyPlan[dayIndex][mealType] = Array.isArray(meal) ? meal.filter(Boolean) : [meal].filter(Boolean);
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderDishSelect(dayIndex, mealType, mealIndex, meal, constraints, isCheatDay) {
  const tr = t();
  const options = getDishRecipeOptions(mealType, meal, constraints, isCheatDay);
  return `
    <select class="dish-select" title="${tr.selectDish}"
            onchange="selectDishRecipe(${dayIndex}, '${mealType}', ${mealIndex}, this.value)">
      <option value="" disabled>${tr.selectDish}</option>
      ${options.map(r => `
        <option value="${escapeHtml(r.title)}" ${r.title === meal.title ? 'selected' : ''}>
          ${escapeHtml(r.title)}
        </option>
      `).join('')}
    </select>
  `;
}

function selectDishRecipe(dayIndex, mealType, mealIndex, recipeTitle) {
  if (!recipeTitle) return;
  const form = document.getElementById("nutritionForm");
  if (!form) return;
  const meal = weeklyPlan[dayIndex]?.[mealType]?.[mealIndex];
  if (!meal || meal.isAddOn || meal.title === recipeTitle) return;

  const userData = getFormData(form);
  const constraints = buildConstraints(userData);
  const day = weeklyPlan[dayIndex];
  let baseCalories = meal.calories;
  if (meal.addons?.length) {
    const addonCal = meal.addons.reduce((s, a) => s + (a.calories || 0), 0);
    baseCalories = meal.calories - addonCal;
  }

  weeklyPlan[dayIndex][mealType][mealIndex] = replaceDishWithRecipe(
    mealType, meal, recipeTitle, baseCalories, constraints, { isCheatDay: isCheatDay(day) }
  );
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
}

function displayWeeklyPlan(plan, dailyCalories, dayIndex = activeDayIndex) {
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab) {
    const idx = parseInt(activeTab.getAttribute('data-day'), 10);
    if (!isNaN(idx)) dayIndex = idx;
  }
  activeDayIndex = Math.max(0, Math.min(6, dayIndex));

  const resultDiv = document.getElementById("result");
  const tabsContainer = document.getElementById("tabs-container");
  const mealPlanDiv = document.getElementById("mealPlan");
  const tr = t();
  const form = document.getElementById("nutritionForm");
  const constraints = form ? buildConstraints(getFormData(form)) : {};

  resultDiv.style.display = "block";
  document.getElementById("calories").textContent = Math.round(dailyCalories);
  renderWeeklyKcalChart(plan.weeklyTargets || weeklyTargets);

  tabsContainer.innerHTML = `
    <div class="tab-buttons">
      ${plan.map((day, i) => `
        <div class="tab-item">
          <button class="tab-button ${isCheatDay(day) ? 'cheat-day' : ''}" data-day="${i}">
            ${tr.day} ${i + 1}${isCheatDay(day) ? ` (${tr.cheatDay})` : ''}
          </button>
          <button type="button" class="mini-btn regen-day-btn" title="Regenerate day" onclick="regenerateDay(${i})">🔄</button>
        </div>
      `).join("")}
    </div>
  `;

  mealPlanDiv.innerHTML = plan.map((day, dayIndex) => {
    const dayTarget = day.dayCaloriesTarget || weeklyTargets[dayIndex] || dailyCalories;
    return `
    <div class="day-plan" data-day-content="${dayIndex}" style="display: none;">
      <p class="day-target">${tr.target}: <strong>${dayTarget}</strong> ккал</p>
      ${MEAL_ORDER.map(mealType => {
        const meals = (day[mealType] || []).filter(Boolean);
        if (!meals.length) return "";
        return `
          <div class="meal-section">
            <div class="meal-header">
              ${getMealLabel(mealType)}
              <button type="button" class="mini-btn regen-meal-btn" title="${tr.regenMeal}"
                      onclick="regenerateMeal(${dayIndex}, '${mealType}')">🔄</button>
            </div>
            ${meals.map((meal, mealIndex) => {
              if (meal.isAddOn) {
                return `
                  <div class="addon-item">
                    <span class="emoji">${getEmojiForBooster(meal.title)}</span>
                    +${meal.weight}г ${meal.title} (${meal.calories}ккал)
                  </div>`;
              }
              const addonsHtml = (meal.addons || []).map(a => `
                <div class="addon-item">
                  <span class="emoji">${getEmojiForBooster(a.title)}</span>
                  +${a.weight}г ${a.title} (${a.calories}ккал)
                </div>
              `).join("");

              return `
                <div class="meal-item">
                  <span class="emoji">${getEmoji(meal.title)}</span>
                  <span class="title">${escapeHtml(meal.title)}</span>
                  ${renderDishSelect(dayIndex, mealType, mealIndex, meal, constraints, isCheatDay(day))}
                  <span class="info">
                    ${meal.weight}г • ${meal.calories}ккал •
                    Б:${(meal.protein || 0).toFixed(1)}г Ж:${(meal.fat || 0).toFixed(1)}г У:${(meal.carbs || 0).toFixed(1)}г
                  </span>
                  <button type="button" class="mini-btn add-booster-btn"
                          title="${tr.addBooster}"
                          onclick="showBoosterMenu(${dayIndex}, '${mealType}', ${mealIndex})">➕</button>
                </div>
                ${addonsHtml}
              `;
            }).join("")}
          </div>
        `;
      }).join("")}
      <div class="daily-summary">
        <strong>${tr.total}</strong><br>
        Калории: ${sumProperty(day, 'calories')} ккал<br>
        Б: ${sumProperty(day, 'protein').toFixed(1)}г,
        Ж: ${sumProperty(day, 'fat').toFixed(1)}г,
        У: ${sumProperty(day, 'carbs').toFixed(1)}г
      </div>
    </div>
  `;
  }).join("");

  const activeTabEl = document.querySelector(`[data-day="${activeDayIndex}"]`);
  const activeContent = document.querySelector(`[data-day-content="${activeDayIndex}"]`);
  if (activeTabEl && activeContent) {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".day-plan").forEach(d => d.style.display = "none");
    activeTabEl.classList.add("active");
    activeContent.style.display = "block";
  }

  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-day");
      activeDayIndex = parseInt(idx, 10);
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".day-plan").forEach(d => d.style.display = "none");
      btn.classList.add("active");
      document.querySelector(`[data-day-content="${idx}"]`).style.display = "block";
    });
  });

  updateCalorieStatus(dailyCalories);
}

function generateCopyText(plan) {
  const tr = t();
  let text = `🍽 FitoPit — ${tr.title}\n\n`;
  plan.forEach((day, i) => {
    const target = day.dayCaloriesTarget || weeklyTargets[i] || baseDailyCalories;
    text += `${tr.day} ${i + 1}${isCheatDay(day) ? ` (${tr.cheatDay})` : ''} — ${target} ккал\n`;
    MEAL_ORDER.forEach(mealType => {
      const meals = (day[mealType] || []).filter(Boolean);
      if (!meals.length) return;
      text += `\n${getMealLabel(mealType)}:\n`;
      meals.forEach(meal => {
        if (meal.isAddOn && !meal.addons) {
          text += `  + ${meal.title}, ${meal.weight}г, ${meal.calories}ккал\n`;
          return;
        }
        text += `- ${meal.title}, ${meal.weight}г, ${meal.calories}ккал`;
        (meal.addons || []).forEach(a => {
          text += `\n  → +${a.weight}г ${a.title} (${a.calories}ккал)`;
        });
        text += '\n';
      });
    });
    text += "\n";
  });
  return text;
}

function getEmojiForBooster(title) {
  const map = {
    масло: '🧈', сыр: '🧀', фета: '🧀', орех: '🥜', мед: '🍯', мёд: '🍯', авокадо: '🥑',
    хлеб: '🍞', хлебец: '🍘', банан: '🍌', яблок: '🍎', груш: '🍐', кефир: '🥛',
    творог: '🥣', сметан: '🥄', сухофрукт: '🍇', хумус: '🫘', гуакамоле: '🥑'
  };
  const lower = (title || '').toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '➕';
}

function showBoosterMenu(dayIndex, mealType, mealIndex) {
  const boosters = getFilteredBoosters();
  const tr = t();
  const menu = document.createElement('div');
  menu.className = 'booster-menu';
  menu.innerHTML = `
    <div class="booster-menu-content">
      <h4>${tr.boosterMenuTitle}</h4>
      ${boosters.map((b, i) => `
        <button type="button" class="booster-item"
                onclick="addBoosterToMeal(${dayIndex}, '${mealType}', ${mealIndex}, ${i})">
          ${getEmojiForBooster(b.title)} ${b.title}
        </button>
      `).join("")}
      <button type="button" class="booster-close" onclick="closeBoosterMenu()">❌ ${tr.close}</button>
    </div>
  `;
  document.body.appendChild(menu);
  menu._boosters = boosters;
  menu.addEventListener('click', (e) => { if (e.target === menu) closeBoosterMenu(); });
}

function closeBoosterMenu() {
  const menu = document.querySelector('.booster-menu');
  if (menu) menu.remove();
}

function getBoosterWeight(booster) {
  if (typeof getBoosterPortionWeight === 'function') {
    return getBoosterPortionWeight(booster);
  }
  const bt = booster.title.toLowerCase();
  if (bt.includes('масло')) return 15;
  if (bt.includes('фета')) return 30;
  if (bt.includes('сыр') && !bt.includes('творог')) return 30;
  if (bt.includes('орех') || bt.includes('сухофрукт')) return 25;
  if (bt.includes('мед') || bt.includes('мёд')) return 10;
  if (bt.includes('авокадо')) return 50;
  if (bt.includes('банан')) return 100;
  if (bt.includes('яблок') || bt.includes('груш')) return 150;
  if (bt.includes('кефир')) return 200;
  if (bt.includes('творог')) return 100;
  if (bt.includes('сметан')) return 30;
  if (bt.includes('хлебец')) return 30;
  if (bt.includes('хумус') || bt.includes('гуакамоле')) return 40;
  return 20;
}

function addBoosterToMeal(dayIndex, mealType, mealIndex, boosterIndex) {
  const menu = document.querySelector('.booster-menu');
  const boosters = menu?._boosters || getFilteredBoosters();
  const booster = boosters[boosterIndex];
  const meal = weeklyPlan[dayIndex]?.[mealType]?.[mealIndex];
  if (!meal || !booster) return;

  const weight = getBoosterWeight(booster);
  const roundedCalories = typeof roundCalories === 'function'
    ? roundCalories((booster.kcalPer100g * weight) / 100)
    : Math.round((booster.kcalPer100g * weight) / 100 / 10) * 10;

  const addon = {
    ...booster,
    weight,
    calories: roundedCalories,
    protein: parseFloat(((booster.proteinPer100g * weight) / 100).toFixed(1)),
    fat: parseFloat(((booster.fatPer100g * weight) / 100).toFixed(1)),
    carbs: parseFloat(((booster.carbsPer100g * weight) / 100).toFixed(1)),
    isAddOn: true
  };

  if (!meal.addons) meal.addons = [];
  meal.addons.push(addon);
  meal.calories = Math.round((meal.calories + roundedCalories) / 10) * 10;
  meal.protein = parseFloat((meal.protein + addon.protein).toFixed(1));
  meal.fat = parseFloat((meal.fat + addon.fat).toFixed(1));
  meal.carbs = parseFloat((meal.carbs + addon.carbs).toFixed(1));

  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  closeBoosterMenu();
}

function renderUserRecipesList() {
  const list = document.getElementById("userRecipesList");
  if (!list) return;
  const recipes = getUserRecipes();
  list.innerHTML = recipes.length
    ? recipes.map(r => `
        <li>
          <span>${r.title} — ${r.kcalPer100g} ккал/100г (${(r.mealSlots || []).join(', ')})</span>
          <button type="button" class="mini-btn" onclick="deleteUserRecipeById('${r.id}')">🗑</button>
        </li>
      `).join('')
    : `<li class="empty-hint">${currentLang === 'ru' ? 'Пока нет своих блюд' : 'No custom recipes yet'}</li>`;
}

function deleteUserRecipeById(id) {
  deleteUserRecipe(id);
  renderUserRecipesList();
}

function createPlanFromForm() {
  const form = document.getElementById("nutritionForm");
  const userData = getFormData(form);
  userData.allergies = getSelectedAllergies();
  saveProfile(userData);

  userData.dailyCalories = calculateCalories(
    userData.weight, userData.height, userData.age,
    userData.gender, userData.activity, userData.goal
  );
  baseDailyCalories = userData.dailyCalories;

  const constraints = buildConstraints(userData);
  weeklyPlan = generateWeeklyPlan(constraints, userData);
  weeklyTargets = weeklyPlan.weeklyTargets || Array(7).fill(baseDailyCalories);

  activeDayIndex = 0;
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  profileEditMode = false;
  updateSurveyVisibility();
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const savedLang = localStorage.getItem("lang") || "ru";
  switchLang(savedLang);

  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang) switchLang(btn.dataset.lang);
    });
  });

  const profile = loadProfile();
  applyProfileToForm(profile);
  profileEditMode = !isProfileComplete(profile);
  updateSurveyVisibility();
  renderUserRecipesList();

  document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    profileEditMode = true;
    updateSurveyVisibility();
  });

  document.getElementById("cheatDay")?.addEventListener("change", (e) => {
    const group = document.getElementById("cheatDayChoiceGroup");
    if (group) group.style.opacity = e.target.checked ? '1' : '0.5';
  });

  const form = document.getElementById("nutritionForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createPlanFromForm();
  });

  form?.addEventListener("reset", () => {
    weeklyPlan = [];
    weeklyTargets = [];
    document.getElementById("result").style.display = "none";
    profileEditMode = true;
    updateSurveyVisibility();
  });

  document.getElementById("userRecipeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const slots = Array.from(document.getElementById("userRecipeSlot").selectedOptions).map(o => o.value);
    addUserRecipe({
      title: document.getElementById("userRecipeTitle").value,
      kcalPer100g: document.getElementById("userRecipeKcal").value,
      proteinPer100g: document.getElementById("userRecipeProtein").value || 0,
      fatPer100g: document.getElementById("userRecipeFat").value || 0,
      carbsPer100g: document.getElementById("userRecipeCarbs").value || 0,
      budget: document.getElementById("userRecipeBudget").value,
      mealSlots: slots.length ? slots : ['breakfast'],
      diet: ['normal', 'vegetarian', 'vegan', 'glutenfree'],
      allergens: []
    });
    e.target.reset();
    document.querySelectorAll('#userRecipeSlot option').forEach((o, i) => { o.selected = i === 0; });
    renderUserRecipesList();
  });

  document.getElementById("copyPlan")?.addEventListener("click", function () {
    navigator.clipboard.writeText(generateCopyText(weeklyPlan)).then(() => {
      this.textContent = t().copied;
      setTimeout(() => { this.textContent = t().copy; }, 2000);
    }).catch(err => console.error(err));
  });
});

window.regenerateDay = regenerateDay;
window.regenerateMeal = regenerateMeal;
window.selectDishRecipe = selectDishRecipe;
window.showBoosterMenu = showBoosterMenu;
window.closeBoosterMenu = closeBoosterMenu;
window.addBoosterToMeal = addBoosterToMeal;
window.deleteUserRecipeById = deleteUserRecipeById;
window.switchLang = switchLang;
