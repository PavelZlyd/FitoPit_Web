// Функция: случайный выбор
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Функция: проверка, подходит ли рецепт по диете и аллергиям
function isRecipeAllowed(recipe, diet, allergies) {
  if (!recipe.diet.includes(diet)) return false;
  return !recipe.allergens.some(aller => allergies.includes(aller));
}

// Рассчёт BMR (Harris-Benedict)
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