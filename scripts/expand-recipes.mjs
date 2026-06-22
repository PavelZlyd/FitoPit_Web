/**
 * Одноразовое расширение базы рецептов (можно запускать повторно — дубликаты по title не добавляет).
 * Запуск: node scripts/expand-recipes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '../data/recipes.json');

const EXTRA_URLS = {
  'Куриный суп': 'https://eda.ru/recepty/kurinyy-sup',
  'Солянка мясная': 'https://eda.ru/recepty/solyanka',
  'Гороховый суп': 'https://eda.ru/recepty/gorohovyy-sup',
  'Рассольник': 'https://eda.ru/recepty/rassolnik',
  'Тефтели в томатном соусе': 'https://eda.ru/recepty/tefteli',
  'Ленивые голубцы': 'https://eda.ru/recepty/lenivye-golubcy',
  'Куриная грудка на гриле': 'https://eda.ru/recepty/kurinaya-grudka',
  'Треска в духовке': 'https://eda.ru/recepty/treska',
  'Яичница-глазунья': 'https://eda.ru/recepty/yachnitsa-glazunya',
  'Рисовая каша на молоке': 'https://eda.ru/recepty/risovaya-kasha-na-moloke',
  'Мюсли с йогуртом': 'https://eda.ru/recepty/musli',
  'Паста с томатным соусом': 'https://eda.ru/recepty/pasta',
  'Свиная отбивная': 'https://eda.ru/recepty/svinaya-otbivnaya',
  'Индейка с овощами': 'https://eda.ru/recepty/indeyka',
  'Хлебец с творожным сыром': 'https://eda.ru/recepty/buterbrod',
  'Салат греческий': 'https://eda.ru/recepty/salat-grecheskiy',
  'Окрошка': 'https://eda.ru/recepty/okroshka',
  'Котлета по-киевски': 'https://eda.ru/recepty/kotleta-po-kievski',
  'Рагу из баранины': 'https://eda.ru/recepty/ragu',
  'Запечённая тыква': 'https://eda.ru/recepty/tykva',
  'Творожная запеканка': 'https://eda.ru/recepty/tvorozhnaya-zapekanka',
  'Смузи-боул': 'https://eda.ru/recepty/smuzi',
  'Тост с арахисовой пастой': 'https://eda.ru/recepty/tost',
  'Ролл с лососем': 'https://eda.ru/recepty/roll',
  'Куриный стейк': 'https://eda.ru/recepty/kurinyy-steyk'
};

const NEW_RECIPES = {
  breakfast: [
    {
      title: 'Яичница-глазунья',
      kcalPer100g: 196,
      proteinPer100g: 13.6,
      fatPer100g: 15.3,
      carbsPer100g: 0.6,
      diet: ['normal', 'vegetarian'],
      allergens: ['eggs'],
      type: 'main',
      budget: 'low',
      url: EXTRA_URLS['Яичница-глазунья']
    },
    {
      title: 'Рисовая каша на молоке',
      kcalPer100g: 97,
      proteinPer100g: 2.5,
      fatPer100g: 2.0,
      carbsPer100g: 17.5,
      diet: ['normal', 'vegetarian'],
      allergens: ['dairy'],
      type: 'side',
      budget: 'low',
      url: EXTRA_URLS['Рисовая каша на молоке']
    },
    {
      title: 'Мюсли с йогуртом',
      kcalPer100g: 145,
      proteinPer100g: 5.5,
      fatPer100g: 4.5,
      carbsPer100g: 21.0,
      diet: ['normal', 'vegetarian'],
      allergens: ['dairy', 'gluten', 'nuts'],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Мюсли с йогуртом']
    },
    {
      title: 'Творожная запеканка',
      kcalPer100g: 168,
      proteinPer100g: 12.5,
      fatPer100g: 7.0,
      carbsPer100g: 14.0,
      diet: ['normal', 'vegetarian'],
      allergens: ['dairy', 'eggs', 'gluten'],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Творожная запеканка']
    },
    {
      title: 'Смузи-боул',
      kcalPer100g: 95,
      proteinPer100g: 3.0,
      fatPer100g: 2.5,
      carbsPer100g: 16.0,
      diet: ['vegetarian', 'vegan', 'glutenfree'],
      allergens: [],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Смузи-боул']
    }
  ],
  lunchFirst: [
    {
      title: 'Солянка мясная',
      kcalPer100g: 98,
      proteinPer100g: 6.5,
      fatPer100g: 6.0,
      carbsPer100g: 4.5,
      diet: ['normal'],
      allergens: [],
      type: 'first',
      budget: 'medium',
      url: EXTRA_URLS['Солянка мясная']
    },
    {
      title: 'Гороховый суп',
      kcalPer100g: 72,
      proteinPer100g: 4.5,
      fatPer100g: 2.5,
      carbsPer100g: 9.0,
      diet: ['normal'],
      allergens: [],
      type: 'first',
      budget: 'low',
      url: EXTRA_URLS['Гороховый суп']
    },
    {
      title: 'Рассольник',
      kcalPer100g: 58,
      proteinPer100g: 2.8,
      fatPer100g: 2.2,
      carbsPer100g: 6.5,
      diet: ['normal'],
      allergens: ['gluten'],
      type: 'first',
      budget: 'low',
      url: EXTRA_URLS['Рассольник']
    },
    {
      title: 'Окрошка',
      kcalPer100g: 52,
      proteinPer100g: 2.5,
      fatPer100g: 2.0,
      carbsPer100g: 5.5,
      diet: ['normal'],
      allergens: ['dairy', 'eggs'],
      type: 'first',
      budget: 'medium',
      url: EXTRA_URLS['Окрошка']
    }
  ],
  lunchSecond: [
    {
      title: 'Тефтели в томатном соусе',
      kcalPer100g: 155,
      proteinPer100g: 11.0,
      fatPer100g: 9.0,
      carbsPer100g: 7.5,
      diet: ['normal'],
      allergens: ['eggs', 'gluten'],
      type: 'main',
      complete: false,
      budget: 'medium',
      url: EXTRA_URLS['Тефтели в томатном соусе']
    },
    {
      title: 'Ленивые голубцы',
      kcalPer100g: 142,
      proteinPer100g: 10.5,
      fatPer100g: 7.5,
      carbsPer100g: 9.0,
      diet: ['normal'],
      allergens: ['eggs'],
      type: 'main',
      complete: true,
      budget: 'medium',
      url: EXTRA_URLS['Ленивые голубцы']
    },
    {
      title: 'Свиная отбивная',
      kcalPer100g: 210,
      proteinPer100g: 18.0,
      fatPer100g: 14.0,
      carbsPer100g: 3.0,
      diet: ['normal'],
      allergens: ['eggs', 'gluten'],
      type: 'main',
      complete: false,
      budget: 'medium',
      url: EXTRA_URLS['Свиная отбивная']
    },
    {
      title: 'Котлета по-киевски',
      kcalPer100g: 245,
      proteinPer100g: 16.0,
      fatPer100g: 17.0,
      carbsPer100g: 8.0,
      diet: ['normal'],
      allergens: ['dairy', 'eggs', 'gluten'],
      type: 'main',
      complete: true,
      budget: 'high',
      url: EXTRA_URLS['Котлета по-киевски']
    },
    {
      title: 'Паста с томатным соусом',
      kcalPer100g: 135,
      proteinPer100g: 5.0,
      fatPer100g: 3.5,
      carbsPer100g: 22.0,
      diet: ['vegetarian', 'vegan'],
      allergens: ['gluten'],
      type: 'main',
      complete: true,
      budget: 'low',
      url: EXTRA_URLS['Паста с томатным соусом']
    },
    {
      title: 'Салат греческий',
      kcalPer100g: 95,
      proteinPer100g: 3.5,
      fatPer100g: 7.0,
      carbsPer100g: 5.0,
      diet: ['vegetarian'],
      allergens: ['dairy'],
      type: 'main',
      complete: true,
      budget: 'medium',
      url: EXTRA_URLS['Салат греческий']
    }
  ],
  dinnerMain: [
    {
      title: 'Куриная грудка на гриле',
      kcalPer100g: 165,
      proteinPer100g: 31.0,
      fatPer100g: 3.6,
      carbsPer100g: 0.0,
      diet: ['normal'],
      allergens: [],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Куриная грудка на гриле']
    },
    {
      title: 'Треска в духовке',
      kcalPer100g: 105,
      proteinPer100g: 22.0,
      fatPer100g: 1.5,
      carbsPer100g: 0.0,
      diet: ['normal'],
      allergens: ['fish'],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Треска в духовке']
    },
    {
      title: 'Индейка с овощами',
      kcalPer100g: 125,
      proteinPer100g: 20.0,
      fatPer100g: 4.0,
      carbsPer100g: 3.5,
      diet: ['normal'],
      allergens: [],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Индейка с овощами']
    },
    {
      title: 'Куриный стейк',
      kcalPer100g: 175,
      proteinPer100g: 27.0,
      fatPer100g: 7.0,
      carbsPer100g: 0.0,
      diet: ['normal'],
      allergens: [],
      type: 'main',
      budget: 'medium',
      url: EXTRA_URLS['Куриный стейк']
    },
    {
      title: 'Запечённая тыква',
      kcalPer100g: 55,
      proteinPer100g: 1.2,
      fatPer100g: 2.0,
      carbsPer100g: 8.5,
      diet: ['vegetarian', 'vegan', 'glutenfree'],
      allergens: [],
      type: 'main',
      budget: 'low',
      url: EXTRA_URLS['Запечённая тыква']
    }
  ],
  snack: [
    {
      title: 'Хлебец с творожным сыром',
      kcalPer100g: 210,
      proteinPer100g: 9.0,
      fatPer100g: 12.0,
      carbsPer100g: 16.0,
      diet: ['normal', 'vegetarian'],
      allergens: ['dairy', 'gluten'],
      type: 'snack',
      budget: 'low',
      url: EXTRA_URLS['Хлебец с творожным сыром']
    },
    {
      title: 'Тост с арахисовой пастой',
      kcalPer100g: 280,
      proteinPer100g: 10.0,
      fatPer100g: 18.0,
      carbsPer100g: 20.0,
      diet: ['vegetarian', 'vegan'],
      allergens: ['gluten', 'nuts'],
      type: 'snack',
      budget: 'medium',
      url: EXTRA_URLS['Тост с арахисовой пастой']
    },
    {
      title: 'Ролл с лососем',
      kcalPer100g: 185,
      proteinPer100g: 9.0,
      fatPer100g: 8.0,
      carbsPer100g: 20.0,
      diet: ['normal'],
      allergens: ['fish', 'gluten', 'eggs'],
      type: 'snack',
      budget: 'high',
      url: EXTRA_URLS['Ролл с лососем']
    }
  ],
  cheatMealRecipes: [
    {
      title: 'Чизбургер',
      kcalPer100g: 295,
      proteinPer100g: 14.0,
      fatPer100g: 17.0,
      carbsPer100g: 24.0,
      diet: ['normal'],
      allergens: ['dairy', 'gluten', 'eggs'],
      type: 'main',
      budget: 'high',
      url: 'https://eda.ru/recepty/cheeseburger'
    },
    {
      title: 'Наггетсы с соусом',
      kcalPer100g: 270,
      proteinPer100g: 13.0,
      fatPer100g: 16.0,
      carbsPer100g: 20.0,
      diet: ['normal'],
      allergens: ['gluten', 'eggs'],
      type: 'main',
      budget: 'high',
      url: 'https://eda.ru/recepty/naggetsy'
    }
  ]
};

function hasTitle(list, title) {
  return (list || []).some((r) => r.title === title);
}

function mergeUnique(list, additions) {
  const out = [...(list || [])];
  for (const recipe of additions) {
    if (!hasTitle(out, recipe.title)) out.push(recipe);
  }
  return out;
}

function applyExtraUrls(items) {
  return (items || []).map((r) => {
    if (r.url || !EXTRA_URLS[r.title]) return r;
    return { ...r, url: EXTRA_URLS[r.title] };
  });
}

function walkDb(db) {
  return {
    breakfast: applyExtraUrls(db.breakfast),
    lunch: {
      first: applyExtraUrls(db.lunch?.first),
      second: applyExtraUrls(db.lunch?.second)
    },
    dinner: {
      main: applyExtraUrls(db.dinner?.main),
      side: applyExtraUrls(db.dinner?.side)
    },
    snack: applyExtraUrls(db.snack)
  };
}

const bundle = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const db = bundle.recipesDB;

bundle.recipesDB = walkDb({
  breakfast: mergeUnique(db.breakfast, NEW_RECIPES.breakfast),
  lunch: {
    first: mergeUnique(db.lunch.first, NEW_RECIPES.lunchFirst),
    second: mergeUnique(db.lunch.second, NEW_RECIPES.lunchSecond)
  },
  dinner: {
    main: mergeUnique(db.dinner.main, NEW_RECIPES.dinnerMain),
    side: db.dinner.side
  },
  snack: mergeUnique(db.snack, NEW_RECIPES.snack)
});

bundle.calorieBoosters = applyExtraUrls(bundle.calorieBoosters);
bundle.cheatMealRecipes = mergeUnique(
  applyExtraUrls(bundle.cheatMealRecipes),
  NEW_RECIPES.cheatMealRecipes
);

fs.writeFileSync(jsonPath, JSON.stringify(bundle, null, 2));
console.log('Expanded recipes.json');
