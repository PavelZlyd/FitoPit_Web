// Локальное хранение профиля и пользовательских блюд
import { recipesDB } from './data.js';

const PROFILE_KEY = 'fitopit_profile';
const RECIPES_KEY = 'fitopit_user_recipes';
const PLAN_KEY = 'fitopit_last_plan';
const PLAN_HISTORY_KEY = 'fitopit_plan_history';
const FEEDBACK_KEY = 'fitopit_feedback';
const MAX_PLAN_HISTORY = 15;

const DEFAULT_PROFILE = {
  age: null,
  gender: 'male',
  weight: null,
  height: null,
  activity: 1.55,
  goal: 'maintain',
  diet: 'normal',
  breakfastType: 'normal',
  budget: 'medium',
  allergies: [],
  cheatDayEnabled: false,
  cheatDayChoice: 'random',
  resolvedCheatDayIndex: null,
  weeklyStrategy: 'flat',
  cookingPref: 'any',
  enableSecondBreakfast: false,
  enableSecondDinner: false,
  excludedTitles: [],
  excludedKeywords: '',
  profileComplete: false
};

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function saveProfile(profile) {
  const toSave = { ...profile, profileComplete: isProfileComplete(profile) };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(toSave));
  return toSave;
}

function isProfileComplete(p) {
  return !!(p.age && p.weight && p.height && p.gender && p.activity && p.goal && p.diet);
}

function getUserRecipes() {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserRecipes(recipes) {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

function addUserRecipe(recipe) {
  const recipes = getUserRecipes();
  const entry = {
    id: recipe.id || `user_${Date.now()}`,
    title: recipe.title.trim(),
    kcalPer100g: parseFloat(recipe.kcalPer100g),
    proteinPer100g: parseFloat(recipe.proteinPer100g) || 0,
    fatPer100g: parseFloat(recipe.fatPer100g) || 0,
    carbsPer100g: parseFloat(recipe.carbsPer100g) || 0,
    diet: recipe.diet || ['normal'],
    allergens: recipe.allergens || [],
    budget: recipe.budget || 'medium',
    mealSlots: recipe.mealSlots || ['breakfast'],
    type: recipe.type || 'main',
    isUser: true
  };
  recipes.push(entry);
  saveUserRecipes(recipes);
  return entry;
}

function updateUserRecipe(id, updates) {
  const recipes = getUserRecipes().map(r =>
    r.id === id ? { ...r, ...updates, isUser: true } : r
  );
  saveUserRecipes(recipes);
}

function deleteUserRecipe(id) {
  saveUserRecipes(getUserRecipes().filter(r => r.id !== id));
}

function cloneRecipe(r) {
  return {
    title: r.title,
    kcalPer100g: r.kcalPer100g,
    proteinPer100g: r.proteinPer100g,
    fatPer100g: r.fatPer100g,
    carbsPer100g: r.carbsPer100g,
    diet: [...(r.diet || ['normal'])],
    allergens: [...(r.allergens || [])],
    budget: r.budget || 'medium',
    type: r.type || 'main',
    complete: r.complete,
    url: r.url,
    image: r.image,
    ingredients: r.ingredients ? r.ingredients.map((i) => ({ ...i })) : undefined,
    isUser: !!r.isUser
  };
}

function mergeSlot(baseList, userList, slot) {
  const fromUser = userList
    .filter(r => (r.mealSlots || []).includes(slot))
    .map(cloneRecipe);
  return [...(baseList || []), ...fromUser];
}

function getMergedRecipesDB() {
  const user = getUserRecipes();
  return {
    breakfast: mergeSlot(recipesDB.breakfast, user, 'breakfast'),
    lunch: {
      first: mergeSlot(recipesDB.lunch?.first, user, 'lunchFirst'),
      second: mergeSlot(recipesDB.lunch?.second, user, 'lunchSecond')
    },
    dinner: {
      main: mergeSlot(recipesDB.dinner?.main, user, 'dinnerMain'),
      side: mergeSlot(recipesDB.dinner?.side, user, 'dinnerSide')
    },
    snack: mergeSlot(recipesDB.snack, user, 'snack')
  };
}

function exportUserData() {
  return JSON.stringify({
    profile: loadProfile(),
    recipes: getUserRecipes()
  }, null, 2);
}

function importUserData(json) {
  const data = JSON.parse(json);
  if (data.profile) saveProfile(data.profile);
  if (data.recipes) saveUserRecipes(data.recipes);
}

function saveLastPlan({ days, weeklyTargets, cheatDayIndex, baseDailyCalories, macroTargets, activeDayIndex }) {
  if (!days?.length) return;
  localStorage.setItem(PLAN_KEY, JSON.stringify({
    days,
    weeklyTargets: weeklyTargets || days.map(d => d.dayCaloriesTarget),
    cheatDayIndex: cheatDayIndex ?? -1,
    baseDailyCalories: baseDailyCalories || 0,
    macroTargets: macroTargets || null,
    activeDayIndex: activeDayIndex ?? 0
  }));
}

function saveFeedbackSubmission(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    list.push(entry);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  } catch {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify([entry]));
  }
}

function loadLastPlan() {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearLastPlan() {
  localStorage.removeItem(PLAN_KEY);
}

function getPlanHistory() {
  try {
    const raw = localStorage.getItem(PLAN_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlanHistory(list) {
  localStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(list.slice(0, MAX_PLAN_HISTORY)));
}

function addPlanToHistory(snapshot) {
  if (!snapshot?.days?.length) return null;
  const entry = {
    id: `plan_${Date.now()}`,
    name: (snapshot.name || '').trim(),
    savedAt: new Date().toISOString(),
    days: snapshot.days,
    weeklyTargets: snapshot.weeklyTargets,
    cheatDayIndex: snapshot.cheatDayIndex ?? -1,
    baseDailyCalories: snapshot.baseDailyCalories || 0,
    macroTargets: snapshot.macroTargets || null,
    activeDayIndex: snapshot.activeDayIndex ?? 0
  };
  const list = getPlanHistory();
  list.unshift(entry);
  savePlanHistory(list);
  return entry;
}

function deletePlanFromHistory(id) {
  savePlanHistory(getPlanHistory().filter((p) => p.id !== id));
}

function getPlanFromHistory(id) {
  return getPlanHistory().find((p) => p.id === id) || null;
}

export {
  loadProfile,
  saveProfile,
  isProfileComplete,
  getUserRecipes,
  saveUserRecipes,
  addUserRecipe,
  updateUserRecipe,
  deleteUserRecipe,
  getMergedRecipesDB,
  exportUserData,
  importUserData,
  saveLastPlan,
  saveFeedbackSubmission,
  loadLastPlan,
  clearLastPlan,
  getPlanHistory,
  addPlanToHistory,
  deletePlanFromHistory,
  getPlanFromHistory
};
