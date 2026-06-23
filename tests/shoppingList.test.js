import { describe, expect, it } from 'vitest';
import {
  buildShoppingList,
  planHasIngredientData,
  roundShoppingWeight,
  SHOPPING_MODES
} from '../shoppingList.js';

// Новый формат: ингредиенты в абсолютных граммах сырого продукта + выход блюда.
const samplePlan = [
  {
    breakfast: [
      {
        title: 'Омлет',
        weight: 200,
        yieldGrams: 100,
        ingredients: [
          { name: 'Яйца', grams: 50 },
          { name: 'Сыр', grams: 25 },
          { name: 'Соль', grams: 1, massless: true }
        ]
      }
    ],
    lunch: [
      {
        title: 'Борщ',
        weight: 300,
        yieldGrams: 100,
        ingredients: [{ name: 'Свёкла', grams: 20 }]
      }
    ]
  },
  {
    breakfast: [
      {
        title: 'Омлет',
        weight: 150,
        yieldGrams: 100,
        ingredients: [
          { name: 'Яйца', grams: 50 },
          { name: 'Сыр', grams: 25 },
          { name: 'Соль', grams: 1, massless: true }
        ]
      }
    ]
  }
];

describe('shoppingList', () => {
  it('aggregates dishes by title', () => {
    const items = buildShoppingList(samplePlan, SHOPPING_MODES.DISHES);
    const omelet = items.find((item) => item.title === 'Омлет');
    expect(omelet.totalWeight).toBe(350);
    expect(omelet.occurrences).toBe(2);
  });

  it('aggregates ingredients by product name', () => {
    const items = buildShoppingList(samplePlan, SHOPPING_MODES.INGREDIENTS);
    const eggs = items.find((item) => item.title === 'Яйца');
    const cheese = items.find((item) => item.title === 'Сыр');
    const beet = items.find((item) => item.title === 'Свёкла');

    expect(eggs.totalWeight).toBe(175);
    expect(cheese.totalWeight).toBe(87.5);
    expect(beet.totalWeight).toBe(60);
  });

  it('excludes massless ingredients (salt/spices) from the list', () => {
    const items = buildShoppingList(samplePlan, SHOPPING_MODES.INGREDIENTS);
    expect(items.find((item) => item.title === 'Соль')).toBeUndefined();
  });

  it('keeps raw grain weight independent of cooked portion weight', () => {
    const plan = [
      {
        dinner: [
          {
            title: 'Гречка',
            weight: 400, // готовая каша набрала воду
            yieldGrams: 200,
            ingredients: [
              { name: 'Гречка', grams: 70 },
              { name: 'Вода', grams: 160 }
            ]
          }
        ]
      }
    ];
    const items = buildShoppingList(plan, SHOPPING_MODES.INGREDIENTS);
    const grain = items.find((item) => item.title === 'Гречка');
    expect(grain.totalWeight).toBe(140); // 70 г сухой крупы * (400/200)
  });

  it('detects ingredient data in plan', () => {
    expect(planHasIngredientData(samplePlan)).toBe(true);
    expect(planHasIngredientData([{ breakfast: [{ title: 'Салат', weight: 100 }] }])).toBe(false);
  });

  it('rounds shopping weights sensibly', () => {
    expect(roundShoppingWeight(23)).toBe(25);
    expect(roundShoppingWeight(156)).toBe(160);
    expect(roundShoppingWeight(620)).toBe(600);
  });
});
