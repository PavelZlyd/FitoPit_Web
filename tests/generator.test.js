import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../data.js', () => ({
  cheatMealRecipes: [],
  calorieBoosters: []
}));

vi.mock('../userStore.js', () => ({
  getMergedRecipesDB: () => ({
    breakfast: [],
    lunch: { first: [], second: [] },
    dinner: { main: [], side: [] },
    snack: []
  })
}));

let isRecipeAllowed;

beforeAll(async () => {
  ({ isRecipeAllowed } = await import('../generator.js'));
});

describe('generator', () => {
  it('allows recipe matching diet and without blocked allergens', () => {
    const recipe = {
      title: 'Каша',
      diet: ['normal', 'vegetarian'],
      allergens: [],
      budget: 'low'
    };
    expect(isRecipeAllowed(recipe, { diet: 'vegetarian', allergies: [], budget: 'low' })).toBe(true);
  });

  it('rejects recipe with allergen conflict', () => {
    const recipe = {
      title: 'Сырники',
      diet: ['normal'],
      allergens: ['dairy', 'eggs'],
      budget: 'medium'
    };
    expect(isRecipeAllowed(recipe, { diet: 'normal', allergies: ['dairy'], budget: 'medium' })).toBe(false);
  });

  it('rejects recipe excluded by keyword', () => {
    const recipe = {
      title: 'Куриный суп',
      diet: ['normal'],
      allergens: [],
      budget: 'low'
    };
    expect(
      isRecipeAllowed(recipe, {
        diet: 'normal',
        allergies: [],
        budget: 'low',
        excludedKeywords: 'курин'
      })
    ).toBe(false);
  });

  it('filters high-budget recipes for low budget user', () => {
    const recipe = {
      title: 'Стейк',
      diet: ['normal'],
      allergens: [],
      budget: 'high'
    };
    expect(isRecipeAllowed(recipe, { diet: 'normal', allergies: [], budget: 'low' })).toBe(false);
  });
});
