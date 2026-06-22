import { describe, expect, it } from 'vitest';
import {
  buildShoppingList,
  planHasIngredientData,
  roundShoppingWeight,
  SHOPPING_MODES
} from '../shoppingList.js';

const samplePlan = [
  {
    breakfast: [
      {
        title: 'Омлет',
        weight: 200,
        ingredients: [
          { name: 'Яйца', gramsPer100g: 50 },
          { name: 'Сыр', gramsPer100g: 25 }
        ]
      }
    ],
    lunch: [
      {
        title: 'Борщ',
        weight: 300,
        ingredients: [{ name: 'Свёкла', gramsPer100g: 20 }]
      }
    ]
  },
  {
    breakfast: [
      {
        title: 'Омлет',
        weight: 150,
        ingredients: [
          { name: 'Яйца', gramsPer100g: 50 },
          { name: 'Сыр', gramsPer100g: 25 }
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
