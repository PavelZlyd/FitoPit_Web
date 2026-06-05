// 🍽️ Полная база рецептов с калориями и БЖУ
const recipesDB = {
  breakfast: [
    {
      title: "Омлет с сыром",
      kcalPer100g: 187,
      proteinPer100g: 12.0,
      fatPer100g: 14.0,
      carbsPer100g: 1.5,
      diet: ["normal", "vegetarian"],
      allergens: ["dairy", "eggs"],
      type: "main",
      budget: "medium"
    },
    {
      title: "Омлет без масла",
      kcalPer100g: 140,
      proteinPer100g: 13.0,
      fatPer100g: 8.0,
      carbsPer100g: 1.0,
      diet: ["normal", "vegetarian"],
      allergens: ["eggs"],
      type: "main",
      budget: "low"
    },
    {
      title: "Гречневая каша на воде",
      kcalPer100g: 90,
      proteinPer100g: 3.0,
      fatPer100g: 0.5,
      carbsPer100g: 18.0,
      diet: ["normal", "vegetarian", "vegan", "glutenfree"],
      allergens: [],
      type: "side",
      budget: "low"
    },
    {
      title: "Гречневая каша на молоке",
      kcalPer100g: 110,
      proteinPer100g: 3.5,
      fatPer100g: 1.0,
      carbsPer100g: 20.0,
      diet: ["normal", "vegetarian"],
      allergens: ["dairy"],
      type: "side",
      budget: "medium"
    },
    {
      title: "Творог с ягодами",
      kcalPer100g: 120,
      proteinPer100g: 10.0,
      fatPer100g: 5.0,
      carbsPer100g: 8.0,
      diet: ["normal", "vegetarian"],
      allergens: ["dairy"],
      type: "main",
      budget: "medium"
    },
    {
      title: "Бутерброд с авокадо",
      kcalPer100g: 210,
      proteinPer100g: 4.0,
      fatPer100g: 16.0,
      carbsPer100g: 12.0,
      diet: ["normal", "vegetarian", "vegan"],
      allergens: ["gluten"],
      type: "main",
      budget: "high"
    },
    {
      title: "Сырники",
      kcalPer100g: 160,
      proteinPer100g: 11.0,
      fatPer100g: 8.0,
      carbsPer100g: 10.0,
      diet: ["normal", "vegetarian"],
      allergens: ["dairy", "eggs"],
      type: "main",
      budget: "medium"
    },
    {
      title: "Овсянка на воде",
      kcalPer100g: 65,
      proteinPer100g: 2.5,
      fatPer100g: 1.0,
      carbsPer100g: 12.0,
      diet: ["normal", "vegetarian", "vegan", "glutenfree"],
      allergens: [],
      type: "main",
      budget: "low"
    },
    {
      title: "Овсянка на молоке",
      kcalPer100g: 130,
      proteinPer100g: 4.5,
      fatPer100g: 3.2,
      carbsPer100g: 18.0,
      diet: ["normal", "vegetarian"],
      allergens: ["dairy"],
      type: "main",
      budget: "medium"
    },
    {
      title: "Овсянка с бананом и орехами",
      kcalPer100g: 150,
      proteinPer100g: 5.0,
      fatPer100g: 7.0,
      carbsPer100g: 19.0,
      diet: ["vegetarian"],
      allergens: ["nuts"],
      type: "main",
      budget: "high"
    },
    {
      title: "Яйца пашот с тостом",
      kcalPer100g: 140,
      proteinPer100g: 9.0,
      fatPer100g: 8.0,
      carbsPer100g: 8.5,
      diet: ["normal"],
      allergens: ["eggs", "gluten"],
      type: "main",
      budget: "medium"
    },
    {
      title: "Чиа-пудинг",
      kcalPer100g: 135,
      proteinPer100g: 5.5,
      fatPer100g: 8.0,
      carbsPer100g: 12.0,
      diet: ["vegetarian", "vegan", "glutenfree"],
      allergens: [],
      type: "main",
      budget: "high"
    },
    {
      title: "Смузи-боул",
      kcalPer100g: 95,
      proteinPer100g: 2.0,
      fatPer100g: 3.5,
      carbsPer100g: 15.0,
      diet: ["vegetarian", "vegan", "glutenfree"],
      allergens: [],
      type: "main",
      budget: "medium"
    },
    {
      title: "Тост с арахисовой пастой",
      kcalPer100g: 200,
      proteinPer100g: 7.0,
      fatPer100g: 14.0,
      carbsPer100g: 13.0,
      diet: ["vegetarian"],
      allergens: ["nuts", "gluten"],
      type: "main",
      budget: "high"
    }
  ],

  lunch: {
    first: [
      {
        title: "Борщ с мясом",
        kcalPer100g: 65,
        proteinPer100g: 3.0,
        fatPer100g: 2.5,
        carbsPer100g: 7.0,
        diet: ["normal"],
        allergens: [],
        type: "first",
        budget: "medium"
      },
      {
        title: "Куриный суп",
        kcalPer100g: 70,
        proteinPer100g: 5.0,
        fatPer100g: 3.0,
        carbsPer100g: 5.0,
        diet: ["normal"],
        allergens: [],
        type: "first",
        budget: "medium"
      },
      {
        title: "Щи",
        kcalPer100g: 55,
        proteinPer100g: 2.0,
        fatPer100g: 2.0,
        carbsPer100g: 6.0,
        diet: ["normal"],
        allergens: [],
        type: "first",
        budget: "low"
      },
      {
        title: "Суп-пюре из цветной капусты",
        kcalPer100g: 80,
        proteinPer100g: 3.5,
        fatPer100g: 4.0,
        carbsPer100g: 7.5,
        diet: ["vegetarian"],
        allergens: ["dairy"],
        type: "first",
        budget: "medium"
      },
      {
        title: "Луковый суп",
        kcalPer100g: 75,
        proteinPer100g: 3.0,
        fatPer100g: 4.5,
        carbsPer100g: 7.0,
        diet: ["vegetarian"],
        allergens: ["dairy"],
        type: "first",
        budget: "medium"
      },
      {
        title: "Фасолевый суп",
        kcalPer100g: 90,
        proteinPer100g: 6.0,
        fatPer100g: 2.0,
        carbsPer100g: 12.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "first",
        budget: "low"
      },
      {
        title: "Суп с сайрой",
        kcalPer100g: 82,
        proteinPer100g: 7.5,
        fatPer100g: 3.5,
        carbsPer100g: 4.0,
        diet: ["normal"],
        allergens: ["fish"],
        type: "first",
        budget: "low"
      },
      {
        title: "Уха",
        kcalPer100g: 88,
        proteinPer100g: 8.5,
        fatPer100g: 4.5,
        carbsPer100g: 3.5,
        diet: ["normal"],
        allergens: ["fish"],
        type: "first",
        budget: "medium"
      },
      {
        title: "Томатный суп",
        kcalPer100g: 70,
        proteinPer100g: 2.0,
        fatPer100g: 3.0,
        carbsPer100g: 8.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "first",
        budget: "low"
      }
    ],
    second: [
      {
        title: "Гуляш",
        kcalPer100g: 120,
        proteinPer100g: 14.0,
        fatPer100g: 6.0,
        carbsPer100g: 3.0,
        diet: ["normal"],
        allergens: [],
        type: "main",
        complete: false,
        budget: "medium"
      },
      {
        title: "Куриные котлеты на пару",
        kcalPer100g: 130,
        proteinPer100g: 16.0,
        fatPer100g: 6.0,
        carbsPer100g: 5.0,
        diet: ["normal"],
        allergens: ["eggs"],
        type: "main",
        complete: false,
        budget: "low"
      },
      {
        title: "Куриные котлеты жареные",
        kcalPer100g: 180,
        proteinPer100g: 16.0,
        fatPer100g: 12.0,
        carbsPer100g: 5.0,
        diet: ["normal"],
        allergens: ["eggs"],
        type: "main",
        complete: false,
        budget: "high"
      },
      {
        title: "Рыба на пару",
        kcalPer100g: 110,
        proteinPer100g: 20.0,
        fatPer100g: 2.5,
        carbsPer100g: 0.0,
        diet: ["normal"],
        allergens: ["fish"],
        type: "main",
        complete: false,
        budget: "medium"
      },
      {
        title: "Тушёная фасоль",
        kcalPer100g: 130,
        proteinPer100g: 8.0,
        fatPer100g: 2.0,
        carbsPer100g: 20.0,
        diet: ["vegan"],
        allergens: [],
        type: "main",
        complete: false,
        budget: "low"
      },
      {
        title: "Тофу с соусом терияки",
        kcalPer100g: 145,
        proteinPer100g: 12.0,
        fatPer100g: 8.0,
        carbsPer100g: 7.0,
        diet: ["vegetarian", "vegan"],
        allergens: ["soy", "gluten"],
        type: "main",
        complete: false,
        budget: "medium"
      },
      {
        title: "Чикен-каре",
        kcalPer100g: 135,
        proteinPer100g: 13.0,
        fatPer100g: 6.0,
        carbsPer100g: 8.0,
        diet: ["normal"],
        allergens: ["dairy"],
        type: "main",
        complete: true,
        budget: "medium"
      },
      {
        title: "Гуляш с картофелем",
        kcalPer100g: 160,
        proteinPer100g: 14.0,
        fatPer100g: 7.0,
        carbsPer100g: 10.0,
        diet: ["normal"],
        allergens: [],
        type: "main",
        complete: true,
        budget: "medium"
      },
      {
        title: "Плов",
        kcalPer100g: 140,
        proteinPer100g: 5.0,
        fatPer100g: 6.0,
        carbsPer100g: 16.0,
        diet: ["normal", "vegetarian"],
        allergens: [],
        type: "main",
        complete: true,
        budget: "medium"
      },
      {
        title: "Лазанья",
        kcalPer100g: 180,
        proteinPer100g: 12.0,
        fatPer100g: 10.0,
        carbsPer100g: 11.0,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy", "eggs", "gluten"],
        type: "main",
        complete: true,
        budget: "high"
      },
      {
        title: "Макароны по-флотски",
        kcalPer100g: 155,
        proteinPer100g: 10.0,
        fatPer100g: 7.0,
        carbsPer100g: 14.0,
        diet: ["normal"],
        allergens: ["gluten"],
        type: "main",
        complete: true,
        budget: "medium"
      },
      {
        title: "Паста с томатами",
        kcalPer100g: 140,
        proteinPer100g: 5.0,
        fatPer100g: 6.0,
        carbsPer100g: 16.0,
        diet: ["normal", "vegetarian"],
        allergens: ["gluten"],
        type: "side",
        complete: true,
        budget: "medium"
      },
      {
        title: "Картофель по-деревенски",
        kcalPer100g: 125,
        proteinPer100g: 3.0,
        fatPer100g: 5.0,
        carbsPer100g: 17.0,
        diet: ["vegetarian"],
        allergens: [],
        type: "side",
        complete: true,
        budget: "medium"
      },
      {
        title: "Кускус с овощами",
        kcalPer100g: 110,
        proteinPer100g: 4.0,
        fatPer100g: 1.5,
        carbsPer100g: 20.0,
        diet: ["vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "side",
        complete: true,
        budget: "low"
      }
    ]
  },

  dinner: {
    main: [
      {
        title: "Запечённая курица",
        kcalPer100g: 165,
        proteinPer100g: 28.0,
        fatPer100g: 7.0,
        carbsPer100g: 0.0,
        diet: ["normal"],
        allergens: [],
        type: "main",
        budget: "medium"
      },
      {
        title: "Рыба на пару",
        kcalPer100g: 110,
        proteinPer100g: 20.0,
        fatPer100g: 2.5,
        carbsPer100g: 0.0,
        diet: ["normal"],
        allergens: ["fish"],
        type: "main",
        budget: "medium"
      },
      {
        title: "Тушёные овощи",
        kcalPer100g: 80,
        proteinPer100g: 2.0,
        fatPer100g: 5.0,
        carbsPer100g: 7.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "main",
        budget: "low"
      },
      {
        title: "Овощное рагу",
        kcalPer100g: 85,
        proteinPer100g: 2.5,
        fatPer100g: 5.5,
        carbsPer100g: 8.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "main",
        budget: "low"
      },
      {
        title: "Тушеная индейка",
        kcalPer100g: 150,
        proteinPer100g: 24.0,
        fatPer100g: 6.0,
        carbsPer100g: 0.0,
        diet: ["normal"],
        allergens: [],
        type: "main",
        budget: "medium"
      },
      {
        title: "Запечённый лосось",
        kcalPer100g: 180,
        proteinPer100g: 20.0,
        fatPer100g: 11.0,
        carbsPer100g: 0.0,
        diet: ["normal"],
        allergens: ["fish"],
        type: "main",
        budget: "high"
      },
      {
        title: "Тофу в кунжутном соусе",
        kcalPer100g: 140,
        proteinPer100g: 11.0,
        fatPer100g: 9.0,
        carbsPer100g: 5.0,
        diet: ["vegetarian", "vegan"],
        allergens: ["sesame", "soy"],
        type: "main",
        budget: "medium"
      },
      {
        title: "Кабачковые оладьи",
        kcalPer100g: 110,
        proteinPer100g: 4.0,
        fatPer100g: 6.0,
        carbsPer100g: 10.0,
        diet: ["vegetarian"],
        allergens: ["eggs", "dairy"],
        type: "main",
        budget: "medium"
      },
      {
        title: "Овсяные котлеты",
        kcalPer100g: 120,
        proteinPer100g: 6.0,
        fatPer100g: 5.0,
        carbsPer100g: 13.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "main",
        budget: "low"
      },
      {
        title: "Гречка с грибами",
        kcalPer100g: 105,
        proteinPer100g: 4.5,
        fatPer100g: 4.0,
        carbsPer100g: 12.0,
        diet: ["vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "main",
        budget: "medium"
      }
    ],
    side: [
      {
        title: "Картофельное пюре",
        kcalPer100g: 90,
        proteinPer100g: 2.0,
        fatPer100g: 3.0,
        carbsPer100g: 14.0,
        diet: ["vegetarian"],
        allergens: ["dairy"],
        type: "side",
        budget: "medium"
      },
      {
        title: "Гречка",
        kcalPer100g: 110,
        proteinPer100g: 3.5,
        fatPer100g: 1.0,
        carbsPer100g: 20.0,
        diet: ["normal", "vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "side",
        budget: "low"
      },
      {
        title: "Рис",
        kcalPer100g: 115,
        proteinPer100g: 2.7,
        fatPer100g: 0.3,
        carbsPer100g: 25.5,
        diet: ["normal", "vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "side",
        budget: "low"
      },
      {
        title: "Тушёная капуста",
        kcalPer100g: 60,
        proteinPer100g: 1.5,
        fatPer100g: 4.0,
        carbsPer100g: 5.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "side",
        budget: "low"
      },
      {
        title: "Запечённый картофель",
        kcalPer100g: 85,
        proteinPer100g: 2.0,
        fatPer100g: 0.1,
        carbsPer100g: 19.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        type: "side",
        budget: "low"
      },
      {
        title: "Квашеная капуста",
        kcalPer100g: 25,
        proteinPer100g: 1.0,
        fatPer100g: 0.2,
        carbsPer100g: 5.5,
        diet: ["vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "side",
        budget: "low"
      },
      {
        title: "Салат из свежих овощей",
        kcalPer100g: 45,
        proteinPer100g: 1.2,
        fatPer100g: 2.0,
        carbsPer100g: 6.0,
        diet: ["vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "side",
        budget: "low"
      },
      {
        title: "Салат Цезарь (без куриного)",
        kcalPer100g: 120,
        proteinPer100g: 4.0,
        fatPer100g: 9.0,
        carbsPer100g: 7.0,
        diet: ["vegetarian"],
        allergens: ["dairy", "eggs", "gluten"],
        type: "side",
        budget: "high"
      },
      {
        title: "Табуле",
        kcalPer100g: 100,
        proteinPer100g: 3.0,
        fatPer100g: 2.5,
        carbsPer100g: 17.0,
        diet: ["vegetarian", "vegan"],
        allergens: ["gluten"],
        type: "side",
        budget: "medium"
      },
      {
        title: "Брокколи на пару",
        kcalPer100g: 35,
        proteinPer100g: 2.8,
        fatPer100g: 0.4,
        carbsPer100g: 7.0,
        diet: ["vegetarian", "vegan", "glutenfree"],
        allergens: [],
        type: "side",
        budget: "low"
      }
    ]
  },

  snack: [
        {
          title: "Банан",
          kcalPer100g: 89,
          proteinPer100g: 1.1,
          fatPer100g: 0.3,
          carbsPer100g: 23.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "low"
        },
        {
          title: "Яблоко",
          kcalPer100g: 52,
          proteinPer100g: 0.3,
          fatPer100g: 0.2,
          carbsPer100g: 14.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "low"
        },
        {
          title: "Груша",
          kcalPer100g: 57,
          proteinPer100g: 0.4,
          fatPer100g: 0.1,
          carbsPer100g: 15.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "low"
        },
        {
          title: "Апельсин",
          kcalPer100g: 47,
          proteinPer100g: 0.9,
          fatPer100g: 0.1,
          carbsPer100g: 12.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "low"
        },
        {
          title: "Мандарин",
          kcalPer100g: 53,
          proteinPer100g: 0.8,
          fatPer100g: 0.3,
          carbsPer100g: 13.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "low"
        },
        {
          title: "Киви",
          kcalPer100g: 61,
          proteinPer100g: 1.1,
          fatPer100g: 0.5,
          carbsPer100g: 15.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "medium"
        },
        {
          title: "Ягоды свежие",
          kcalPer100g: 57,
          proteinPer100g: 0.7,
          fatPer100g: 0.3,
          carbsPer100g: 14.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "medium"
        },
        {
          title: "Виноград",
          kcalPer100g: 69,
          proteinPer100g: 0.7,
          fatPer100g: 0.2,
          carbsPer100g: 18.0,
          diet: ["normal", "vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "medium"
        },
        {
          title: "Хумус с овощами",
          kcalPer100g: 160,
          proteinPer100g: 6.0,
          fatPer100g: 10.0,
          carbsPer100g: 12.0,
          diet: ["vegetarian", "vegan"],
          allergens: [],
          type: "snack",
          budget: "medium"
        },
        {
          title: "Протеиновый батончик",
          kcalPer100g: 400,
          proteinPer100g: 25.0,
          fatPer100g: 15.0,
          carbsPer100g: 40.0,
          diet: ["normal", "vegetarian"],
          allergens: ["nuts", "dairy", "gluten"],
          type: "snack",
          budget: "high"
        },
        {
          title: "Сырные кубики",
          kcalPer100g: 300,
          proteinPer100g: 20.0,
          fatPer100g: 25.0,
          carbsPer100g: 2.0,
          diet: ["normal", "vegetarian"],
          allergens: ["dairy"],
          type: "snack",
          budget: "high"
        },
        {
          title: "Авокадо",
          kcalPer100g: 160,
          proteinPer100g: 2.0,
          fatPer100g: 15.0,
          carbsPer100g: 9.0,
          diet: ["vegetarian", "vegan"],
          allergens: [],
          type: "snack",
          budget: "high"
        },
        {
          title: "Сухофрукты",
          kcalPer100g: 280,
          proteinPer100g: 2.5,
          fatPer100g: 0.5,
          carbsPer100g: 70.0,
          diet: ["vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "medium"
        },
        {
          title: "Варёное яйцо",
          kcalPer100g: 155,
          proteinPer100g: 13.0,
          fatPer100g: 11.0,
          carbsPer100g: 1.1,
          diet: ["normal", "vegetarian"],
          allergens: ["eggs"],
          type: "snack",
          budget: "low"
        },
        {
          title: "Огурец с солью",
          kcalPer100g: 12,
          proteinPer100g: 0.7,
          fatPer100g: 0.1,
          carbsPer100g: 2.2,
          diet: ["vegetarian", "vegan", "glutenfree"],
          allergens: [],
          type: "snack",
          budget: "low"
        },
        {
          title: "Кефир 1%",
          kcalPer100g: 45,
          proteinPer100g: 3.0,
          fatPer100g: 1.0,
          carbsPer100g: 5.0,
          diet: ["normal", "vegetarian"],
          allergens: ["dairy"],
          type: "snack",
          budget: "low"
        },
        {
          title: "Гранола без сахара",
          kcalPer100g: 380,
          proteinPer100g: 10.0,
          fatPer100g: 12.0,
          carbsPer100g: 60.0,
          diet: ["vegetarian"],
          allergens: ["gluten", "nuts"],
          type: "snack",
          budget: "medium"
        }
      ]
    };

    // 🔋 Калорийные добавки (теперь тоже по бюджету)
    const calorieBoosters = [
      {
        title: "Кусочек чёрного хлеба",
        kcalPer100g: 250,
        proteinPer100g: 8.0,
        fatPer100g: 3.0,
        carbsPer100g: 48.0,
        diet: ["normal", "vegetarian"],
        allergens: ["gluten"],
        budget: "low"
      },
      {
        title: "Авокадо",
        kcalPer100g: 160,
        proteinPer100g: 2.0,
        fatPer100g: 15.0,
        carbsPer100g: 9.0,
        diet: ["normal", "vegetarian", "vegan"],
        allergens: [],
        budget: "high"
      },
      {
        title: "Сыр",
        kcalPer100g: 400,
        proteinPer100g: 25.0,
        fatPer100g: 35.0,
        carbsPer100g: 1.5,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy"],
        budget: "high"
      },
      {
        title: "Орехи (горсть)",
        kcalPer100g: 600,
        proteinPer100g: 20.0,
        fatPer100g: 50.0,
        carbsPer100g: 20.0,
        diet: ["vegetarian", "vegan"],
        allergens: ["nuts"],
        budget: "high"
      },
      {
        title: "Оливковое масло (1 ст. л.)",
        kcalPer100g: 884,
        proteinPer100g: 0.0,
        fatPer100g: 100.0,
        carbsPer100g: 0.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        budget: "high"
      },
      {
        title: "Мед (1 ч. л.)",
        kcalPer100g: 304,
        proteinPer100g: 0.3,
        fatPer100g: 0.0,
        carbsPer100g: 80.0,
        diet: ["vegetarian"],
        allergens: [],
        budget: "medium"
      },
      {
        title: "Гуакамоле",
        kcalPer100g: 180,
        proteinPer100g: 2.0,
        fatPer100g: 16.0,
        carbsPer100g: 8.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        budget: "medium"
      },
      {
        title: "Сыр фета",
        kcalPer100g: 264,
        proteinPer100g: 14.0,
        fatPer100g: 21.0,
        carbsPer100g: 3.0,
        diet: ["vegetarian"],
        allergens: ["dairy"],
        budget: "high"
      },
      {
        title: "Хлебец ржаной",
        kcalPer100g: 280,
        proteinPer100g: 10.0,
        fatPer100g: 2.0,
        carbsPer100g: 55.0,
        diet: ["normal", "vegetarian"],
        allergens: ["gluten"],
        budget: "low"
      },
      {
        title: "Банан",
        kcalPer100g: 89,
        proteinPer100g: 1.1,
        fatPer100g: 0.3,
        carbsPer100g: 23.0,
        diet: ["normal", "vegetarian", "vegan"],
        allergens: [],
        budget: "low"
      },
      {
        title: "Яблоко",
        kcalPer100g: 52,
        proteinPer100g: 0.3,
        fatPer100g: 0.2,
        carbsPer100g: 14.0,
        diet: ["normal", "vegetarian", "vegan", "glutenfree"],
        allergens: [],
        budget: "low"
      },
      {
        title: "Груша",
        kcalPer100g: 57,
        proteinPer100g: 0.4,
        fatPer100g: 0.1,
        carbsPer100g: 15.0,
        diet: ["normal", "vegetarian", "vegan", "glutenfree"],
        allergens: [],
        budget: "low"
      },
      {
        title: "Кефир 2.5%",
        kcalPer100g: 53,
        proteinPer100g: 3.0,
        fatPer100g: 2.5,
        carbsPer100g: 4.0,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy"],
        budget: "low"
      },
      {
        title: "Творог 5%",
        kcalPer100g: 121,
        proteinPer100g: 17.0,
        fatPer100g: 5.0,
        carbsPer100g: 3.0,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy"],
        budget: "medium"
      },
      {
        title: "Сметана 15%",
        kcalPer100g: 160,
        proteinPer100g: 2.5,
        fatPer100g: 15.0,
        carbsPer100g: 3.0,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy"],
        budget: "medium"
      },
      {
        title: "Сливочное масло",
        kcalPer100g: 748,
        proteinPer100g: 0.5,
        fatPer100g: 82.0,
        carbsPer100g: 0.8,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy"],
        budget: "medium"
      },
      {
        title: "Сухофрукты (горсть)",
        kcalPer100g: 280,
        proteinPer100g: 2.5,
        fatPer100g: 0.5,
        carbsPer100g: 70.0,
        diet: ["normal", "vegetarian", "vegan"],
        allergens: [],
        budget: "low"
      },
      {
        title: "Хумус",
        kcalPer100g: 166,
        proteinPer100g: 8.0,
        fatPer100g: 9.6,
        carbsPer100g: 14.0,
        diet: ["vegetarian", "vegan"],
        allergens: [],
        budget: "medium"
      }
    ];

    // 🍽️ Читмил-рецепты — высококалорийные и вкусные
    const cheatMealRecipes = [
      {
        title: "Бургер с картошкой",
        kcalPer100g: 320,
        proteinPer100g: 12.0,
        fatPer100g: 18.0,
        carbsPer100g: 30.0,
        diet: ["normal"],
        allergens: ["gluten", "dairy", "eggs"],
        type: "main",
        budget: "high"
      },
      {
        title: "Пицца",
        kcalPer100g: 280,
        proteinPer100g: 11.0,
        fatPer100g: 12.0,
        carbsPer100g: 32.0,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy", "gluten"],
        type: "main",
        budget: "high"
      },
      {
        title: "Паста карбонара",
        kcalPer100g: 310,
        proteinPer100g: 13.0,
        fatPer100g: 16.0,
        carbsPer100g: 30.0,
        diet: ["normal"],
        allergens: ["dairy", "eggs", "gluten"],
        type: "main",
        budget: "high"
      },
      {
        title: "Торт",
        kcalPer100g: 380,
        proteinPer100g: 6.0,
        fatPer100g: 20.0,
        carbsPer100g: 45.0,
        diet: ["normal"],
        allergens: ["dairy", "eggs", "gluten"],
        type: "dessert",
        budget: "high"
      },
      {
        title: "Мороженое",
        kcalPer100g: 207,
        proteinPer100g: 3.5,
        fatPer100g: 11.0,
        carbsPer100g: 24.0,
        diet: ["normal", "vegetarian"],
        allergens: ["dairy"],
        type: "dessert",
        budget: "medium"
      }
    ];

    // Emoji map (глобально для UI и генератора)
    const emojiMap = {
      омлет: '🍳', каша: '🥣', творог: '🧀', авокадо: '🥑',
      сырники: '🟡', борщ: '🍲', суп: '🥘', щи: '🥗', капуста: '🥬', уха: '🐟', сайр: '🐟',
      гуляш: '🍖', паста: '🍝', рис: '🍚', овощи: '🥦', запеканка: '🥧',
      рагу: '🥘', курица: '🍗', рыба: '🐟', фасоль: '🫘', пюре: '🥔',
      гречка: '🌾', хумус: '🥒', яблоко: '🍎', банан: '🍌', груша: '🍐', апельсин: '🍊',
      мандарин: '🍊', киви: '🥝', ягод: '🫐', виноград: '🍇', йогурт: '🥛', орехи: '🥜',
      хлеб: '🍞', масло: '🧈', сыр: '🧀', салат: '🥗', тост: '🥪', котлета: '🍔',
      плов: '🍛', лазанья: '🍝', кукуруза: '🌽', картофель: '🥔', лосось: '🐟',
      тофу: '🥩', оладьи: '🥞', кефир: '🥛', гранола: '🥣', батончик: '🍫',
      бургер: '🍔', пицца: '🍕', тортик: '🍰', мороженое: '🍦', карбонара: '🍝'
    };
    if (typeof window !== 'undefined') window.emojiMap = emojiMap;