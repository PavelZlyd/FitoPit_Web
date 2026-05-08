// Функция: случайный выбор
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Функция: проверка, подходит ли рецепт по диете и аллергиям
function isRecipeAllowed(recipe, diet, allergies) {
  if (!recipe.diet.includes(diet)) return false;
  return !recipe.allergens.some(aller => allergies.includes(aller));
}

// Рассчёт BMR
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Получить фолбэк-блюдо
function getFallbackMeal(diet, allergies) {
  return {
    title: "Лёгкий салат",
    kcalPer100g: 50,
    diet: ["vegan"],
    allergens: [],
    weight: 200,
    calories: 100,
    type: "main"
  };
}

// Получить emoji по названию
function getEmojiForTitle(title) {
  const lowerTitle = title.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerTitle.includes(key)) return emoji;
  }
  return '🍽️';
}

// Универсальная генерация блюда с гарниром
function generateMealWithSides(targetCalories, mainOptions, sideOptions, diet, allergies, mainRatio = 0.6) {
  const meals = [];

  // Защита от пустых массивов
  if (!Array.isArray(mainOptions) || mainOptions.length === 0) return [];
  if (!Array.isArray(sideOptions) || sideOptions.length === 0) return [];

  const main = getRandom(mainOptions);
  const weightMain = Math.min(250, Math.max(100, Math.round((targetCalories * mainRatio / main.kcalPer100g) * 100)));
  const calMain = Math.round((main.kcalPer100g * weightMain) / 100);
  meals.push({ ...main, weight: weightMain, calories: calMain });

  const side = getRandom(sideOptions);
  const remaining = targetCalories - calMain;
  const weightSide = Math.min(300, Math.max(100, Math.round((remaining / side.kcalPer100g) * 100)));
  const calSide = Math.round((side.kcalPer100g * weightSide) / 100);
  meals.push({ ...side, weight: weightSide, calories: calSide });

  return meals;
}

// Генерация простого блюда
function generateSimpleMeal(targetCalories, options, diet, allergies) {
  if (!Array.isArray(options)) return null;

  const allowed = options.filter(r => isRecipeAllowed(r, diet, allergies));
  if (allowed.length === 0) return null;

  const recipe = getRandom(allowed);
  let weight = Math.min(250, Math.round((targetCalories / recipe.kcalPer100g) * 100));
  weight = Math.max(100, weight);
  const calories = Math.round((recipe.kcalPer100g * weight) / 100);

  return { ...recipe, weight, calories };
}

// Обед: суп + основное + гарнир
function generateLunch(targetCalories, diet, allergies) {
  const meals = [];

  // Прямой доступ к recipesDB.lunch.first
  const firstCourses = Array.isArray(recipesDB.lunch?.first)
    ? recipesDB.lunch.first.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  const mainIncomplete = Array.isArray(recipesDB.lunch?.second)
    ? recipesDB.lunch.second.filter(r => isRecipeAllowed(r, diet, allergies) && r.type === "main" && !r.complete)
    : [];

  const completeMeals = Array.isArray(recipesDB.lunch?.second)
    ? recipesDB.lunch.second.filter(r => isRecipeAllowed(r, diet, allergies) && r.complete)
    : [];

  const sideCourses = Array.isArray(recipesDB.dinner?.side)
    ? recipesDB.dinner.side.filter(r => isRecipeAllowed(r, diet, allergies))
    : [];

  // Суп
  if (firstCourses.length > 0) {
    const first = getRandom(firstCourses);
    const weightFirst = Math.min(400, Math.max(100, Math.round((targetCalories * 0.4 / first.kcalPer100g) * 100)));
    const calFirst = Math.round((first.kcalPer100g * weightFirst) / 100);
    meals.push({ ...first, weight: weightFirst, calories: calFirst });
  }

  let remainingAfterFirst = targetCalories - (meals[0]?.calories || 0);

  const useCompleteMeal = completeMeals.length > 0 && Math.random() < 0.4;
  if (useCompleteMeal) {
    const complete = getRandom(completeMeals);
    const weight = Math.min(400, Math.max(200, Math.round((remainingAfterFirst / complete.kcalPer100g) * 100)));
    const calories = Math.round((complete.kcalPer100g * weight) / 100);
    meals.push({ ...complete, weight, calories });
  } else if (mainIncomplete.length > 0 && sideCourses.length > 0) {
    const combined = generateMealWithSides(remainingAfterFirst, mainIncomplete, sideCourses, diet, allergies, 0.5);
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

  const useCompleteMeal = mains.length > 0 && Math.random() < 0.5;
  if (useCompleteMeal && sides.length > 0) {
    const combined = generateMealWithSides(targetCalories, mains, sides, diet, allergies, 0.6);
    meals.push(...combined);
  } else {
    const completeMeals = Array.isArray(recipesDB.dinner?.main)
      ? recipesDB.dinner.main.filter(r => isRecipeAllowed(r, diet, allergies) && r.complete)
      : [];

    if (completeMeals.length > 0) {
      const complete = getRandom(completeMeals);
      const weight = Math.min(400, Math.max(200, Math.round((targetCalories / complete.kcalPer100g) * 100)));
      const calories = Math.round((complete.kcalPer100g * weight) / 100);
      meals.push({ ...complete, weight, calories });
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

// Полный приём пищи (основное + гарнир)
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
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  if (totalCalories < targetCalories * 0.85) {
    const boosters = Array.isArray(calorieBoosters)
      ? calorieBoosters.filter(r => isRecipeAllowed(r, diet, allergies))
      : [];

    if (boosters.length > 0) {
      const booster = getRandom(boosters);
      const needed = targetCalories - totalCalories;
      const weightBooster = Math.min(50, Math.round((needed / booster.kcalPer100g) * 100));
      const calBooster = Math.round((booster.kcalPer100g * weightBooster) / 100);
      meals.push({ ...booster, weight: weightBooster, calories: calBooster, isAddOn: true });
    }
  }
}