/**
 * Добавляет ингредиенты к блюдам в data/recipes.json (по названию).
 * Запуск: node scripts/add-ingredients.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '../data/recipes.json');

// граммы ингредиента на 100 г готового блюда (приблизительно)
const INGREDIENTS_BY_TITLE = {
  'Омлет с сыром': [
    { name: 'Яйца', gramsPer100g: 55 },
    { name: 'Сыр', gramsPer100g: 18 },
    { name: 'Молоко', gramsPer100g: 20 }
  ],
  'Омлет без масла': [
    { name: 'Яйца', gramsPer100g: 70 },
    { name: 'Молоко', gramsPer100g: 15 }
  ],
  'Яичница-глазунья': [{ name: 'Яйца', gramsPer100g: 85 }],
  'Гречневая каша на воде': [
    { name: 'Гречка', gramsPer100g: 35 },
    { name: 'Вода', gramsPer100g: 60 },
    { name: 'Соль', gramsPer100g: 1 }
  ],
  'Гречневая каша на молоке': [
    { name: 'Гречка', gramsPer100g: 30 },
    { name: 'Молоко', gramsPer100g: 65 },
    { name: 'Соль', gramsPer100g: 1 }
  ],
  'Рисовая каша на молоке': [
    { name: 'Рис', gramsPer100g: 25 },
    { name: 'Молоко', gramsPer100g: 70 },
    { name: 'Сахар', gramsPer100g: 3 }
  ],
  'Творог с ягодами': [
    { name: 'Творог', gramsPer100g: 75 },
    { name: 'Ягоды', gramsPer100g: 20 }
  ],
  'Сырники': [
    { name: 'Творог', gramsPer100g: 55 },
    { name: 'Яйца', gramsPer100g: 12 },
    { name: 'Мука', gramsPer100g: 15 },
    { name: 'Сахар', gramsPer100g: 5 }
  ],
  'Борщ с мясом': [
    { name: 'Говядина', gramsPer100g: 12 },
    { name: 'Свёкла', gramsPer100g: 20 },
    { name: 'Капуста', gramsPer100g: 18 },
    { name: 'Картофель', gramsPer100g: 12 },
    { name: 'Морковь', gramsPer100g: 8 },
    { name: 'Лук', gramsPer100g: 5 }
  ],
  'Куриный суп': [
    { name: 'Курица', gramsPer100g: 15 },
    { name: 'Картофель', gramsPer100g: 12 },
    { name: 'Морковь', gramsPer100g: 8 },
    { name: 'Лук', gramsPer100g: 5 },
    { name: 'Лапша', gramsPer100g: 8 }
  ],
  'Щи': [
    { name: 'Капуста', gramsPer100g: 25 },
    { name: 'Морковь', gramsPer100g: 8 },
    { name: 'Лук', gramsPer100g: 6 },
    { name: 'Томатная паста', gramsPer100g: 5 }
  ],
  'Уха': [
    { name: 'Рыба', gramsPer100g: 18 },
    { name: 'Картофель', gramsPer100g: 15 },
    { name: 'Морковь', gramsPer100g: 8 },
    { name: 'Лук', gramsPer100g: 5 }
  ],
  'Гуляш': [
    { name: 'Говядина', gramsPer100g: 55 },
    { name: 'Лук', gramsPer100g: 12 },
    { name: 'Морковь', gramsPer100g: 10 },
    { name: 'Томатная паста', gramsPer100g: 8 }
  ],
  'Куриные котлеты на пару': [
    { name: 'Куриный фарш', gramsPer100g: 70 },
    { name: 'Яйца', gramsPer100g: 10 },
    { name: 'Лук', gramsPer100g: 8 },
    { name: 'Хлеб', gramsPer100g: 5 }
  ],
  'Плов': [
    { name: 'Рис', gramsPer100g: 35 },
    { name: 'Баранина', gramsPer100g: 25 },
    { name: 'Морковь', gramsPer100g: 18 },
    { name: 'Лук', gramsPer100g: 12 },
    { name: 'Масло растительное', gramsPer100g: 5 }
  ],
  'Паста карбонара': [
    { name: 'Паста', gramsPer100g: 45 },
    { name: 'Бекон', gramsPer100g: 18 },
    { name: 'Яйца', gramsPer100g: 12 },
    { name: 'Сыр пармезан', gramsPer100g: 10 },
    { name: 'Сливки', gramsPer100g: 8 }
  ],
  'Запечённая курица': [
    { name: 'Курица', gramsPer100g: 85 },
    { name: 'Специи', gramsPer100g: 2 }
  ],
  'Куриная грудка на гриле': [
    { name: 'Куриная грудка', gramsPer100g: 92 },
    { name: 'Специи', gramsPer100g: 2 }
  ],
  'Рыба на пару': [
    { name: 'Филе рыбы', gramsPer100g: 88 },
    { name: 'Лимон', gramsPer100g: 3 }
  ],
  'Гречка': [
    { name: 'Гречка', gramsPer100g: 40 },
    { name: 'Вода', gramsPer100g: 55 }
  ],
  'Рис': [
    { name: 'Рис', gramsPer100g: 38 },
    { name: 'Вода', gramsPer100g: 58 }
  ],
  'Картофельное пюре': [
    { name: 'Картофель', gramsPer100g: 75 },
    { name: 'Молоко', gramsPer100g: 15 },
    { name: 'Масло сливочное', gramsPer100g: 5 }
  ],
  'Салат из свежих овощей': [
    { name: 'Огурцы', gramsPer100g: 30 },
    { name: 'Помидоры', gramsPer100g: 30 },
    { name: 'Перец', gramsPer100g: 15 },
    { name: 'Масло растительное', gramsPer100g: 8 }
  ],
  'Салат греческий': [
    { name: 'Помидоры', gramsPer100g: 25 },
    { name: 'Огурцы', gramsPer100g: 20 },
    { name: 'Сыр фета', gramsPer100g: 18 },
    { name: 'Маслины', gramsPer100g: 10 },
    { name: 'Масло оливковое', gramsPer100g: 8 }
  ],
  'Банан': [{ name: 'Банан', gramsPer100g: 100 }],
  'Яблоко': [{ name: 'Яблоко', gramsPer100g: 100 }],
  'Творожная запеканка': [
    { name: 'Творог', gramsPer100g: 50 },
    { name: 'Яйца', gramsPer100g: 12 },
    { name: 'Манка', gramsPer100g: 10 },
    { name: 'Сахар', gramsPer100g: 8 }
  ],
  'Тефтели в томатном соусе': [
    { name: 'Говяжий фарш', gramsPer100g: 45 },
    { name: 'Рис', gramsPer100g: 12 },
    { name: 'Лук', gramsPer100g: 10 },
    { name: 'Томатная паста', gramsPer100g: 15 }
  ],
  'Бургер с картошкой': [
    { name: 'Булочка', gramsPer100g: 25 },
    { name: 'Говяжий фарш', gramsPer100g: 30 },
    { name: 'Сыр', gramsPer100g: 10 },
    { name: 'Картофель фри', gramsPer100g: 28 }
  ],
  'Пицца': [
    { name: 'Тесто', gramsPer100g: 40 },
    { name: 'Сыр моцарелла', gramsPer100g: 22 },
    { name: 'Томатный соус', gramsPer100g: 15 },
    { name: 'Колбаса', gramsPer100g: 12 }
  ]
};

function applyIngredients(recipe) {
  const mapped = INGREDIENTS_BY_TITLE[recipe.title];
  if (!mapped) return recipe;
  return { ...recipe, ingredients: mapped };
}

function walkList(list) {
  return (list || []).map(applyIngredients);
}

const bundle = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const db = bundle.recipesDB;

bundle.recipesDB = {
  breakfast: walkList(db.breakfast),
  lunch: {
    first: walkList(db.lunch?.first),
    second: walkList(db.lunch?.second)
  },
  dinner: {
    main: walkList(db.dinner?.main),
    side: walkList(db.dinner?.side)
  },
  snack: walkList(db.snack)
};
bundle.calorieBoosters = walkList(bundle.calorieBoosters);
bundle.cheatMealRecipes = walkList(bundle.cheatMealRecipes);

fs.writeFileSync(jsonPath, JSON.stringify(bundle, null, 2));

const countWith = (items) => (items || []).filter((r) => r.ingredients?.length).length;
let total = 0;
total += countWith(bundle.recipesDB.breakfast);
total += countWith(bundle.recipesDB.lunch.first);
total += countWith(bundle.recipesDB.lunch.second);
total += countWith(bundle.recipesDB.dinner.main);
total += countWith(bundle.recipesDB.dinner.side);
total += countWith(bundle.recipesDB.snack);
total += countWith(bundle.cheatMealRecipes);
console.log(`Ingredients added. Recipes with ingredients: ${total}`);
