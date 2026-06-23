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
let isMeatDish;
let reduceMeatAndBoostSides;

beforeAll(async () => {
  ({
    isRecipeAllowed,
    isMeatDish,
    reduceMeatAndBoostSides
  } = await import('../generator.js'));
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

  it('detects meat dishes but not fish', () => {
    expect(isMeatDish({ title: 'Куриная грудка', diet: ['normal'] })).toBe(true);
    expect(isMeatDish({ title: 'Лосось на пару', diet: ['normal'] })).toBe(false);
    expect(isMeatDish({ title: 'Гречка с грибами', diet: ['vegetarian', 'vegan'] })).toBe(false);
  });

  it('reduces meat portion and adds calories to side dish', () => {
    const meals = [
      {
        title: 'Куриная котлета',
        diet: ['normal'],
        type: 'main',
        kcalPer100g: 200,
        proteinPer100g: 20,
        fatPer100g: 10,
        carbsPer100g: 5,
        weight: 200,
        calories: 400,
        protein: 40,
        fat: 20,
        carbs: 10
      },
      {
        title: 'Гречка',
        diet: ['normal'],
        type: 'side',
        kcalPer100g: 100,
        proteinPer100g: 4,
        fatPer100g: 1,
        carbsPer100g: 20,
        weight: 150,
        calories: 150,
        protein: 6,
        fat: 1.5,
        carbs: 30
      }
    ];
    const sideOptions = [{
      title: 'Гречка',
      diet: ['normal'],
      type: 'side',
      kcalPer100g: 100,
      proteinPer100g: 4,
      fatPer100g: 1,
      carbsPer100g: 20,
      budget: 'low'
    }];

    reduceMeatAndBoostSides(meals, sideOptions, { diet: 'normal', budget: 'low' });

    expect(meals[0].weight).toBeLessThan(200);
    expect(meals[1].weight).toBeGreaterThan(150);
    const total = meals[0].calories + meals[1].calories;
    expect(total).toBeGreaterThanOrEqual(520);
  });
});
