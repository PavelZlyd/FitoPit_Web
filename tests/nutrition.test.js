import { describe, expect, it } from 'vitest';
import {
  calculateRecipeNutrition,
  scaleIngredientsForPortion,
  getShoppingIngredients,
} from '../nutrition.js';

const products = {
  Яйца: { kcalPer100g: 157, proteinPer100g: 12.7, fatPer100g: 11.5, carbsPer100g: 0.7 },
  Молоко: { kcalPer100g: 60, proteinPer100g: 2.9, fatPer100g: 3.2, carbsPer100g: 4.7 },
  Соль: { kcalPer100g: 0, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0 },
  Гречка: { kcalPer100g: 343, proteinPer100g: 13, fatPer100g: 3.4, carbsPer100g: 62 },
  Вода: { kcalPer100g: 0, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0 },
};

describe('nutrition', () => {
  it('computes per-100g nutrition from raw ingredients and yield', () => {
    const recipe = {
      yieldGrams: 130,
      ingredients: [
        { name: 'Яйца', grams: 110 },
        { name: 'Молоко', grams: 30 },
        { name: 'Соль', grams: 1, massless: true },
      ],
    };
    const n = calculateRecipeNutrition(recipe, products);
    // (157*1.1 + 60*0.3) / 130 * 100 ≈ 147
    expect(n.kcalPer100g).toBe(147);
    expect(n.proteinPer100g).toBeGreaterThan(10);
  });

  it('water lowers kcal per 100g (grain absorbs it)', () => {
    const recipe = {
      yieldGrams: 200,
      ingredients: [
        { name: 'Гречка', grams: 70 },
        { name: 'Вода', grams: 160 },
      ],
    };
    const n = calculateRecipeNutrition(recipe, products);
    expect(n.kcalPer100g).toBe(Math.round(((343 * 0.7) / 200) * 100));
  });

  it('scales ingredients to portion weight', () => {
    const recipe = {
      yieldGrams: 100,
      ingredients: [{ name: 'Яйца', grams: 50 }],
    };
    const scaled = scaleIngredientsForPortion(recipe, 200);
    expect(scaled[0].grams).toBe(100);
  });

  it('shopping ingredients drop massless items', () => {
    const recipe = {
      yieldGrams: 100,
      ingredients: [
        { name: 'Гречка', grams: 70 },
        { name: 'Соль', grams: 1, massless: true },
      ],
    };
    const shopping = getShoppingIngredients(recipe, 100);
    expect(shopping).toHaveLength(1);
    expect(shopping[0].name).toBe('Гречка');
  });
});
