// Генератор планов питания
import { cheatMealRecipes, calorieBoosters } from './data.js';
import { getMergedRecipesDB } from './userStore.js';

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roundPortionWeight(grams, isAddon = false) {
  if (isAddon) return Math.max(10, Math.round(grams / 10) * 10);
  if (grams < 200) return Math.max(50, Math.round(grams / 25) * 25);
  if (grams <= 400) return Math.max(100, Math.round(grams / 50) * 50);
  return Math.min(600, Math.max(100, Math.round(grams / 50) * 50));
}

function roundCalories(cal) {
  return Math.round(cal / 10) * 10;
}

function isExcluded(recipe, constraints) {
  const title = (recipe.title || '').toLowerCase();
  const titles = constraints.excludedTitles || [];
  const keywords = (constraints.excludedKeywords || '')
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean);
  if (titles.some(t => title === t.toLowerCase())) return true;
  if (keywords.some(k => title.includes(k))) return true;
  return false;
}

function isBudgetAllowed(recipeBudget, userBudget) {
  if (!recipeBudget || !userBudget) return true;
  if (userBudget === 'low') return recipeBudget !== 'high';
  if (userBudget === 'medium') return recipeBudget !== 'high';
  return true;
}

function isRecipeAllowed(recipe, constraints) {
  const { diet, allergies = [], budget } = constraints;
  if (!recipe.diet?.includes(diet)) return false;
  if (recipe.allergens?.some(a => allergies.includes(a))) return false;
  if (!isBudgetAllowed(recipe.budget, budget)) return false;
  if (isExcluded(recipe, constraints)) return false;
  return true;
}

function getBudgetWeight(recipe, userBudget) {
  if (!recipe.budget || !userBudget) return 1;
  if (userBudget === 'low') {
    if (recipe.budget === 'low') return 3;
    if (recipe.budget === 'medium') return 1;
    return 0;
  }
  if (userBudget === 'high') {
    if (recipe.budget === 'high') return 3;
    if (recipe.budget === 'medium') return 2;
    return 1;
  }
  if (recipe.budget === 'medium') return 2;
  if (recipe.budget === 'low') return 2;
  return 1;
}

function getWeightedRandom(arr, userBudget) {
  if (!arr.length) return null;
  const weights = arr.map(r => getBudgetWeight(r, userBudget));
  const total = weights.reduce((s, w) => s + w, 0);
  if (total === 0) return getRandom(arr);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function getCookingBase(title) {
  const t = title.toLowerCase();
  if (t.includes('овсянка') || t.includes('гречневая каша')) {
    return t.replace(/\s+на\s+(молоке|воде)/, '').trim();
  }
  return null;
}

function applyCookingPref(pool, cookingPref) {
  if (!cookingPref || cookingPref === 'any') return pool;
  const groups = new Map();
  const standalone = [];
  for (const r of pool) {
    const base = getCookingBase(r.title);
    if (!base) {
      standalone.push(r);
      continue;
    }
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(r);
  }
  const result = [...standalone];
  for (const variants of groups.values()) {
    const match = variants.find(v => {
      const t = v.title.toLowerCase();
      if (cookingPref === 'milk') return t.includes('молок');
      if (cookingPref === 'water') return t.includes('вод');
      return true;
    });
    result.push(match || variants[0]);
  }
  return result.length ? result : pool;
}

function filterAllowed(options, constraints) {
  if (!Array.isArray(options)) return [];
  let pool = options.filter(r => isRecipeAllowed(r, constraints));
  pool = applyCookingPref(pool, constraints.cookingPref);
  return pool;
}

function pickRecipe(options, constraints) {
  const allowed = filterAllowed(options, constraints);
  if (!allowed.length) return null;
  return getWeightedRandom(allowed, constraints.budget);
}

function getActiveDB() {
  return getMergedRecipesDB();
}

function getFallbackMeal(_diet) {
  const weight = 200;
  const calories = roundCalories((50 * weight) / 100);
  return {
    title: "Лёгкий салат",
    kcalPer100g: 50,
    proteinPer100g: 2.0,
    fatPer100g: 3.0,
    carbsPer100g: 4.0,
    diet: ["vegan", "normal", "vegetarian", "glutenfree"],
    allergens: [],
    weight,
    calories,
    protein: parseFloat(((2.0 * weight) / 100).toFixed(1)),
    fat: parseFloat(((3.0 * weight) / 100).toFixed(1)),
    carbs: parseFloat(((4.0 * weight) / 100).toFixed(1)),
    type: "main"
  };
}

function buildMealFromRecipe(recipe, targetCalories, opts = {}) {
  const breakfastType = opts.breakfastType || 'normal';
  let maxWeight = opts.maxWeight || 500;
  if (breakfastType === 'light') maxWeight = 300;
  const tl = recipe.title.toLowerCase();
  if (tl.includes('каша') || tl.includes('овсянка')) {
    maxWeight = breakfastType === 'light' ? 200 : 350;
  }

  let weight = Math.round((targetCalories / recipe.kcalPer100g) * 100);
  weight = Math.min(maxWeight, Math.max(50, roundPortionWeight(weight)));
  const calories = roundCalories((recipe.kcalPer100g * weight) / 100);
  return {
    ...recipe,
    weight,
    calories,
    protein: parseFloat(((recipe.proteinPer100g * weight) / 100).toFixed(1)),
    fat: parseFloat(((recipe.fatPer100g * weight) / 100).toFixed(1)),
    carbs: parseFloat(((recipe.carbsPer100g * weight) / 100).toFixed(1))
  };
}

function generateSimpleMeal(targetCalories, options, constraints, opts = {}) {
  if (!Array.isArray(options)) return null;

  let filtered = [...options];
  const breakfastType = opts.breakfastType || constraints.breakfastType || 'normal';
  if (opts.lightFilter || breakfastType === 'light') {
    const lightKeywords = ['йогурт', 'творог', 'фрукт', 'яблок', 'банан', 'груш', 'апельсин', 'мандарин', 'киви', 'ягод', 'виноград', 'авокадо', 'чиа', 'пудинг', 'тост', 'смузи', 'кефир', 'омлет'];
    filtered = options.filter(r =>
      lightKeywords.some(kw => r.title.toLowerCase().includes(kw))
    );
    if (!filtered.length) filtered = options;
  }

  const recipe = pickRecipe(filtered, constraints);
  if (!recipe) return null;
  return buildMealFromRecipe(recipe, targetCalories, { breakfastType });
}

function generateMealWithSides(targetCalories, mainOptions, sideOptions, constraints, mainRatio = 0.6) {
  const allowedMain = filterAllowed(mainOptions, constraints);
  const allowedSide = filterAllowed(sideOptions, constraints);
  if (!allowedMain.length || !allowedSide.length) return [];

  const main = getWeightedRandom(allowedMain, constraints.budget);
  const calMainTarget = Math.round(targetCalories * mainRatio);
  let weightMain = roundPortionWeight((calMainTarget / main.kcalPer100g) * 100);
  weightMain = Math.min(500, Math.max(100, weightMain));
  const calMain = roundCalories((main.kcalPer100g * weightMain) / 100);

  const meals = [{
    ...main,
    weight: weightMain,
    calories: calMain,
    protein: parseFloat(((main.proteinPer100g * weightMain) / 100).toFixed(1)),
    fat: parseFloat(((main.fatPer100g * weightMain) / 100).toFixed(1)),
    carbs: parseFloat(((main.carbsPer100g * weightMain) / 100).toFixed(1))
  }];

  const side = getWeightedRandom(allowedSide, constraints.budget);
  const remaining = targetCalories - calMain;
  let weightSide = roundPortionWeight((remaining / side.kcalPer100g) * 100);
  weightSide = Math.min(400, Math.max(100, weightSide));
  const calSide = roundCalories((side.kcalPer100g * weightSide) / 100);
  meals.push({
    ...side,
    weight: weightSide,
    calories: calSide,
    protein: parseFloat(((side.proteinPer100g * weightSide) / 100).toFixed(1)),
    fat: parseFloat(((side.fatPer100g * weightSide) / 100).toFixed(1)),
    carbs: parseFloat(((side.carbsPer100g * weightSide) / 100).toFixed(1))
  });
  return meals;
}

function generateLunch(targetCalories, db, constraints) {
  const meals = [];
  const firstCourses = filterAllowed(db.lunch?.first || [], constraints);
  const incompleteMains = (db.lunch?.second || []).filter(
    r => isRecipeAllowed(r, constraints) && r.type === 'main' && !r.complete
  );
  const completeMeals = (db.lunch?.second || []).filter(
    r => isRecipeAllowed(r, constraints) && r.complete
  );
  const sideCourses = filterAllowed(db.dinner?.side || [], constraints);

  if (firstCourses.length && Math.random() < 0.7) {
    const first = getWeightedRandom(firstCourses, constraints.budget);
    let weightFirst = roundPortionWeight((targetCalories * 0.4 / first.kcalPer100g) * 100);
    weightFirst = Math.min(600, Math.max(100, weightFirst));
    const calFirst = roundCalories((first.kcalPer100g * weightFirst) / 100);
    meals.push({
      ...first,
      weight: weightFirst,
      calories: calFirst,
      protein: parseFloat(((first.proteinPer100g * weightFirst) / 100).toFixed(1)),
      fat: parseFloat(((first.fatPer100g * weightFirst) / 100).toFixed(1)),
      carbs: parseFloat(((first.carbsPer100g * weightFirst) / 100).toFixed(1))
    });
  }

  const remainingAfterFirst = targetCalories - (meals[0]?.calories || 0);
  if (completeMeals.length && Math.random() < 0.4) {
    const complete = getWeightedRandom(completeMeals, constraints.budget);
    let weight = roundPortionWeight((remainingAfterFirst / complete.kcalPer100g) * 100);
    weight = Math.min(600, Math.max(200, weight));
    const calories = roundCalories((complete.kcalPer100g * weight) / 100);
    meals.push({
      ...complete,
      weight,
      calories,
      protein: parseFloat(((complete.proteinPer100g * weight) / 100).toFixed(1)),
      fat: parseFloat(((complete.fatPer100g * weight) / 100).toFixed(1)),
      carbs: parseFloat(((complete.carbsPer100g * weight) / 100).toFixed(1))
    });
  } else if (incompleteMains.length && sideCourses.length) {
    meals.push(...generateMealWithSides(remainingAfterFirst, incompleteMains, sideCourses, constraints, 0.5));
  }

  addCalorieBooster(meals, targetCalories, constraints);
  return meals.length ? meals : [getFallbackMeal(constraints.diet)];
}

function generateDinner(targetCalories, db, constraints) {
  const meals = [];
  const mains = (db.dinner?.main || []).filter(
    r => isRecipeAllowed(r, constraints) && !r.complete
  );
  const sides = filterAllowed(db.dinner?.side || [], constraints);
  const completeMeals = (db.dinner?.main || []).filter(
    r => isRecipeAllowed(r, constraints) && r.complete
  );

  if (completeMeals.length && Math.random() < 0.5) {
    const complete = getWeightedRandom(completeMeals, constraints.budget);
    let weight = roundPortionWeight((targetCalories / complete.kcalPer100g) * 100);
    weight = Math.min(600, Math.max(200, weight));
    const calories = roundCalories((complete.kcalPer100g * weight) / 100);
    meals.push({
      ...complete,
      weight,
      calories,
      protein: parseFloat(((complete.proteinPer100g * weight) / 100).toFixed(1)),
      fat: parseFloat(((complete.fatPer100g * weight) / 100).toFixed(1)),
      carbs: parseFloat(((complete.carbsPer100g * weight) / 100).toFixed(1))
    });
  } else if (mains.length && sides.length) {
    meals.push(...generateMealWithSides(targetCalories, mains, sides, constraints, 0.6));
  }

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  if (totalCalories < targetCalories * 0.8) {
    const extraOptions = [
      ...sides,
      ...(db.snack || []).filter(r => isRecipeAllowed(r, constraints) && r.kcalPer100g > 80)
    ];
    if (extraOptions.length) {
      const extra = getWeightedRandom(extraOptions, constraints.budget);
      const needed = targetCalories - totalCalories;
      let weightExtra = roundPortionWeight((needed / extra.kcalPer100g) * 100);
      weightExtra = Math.min(300, Math.max(100, weightExtra));
      const calories = roundCalories((extra.kcalPer100g * weightExtra) / 100);
      meals.push({
        ...extra,
        weight: weightExtra,
        calories,
        protein: parseFloat(((extra.proteinPer100g * weightExtra) / 100).toFixed(1)),
        fat: parseFloat(((extra.fatPer100g * weightExtra) / 100).toFixed(1)),
        carbs: parseFloat(((extra.carbsPer100g * weightExtra) / 100).toFixed(1)),
        isExtra: true
      });
    }
  }

  addCalorieBooster(meals, targetCalories, constraints);
  return meals.length ? meals : [getFallbackMeal(constraints.diet)];
}

function generateSnack(targetCalories, db, constraints) {
  return generateSimpleMeal(targetCalories, db.snack || [], constraints) || getFallbackMeal(constraints.diet);
}

function getBoosterPortionWeight(booster, needed = null) {
  const bt = (booster.title || '').toLowerCase();
  if (bt.includes('масло')) return 15;
  if (bt.includes('фета')) return 30;
  if (bt.includes('сыр') && !bt.includes('творог')) return 30;
  if (bt.includes('орех') || bt.includes('сухофрукт') || bt.includes('изюм')) return 25;
  if (bt.includes('мед') || bt.includes('мёд')) return 10;
  if (bt.includes('авокадо')) return 50;
  if (bt.includes('банан')) return 100;
  if (bt.includes('яблок') || bt.includes('груш')) return 150;
  if (bt.includes('кефир')) return 200;
  if (bt.includes('творог')) return 100;
  if (bt.includes('сметан')) return 30;
  if (bt.includes('хлебец')) return 30;
  if (bt.includes('хумус') || bt.includes('гуакамоле')) return 40;
  if (bt.includes('чай')) return 200;
  if (bt.includes('сахар') || bt.includes('кубик')) return 5;
  if (needed != null) {
    return Math.min(50, roundPortionWeight((needed / booster.kcalPer100g) * 100, true));
  }
  return 20;
}

function addCalorieBooster(meals, targetCalories, constraints) {
  const boosters = calorieBoosters.filter(r => isRecipeAllowed(r, constraints));
  if (!boosters.length) return;

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const needed = targetCalories - totalCalories;
  if (needed < targetCalories * 0.05 || needed <= 30) return;

  const booster = getWeightedRandom(boosters, constraints.budget);
  const bt = booster.title.toLowerCase();
  const hasFixedWeight = ['масло', 'фета', 'сыр', 'орех', 'сухофрукт', 'изюм', 'мед', 'мёд', 'авокадо',
    'банан', 'яблок', 'груш', 'кефир', 'творог', 'сметан', 'хлебец', 'хумус', 'гуакамоле', 'хлеб',
    'чай', 'сахар', 'кубик']
    .some(k => bt.includes(k));
  const weightBooster = hasFixedWeight
    ? getBoosterPortionWeight(booster)
    : getBoosterPortionWeight(booster, needed);

  const calories = roundCalories((booster.kcalPer100g * weightBooster) / 100);
  if (calories < 20) return;

  meals.push({
    ...booster,
    weight: weightBooster,
    calories,
    protein: parseFloat(((booster.proteinPer100g * weightBooster) / 100).toFixed(1)),
    fat: parseFloat(((booster.fatPer100g * weightBooster) / 100).toFixed(1)),
    carbs: parseFloat(((booster.carbsPer100g * weightBooster) / 100).toFixed(1)),
    isAddOn: true
  });
}

function getDishRecipeOptions(mealType, dish, constraints, isCheatDay) {
  if (isCheatDay) {
    return filterAllowed(cheatMealRecipes, constraints);
  }

  const db = getActiveDB();
  let pool = [];

  // Для одиночных приёмов пищи пул определяется слотом, а не dish.type
  // (у завтрака type может быть "main"/"side", но это всё равно завтраки)
  switch (mealType) {
    case 'breakfast':
    case 'secondBreakfast':
      pool = db.breakfast || [];
      break;
    case 'snack':
      pool = db.snack || [];
      break;
    case 'secondDinner':
      pool = [...(db.snack || []), ...(db.dinner?.side || [])];
      break;
    case 'lunch':
      if (dish.complete || dish.type === 'complete') {
        pool = (db.lunch?.second || []).filter(r => r.complete);
      } else if (dish.type === 'first') {
        pool = db.lunch?.first || [];
      } else if (dish.type === 'side') {
        pool = db.dinner?.side || [];
      } else if (dish.type === 'main') {
        pool = (db.lunch?.second || []).filter(r => r.type === 'main' && !r.complete);
      } else {
        pool = [
          ...(db.lunch?.first || []),
          ...(db.lunch?.second || []),
          ...(db.dinner?.side || [])
        ];
      }
      break;
    case 'dinner':
      if (dish.complete || dish.type === 'complete') {
        pool = (db.dinner?.main || []).filter(r => r.complete);
      } else if (dish.type === 'side' || dish.isExtra) {
        pool = [
          ...(db.dinner?.side || []),
          ...(db.snack || []).filter(r => r.kcalPer100g > 80)
        ];
      } else if (dish.type === 'snack') {
        pool = (db.snack || []).filter(r => r.kcalPer100g > 80);
      } else if (dish.type === 'main') {
        pool = (db.dinner?.main || []).filter(r => !r.complete);
      } else {
        pool = [
          ...(db.dinner?.main || []),
          ...(db.dinner?.side || [])
        ];
      }
      break;
    default:
      pool = [];
  }

  const allowed = filterAllowed(pool, constraints);
  return allowed.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

function replaceDishWithRecipe(mealType, dish, recipeTitle, targetCalories, constraints, opts = {}) {
  const options = getDishRecipeOptions(mealType, dish, constraints, !!opts.isCheatDay);
  const recipe = options.find(r => r.title === recipeTitle);
  if (!recipe) return dish;

  const buildOpts = {};
  if (mealType === 'breakfast' || mealType === 'secondBreakfast') {
    buildOpts.breakfastType = constraints.breakfastType || 'normal';
    if (mealType === 'secondBreakfast') buildOpts.maxWeight = 300;
  }

  const newDish = buildMealFromRecipe(recipe, targetCalories, buildOpts);
  if (dish.addons) newDish.addons = dish.addons;
  return newDish;
}

function normalizeMealArray(meal, diet = 'normal') {
  const arr = Array.isArray(meal) ? meal : (meal ? [meal] : []);
  const filtered = arr.filter(Boolean);
  return filtered.length ? filtered : [getFallbackMeal(diet)];
}

function generateMeal(mealType, constraints, userData) {
  const db = getActiveDB();
  const targetCalories = getTargetCaloriesForMeal(mealType, userData);

  switch (mealType) {
    case 'breakfast':
    case 'secondBreakfast':
      return normalizeMealArray(
        generateSimpleMeal(targetCalories, db.breakfast || [], constraints, {
          breakfastType: userData.breakfastType,
          lightFilter: mealType === 'secondBreakfast'
        }),
        constraints.diet
      );
    case 'lunch':
      return generateLunch(targetCalories, db, constraints);
    case 'snack':
      return normalizeMealArray(generateSnack(targetCalories, db, constraints), constraints.diet);
    case 'dinner':
      return generateDinner(targetCalories, db, constraints);
    case 'secondDinner': {
      const options = [...(db.snack || []), ...(db.dinner?.side || [])];
      return normalizeMealArray(
        generateSimpleMeal(targetCalories, options, constraints),
        constraints.diet
      );
    }
    default:
      return [getFallbackMeal(constraints.diet)];
  }
}

const CHEAT_MEAL_RATIOS = {
  breakfast: 0.16,
  lunch: 0.35,
  snack: 0.1,
  dinner: 0.24,
  secondDinner: 0.05
};

function generateCheatMeal(mealType, constraints, dailyCalories) {
  const ratio = CHEAT_MEAL_RATIOS[mealType] || 0.1;
  const targetCalories = Math.round(dailyCalories * ratio * 1.4);
  const allowed = cheatMealRecipes.filter(r => isRecipeAllowed(r, constraints));
  const recipe = allowed.length ? getWeightedRandom(allowed, 'high') : getFallbackMeal(constraints.diet);
  let weight = roundPortionWeight((targetCalories / recipe.kcalPer100g) * 100);
  weight = Math.min(400, Math.max(150, weight));
  const calories = roundCalories((recipe.kcalPer100g * weight) / 100);
  return [{
    ...recipe,
    weight,
    calories,
    protein: parseFloat(((recipe.proteinPer100g * weight) / 100).toFixed(1)),
    fat: parseFloat(((recipe.fatPer100g * weight) / 100).toFixed(1)),
    carbs: parseFloat(((recipe.carbsPer100g * weight) / 100).toFixed(1))
  }];
}

function generateCheatDay(constraints, dailyCalories) {
  const day = { isCheatDay: true, dayCaloriesTarget: Math.round(dailyCalories * 1.15) };

  for (const mealType of Object.keys(CHEAT_MEAL_RATIOS)) {
    day[mealType] = generateCheatMeal(mealType, constraints, dailyCalories);
  }
  return day;
}

function getBaseRatios(userData) {
  const ratios = {
    breakfast: 0.16,
    secondBreakfast: 0.1,
    lunch: 0.35,
    snack: 0.1,
    dinner: 0.24,
    secondDinner: 0.05
  };
  if (userData.breakfastType === 'light') {
    ratios.breakfast *= 0.7;
    ratios.lunch *= 1.1;
  }
  if (!userData.enableSecondBreakfast) ratios.secondBreakfast = 0;
  if (!userData.enableSecondDinner) ratios.secondDinner = 0;
  const total = Object.values(ratios).reduce((s, v) => s + v, 0);
  if (total > 0 && total !== 1) {
    for (const k of Object.keys(ratios)) ratios[k] /= total;
  }
  return ratios;
}

function getTargetCaloriesForMeal(type, userData) {
  const ratios = getBaseRatios(userData);
  return Math.round(userData.dailyCalories * (ratios[type] || 0.1));
}

function computeWeeklyTargets(baseCalories, strategy, cheatDayIndex, cheatEnabled) {
  const targets = Array(7).fill(baseCalories);
  if (strategy === 'cycle') {
    for (let i = 0; i < 7; i++) {
      if (i <= 3) targets[i] = Math.round(baseCalories * 0.92);
      else if (i === 5) targets[i] = Math.round(baseCalories * 1.05);
      else if (i === 6) targets[i] = Math.round(baseCalories * 1.02);
    }
  }
  if (cheatEnabled && cheatDayIndex >= 0 && cheatDayIndex < 7) {
    for (let i = 0; i < 7; i++) {
      if (i !== cheatDayIndex && strategy !== 'flat') {
        targets[i] = Math.round(targets[i] * 0.97);
      }
    }
  }
  return targets;
}

function resolveCheatDayIndex(userData) {
  if (!userData.cheatDayEnabled) return -1;
  const choice = userData.cheatDayChoice;
  if (choice !== 'random' && choice !== '' && choice != null) {
    const fixed = parseInt(choice, 10);
    if (fixed >= 0 && fixed < 7) return fixed;
  }
  const stored = userData.resolvedCheatDayIndex;
  if (stored >= 0 && stored < 7) return stored;
  return Math.floor(Math.random() * 7);
}

const DAY_MEAL_TYPES = ['breakfast', 'secondBreakfast', 'lunch', 'snack', 'dinner', 'secondDinner'];

function sumDayCalories(day) {
  return DAY_MEAL_TYPES.reduce((sum, type) => {
    const meals = day[type];
    if (!Array.isArray(meals)) return sum;
    return sum + meals.reduce((s, m) => s + (m?.calories || 0), 0);
  }, 0);
}

function recalcMealFromWeight(meal, weight) {
  weight = roundPortionWeight(weight, !!meal.isAddOn);
  const addonCal = (meal.addons || []).reduce((s, a) => s + (a.calories || 0), 0);
  const addonP = (meal.addons || []).reduce((s, a) => s + (a.protein || 0), 0);
  const addonF = (meal.addons || []).reduce((s, a) => s + (a.fat || 0), 0);
  const addonC = (meal.addons || []).reduce((s, a) => s + (a.carbs || 0), 0);
  const baseCal = roundCalories((meal.kcalPer100g * weight) / 100);
  meal.weight = weight;
  meal.calories = roundCalories(baseCal + addonCal);
  meal.protein = parseFloat(((meal.proteinPer100g * weight) / 100 + addonP).toFixed(1));
  meal.fat = parseFloat(((meal.fatPer100g * weight) / 100 + addonF).toFixed(1));
  meal.carbs = parseFloat(((meal.carbsPer100g * weight) / 100 + addonC).toFixed(1));
}

function tryAddDayBooster(day, needed, constraints) {
  for (const type of ['dinner', 'lunch', 'snack', 'secondDinner', 'breakfast', 'secondBreakfast']) {
    const meals = day[type];
    if (!Array.isArray(meals) || !meals.length) continue;
    const before = sumDayCalories(day);
    const mealCals = meals.reduce((s, m) => s + (m.calories || 0), 0);
    addCalorieBooster(meals, mealCals + needed, constraints);
    if (sumDayCalories(day) > before) return true;
  }
  return false;
}

function tryReduceDayCalories(day, surplus) {
  const minWeight = 50;

  for (const type of ['dinner', 'lunch', 'snack', 'secondBreakfast', 'breakfast', 'secondDinner']) {
    const meals = day[type];
    if (!Array.isArray(meals)) continue;
    for (let i = meals.length - 1; i >= 0; i--) {
      const meal = meals[i];
      if (!meal?.kcalPer100g) continue;

      if (meal.isAddOn && meal.weight <= 30) {
        meals.splice(i, 1);
        return true;
      }

      if (!meal.isAddOn && meal.addons?.length) {
        const removed = meal.addons.pop();
        meal.calories = Math.max(0, roundCalories(meal.calories - removed.calories));
        meal.protein = parseFloat(Math.max(0, meal.protein - removed.protein).toFixed(1));
        meal.fat = parseFloat(Math.max(0, meal.fat - removed.fat).toFixed(1));
        meal.carbs = parseFloat(Math.max(0, meal.carbs - removed.carbs).toFixed(1));
        return true;
      }

      if (meal.isAddOn || meal.weight <= minWeight) continue;

      const reduceBy = Math.min(
        meal.weight - minWeight,
        Math.max(25, Math.round((surplus / meal.kcalPer100g) * 100 / 25) * 25)
      );
      if (reduceBy >= 25) {
        recalcMealFromWeight(meal, meal.weight - reduceBy);
        return true;
      }
    }
  }
  return false;
}

function isDayBalanced(total, target) {
  return Math.abs(total - target) <= Math.max(30, target * 0.05);
}

function balanceDayCalories(day, targetCalories, constraints) {
  if (day.isCheatDay || !targetCalories) return day;

  for (let attempt = 0; attempt < 10; attempt++) {
    const total = sumDayCalories(day);
    if (isDayBalanced(total, targetCalories)) break;

    const diff = targetCalories - total;
    if (diff > 0) {
      if (!tryAddDayBooster(day, diff, constraints)) break;
    } else if (!tryReduceDayCalories(day, -diff)) {
      break;
    }
  }

  return day;
}

function generateDayMeals(constraints, userData) {
  const dailyCalories = userData.dailyCalories;

  if (userData.isCheatDaySlot) {
    const day = generateCheatDay(constraints, dailyCalories);
    day.dayCaloriesTarget = dailyCalories;
    return day;
  }

  const ratios = getBaseRatios(userData);
  const day = { isCheatDay: false, dayCaloriesTarget: dailyCalories };
  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];

  if (userData.enableSecondBreakfast) mealTypes.splice(1, 0, 'secondBreakfast');
  if (userData.enableSecondDinner) mealTypes.push('secondDinner');

  for (const mealType of mealTypes) {
    if (ratios[mealType] > 0) {
      day[mealType] = generateMeal(mealType, constraints, userData);
    }
  }

  balanceDayCalories(day, dailyCalories, constraints);
  return day;
}

function generateWeeklyPlan(constraints, userData) {
  const baseCalories = userData.dailyCalories;
  const cheatDayIndex = resolveCheatDayIndex(userData);
  const weeklyTargets = computeWeeklyTargets(
    baseCalories,
    userData.weeklyStrategy || 'flat',
    cheatDayIndex,
    userData.cheatDayEnabled
  );

  const plan = [];
  for (let i = 0; i < 7; i++) {
    const dayUserData = {
      ...userData,
      dailyCalories: weeklyTargets[i],
      isCheatDaySlot: userData.cheatDayEnabled && i === cheatDayIndex
    };
    const day = generateDayMeals(constraints, dayUserData);
    day.dayIndex = i;
    day.dayCaloriesTarget = weeklyTargets[i];
    plan.push(day);
  }

  plan.cheatDayIndex = cheatDayIndex;
  plan.weeklyTargets = weeklyTargets;
  return plan;
}

export {
  generateWeeklyPlan,
  generateDayMeals,
  generateMeal,
  generateCheatMeal,
  balanceDayCalories,
  getDishRecipeOptions,
  replaceDishWithRecipe,
  getBoosterPortionWeight,
  isRecipeAllowed,
  recalcMealFromWeight
};
