// Агрегация продуктов/блюд для списка покупок на неделю
const MEAL_SLOTS = ['breakfast', 'secondBreakfast', 'lunch', 'snack', 'dinner', 'secondDinner'];

function addShoppingItem(items, title, weight) {
  if (!title || !weight) return;
  const key = title.trim();
  const existing = items.get(key) || { title: key, totalWeight: 0, occurrences: 0 };
  existing.totalWeight += weight;
  existing.occurrences += 1;
  items.set(key, existing);
}

export function buildShoppingList(plan) {
  const items = new Map();
  const days = Array.isArray(plan) ? plan : [];

  for (const day of days) {
    if (!day || typeof day !== 'object') continue;
    for (const mealType of MEAL_SLOTS) {
      const meals = day[mealType];
      if (!Array.isArray(meals)) continue;
      for (const meal of meals) {
        if (!meal?.title) continue;
        addShoppingItem(items, meal.title, meal.weight);
        for (const addon of meal.addons || []) {
          addShoppingItem(items, addon.title, addon.weight);
        }
      }
    }
  }

  return [...items.values()].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

export function formatShoppingListText(items, tr, lang = 'ru') {
  if (!items.length) return '';
  const unit = lang === 'ru' ? 'г' : 'g';
  const times = lang === 'ru' ? 'раз' : '×';
  let text = `🛒 FitoPit — ${tr.shoppingListTitle}\n\n`;
  for (const item of items) {
    const weight = Math.round(item.totalWeight);
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
