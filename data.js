// 🍽️ Полная база рецептов с калориями и атрибутами
const recipesDB = {
  breakfast: [
    { title: "Омлет с сыром", kcalPer100g: 187, diet: ["normal", "vegetarian"], allergens: ["dairy", "eggs"], type: "main" },
    { title: "Гречневая каша", kcalPer100g: 110, diet: ["normal", "vegetarian", "vegan", "glutenfree"], allergens: [], type: "side" },
    { title: "Творог с ягодами", kcalPer100g: 120, diet: ["normal", "vegetarian"], allergens: ["dairy"], type: "main" },
    { title: "Бутерброд с авокадо", kcalPer100g: 210, diet: ["normal", "vegetarian", "vegan"], allergens: ["gluten"], type: "main" },
    { title: "Сырники", kcalPer100g: 160, diet: ["normal", "vegetarian"], allergens: ["dairy", "eggs"], type: "main" },
    { title: "Овсянка на молоке", kcalPer100g: 130, diet: ["normal", "vegetarian"], allergens: ["dairy"], type: "main" },
    { title: "Овсянка с бананом и орехами", kcalPer100g: 150, diet: ["vegetarian"], allergens: ["nuts"], type: "main" },
    { title: "Яйца пашот с тостом", kcalPer100g: 140, diet: ["normal"], allergens: ["eggs", "gluten"], type: "main" },
    { title: "Запечённый йогурт с мёдом", kcalPer100g: 110, diet: ["normal", "vegetarian"], allergens: ["dairy"], type: "main" },
    { title: "Чиа-пудинг", kcalPer100g: 135, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "main" },
    { title: "Смузи-боул", kcalPer100g: 95, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "main" },
    { title: "Тост с арахисовой пастой", kcalPer100g: 200, diet: ["vegetarian"], allergens: ["nuts", "gluten"], type: "main" }
  ],

  lunch: {
    first: [
      { title: "Борщ с мясом", kcalPer100g: 65, diet: ["normal"], allergens: [], type: "first" },
      { title: "Куриный суп", kcalPer100g: 70, diet: ["normal"], allergens: [], type: "first" },
      { title: "Щи", kcalPer100g: 55, diet: ["normal"], allergens: [], type: "first" },
      { title: "Суп-пюре из цветной капусты", kcalPer100g: 80, diet: ["vegetarian", "vegan"], allergens: ["dairy"], type: "first" },
      { title: "Луковый суп", kcalPer100g: 75, diet: ["vegetarian"], allergens: ["dairy"], type: "first" },
      { title: "Фасолевый суп", kcalPer100g: 90, diet: ["vegetarian", "vegan"], allergens: [], type: "first" },
      { title: "Рыбный суп", kcalPer100g: 85, diet: ["normal"], allergens: ["fish"], type: "first" },
      { title: "Томатный суп", kcalPer100g: 70, diet: ["vegetarian", "vegan"], allergens: [], type: "first" },
      { title: "Суп с фрикадельками", kcalPer100g: 80, diet: ["normal"], allergens: ["eggs"], type: "first" }
    ],
    second: [
      { title: "Гуляш", kcalPer100g: 120, diet: ["normal"], allergens: [], type: "main", complete: false },
      { title: "Куриные котлеты", kcalPer100g: 150, diet: ["normal"], allergens: ["eggs"], type: "main", complete: false },
      { title: "Рыба на пару", kcalPer100g: 110, diet: ["normal"], allergens: ["fish"], type: "main", complete: false },
      { title: "Тушёная фасоль", kcalPer100g: 130, diet: ["vegan"], allergens: [], type: "main", complete: false },
      { title: "Тофу с соусом терияки", kcalPer100g: 145, diet: ["vegetarian", "vegan"], allergens: ["soy", "gluten"], type: "main", complete: false },
      { title: "Чикен-каре", kcalPer100g: 135, diet: ["normal"], allergens: ["dairy"], type: "main", complete: false },
      { title: "Гуляш с картофелем", kcalPer100g: 160, diet: ["normal"], allergens: [], type: "main", complete: true },
      { title: "Плов", kcalPer100g: 140, diet: ["normal", "vegetarian"], allergens: [], type: "main", complete: true },
      { title: "Лазанья", kcalPer100g: 180, diet: ["normal", "vegetarian"], allergens: ["dairy", "eggs", "gluten"], type: "main", complete: true },
      { title: "Макароны по-флотски", kcalPer100g: 155, diet: ["normal"], allergens: ["gluten"], type: "main", complete: true },
      { title: "Паста с томатами", kcalPer100g: 140, diet: ["normal", "vegetarian"], allergens: ["gluten"], type: "side", complete: true },
      { title: "Картофель по-деревенски", kcalPer100g: 125, diet: ["vegetarian"], allergens: [], type: "side", complete: true },
      { title: "Кускус с овощами", kcalPer100g: 110, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "side", complete: true }
    ]
  },

  dinner: {
    main: [
      { title: "Запечённая курица", kcalPer100g: 165, diet: ["normal"], allergens: [], type: "main" },
      { title: "Рыба на пару", kcalPer100g: 110, diet: ["normal"], allergens: ["fish"], type: "main" },
      { title: "Тушёные овощи", kcalPer100g: 80, diet: ["vegetarian", "vegan"], allergens: [], type: "main" },
      { title: "Овощное рагу", kcalPer100g: 85, diet: ["vegetarian", "vegan"], allergens: [], type: "main" },
      { title: "Тушеная индейка", kcalPer100g: 150, diet: ["normal"], allergens: [], type: "main" },
      { title: "Запечённый лосось", kcalPer100g: 180, diet: ["normal"], allergens: ["fish"], type: "main" },
      { title: "Тофу в кунжутном соусе", kcalPer100g: 140, diet: ["vegetarian", "vegan"], allergens: ["sesame", "soy"], type: "main" },
      { title: "Кабачковые оладьи", kcalPer100g: 110, diet: ["vegetarian"], allergens: ["eggs", "dairy"], type: "main" },
      { title: "Овсяные котлеты", kcalPer100g: 120, diet: ["vegetarian", "vegan"], allergens: [], type: "main" },
      { title: "Гречка с грибами", kcalPer100g: 105, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "main" }
    ],
    side: [
      { title: "Картофельное пюре", kcalPer100g: 90, diet: ["vegetarian"], allergens: ["dairy"], type: "side" },
      { title: "Гречка", kcalPer100g: 110, diet: ["normal", "vegetarian", "vegan", "glutenfree"], allergens: [], type: "side" },
      { title: "Рис", kcalPer100g: 115, diet: ["normal", "vegetarian", "vegan", "glutenfree"], allergens: [], type: "side" },
      { title: "Тушёная капуста", kcalPer100g: 60, diet: ["vegetarian", "vegan"], allergens: [], type: "side" },
      { title: "Запечённый картофель", kcalPer100g: 85, diet: ["vegetarian", "vegan"], allergens: [], type: "side" },
      { title: "Квашеная капуста", kcalPer100g: 25, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "side" },
      { title: "Салат из свежих овощей", kcalPer100g: 45, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "side" },
      { title: "Салат Цезарь (без куриного)", kcalPer100g: 120, diet: ["vegetarian"], allergens: ["dairy", "eggs", "gluten"], type: "side" },
      { title: "Табуле", kcalPer100g: 100, diet: ["vegetarian", "vegan"], allergens: ["gluten"], type: "side" },
      { title: "Брокколи на пару", kcalPer100g: 35, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "side" }
    ]
  },

  snack: [
    { title: "Яблоко", kcalPer100g: 52, diet: ["normal", "vegetarian", "vegan", "glutenfree"], allergens: [], type: "snack" },
    { title: "Греческий йогурт", kcalPer100g: 90, diet: ["normal", "vegetarian"], allergens: ["dairy"], type: "snack" },
    { title: "Орехи (миндаль)", kcalPer100g: 575, diet: ["vegetarian", "vegan"], allergens: ["nuts"], type: "snack" },
    { title: "Банан", kcalPer100g: 89, diet: ["normal", "vegetarian", "vegan", "glutenfree"], allergens: [], type: "snack" },
    { title: "Хумус с овощами", kcalPer100g: 160, diet: ["vegetarian", "vegan"], allergens: [], type: "snack" },
    { title: "Протеиновый батончик", kcalPer100g: 400, diet: ["normal", "vegetarian"], allergens: ["nuts", "dairy", "gluten"], type: "snack" },
    { title: "Сырные кубики", kcalPer100g: 300, diet: ["normal", "vegetarian"], allergens: ["dairy"], type: "snack" },
    { title: "Авокадо", kcalPer100g: 160, diet: ["vegetarian", "vegan"], allergens: [], type: "snack" },
    { title: "Сухофрукты", kcalPer100g: 280, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "snack" },
    { title: "Варёное яйцо", kcalPer100g: 155, diet: ["normal", "vegetarian"], allergens: ["eggs"], type: "snack" },
    { title: "Огурец с солью", kcalPer100g: 12, diet: ["vegetarian", "vegan", "glutenfree"], allergens: [], type: "snack" },
    { title: "Кефир 1%", kcalPer100g: 45, diet: ["normal", "vegetarian"], allergens: ["dairy"], type: "snack" },
    { title: "Гранола без сахара", kcalPer100g: 380, diet: ["vegetarian"], allergens: ["gluten", "nuts"], type: "snack" }
  ]
};

// 🔋 Калорийные добавки
const calorieBoosters = [
  { title: "Кусочек чёрного хлеба", kcalPer100g: 250, diet: ["normal", "vegetarian"], allergens: ["gluten"] },
  { title: "Авокадо", kcalPer100g: 160, diet: ["normal", "vegetarian", "vegan"], allergens: [] },
  { title: "Сыр", kcalPer100g: 400, diet: ["normal", "vegetarian"], allergens: ["dairy"] },
  { title: "Орехи (горсть)", kcalPer100g: 600, diet: ["vegetarian", "vegan"], allergens: ["nuts"] },
  { title: "Оливковое масло (1 ст. л.)", kcalPer100g: 884, diet: ["vegetarian", "vegan"], allergens: [] },
  { title: "Мед (1 ч. л.)", kcalPer100g: 304, diet: ["vegetarian"], allergens: [] },
  { title: "Гуакамоле", kcalPer100g: 180, diet: ["vegetarian", "vegan"], allergens: [] },
  { title: "Сыр фета", kcalPer100g: 264, diet: ["vegetarian"], allergens: ["dairy"] }
];

// Emoji map
const emojiMap = {
  омлет: '🍳', каша: '🥣', творог: '🧀', авокадо: '🥑',
  сырники: '🟡', борщ: '🍲', суп: '🥘', щи: '🥗', капуста: '🥬',
  гуляш: '🍖', паста: '🍝', рис: '🍚', овощи: '🥦', запеканка: '🥧',
  рагу: '🥘', курица: '🍗', рыба: '🐟', фасоль: '🫘', пюре: '🥔',
  гречка: '🌾', хумус: '🥒', яблоко: '🍎', банан: '🍌', йогурт: '🥛', орехи: '🥜',
  хлеб: '🍞', масло: '🧈', сыр: '🧀', салат: '🥗', тост: '🥪', котлета: '🍔',
  плов: '🍛', лазанья: '🍝', кукуруза: '🌽', картофель: '🥔', лосось: '🐟',
  тофу: '🥩', оладьи: '🥞', кефир: '🥛', гранола: '🥣', батончик: '🍫'
};

// Кэшированные версии рецептов
const cachedRecipes = {
  breakfast: {},
  lunch: {
    incomplete: {},
    complete: {}
  },
  dinner: {
    main: {},
    side: {}
  },
  snack: {}
};

function getCacheKey(diet, allergies) {
  return `${diet}_${[...allergies].sort().join('-')}`;
}

function cacheAndFilter(array, diet, allergies) {
  const key = getCacheKey(diet, allergies);
  if (!cachedRecipes[array]?.[key]) {
    cachedRecipes[array][key] = recipesDB[array].filter(r => isRecipeAllowed(r, diet, allergies));
  }
  return cachedRecipes[array][key];
}