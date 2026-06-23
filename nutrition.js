// Расчёт КБЖУ из ингредиентов, масштабирование порций и список покупок

export function normalizeIngredient(ing) {
  if (!ing) return ing;
  if (ing.grams != null) return { ...ing };
  if (ing.gramsPer100g != null) return { ...ing, grams: ing.gramsPer100g };
  return { ...ing };
}

export function getProductNutrition(products, name) {
  const p = products?.[name];
  if (!p) {
    return { kcalPer100g: 0, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0 };
  }
  return p;
}

export function calculateRecipeNutrition(recipe, products) {
  const ingredients = (recipe.ingredients || []).map(normalizeIngredient);
  const yieldGrams = recipe.yieldGrams > 0 ? recipe.yieldGrams : 100;

  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  for (const ing of ingredients) {
    const n = getProductNutrition(products, ing.name);
    const factor = (ing.grams || 0) / 100;
    totalKcal += n.kcalPer100g * factor;
    totalProtein += n.proteinPer100g * factor;
    totalFat += n.fatPer100g * factor;
    totalCarbs += n.carbsPer100g * factor;
  }

  const scale = 100 / yieldGrams;
  return {
    kcalPer100g: Math.round(totalKcal * scale),
    proteinPer100g: parseFloat((totalProtein * scale).toFixed(1)),
    fatPer100g: parseFloat((totalFat * scale).toFixed(1)),
    carbsPer100g: parseFloat((totalCarbs * scale).toFixed(1)),
  };
}

export function getPortionScale(recipe, portionWeight) {
  const yieldGrams = recipe.yieldGrams > 0 ? recipe.yieldGrams : 100;
  if (!portionWeight || !yieldGrams) return 0;
  return portionWeight / yieldGrams;
}

export function scaleIngredientsForPortion(recipe, portionWeight, { includeMassless = true } = {}) {
  const scale = getPortionScale(recipe, portionWeight);
  return (recipe.ingredients || [])
    .map(normalizeIngredient)
    .filter((ing) => includeMassless || !ing.massless)
    .map((ing) => ({
      name: ing.name,
      grams: Math.round(ing.grams * scale * 10) / 10,
      massless: !!ing.massless,
    }));
}

export function getShoppingIngredients(recipe, portionWeight) {
  return scaleIngredientsForPortion(recipe, portionWeight, { includeMassless: false });
}

export function enrichRecipeWithNutrition(recipe, products) {
  if (!recipe?.ingredients?.length) return recipe;

  const ingredients = recipe.ingredients.map(normalizeIngredient);
  const yieldGrams = recipe.yieldGrams > 0 ? recipe.yieldGrams : 100;
  const nutrition = calculateRecipeNutrition({ ingredients, yieldGrams }, products);

  return {
    ...recipe,
    ...nutrition,
    ingredients,
    yieldGrams,
  };
}

export function enrichMealWithScaledIngredients(meal) {
  if (!meal?.ingredients?.length || !meal.weight) return meal;
  const recipe = { ingredients: meal.ingredients, yieldGrams: meal.yieldGrams || 100 };
  return {
    ...meal,
    portionIngredients: scaleIngredientsForPortion(recipe, meal.weight),
  };
}
