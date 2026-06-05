// Локальное хранение профиля и пользовательских блюд
const PROFILE_KEY = 'fitopit_profile';
const RECIPES_KEY = 'fitopit_user_recipes';

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
