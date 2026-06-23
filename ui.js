// ui.js — Интерфейс и управление питанием
import {
  calorieBoosters,
  cheatMealRecipes,
  emojiMap,
  noRecipeLinkTitles
} from './data.js';
import { scaleIngredientsForPortion } from './nutrition.js';
import {
  balanceDayCalories,
  generateCheatMeal,
  generateDayMeals,
  generateMeal,
  generateWeeklyPlan,
  getBoosterPortionWeight,
  getDishRecipeOptions,
  isRecipeAllowed,
  recalcMealFromWeight,
  replaceDishWithRecipe
} from './generator.js';
import { buildShoppingList, formatShoppingListText, planHasIngredientData, roundShoppingWeight, SHOPPING_MODES } from './shoppingList.js';
import {
  addPlanToHistory,
  addUserRecipe,
  clearLastPlan,
  deletePlanFromHistory,
  deleteUserRecipe,
  getMergedRecipesDB,
  getPlanFromHistory,
  getPlanHistory,
  getUserRecipes,
  isProfileComplete,
  loadLastPlan,
  loadProfile,
  saveFeedbackSubmission,
  saveLastPlan,
  saveProfile
} from './userStore.js';

let weeklyPlan = [];
let weeklyTargets = [];
let baseDailyCalories = 0;
let macroTargets = { protein: 0, fat: 0, carbs: 0 };
let profileEditMode = true;
let activeDayIndex = 0;
let shoppingListMode = localStorage.getItem('fitopit_shopping_mode') || SHOPPING_MODES.INGREDIENTS;
let compositionCounter = 0;

// Укажи email для отправки через FormSubmit (https://formsubmit.co), иначе — только localStorage
const FEEDBACK_EMAIL = 'Zlydin.pm@dvfu.ru';

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
    removeAddon: "Убрать добавку",
    boosterMenuTitle: "Добавить к блюду",
    selectDish: "Выбрать блюдо…",
    regenMeal: "Перегенерировать приём пищи",
    sectionProfile: "Профиль",
    sectionPrefs: "Предпочтения",
    sectionAllergies: "Аллергии",
    sectionStrategy: "Стратегия недели",
    strategyCaloriesHint: "Ровная неделя — одинаковая норма каждый день. Циклическая — пн–чт чуть меньше, суббота чуть больше.",
    strategyCheatHint: "В этот день вместо обычного меню — разрешённые «вкусняшки».",
    chartTitle: "Итого калорий за день",
    chartTargetHint: "цель",
    myRecipes: "Моя база блюд",
    editProfile: "✏️ Изменить профиль",
    createPlan: "🎯 Создать план",
    reset: "🗑 Очистить",
    profileSummary: "Профиль сохранён",
    submitQuick: "🎯 Обновить план",
    deltaOnTarget: "в цели",
    deltaOver: "выше цели",
    deltaUnder: "ниже цели",
    recipeLink: "📖 Рецепт",
    compositionBtn: "🧾 Состав",
    compositionTitle: "Состав на порцию",
    compositionToTaste: "по вкусу",
    importPlanSummary: "📥 Загрузить сохранённый план",
    importPlanHint: "Вставь текст, скопированный кнопкой «Копировать план».",
    importPlanBtn: "📥 Загрузить план",
    importPlanPlaceholder: "🍽 FitoPit — Твой план питания…",
    importPlanSuccess: "✅ План загружен",
    importPlanError: "Не удалось распознать план. Проверь, что текст скопирован из FitoPit.",
    copyFailed: "❌ Не удалось скопировать",
    tabPlan: "План питания",
    tabProfile: "Профиль",
    tabSavedPlans: "Сохранённые планы",
    tabMyRecipes: "Мои блюда",
    tabFeedback: "Обратная связь",
    planEmptyHint: "Сначала заполни профиль и нажми «Создать план» в разделе «Профиль».",
    macroNorms: "Норма БЖУ в день",
    macroProtein: "Б",
    macroFat: "Ж",
    macroCarbs: "У",
    macroGrams: "г",
    macroDeltaOnTarget: "в норме",
    macroDeltaOver: "выше нормы",
    macroDeltaUnder: "ниже нормы",
    feedbackTitle: "Предложить блюдо или оставить отзыв",
    feedbackHint: "Расскажи, какое блюдо хочешь видеть в базе, или поделись идеей по улучшению сервиса.",
    feedbackTypeLabel: "Тип сообщения",
    feedbackTypeDish: "Предложить блюдо",
    feedbackTypeImprove: "Идея по улучшению",
    feedbackTypeOther: "Другое",
    feedbackDishLabel: "Название блюда (если есть)",
    feedbackMessageLabel: "Сообщение",
    feedbackContactLabel: "Контакт (необязательно)",
    feedbackSubmit: "Отправить",
    feedbackSuccess: "✅ Спасибо! Мы получили твоё сообщение.",
    feedbackError: "❌ Не удалось отправить. Попробуй позже.",
    feedbackDishPlaceholder: "Например: куриный суп с лапшой",
    feedbackMessagePlaceholder: "Опиши блюдо, ингредиенты или пожелание…",
    feedbackContactPlaceholder: "Email или Telegram",
    shoppingListTitle: "Список покупок на неделю",
    shoppingListHint: "Суммарный вес продуктов по неделе — ориентир для закупок.",
    shoppingListHintDishes: "Суммарный вес блюд по неделе — ориентир для закупок.",
    shoppingListEmpty: "Нет позиций для списка.",
    shoppingListOccurrences: "раз",
    shoppingModeDishes: "По блюдам",
    shoppingModeIngredients: "По продуктам",
    shoppingModeLabel: "Режим списка",
    copyShoppingList: "🛒 Копировать список покупок",
    shoppingListCopied: "✅ Список скопирован",
    printPlan: "🖨 Печать",
    planHistorySummary: "📚 История планов",
    planHistoryHint: "Сохраняй удачные планы и загружай их позже.",
    planHistoryNamePlaceholder: "Название (необязательно)",
    savePlanHistory: "💾 Сохранить текущий план",
    planHistorySaved: "✅ План сохранён в историю",
    planHistoryEmpty: "История пуста — сохрани текущий план.",
    planHistoryLoad: "Загрузить",
    planHistoryDelete: "Удалить",
    planHistoryNoPlan: "Сначала создай план питания."
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
    removeAddon: "Remove add-on",
    boosterMenuTitle: "Add to meal",
    selectDish: "Choose dish…",
    regenMeal: "Regenerate meal",
    sectionProfile: "Profile",
    sectionPrefs: "Preferences",
    sectionAllergies: "Allergies",
    sectionStrategy: "Weekly strategy",
    strategyCaloriesHint: "Flat — same calories every day. Cycle — slightly less Mon–Thu, slightly more on Saturday.",
    strategyCheatHint: "On this day, regular meals are replaced with allowed treat options.",
    chartTitle: "Daily calorie totals",
    chartTargetHint: "target",
    myRecipes: "My recipe database",
    editProfile: "✏️ Edit profile",
    createPlan: "🎯 Create plan",
    reset: "🗑 Clear",
    profileSummary: "Profile saved",
    submitQuick: "🎯 Refresh plan",
    deltaOnTarget: "on target",
    deltaOver: "above target",
    deltaUnder: "below target",
    recipeLink: "📖 Recipe",
    compositionBtn: "🧾 Ingredients",
    compositionTitle: "Per-portion ingredients",
    compositionToTaste: "to taste",
    importPlanSummary: "📥 Load saved plan",
    importPlanHint: "Paste text copied with the «Copy Plan» button.",
    importPlanBtn: "📥 Load plan",
    importPlanPlaceholder: "🍽 FitoPit — Your Meal Plan…",
    importPlanSuccess: "✅ Plan loaded",
    importPlanError: "Could not parse the plan. Make sure the text was copied from FitoPit.",
    copyFailed: "❌ Copy failed",
    tabPlan: "Meal plan",
    tabProfile: "Profile",
    tabSavedPlans: "Saved plans",
    tabMyRecipes: "My dishes",
    tabFeedback: "Feedback",
    planEmptyHint: "Fill in your profile and tap «Create plan» in the Profile section first.",
    macroNorms: "Daily macro targets",
    macroProtein: "P",
    macroFat: "F",
    macroCarbs: "C",
    macroGrams: "g",
    macroDeltaOnTarget: "on target",
    macroDeltaOver: "above target",
    macroDeltaUnder: "below target",
    feedbackTitle: "Suggest a dish or leave feedback",
    feedbackHint: "Tell us which dish you'd like in the database, or share an idea to improve the service.",
    feedbackTypeLabel: "Message type",
    feedbackTypeDish: "Suggest a dish",
    feedbackTypeImprove: "Improvement idea",
    feedbackTypeOther: "Other",
    feedbackDishLabel: "Dish name (optional)",
    feedbackMessageLabel: "Message",
    feedbackContactLabel: "Contact (optional)",
    feedbackSubmit: "Send",
    feedbackSuccess: "✅ Thanks! We received your message.",
    feedbackError: "❌ Could not send. Please try again later.",
    feedbackDishPlaceholder: "e.g. chicken noodle soup",
    feedbackMessagePlaceholder: "Describe the dish, ingredients, or your suggestion…",
    feedbackContactPlaceholder: "Email or Telegram",
    shoppingListTitle: "Weekly shopping list",
    shoppingListHint: "Total ingredient weights for the week — a guide for grocery shopping.",
    shoppingListHintDishes: "Total dish weights for the week — a guide for grocery shopping.",
    shoppingListEmpty: "No items for the list.",
    shoppingListOccurrences: "×",
    shoppingModeDishes: "By dishes",
    shoppingModeIngredients: "By ingredients",
    shoppingModeLabel: "List mode",
    copyShoppingList: "🛒 Copy shopping list",
    shoppingListCopied: "✅ List copied",
    printPlan: "🖨 Print",
    planHistorySummary: "📚 Plan history",
    planHistoryHint: "Save successful plans and load them later.",
    planHistoryNamePlaceholder: "Name (optional)",
    savePlanHistory: "💾 Save current plan",
    planHistorySaved: "✅ Plan saved to history",
    planHistoryEmpty: "History is empty — save the current plan.",
    planHistoryLoad: "Load",
    planHistoryDelete: "Delete",
    planHistoryNoPlan: "Create a meal plan first."
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
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
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

  const importTextarea = document.getElementById('importPlanText');
  if (importTextarea) importTextarea.placeholder = tr.importPlanPlaceholder;

  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const editBtn = document.getElementById('editProfileBtn');
  if (submitBtn) submitBtn.textContent = profileEditMode ? tr.createPlan : tr.submitQuick;
  if (resetBtn) resetBtn.textContent = tr.reset;
  if (editBtn) editBtn.textContent = tr.editProfile;

  const copyBtn = document.getElementById("copyPlan");
  if (copyBtn) copyBtn.textContent = tr.copy;

  const copyShoppingBtn = document.getElementById("copyShoppingList");
  if (copyShoppingBtn) copyShoppingBtn.textContent = tr.copyShoppingList;

  const printBtn = document.getElementById("printPlan");
  if (printBtn) printBtn.textContent = tr.printPlan;

  const saveHistoryBtn = document.getElementById("savePlanHistoryBtn");
  if (saveHistoryBtn) saveHistoryBtn.textContent = tr.savePlanHistory;

  const historyNameInput = document.getElementById("planHistoryName");
  if (historyNameInput) historyNameInput.placeholder = tr.planHistoryNamePlaceholder;

  const dailyCalories = parseInt(document.getElementById("calories")?.textContent || 0);
  if (dailyCalories > 0) updateCalorieStatus(dailyCalories);
  if (weeklyPlan.length > 0) {
    displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  }
  renderUserRecipesList();
  renderPlanHistoryList();
  updateFeedbackFormLabels();
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

function calculateMacroTargets(weight, dailyCalories, goal) {
  const proteinPerKg = goal === "lose" ? 2.0 : goal === "gain" ? 2.2 : 1.6;
  const fatKcalShare = goal === "maintain" ? 0.30 : 0.25;

  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((dailyCalories * fatKcalShare) / 9);
  const carbs = Math.max(0, Math.round((dailyCalories - protein * 4 - fat * 9) / 4));

  return { protein, fat, carbs };
}

function renderMacroTargetsLine() {
  const line = document.getElementById("macroTargetsLine");
  if (!line || !macroTargets.protein) return;

  line.style.display = "block";
  document.getElementById("macroProtein").textContent = macroTargets.protein;
  document.getElementById("macroFat").textContent = macroTargets.fat;
  document.getElementById("macroCarbs").textContent = macroTargets.carbs;
}

function getMacroDeltaInfo(actual, target) {
  const delta = Math.round((actual - target) * 10) / 10;
  const tolerance = Math.max(10, target * 0.1);
  const abs = Math.abs(delta);
  let status = "good";
  if (abs > tolerance * 2) status = "bad";
  else if (abs > tolerance) status = "warn";
  return { delta, status };
}

function formatMacroDelta(delta) {
  const tr = t();
  const rounded = Math.round(delta);
  if (rounded === 0) return tr.macroDeltaOnTarget;
  const sign = rounded > 0 ? "+" : "";
  const suffix = rounded > 0 ? tr.macroDeltaOver : tr.macroDeltaUnder;
  return `${sign}${rounded} ${tr.macroGrams} (${suffix})`;
}

function formatMacroLine(label, actual, target) {
  const { delta } = getMacroDeltaInfo(actual, target);
  return `${label}: ${actual.toFixed(1)} / ${target} ${t().macroGrams} — ${formatMacroDelta(delta)}`;
}

const SITE_PANELS = {
  profile: 'profilePanel',
  plan: 'planPanel',
  savedPlans: 'savedPlansPanel',
  myRecipes: 'myRecipesPanel',
  feedback: 'feedbackPanel'
};

function switchSitePanel(panelId) {
  const targetId = SITE_PANELS[panelId] ? panelId : 'profile';
  document.querySelectorAll(".site-tab").forEach(btn => {
    const isActive = btn.dataset.panel === targetId;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  for (const [id, elId] of Object.entries(SITE_PANELS)) {
    const el = document.getElementById(elId);
    if (el) el.style.display = id === targetId ? "block" : "none";
  }
  localStorage.setItem("fitopit_active_panel", targetId);
}

function updatePlanEmptyState() {
  const empty = document.getElementById("planEmptyState");
  const result = document.getElementById("result");
  if (!empty) return;
  const hasPlan = weeklyPlan?.length > 0 && result?.style.display !== "none";
  empty.style.display = hasPlan ? "none" : "block";
}

function updateFeedbackFormLabels() {
  const tr = t();
  const dish = document.getElementById("feedbackDish");
  const message = document.getElementById("feedbackMessage");
  const contact = document.getElementById("feedbackContact");
  if (dish) dish.placeholder = tr.feedbackDishPlaceholder;
  if (message) message.placeholder = tr.feedbackMessagePlaceholder;
  if (contact) contact.placeholder = tr.feedbackContactPlaceholder;
}

async function submitFeedback(form) {
  const tr = t();
  const payload = {
    type: form.type.value,
    dish: form.dish.value.trim(),
    message: form.message.value.trim(),
    contact: form.contact.value.trim(),
    lang: currentLang,
    submittedAt: new Date().toISOString()
  };

  saveFeedbackSubmission(payload);

  if (FEEDBACK_EMAIL) {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(FEEDBACK_EMAIL)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "FitoPit — обратная связь",
          type: payload.type,
          dish: payload.dish,
          message: payload.message,
          contact: payload.contact,
          lang: payload.lang
        })
      });
      if (!res.ok) throw new Error("send failed");
    } catch {
      return { ok: false, message: tr.feedbackError };
    }
  }

  return { ok: true, message: tr.feedbackSuccess };
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

function updateSurveyVisibility() {
  const profile = loadProfile();
  const complete = isProfileComplete(profile) && !profileEditMode;

  const summary = document.getElementById("profileSummary");
  if (complete) {
    summary.style.display = "block";
    const tr = t();
    document.getElementById("profileSummaryText").textContent =
      `${tr.profileSummary}: ${profile.age} ${currentLang === 'ru' ? 'лет' : 'y'}, ${profile.weight} кг, ${profile.height} см — ${profile.goal}`;
    const profileSec = document.getElementById('profileSection');
    if (profileSec) profileSec.classList.add('section-collapsed');
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
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerTitle.includes(key)) return emoji;
  }
  return '🍽️';
}

function renderMealThumb(meal) {
  if (meal?.image) {
    return `<img class="meal-thumb" src="${escapeHtml(meal.image)}" alt="" loading="lazy" width="40" height="40">`;
  }
  return `<span class="emoji" aria-hidden="true">${getEmoji(meal.title)}</span>`;
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

function getCalorieDeltaInfo(total, target) {
  const delta = Math.round(total - target);
  const abs = Math.abs(delta);
  let status = 'good';
  if (abs > 100) status = 'bad';
  else if (abs > 50) status = 'warn';
  return { delta, status };
}

function formatCalorieDelta(delta) {
  const tr = t();
  if (delta === 0) return tr.deltaOnTarget;
  const sign = delta > 0 ? '+' : '';
  const suffix = delta > 0 ? tr.deltaOver : tr.deltaUnder;
  return `${sign}${delta} ккал (${suffix})`;
}

function getRecipeUrl(title) {
  if (noRecipeLinkTitles.has(title)) return null;

  const query = currentLang === 'ru' ? `${title} рецепт` : `${title} recipe`;
  if (currentLang === 'ru') {
    return `https://yandex.ru/search/?text=${encodeURIComponent(query)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function renderRecipeLink(meal) {
  const url = getRecipeUrl(meal.title);
  if (!url) return '';
  return `<a href="${escapeHtml(url)}" class="recipe-link" target="_blank" rel="noopener noreferrer">${t().recipeLink}</a>`;
}

const MASSLESS_INGREDIENTS = new Set(['Соль', 'Специи', 'Перец чёрный', 'Перец']);

function parseUserIngredients(raw) {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => {
      const parts = line.split(/[:：]/);
      if (parts.length < 2) return null;
      const name = parts[0].trim();
      const grams = parseFloat(parts[1].replace(',', '.'));
      if (!name || !(grams >= 0)) return null;
      const ing = { name, grams };
      if (MASSLESS_INGREDIENTS.has(name)) ing.massless = true;
      return ing;
    })
    .filter(Boolean);
}

function getPortionIngredients(meal) {
  if (!meal?.ingredients?.length || !meal.weight) return [];
  return scaleIngredientsForPortion(
    { ingredients: meal.ingredients, yieldGrams: meal.yieldGrams || 100 },
    meal.weight
  );
}

function renderCompositionButton(meal) {
  const items = getPortionIngredients(meal);
  if (!items.length) return '';
  // Простое блюдо из одного продукта (банан, яблоко) — состав очевиден, кнопку не показываем.
  if (items.length === 1 && items[0].name.toLowerCase() === meal.title.trim().toLowerCase()) return '';
  const rows = items
    .map((ing) => `<li><span>${escapeHtml(ing.name)}</span><span>${formatIngredientAmount(ing)}</span></li>`)
    .join('');
  const popoverId = `comp-${compositionCounter++}`;
  return `
    <span class="composition-wrap">
      <button type="button" class="composition-btn" aria-expanded="false"
              onclick="toggleComposition('${popoverId}', this)">${t().compositionBtn}</button>
      <div class="composition-popover" id="${popoverId}" role="tooltip" hidden>
        <p class="composition-title">${t().compositionTitle}</p>
        <ul>${rows}</ul>
      </div>
    </span>`;
}

function formatIngredientAmount(ing) {
  if (ing.massless) return t().compositionToTaste;
  const grams = Math.round(ing.grams);
  return `${grams}${t().macroGrams}`;
}

window.toggleComposition = function (id, btn) {
  const popover = document.getElementById(id);
  if (!popover) return;
  const willOpen = popover.hasAttribute('hidden');
  document.querySelectorAll('.composition-popover').forEach((p) => p.setAttribute('hidden', ''));
  document.querySelectorAll('.composition-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  if (willOpen) {
    popover.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
  }
};

document.addEventListener('click', (e) => {
  if (e.target.closest('.composition-wrap')) return;
  document.querySelectorAll('.composition-popover').forEach((p) => p.setAttribute('hidden', ''));
  document.querySelectorAll('.composition-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
});

function isCheatDay(day) {
  return !!day.isCheatDay;
}

function getFilteredBoosters() {
  const constraints = buildConstraints(getFormData(document.getElementById("nutritionForm")));
  return calorieBoosters.filter(b => isRecipeAllowed(b, constraints));
}

function renderWeeklyKcalChart(plan) {
  const chart = document.getElementById("weeklyKcalChart");
  if (!chart || !plan?.length) return;

  const tr = t();
  const days = plan.map((day, i) => {
    const total = sumProperty(day, 'calories');
    const target = day.dayCaloriesTarget || weeklyTargets[i] || 0;
    const { status } = getCalorieDeltaInfo(total, target);
    return { total, target, status, isCheat: isCheatDay(day) };
  });

  const max = Math.max(...days.map(d => Math.max(d.total, d.target)), 1);

  chart.innerHTML = `
    <p class="chart-label">${tr.chartTitle}</p>
    <div class="chart-bars">
      ${days.map(({ total, target, status, isCheat }, i) => {
        const barHeight = Math.max(4, Math.round((total / max) * 100));
        const targetLine = target > 0 ? Math.round((target / max) * 100) : 0;
        const title = target > 0
          ? `${tr.day} ${i + 1}: ${total} ккал (${tr.chartTargetHint}: ${target})`
          : `${tr.day} ${i + 1}: ${total} ккал`;
        return `
        <div class="chart-bar-wrap${isCheat ? ' chart-bar-cheat' : ''}" title="${title}">
          <span class="chart-kcal">${total}</span>
          <div class="chart-bar-track">
            ${target > 0 ? `<div class="chart-bar-target-line" style="bottom: ${targetLine}%"></div>` : ''}
            <div class="chart-bar chart-bar--${status}" style="height: ${barHeight}%"></div>
          </div>
          <span class="chart-day">${i + 1}</span>
        </div>`;
      }).join('')}
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
  const dayTarget = weeklyTargets[dayIndex] ?? baseDailyCalories;
  balanceDayCalories(weeklyPlan[dayIndex], dayTarget, constraints);
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

function persistCurrentPlan() {
  if (!weeklyPlan?.length) return;
  saveLastPlan({
    days: weeklyPlan,
    weeklyTargets: weeklyPlan.weeklyTargets || weeklyTargets,
    cheatDayIndex: weeklyPlan.cheatDayIndex,
    baseDailyCalories,
    macroTargets,
    activeDayIndex
  });
}

function restoreLastPlan() {
  const saved = loadLastPlan();
  if (!saved?.days?.length) return false;

  weeklyPlan = saved.days;
  weeklyPlan.cheatDayIndex = saved.cheatDayIndex ?? -1;
  weeklyPlan.weeklyTargets = saved.weeklyTargets || saved.days.map(d => d.dayCaloriesTarget);
  weeklyTargets = weeklyPlan.weeklyTargets;
  baseDailyCalories = saved.baseDailyCalories || 0;
  macroTargets = saved.macroTargets || macroTargets;
  if (!macroTargets.protein && baseDailyCalories) {
    const profile = loadProfile();
    if (profile.weight && profile.goal) {
      macroTargets = calculateMacroTargets(profile.weight, baseDailyCalories, profile.goal);
    }
  }
  activeDayIndex = Math.max(0, Math.min(6, saved.activeDayIndex ?? 0));
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  return true;
}

function formatHistoryDate(iso, lang) {
  try {
    return new Date(iso).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

function renderShoppingList(plan) {
  const panel = document.getElementById('shoppingListPanel');
  if (!panel) return;
  const tr = t();
  const hasIngredients = planHasIngredientData(plan);
  const mode = hasIngredients ? shoppingListMode : SHOPPING_MODES.DISHES;
  const items = buildShoppingList(plan, mode);
  if (!items.length) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  const unit = currentLang === 'ru' ? 'г' : 'g';
  const timesLabel = tr.shoppingListOccurrences;
  const hint = mode === SHOPPING_MODES.INGREDIENTS ? tr.shoppingListHint : tr.shoppingListHintDishes;

  panel.style.display = 'block';
  panel.innerHTML = `
    <details>
      <summary>${tr.shoppingListTitle}</summary>
      ${hasIngredients ? `
        <div class="shopping-list-mode" role="group" aria-label="${tr.shoppingModeLabel}">
          <button type="button" class="shopping-mode-btn ${mode === SHOPPING_MODES.INGREDIENTS ? 'active' : ''}" data-shopping-mode="${SHOPPING_MODES.INGREDIENTS}">${tr.shoppingModeIngredients}</button>
          <button type="button" class="shopping-mode-btn ${mode === SHOPPING_MODES.DISHES ? 'active' : ''}" data-shopping-mode="${SHOPPING_MODES.DISHES}">${tr.shoppingModeDishes}</button>
        </div>
      ` : ''}
      <p class="shopping-list-hint">${hint}</p>
      <ul class="shopping-list">
        ${items.map((item) => `
          <li>
            <span class="shopping-list-title">${escapeHtml(item.title)}</span>
            <span class="shopping-list-weight">${roundShoppingWeight(item.totalWeight)}${unit}</span>
            ${item.occurrences > 1 ? `<span class="shopping-list-count">(${item.occurrences} ${timesLabel})</span>` : ''}
          </li>
        `).join('')}
      </ul>
    </details>
  `;

  panel.querySelectorAll('[data-shopping-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      shoppingListMode = btn.dataset.shoppingMode;
      localStorage.setItem('fitopit_shopping_mode', shoppingListMode);
      renderShoppingList(plan);
    });
  });
}

function showPlanHistoryStatus(message, ok = true) {
  const el = document.getElementById('planHistoryStatus');
  if (!el) return;
  if (!message) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  el.textContent = message;
  el.style.display = 'block';
  el.className = `plan-history-status plan-history-status--${ok ? 'ok' : 'error'}`;
}

function renderPlanHistoryList() {
  const listEl = document.getElementById('planHistoryList');
  if (!listEl) return;
  const tr = t();
  const history = getPlanHistory();
  if (!history.length) {
    listEl.innerHTML = `<li class="plan-history-empty">${tr.planHistoryEmpty}</li>`;
    return;
  }

  listEl.innerHTML = history.map((entry) => {
    const label = entry.name || formatHistoryDate(entry.savedAt, currentLang);
    const kcal = entry.baseDailyCalories
      ? ` · ~${entry.baseDailyCalories} ${currentLang === 'ru' ? 'ккал' : 'kcal'}`
      : '';
    return `
      <li class="plan-history-item">
        <div class="plan-history-meta">
          <strong>${escapeHtml(label)}</strong>
          <span class="plan-history-date">${escapeHtml(formatHistoryDate(entry.savedAt, currentLang))}${kcal}</span>
        </div>
        <div class="plan-history-actions">
          <button type="button" class="btn-secondary plan-history-load" data-plan-id="${escapeHtml(entry.id)}">${tr.planHistoryLoad}</button>
          <button type="button" class="mini-btn plan-history-delete" data-plan-id="${escapeHtml(entry.id)}" title="${tr.planHistoryDelete}" aria-label="${tr.planHistoryDelete}">🗑</button>
        </div>
      </li>
    `;
  }).join('');
}

function saveCurrentPlanToHistory() {
  const tr = t();
  if (!weeklyPlan?.length) {
    showPlanHistoryStatus(tr.planHistoryNoPlan, false);
    return;
  }
  const name = document.getElementById('planHistoryName')?.value?.trim() || '';
  addPlanToHistory({
    name,
    days: weeklyPlan,
    weeklyTargets: weeklyPlan.weeklyTargets || weeklyTargets,
    cheatDayIndex: weeklyPlan.cheatDayIndex,
    baseDailyCalories,
    macroTargets,
    activeDayIndex
  });
  const nameInput = document.getElementById('planHistoryName');
  if (nameInput) nameInput.value = '';
  renderPlanHistoryList();
  showPlanHistoryStatus(tr.planHistorySaved, true);
  setTimeout(() => showPlanHistoryStatus(''), 2500);
}

function loadPlanFromHistoryEntry(id) {
  const entry = getPlanFromHistory(id);
  if (!entry?.days?.length) return;
  weeklyPlan = entry.days;
  weeklyPlan.cheatDayIndex = entry.cheatDayIndex ?? -1;
  weeklyPlan.weeklyTargets = entry.weeklyTargets || entry.days.map((d) => d.dayCaloriesTarget);
  weeklyTargets = weeklyPlan.weeklyTargets;
  baseDailyCalories = entry.baseDailyCalories || baseDailyCalories;
  macroTargets = entry.macroTargets || macroTargets;
  activeDayIndex = Math.max(0, Math.min(6, entry.activeDayIndex ?? 0));
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  switchSitePanel('plan');
  document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deletePlanHistoryEntry(id) {
  deletePlanFromHistory(id);
  renderPlanHistoryList();
}

function getShoppingListText() {
  const hasIngredients = planHasIngredientData(weeklyPlan);
  const mode = hasIngredients ? shoppingListMode : SHOPPING_MODES.DISHES;
  return formatShoppingListText(buildShoppingList(weeklyPlan, mode), t(), currentLang);
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
  updatePlanEmptyState();
  document.getElementById("calories").textContent = Math.round(dailyCalories);
  renderMacroTargetsLine();
  renderWeeklyKcalChart(plan);

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
    const dayTotal = sumProperty(day, 'calories');
    const { delta, status } = getCalorieDeltaInfo(dayTotal, dayTarget);
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
                    <span>+${meal.weight}г ${escapeHtml(meal.title)} (${meal.calories}ккал)</span>
                    <button type="button" class="mini-btn remove-addon-btn" title="${tr.removeAddon}"
                            onclick="removeStandaloneAddon(${dayIndex}, '${mealType}', ${mealIndex})">✕</button>
                  </div>`;
              }
              const addonsHtml = (meal.addons || []).map((a, addonIndex) => `
                <div class="addon-item">
                  <span class="emoji">${getEmojiForBooster(a.title)}</span>
                  <span>+${a.weight}г ${escapeHtml(a.title)} (${a.calories}ккал)</span>
                  <button type="button" class="mini-btn remove-addon-btn" title="${tr.removeAddon}"
                          onclick="removeAttachedAddon(${dayIndex}, '${mealType}', ${mealIndex}, ${addonIndex})">✕</button>
                </div>
              `).join("");

              return `
                <div class="meal-item">
                  ${renderMealThumb(meal)}
                  <span class="title">${escapeHtml(meal.title)}</span>
                  ${renderDishSelect(dayIndex, mealType, mealIndex, meal, constraints, isCheatDay(day))}
                  <span class="info">
                    ${meal.weight}г • ${meal.calories}ккал •
                    Б:${(meal.protein || 0).toFixed(1)}г Ж:${(meal.fat || 0).toFixed(1)}г У:${(meal.carbs || 0).toFixed(1)}г
                  </span>
                  ${renderRecipeLink(meal)}
                  ${renderCompositionButton(meal)}
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
      <div class="daily-summary daily-summary--${status}">
        <strong>${tr.total}</strong><br>
        Калории: ${dayTotal} / ${dayTarget} ккал<br>
        <span class="calorie-delta">${formatCalorieDelta(delta)}</span><br>
        ${macroTargets.protein ? `
        ${formatMacroLine(tr.macroProtein, sumProperty(day, 'protein'), macroTargets.protein)}<br>
        ${formatMacroLine(tr.macroFat, sumProperty(day, 'fat'), macroTargets.fat)}<br>
        ${formatMacroLine(tr.macroCarbs, sumProperty(day, 'carbs'), macroTargets.carbs)}
        ` : `
        ${tr.macroProtein}: ${sumProperty(day, 'protein').toFixed(1)}${tr.macroGrams},
        ${tr.macroFat}: ${sumProperty(day, 'fat').toFixed(1)}${tr.macroGrams},
        ${tr.macroCarbs}: ${sumProperty(day, 'carbs').toFixed(1)}${tr.macroGrams}
        `}
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
      persistCurrentPlan();
    });
  });

  updateCalorieStatus(dailyCalories);
  persistCurrentPlan();
  renderShoppingList(plan);
}

const IMPORT_DAY_RE = /^(?:День|Day)\s+(\d+)(?:\s*\(([^)]+)\))?\s*[—–-]\s*(\d+)/i;
const IMPORT_DISH_RE = /^[-–]\s*(.+?),\s*(\d+(?:[.,]\d+)?)\s*(?:г|g),\s*(\d+)\s*(?:ккал|kcal)/i;
const IMPORT_ADDON_ARROW_RE = /^[→➜>]+\s*\+(\d+(?:[.,]\d+)?)\s*(?:г|g)\s+(.+?)\s*\((\d+)\s*(?:ккал|kcal)\)/i;
const IMPORT_ADDON_PLUS_RE = /^\+\s*(.+?),\s*(\d+(?:[.,]\d+)?)\s*(?:г|g),\s*(\d+)\s*(?:ккал|kcal)/i;

function getMealLabelMap() {
  const map = new Map();
  for (const lang of ['ru', 'en']) {
    for (const type of MEAL_ORDER) {
      map.set(translations[lang][type], type);
    }
  }
  return map;
}

function findRecipeByTitle(title) {
  const db = getMergedRecipesDB();
  const sources = [
    ...(db.breakfast || []),
    ...(db.lunch?.first || []),
    ...(db.lunch?.second || []),
    ...(db.dinner?.main || []),
    ...(db.dinner?.side || []),
    ...(db.snack || []),
    ...calorieBoosters,
    ...cheatMealRecipes
  ];
  return sources.find(r => r.title === title);
}

function buildImportedMeal(title, weight, calories, opts = {}) {
  const recipe = findRecipeByTitle(title);
  const w = Math.round(parseFloat(String(weight).replace(',', '.')));
  const cal = Math.round(parseFloat(calories));
  const meal = {
    title: title.trim(),
    kcalPer100g: recipe?.kcalPer100g ?? (w > 0 ? Math.round((cal / w) * 100) : 50),
    proteinPer100g: recipe?.proteinPer100g ?? 0,
    fatPer100g: recipe?.fatPer100g ?? 0,
    carbsPer100g: recipe?.carbsPer100g ?? 0,
    diet: recipe?.diet ? [...recipe.diet] : ['normal'],
    allergens: recipe?.allergens ? [...recipe.allergens] : [],
    budget: recipe?.budget ?? 'medium',
    type: recipe?.type ?? (opts.isAddOn ? 'side' : 'main'),
    complete: recipe?.complete,
    image: recipe?.image,
    yieldGrams: recipe?.yieldGrams,
    ingredients: recipe?.ingredients ? recipe.ingredients.map((i) => ({ ...i })) : undefined,
    weight: w,
    calories: cal,
    protein: recipe ? parseFloat(((recipe.proteinPer100g * w) / 100).toFixed(1)) : 0,
    fat: recipe ? parseFloat(((recipe.fatPer100g * w) / 100).toFixed(1)) : 0,
    carbs: recipe ? parseFloat(((recipe.carbsPer100g * w) / 100).toFixed(1)) : 0
  };
  if (opts.isAddOn) meal.isAddOn = true;
  return meal;
}

function createEmptyImportDay(target, dayIndex, isCheatDay) {
  return {
    isCheatDay,
    dayCaloriesTarget: target,
    dayIndex,
    breakfast: [],
    secondBreakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
    secondDinner: []
  };
}

function parseImportedPlan(text) {
  const mealLabelMap = getMealLabelMap();
  const lines = text.split(/\r?\n/);
  const plan = [];
  let currentDay = null;
  let currentMealType = null;
  let currentMainMeal = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('🍽 FitoPit')) continue;

    const dayMatch = line.match(IMPORT_DAY_RE);
    if (dayMatch) {
      if (currentDay) plan.push(currentDay);
      const dayIndex = parseInt(dayMatch[1], 10) - 1;
      const paren = dayMatch[2] || '';
      const target = parseInt(dayMatch[3], 10);
      const isCheat = /читмил|cheat day|🎉/i.test(paren) || /🎉/.test(line);
      currentDay = createEmptyImportDay(target, dayIndex, isCheat);
      currentMealType = null;
      currentMainMeal = null;
      continue;
    }

    if (!currentDay) continue;

    if (line.endsWith(':')) {
      const labelKey = line.slice(0, -1);
      if (mealLabelMap.has(labelKey)) {
        currentMealType = mealLabelMap.get(labelKey);
        currentMainMeal = null;
        continue;
      }
    }

    if (!currentMealType) continue;

    let m;
    if ((m = line.match(IMPORT_ADDON_ARROW_RE))) {
      const addon = buildImportedMeal(m[2], m[1], m[3], { isAddOn: true });
      if (currentMainMeal) {
        if (!currentMainMeal.addons) currentMainMeal.addons = [];
        currentMainMeal.addons.push(addon);
      } else {
        currentDay[currentMealType].push(addon);
      }
      continue;
    }

    if ((m = line.match(IMPORT_ADDON_PLUS_RE))) {
      currentDay[currentMealType].push(buildImportedMeal(m[1], m[2], m[3], { isAddOn: true }));
      currentMainMeal = null;
      continue;
    }

    if ((m = line.match(IMPORT_DISH_RE))) {
      const meal = buildImportedMeal(m[1], m[2], m[3]);
      currentDay[currentMealType].push(meal);
      currentMainMeal = meal;
    }
  }

  if (currentDay) plan.push(currentDay);
  if (!plan.length) return null;

  plan.weeklyTargets = plan.map(d => d.dayCaloriesTarget);
  plan.cheatDayIndex = plan.findIndex(d => d.isCheatDay);
  return plan;
}

function showImportPlanError(message) {
  const el = document.getElementById('importPlanError');
  if (!el) return;
  el.textContent = message;
  el.style.display = message ? 'block' : 'none';
}

function loadImportedPlan(text) {
  const plan = parseImportedPlan(text);
  if (!plan?.length) {
    showImportPlanError(t().importPlanError);
    return false;
  }

  weeklyPlan = plan;
  weeklyTargets = plan.weeklyTargets || plan.map(d => d.dayCaloriesTarget);
  baseDailyCalories = Math.round(
    weeklyTargets.reduce((s, v) => s + v, 0) / weeklyTargets.length
  ) || baseDailyCalories;
  const profile = loadProfile();
  if (profile.weight && profile.goal && baseDailyCalories) {
    macroTargets = calculateMacroTargets(profile.weight, baseDailyCalories, profile.goal);
  }
  activeDayIndex = 0;

  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  switchSitePanel('plan');
  showImportPlanError('');
  document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function generateCopyText(plan) {
  const tr = t();
  const days = Array.isArray(plan) ? plan.filter(d => d && typeof d === 'object') : [];
  let text = `🍽 FitoPit — ${tr.title}\n\n`;
  if (macroTargets.protein) {
    text += `${tr.macroNorms}: ${tr.macroProtein} ${macroTargets.protein}${tr.macroGrams}, `;
    text += `${tr.macroFat} ${macroTargets.fat}${tr.macroGrams}, `;
    text += `${tr.macroCarbs} ${macroTargets.carbs}${tr.macroGrams}\n\n`;
  }
  days.forEach((day, i) => {
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

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.left = '-1000px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return ok;
}

function getEmojiForBooster(title) {
  const map = {
    масло: '🧈', сыр: '🧀', фета: '🧀', орех: '🥜', мед: '🍯', мёд: '🍯', авокадо: '🥑',
    хлеб: '🍞', хлебец: '🍘', банан: '🍌', яблок: '🍎', груш: '🍐', кефир: '🥛',
    творог: '🥣', сметан: '🥄', сухофрукт: '🍇', хумус: '🫘', гуакамоле: '🥑',
    чай: '🍵', сахар: '🍬', кубик: '🍬'
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
  return getBoosterPortionWeight(booster);
}

function removeAttachedAddon(dayIndex, mealType, mealIndex, addonIndex) {
  const meal = weeklyPlan[dayIndex]?.[mealType]?.[mealIndex];
  if (!meal?.addons?.length || addonIndex < 0 || addonIndex >= meal.addons.length) return;
  meal.addons.splice(addonIndex, 1);
  recalcMealFromWeight(meal, meal.weight);
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
}

function removeStandaloneAddon(dayIndex, mealType, mealIndex) {
  const meals = weeklyPlan[dayIndex]?.[mealType];
  if (!meals?.[mealIndex]?.isAddOn) return;
  meals.splice(mealIndex, 1);
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
}

function addBoosterToMeal(dayIndex, mealType, mealIndex, boosterIndex) {
  const menu = document.querySelector('.booster-menu');
  const boosters = menu?._boosters || getFilteredBoosters();
  const booster = boosters[boosterIndex];
  const meal = weeklyPlan[dayIndex]?.[mealType]?.[mealIndex];
  if (!meal || !booster) return;

  const weight = getBoosterWeight(booster);
  const roundedCalories = Math.round((booster.kcalPer100g * weight) / 100 / 10) * 10;

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
          <span>${escapeHtml(r.title)} — ${r.kcalPer100g} ккал/100г (${escapeHtml((r.mealSlots || []).join(', '))})</span>
          <button type="button" class="mini-btn" onclick="deleteUserRecipeById(${JSON.stringify(r.id)})">🗑</button>
        </li>
      `).join('')
    : `<li class="empty-hint">${currentLang === 'ru' ? 'Пока нет своих блюд' : 'No custom recipes yet'}</li>`;
}

function deleteUserRecipeById(id) {
  deleteUserRecipe(id);
  renderUserRecipesList();
}

function clearResolvedCheatDay() {
  const profile = loadProfile();
  if (profile.resolvedCheatDayIndex == null) return;
  profile.resolvedCheatDayIndex = null;
  saveProfile(profile);
}

function createPlanFromForm() {
  const form = document.getElementById("nutritionForm");
  const userData = getFormData(form);
  userData.allergies = getSelectedAllergies();
  userData.resolvedCheatDayIndex = loadProfile().resolvedCheatDayIndex ?? null;

  userData.dailyCalories = calculateCalories(
    userData.weight, userData.height, userData.age,
    userData.gender, userData.activity, userData.goal
  );
  baseDailyCalories = userData.dailyCalories;
  macroTargets = calculateMacroTargets(userData.weight, baseDailyCalories, userData.goal);

  const constraints = buildConstraints(userData);
  weeklyPlan = generateWeeklyPlan(constraints, userData);
  weeklyTargets = weeklyPlan.weeklyTargets || Array(7).fill(baseDailyCalories);

  if (userData.cheatDayEnabled && weeklyPlan.cheatDayIndex >= 0) {
    userData.resolvedCheatDayIndex = weeklyPlan.cheatDayIndex;
  } else {
    userData.resolvedCheatDayIndex = null;
  }
  saveProfile(userData);

  activeDayIndex = 0;
  displayWeeklyPlan(weeklyPlan, baseDailyCalories, activeDayIndex);
  profileEditMode = false;
  updateSurveyVisibility();
  switchSitePanel('plan');
  document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initApp() {
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
  const hadPlan = restoreLastPlan();
  renderPlanHistoryList();
  updateFeedbackFormLabels();
  updatePlanEmptyState();

  const savedPanel = localStorage.getItem("fitopit_active_panel") || "profile";
  switchSitePanel(hadPlan ? 'plan' : savedPanel);

  document.querySelectorAll(".site-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.panel) switchSitePanel(btn.dataset.panel);
    });
  });

  document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    profileEditMode = true;
    updateSurveyVisibility();
    switchSitePanel('profile');
  });

  document.getElementById("cheatDay")?.addEventListener("change", (e) => {
    const group = document.getElementById("cheatDayChoiceGroup");
    if (group) group.style.opacity = e.target.checked ? '1' : '0.5';
    clearResolvedCheatDay();
  });

  document.getElementById("cheatDayChoice")?.addEventListener("change", () => {
    clearResolvedCheatDay();
  });

  const form = document.getElementById("nutritionForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createPlanFromForm();
  });

  form?.addEventListener("reset", () => {
    weeklyPlan = [];
    weeklyTargets = [];
    clearLastPlan();
    document.getElementById("result").style.display = "none";
    updatePlanEmptyState();
    profileEditMode = true;
    updateSurveyVisibility();
  });

  document.getElementById("userRecipeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const slots = Array.from(document.getElementById("userRecipeSlot").selectedOptions).map(o => o.value);
    const ingredients = parseUserIngredients(document.getElementById("userRecipeIngredients")?.value);
    if (!ingredients.length && !document.getElementById("userRecipeKcal").value) {
      alert(currentLang === 'ru'
        ? 'Укажите состав блюда или калорийность вручную.'
        : 'Add ingredients or enter calories manually.');
      return;
    }
    addUserRecipe({
      title: document.getElementById("userRecipeTitle").value,
      ingredients,
      yieldGrams: document.getElementById("userRecipeYield").value || 0,
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

  document.getElementById("copyPlan")?.addEventListener("click", async function () {
    if (!weeklyPlan?.length) return;

    const btn = this;
    const text = generateCopyText(weeklyPlan);
    const ok = await copyTextToClipboard(text);

    btn.textContent = ok ? t().copied : t().copyFailed;
    setTimeout(() => { btn.textContent = t().copy; }, 2000);
  });

  document.getElementById("copyShoppingList")?.addEventListener("click", async function () {
    if (!weeklyPlan?.length) return;
    const btn = this;
    const text = getShoppingListText();
    const ok = text ? await copyTextToClipboard(text) : false;
    const prev = btn.textContent;
    btn.textContent = ok ? t().shoppingListCopied : t().copyFailed;
    setTimeout(() => { btn.textContent = prev; }, 2000);
  });

  document.getElementById("printPlan")?.addEventListener("click", () => {
    if (!weeklyPlan?.length) return;
    window.print();
  });

  document.getElementById("savePlanHistoryBtn")?.addEventListener("click", saveCurrentPlanToHistory);

  document.getElementById("planHistoryList")?.addEventListener("click", (e) => {
    const loadBtn = e.target.closest('.plan-history-load');
    if (loadBtn?.dataset.planId) {
      loadPlanFromHistoryEntry(loadBtn.dataset.planId);
      return;
    }
    const deleteBtn = e.target.closest('.plan-history-delete');
    if (deleteBtn?.dataset.planId) {
      deletePlanHistoryEntry(deleteBtn.dataset.planId);
    }
  });

  document.getElementById("feedbackForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("feedbackStatus");
    const btn = document.getElementById("feedbackSubmitBtn");
    if (btn) btn.disabled = true;

    const result = await submitFeedback(e.target);
    if (statusEl) {
      statusEl.textContent = result.message;
      statusEl.style.display = "block";
      statusEl.className = `feedback-status feedback-status--${result.ok ? "ok" : "error"}`;
    }
    if (result.ok) e.target.reset();

    if (btn) btn.disabled = false;
  });

  document.getElementById("importPlanBtn")?.addEventListener("click", function () {
    const text = document.getElementById("importPlanText")?.value || '';
    if (!text.trim()) {
      showImportPlanError(t().importPlanError);
      return;
    }
    const ok = loadImportedPlan(text);
    if (ok) {
      const btn = this;
      const prev = btn.textContent;
      btn.textContent = t().importPlanSuccess;
      setTimeout(() => { btn.textContent = prev; }, 2000);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

window.regenerateDay = regenerateDay;
window.regenerateMeal = regenerateMeal;
window.selectDishRecipe = selectDishRecipe;
window.showBoosterMenu = showBoosterMenu;
window.closeBoosterMenu = closeBoosterMenu;
window.addBoosterToMeal = addBoosterToMeal;
window.removeAttachedAddon = removeAttachedAddon;
window.removeStandaloneAddon = removeStandaloneAddon;
window.deleteUserRecipeById = deleteUserRecipeById;
window.switchLang = switchLang;
