// Загрузка базы рецептов из JSON + метаданные UI
const bundle = await fetch(new URL('./data/recipes.json', import.meta.url)).then((res) => {
  if (!res.ok) throw new Error('Не удалось загрузить data/recipes.json');
  return res.json();
});

const IMAGE_RULES = [
  { match: ['суп', 'борщ', 'щи', 'уха', 'солянк', 'рассольник', 'горох', 'окрошк'], image: 'images/dishes/soup.svg' },
  { match: ['каша', 'овсянк', 'греч', 'рис', 'мюсли'], image: 'images/dishes/porridge.svg' },
  { match: ['омлет', 'яичниц', 'сырник', 'блин', 'олад', 'тост', 'запеканк'], image: 'images/dishes/breakfast.svg' },
  { match: ['рыб', 'лосос', 'треск', 'сайр', 'ролл'], image: 'images/dishes/fish.svg' },
  { match: ['кури', 'индей', 'мяс', 'говя', 'свин', 'тефтел', 'котлет', 'гуляш', 'отбив', 'стейк', 'бургер', 'наггет'], image: 'images/dishes/meat.svg' },
  { match: ['салат', 'овощ', 'тыкв', 'капуст', 'огур'], image: 'images/dishes/salad.svg' },
  { match: ['торт', 'морожен', 'пицц', 'десерт', 'смузи'], image: 'images/dishes/treat.svg' }
];

const SIMPLE_FOOD_TITLES = [
  'Банан', 'Яблоко', 'Груша', 'Апельсин', 'Мандарин', 'Киви',
  'Ягоды свежие', 'Виноград', 'Огурец с солью', 'Варёное яйцо',
  'Кефир 1%', 'Кефир 2.5%', 'Протеиновый батончик',
  'Авокадо', 'Сыр', 'Орехи (горсть)', 'Оливковое масло (1 ст. л.)',
  'Мед (1 ч. л.)', 'Чай', 'Кубик сахара'
];

function inferImage(title) {
  const lower = (title || '').toLowerCase();
  for (const { match, image } of IMAGE_RULES) {
    if (match.some((part) => lower.includes(part))) return image;
  }
  return 'images/dishes/plate.svg';
}

function enrichRecipe(recipe) {
  if (!recipe || typeof recipe !== 'object') return recipe;
  return {
    ...recipe,
    image: recipe.image || inferImage(recipe.title)
  };
}

function enrichList(list) {
  return (list || []).map(enrichRecipe);
}

function enrichRecipesDB(db) {
  return {
    breakfast: enrichList(db.breakfast),
    lunch: {
      first: enrichList(db.lunch?.first),
      second: enrichList(db.lunch?.second)
    },
    dinner: {
      main: enrichList(db.dinner?.main),
      side: enrichList(db.dinner?.side)
    },
    snack: enrichList(db.snack)
  };
}

function buildRecipeLinkMap(db, boosters, cheatMeals) {
  const map = {};
  const collect = (items) => {
    for (const recipe of items || []) {
      if (recipe?.url) map[recipe.title] = recipe.url;
    }
  };
  collect(db.breakfast);
  collect(db.lunch?.first);
  collect(db.lunch?.second);
  collect(db.dinner?.main);
  collect(db.dinner?.side);
  collect(db.snack);
  collect(boosters);
  collect(cheatMeals);
  return map;
}

export const recipesDB = enrichRecipesDB(bundle.recipesDB);
export const calorieBoosters = enrichList(bundle.calorieBoosters);
export const cheatMealRecipes = enrichList(bundle.cheatMealRecipes);
export const recipeLinkMap = buildRecipeLinkMap(recipesDB, calorieBoosters, cheatMealRecipes);
export const noRecipeLinkTitles = new Set(SIMPLE_FOOD_TITLES);

export const emojiMap = {
  омлет: '🍳', каша: '🥣', творог: '🧀', авокадо: '🥑',
  сырники: '🟡', борщ: '🍲', суп: '🥘', щи: '🥗', капуста: '🥬', уха: '🐟', сайр: '🐟',
  гуляш: '🍖', паста: '🍝', рис: '🍚', овощи: '🥦', запеканка: '🥧',
  рагу: '🥘', курица: '🍗', рыба: '🐟', фасоль: '🫘', пюре: '🥔',
  гречка: '🌾', хумус: '🥒', яблоко: '🍎', банан: '🍌', груша: '🍐', апельсин: '🍊',
  мандарин: '🍊', киви: '🥝', ягод: '🫐', виноград: '🍇', йогурт: '🥛', орехи: '🥜',
  хлеб: '🍞', масло: '🧈', сыр: '🧀', салат: '🥗', тост: '🥪', котлета: '🍔',
  плов: '🍛', лазанья: '🍝', кукуруза: '🌽', картофель: '🥔', лосось: '🐟',
  тофу: '🥩', оладьи: '🥞', кефир: '🥛', гранола: '🥣', батончик: '🍫',
  бургер: '🍔', пицца: '🍕', тортик: '🍰', мороженое: '🍦', карбонара: '🍝',
  чай: '🍵', сахар: '🍬', тыкв: '🎃', мюсли: '🥣', ролл: '🍣', треск: '🐟',
  солянк: '🍲', горох: '🥣', рассольник: '🥣', окрошк: '🥣', тефтел: '🍖',
  отбив: '🥩', чизбургер: '🍔', наггет: '🍗'
};
