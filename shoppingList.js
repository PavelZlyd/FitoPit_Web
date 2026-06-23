// Агрегация продуктов/блюд для списка покупок на неделю
const MEAL_SLOTS = ['breakfast', 'secondBreakfast', 'lunch', 'snack', 'dinner', 'secondDinner'];

export const SHOPPING_MODES = {
  DISHES: 'dishes',
  INGREDIENTS: 'ingredients'
};

function addShoppingItem(items, title, weight, meta = {}) {
  if (!title || !weight) return;
  const key = title.trim();
  const existing = items.get(key) || {
    title: key,
    totalWeight: 0,
    occurrences: 0,
    ...meta
  };
  existing.totalWeight += weight;
  existing.occurrences += 1;
  items.set(key, existing);
}

function ingredientGramsForPortion(ing, meal) {
  // Новый формат: абсолютные граммы сырого продукта + выход блюда (yieldGrams).
  if (ing.grams != null) {
    const yieldGrams = meal.yieldGrams > 0 ? meal.yieldGrams : meal.weight || 100;
    return ing.grams * ((meal.weight || 0) / yieldGrams);
  }
  // Старый формат (граммы на 100 г готового блюда) — для сохранённых планов.
  if (ing.gramsPer100g != null) {
    return (ing.gramsPer100g / 100) * (meal.weight || 0);
  }
  return 0;
}

function collectMealEntries(meal, items, mode) {
  if (!meal?.title) return;

  if (mode === SHOPPING_MODES.INGREDIENTS && meal.ingredients?.length) {
    for (const ing of meal.ingredients) {
      if (ing.massless) continue; // соль и специи в массу/закупку не идут
      const grams = ingredientGramsForPortion(ing, meal);
      addShoppingItem(items, ing.name, grams, { isIngredient: true });
    }
    return;
  }

  addShoppingItem(items, meal.title, meal.weight, { isIngredient: false });
}

function iteratePlan(plan, callback) {
  const days = Array.isArray(plan) ? plan : [];
  for (const day of days) {
    if (!day || typeof day !== 'object') continue;
    for (const mealType of MEAL_SLOTS) {
      const meals = day[mealType];
      if (!Array.isArray(meals)) continue;
      for (const meal of meals) {
        callback(meal);
        for (const addon of meal.addons || []) {
          callback(addon);
        }
      }
    }
  }
}

export function planHasIngredientData(plan) {
  let found = false;
  iteratePlan(plan, (meal) => {
    if (meal.ingredients?.length) found = true;
  });
  return found;
}

export function buildShoppingList(plan, mode = SHOPPING_MODES.DISHES) {
  const items = new Map();
  const effectiveMode =
    mode === SHOPPING_MODES.INGREDIENTS && planHasIngredientData(plan)
      ? SHOPPING_MODES.INGREDIENTS
      : SHOPPING_MODES.DISHES;

  iteratePlan(plan, (meal) => {
    collectMealEntries(meal, items, effectiveMode);
  });

  return [...items.values()].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

export function formatShoppingListText(items, tr, lang = 'ru') {
  if (!items.length) return '';
  const unit = lang === 'ru' ? 'г' : 'g';
  const times = lang === 'ru' ? 'раз' : '×';
  let text = `🛒 FitoPit — ${tr.shoppingListTitle}\n\n`;
  for (const item of items) {
    const weight = roundShoppingWeight(item.totalWeight);
    text += `• ${item.title} — ${weight}${unit}`;
    if (item.occurrences > 1) {
      text += ` (${item.occurrences} ${times})`;
    }
    text += '\n';
  }
  return text.trim();
}

export function roundShoppingWeight(grams) {
  if (grams < 50) return Math.max(10, Math.round(grams / 5) * 5);
  if (grams < 500) return Math.round(grams / 10) * 10;
  return Math.round(grams / 50) * 50;
}
