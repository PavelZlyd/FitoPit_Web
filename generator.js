// generator.js

// Функция: случайный выбор
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Функция: проверка, подходит ли рецепт по диете и аллергиям
function isRecipeAllowed(recipe, diet, allergies) {
  if (!recipe.diet.includes(diet)) return false;
  return !recipe.allergens.some(aller => allergies.includes(aller));
}

// Получить фолбэк-блюдо
function getFallbackMeal(diet, allergies) {
  return {
    title: "Лёгкий салат",
    kcalPer100g: 50,
    proteinPer100g: 2.0,
    fatPer100g: 3.0,
    carbsPer100g: 4.0,
    diet: ["vegan"],
    allergens: [],
    weight: 200,
    calories: 100,
    protein: 4.0,
    fat: 6.0,
    carbs: 8.0,
    type: "main"
  };
}

// Получить emoji по названию
function getEmojiForTitle(title) {
  const lowerTitle = title.toLowerCase();
  for (const [key, emoji] of Object.entries(window.emojiMap || {})) {
    if (lowerTitle.includes(key)) return emoji;
  }
  return '🍽️';
}

// Универсальная генерация блюда с гарниром
function generateMealWithSides(targetCalories, mainOptions, sideOptions, diet, allergies, mainRatio = 0.6) {
  const meals = [];

  if (!Array.isArray(mainOptions) || mainOptions.length === 0) return [];
  if (!Array.isArray(sideOptions) || sideOptions.length === 0) return [];

  const main = getRandom(mainOptions);
  const calMainTarget = Math.round(targetCalories * mainRatio);
  let weightMain = Math.round((calMainTarget / main.kcalPer100g) * 100);
  weightMain = Math.min(500, Math.max(100, weightMain));
  const calMain = Math.round((main.kcalPer100g * weightMain) / 100);
  const proteinMain = parseFloat(((main.proteinPer100g * weightMain) / 100).toFixed(1));
  const fatMain = parseFloat(((main.fatPer100g * weightMain) / 100).toFixed(1));
  const carbsMain = parseFloat(((main.carbsPer100g * weightMain) / 100).toFixed(1));
  meals.push({ ...main, weight: weightMain, calories: calMain, protein: proteinMain, fat: fatMain, carbs: carbsMain });

  const side = getRandom(sideOptions);
  const remaining = targetCalories - calMain;
  let weightSide = Math.round((remaining / side.kcalPer100g) * 100);
  weightSide = Math.min(400, Math.max(100, weightSide));
  const calSide = Math.round((side.kcalPer100g * weightSide) / 100);
  const proteinSide = parseFloat(((side.proteinPer100g * weightSide) / 100).toFixed(1));
  const fatSide = parseFloat(((side.fatPer100g * weightSide) / 100).toFixed(1));
  const carbsSide = parseFloat(((side.carbsPer100g * weightSide) / 100).toFixed(1));
  meals.push({ ...side, weight: weightSide, calories: calSide, protein: proteinSide, fat: fatSide, carbs: carbsSide });

  return meals;
}

// Генерация простого блюда
function generateSimpleMeal(targetCalories, options, diet, allergies) {
  if (!Array.isArray(options)) return null;

  // Проверяем, включён ли "лёгкий завтрак"
  const breakfastType = document.getElementById?.('breakfastType')?.value || 'normal';

  let filtered = [...options];
  if (breakfastType === 'light') {
    const lightKeywords = ['йогурт', 'творог', 'фрукт', 'яблоко', 'банан', 'авокадо', 'чиа', 'пудинг', 'тост', 'смузи', 'кефир', 'омлет'];
    filtered = options.filter(r =>
      lightKeywords.some(kw => r.title.toLowerCase().includes(kw))
    );
    if (filtered.length === 0) {
      filtered = options;
      targetCalories = Math.min(targetCalories, 400);
    }
  }

  const allowed = filtered.filter(r => isRecipeAllowed(r, diet, allergies));
  if (allowed.length === 0) return null;

  const recipe = getRandom(allowed);

  let maxWeight = 500;
  if (breakfastType === 'light') {
    maxWeight = 300;
    if (recipe.type === "main") maxWeight = 250;
  }
  if (recipe.title.toLowerCase().includes("каша") || recipe.title.toLowerCase().includes("овсянка")) {
    maxWeight = breakfastType === 'light' ? 200 : 350;
  }

  let weight = Math.round((targetCalories / recipe.kcalPer100g) * 100);
  weight = Math.min(maxWeight, Math.max(100, weight));

  const calories = Math.round((recipe.kcalPer100g * weight) / 100);
  const protein = parseFloat(((recipe.proteinPer100g * weight) / 100).toFixed(1));
  const fat = parseFloat(((recipe.fatPer100g * weight) / 100).toFixed(1));
  const carbs = parseFloat(((recipe.carbsPer100g * weight) / 100).toFixed(1));

  return { ...recipe, weight, calories, protein, fat, carbs };
}

// Обед: суп + основное + гарнир
function generateLunch(targetCalories, diet, allergies) {
  const meals = [];

  const firstCourses = Array.isArray(recipesDB.lunch?.first)
    ? recipesDB.lunch.first.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  const incompleteMains = Array.isArray(recipesDB.lunch?.second)
    ? recipesDB.lunch.second.filter(r => isRecipeAllowed(r, diet, allergies) && r.type === "main" && !r.complete)
    : [];

  const completeMeals = Array.isArray(recipesDB.lunch?.second)
    ? recipesDB.lunch.second.filter(r => isRecipeAllowed(r, diet, allergies) && r.complete)
    : [];

  const sideCourses = Array.isArray(recipesDB.dinner?.side)
    ? recipesDB.dinner.side.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  if (firstCourses.length > 0) {
    const first = getRandom(firstCourses);
    const weightFirst = Math.min(600, Math.max(100, Math.round((targetCalories * 0.4 / first.kcalPer100g) * 100)));
    const calFirst = Math.round((first.kcalPer100g * weightFirst) / 100);
    const proteinFirst = parseFloat(((first.proteinPer100g * weightFirst) / 100).toFixed(1));
    const fatFirst = parseFloat(((first.fatPer100g * weightFirst) / 100).toFixed(1));
    const carbsFirst = parseFloat(((first.carbsPer100g * weightFirst) / 100).toFixed(1));
    meals.push({ ...first, weight: weightFirst, calories: calFirst, protein: proteinFirst, fat: fatFirst, carbs: carbsFirst });
  }

  let remainingAfterFirst = targetCalories - (meals[0]?.calories || 0);

  const useCompleteMeal = completeMeals.length > 0 && Math.random() < 0.4;
  if (useCompleteMeal) {
    const complete = getRandom(completeMeals);
    const weight = Math.min(600, Math.max(200, Math.round((remainingAfterFirst / complete.kcalPer100g) * 100)));
    const calories = Math.round((complete.kcalPer100g * weight) / 100);
    const protein = parseFloat(((complete.proteinPer100g * weight) / 100).toFixed(1));
    const fat = parseFloat(((complete.fatPer100g * weight) / 100).toFixed(1));
    const carbs = parseFloat(((complete.carbsPer100g * weight) / 100).toFixed(1));
    meals.push({ ...complete, weight, calories, protein, fat, carbs });
  } else if (incompleteMains.length > 0 && sideCourses.length > 0) {
    const combined = generateMealWithSides(remainingAfterFirst, incompleteMains, sideCourses, diet, allergies, 0.5);
    meals.push(...combined);
  }

  addCalorieBooster(meals, targetCalories, diet, allergies);
  return meals.length > 0 ? meals : [getFallbackMeal(diet, allergies)];
}

// Ужин: основное + гарнир
function generateDinner(targetCalories, diet, allergies) {
  const meals = [];

  const mains = Array.isArray(recipesDB.dinner?.main)
    ? recipesDB.dinner.main.filter(r => isRecipeAllowed(r, diet, allergies) && !r.complete)
    : [];

  const sides = Array.isArray(recipesDB.dinner?.side)
    ? recipesDB.dinner.side.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  const completeMeals = Array.isArray(recipesDB.dinner?.main)
    ? recipesDB.dinner.main.filter(r => isRecipeAllowed(r, diet, allergies) && r.complete)
    : [];

  const useCompleteMeal = completeMeals.length > 0 && Math.random() < 0.5;
  if (useCompleteMeal) {
    const complete = getRandom(completeMeals);
    const weight = Math.min(600, Math.max(200, Math.round((targetCalories / complete.kcalPer100g) * 100)));
    const calories = Math.round((complete.kcalPer100g * weight) / 100);
    const protein = parseFloat(((complete.proteinPer100g * weight) / 100).toFixed(1));
    const fat = parseFloat(((complete.fatPer100g * weight) / 100).toFixed(1));
    const carbs = parseFloat(((complete.carbsPer100g * weight) / 100).toFixed(1));
    meals.push({ ...complete, weight, calories, protein, fat, carbs });
  } else if (mains.length > 0 && sides.length > 0) {
    const combined = generateMealWithSides(targetCalories, mains, sides, diet, allergies, 0.6);
    meals.push(...combined);
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  if (totalCalories < targetCalories * 0.8) {
    const extraOptions = [
      ...(sides.length > 0 ? sides : []),
      ...recipesDB.snack.filter(r => isRecipeAllowed(r, diet, allergies) && r.kcalPer100g > 80)
    ];
    if (extraOptions.length > 0) {
      const extra = getRandom(extraOptions);
      const needed = targetCalories - totalCalories;
      const weightExtra = Math.min(300, Math.max(100, Math.round((needed / extra.kcalPer100g) * 100)));
      const calories = Math.round((extra.kcalPer100g * weightExtra) / 100);
      const protein = parseFloat(((extra.proteinPer100g * weightExtra) / 100).toFixed(1));
      const fat = parseFloat(((extra.fatPer100g * weightExtra) / 100).toFixed(1));
      const carbs = parseFloat(((extra.carbsPer100g * weightExtra) / 100).toFixed(1));
      meals.push({ ...extra, weight: weightExtra, calories, protein, fat, carbs, isExtra: true });
    }
  }

  addCalorieBooster(meals, targetCalories, diet, allergies);
  return meals.length > 0 ? meals : [getFallbackMeal(diet, allergies)];
}

// Перекус
function generateSnack(targetCalories, diet, allergies) {
  const options = Array.isArray(recipesDB.snack)
    ? recipesDB.snack.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  return generateSimpleMeal(targetCalories, options, diet, allergies) || getFallbackMeal(diet, allergies);
}

// Полный приём пищи
function generateFullMeal(targetCalories, diet, allergies) {
  const allMains = [
    ...(Array.isArray(recipesDB.lunch?.second) ? recipesDB.lunch.second : []),
    ...(Array.isArray(recipesDB.dinner?.main) ? recipesDB.dinner.main : [])
  ].filter(r => isRecipeAllowed(r, diet, allergies));

  const sides = Array.isArray(recipesDB.dinner?.side)
    ? recipesDB.dinner.side.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  return generateMealWithSides(targetCalories, allMains, sides, diet, allergies, 0.6);
}

// Добавление калорийной добавки
function addCalorieBooster(meals, targetCalories, diet, allergies) {
  const boosters = Array.isArray(calorieBoosters)
    ? calorieBoosters.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  if (boosters.length === 0) return;

  let totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const needed = targetCalories - totalCalories;

  if (needed < targetCalories * 0.05) return;

  let added = 0;
  while (added < 2 && needed > 30) {
    const booster = getRandom(boosters);
    let weightBooster;

    if (booster.title.includes("масло")) weightBooster = 15;
    else if (booster.title.includes("сыр") || booster.title.includes("фета")) weightBooster = 30;
    else if (booster.title.includes("орехи")) weightBooster = 20;
    else if (booster.title.includes("мед")) weightBooster = 10;
    else weightBooster = Math.min(50, Math.round((needed / booster.kcalPer100g) * 100));

    const calories = Math.round((booster.kcalPer100g * weightBooster) / 100);
    if (calories < 20) break;

    const protein = parseFloat(((booster.proteinPer100g * weightBooster) / 100).toFixed(1));
    const fat = parseFloat(((booster.fatPer100g * weightBooster) / 100).toFixed(1));
    const carbs = parseFloat(((booster.carbsPer100g * weightBooster) / 100).toFixed(1));

    meals.push({ ...booster, weight: weightBooster, calories, protein, fat, carbs, isAddOn: true });
    totalCalories += calories;
    added++;
    break;
  }
}

// ✅ НОВАЯ ФУНКЦИЯ: Генерация одного приёма пищи
function generateMeal(mealType, constraints, userData) {
  const { diet, allergies } = constraints;
  const targetCalories = getTargetCaloriesForMeal(mealType, userData);

  switch (mealType) {
    case 'breakfast':
    case 'secondBreakfast':
      return [generateSimpleMeal(targetCalories, recipesDB.breakfast || [], diet, allergies)];

    case 'lunch':
      return generateLunch(targetCalories, diet, allergies);

    case 'snack':
      return [generateSnack(targetCalories, diet, allergies)];

    case 'dinner':
      return generateDinner(targetCalories, diet, allergies);

    case 'secondDinner':
      const options = [...(recipesDB.snack || []), ...(recipesDB.dinner?.side || [])];
      return [generateSimpleMeal(targetCalories, options, diet, allergies)];

    default:
      return [getFallbackMeal(diet, allergies)];
  }
}

// ✅ Генерация целого дня с умным secondBreakfast
function generateDayMeals(constraints, userData) {
  const { diet, allergies } = constraints;
  const dailyCalories = userData.dailyCalories;

  // Базовые пропорции — без второго завтрака
  const baseRatios = {
    breakfast: 0.16,
    lunch: 0.35,
    snack: 0.1,
    dinner: 0.24,
    secondDinner: 0.05
  };

  if (userData.breakfastType === 'light') {
    baseRatios.breakfast *= 0.7;
    baseRatios.lunch *= 1.1;
  }

  // Добавляем secondBreakfast только если нужно
  let ratios = { ...baseRatios };
  let day = {};

  // Генерируем все приёмы пищи
  for (const [mealType, ratio] of Object.entries(ratios)) {
    const targetCalories = Math.round(dailyCalories * ratio);
    day[mealType] = generateMeal(mealType, constraints, userData);
  }

  // Считаем общие калории
  const totalCalories = Object.values(day).flat().reduce((sum, m) => sum + m.calories, 0);
  const deficit = dailyCalories - totalCalories;

  // Если дефицит > 15% от нормы — добавляем второй завтрак
  if (deficit > dailyCalories * 0.1) {
    const targetCalories = Math.min(Math.round(deficit * 0.8), 300); // не больше 300 ккал
    const meal = generateMeal('secondBreakfast', constraints, userData);
    if (meal && meal[0]?.calories > 50) {
      day.secondBreakfast = meal;
    }
  }

  return day;
}

// Вспомогательная: расчёт калорий для приёма пищи
function getTargetCaloriesForMeal(type, userData) {
  const { dailyCalories, breakfastType } = userData;
  const baseRatios = {
    breakfast: 0.16,
    secondBreakfast: 0.1,
    lunch: 0.35,
    snack: 0.1,
    dinner: 0.24,
    secondDinner: 0.05
  };
  if (breakfastType === 'light' && type === 'breakfast') {
    return Math.round(dailyCalories * baseRatios.breakfast * 0.7);
  }
  return Math.round(dailyCalories * baseRatios[type]);
}

// Проверка загрузки
console.log("✅ generator.js: generateDayMeals =", typeof generateDayMeals);