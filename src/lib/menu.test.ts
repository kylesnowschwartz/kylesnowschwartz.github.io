import { describe, it, expect } from 'vitest';
import {
  emptyPlan,
  setSlot,
  shoppingList,
  formatQty,
  lineAmount,
  shoppingListText,
  weekNetCarbs,
  fillEmptySlots,
  fillWeek,
  usageCounts,
  loadState,
  saveState,
  freshState,
  lineKey,
  STATE_VERSION,
  type Recipe,
  type Ingredient,
  type Plan,
} from './menu';

const ing = (item: string, qty: number | null, unit: Ingredient['unit'], aisle: Ingredient['aisle'], staple = false): Ingredient => ({
  text: `${qty ?? ''} ${unit ?? ''} ${item}`.trim(),
  item,
  qty,
  unit,
  aisle,
  staple,
});

const recipe = (id: string, meal: Recipe['meal'], netCarbsG: number, ingredients: Ingredient[], serves = 1): Recipe => ({
  id,
  name: id.replace(/-/g, ' '),
  meal,
  tags: [],
  netCarbsG,
  serves,
  ingredients,
  method: ['Cook it.', 'Eat it.'],
});

const omelette = recipe('omelette', 'breakfast', 3, [
  ing('eggs', 3, 'whole', 'fridge'),
  ing('baby spinach', 40, 'g', 'veg'),
  ing('salt', null, null, 'pantry', true),
  ing('butter', null, null, 'fridge', true),
]);
const chia = recipe('chia-pudding', 'breakfast', 6, [ing('chia seeds', 12, 'g', 'nuts-seeds'), ing('salt', null, null, 'pantry', true)]);
const salad = recipe('salmon-salad', 'lunch', 8, [
  ing('baby spinach', 79, 'g', 'veg'),
  ing('salmon fillet', 1, 'whole', 'meat-fish'),
  ing('olive oil', 1, 'tbsp', 'pantry', true),
]);
const quiche = recipe(
  'mini-quiches',
  'lunch',
  4,
  [ing('eggs', 5, 'whole', 'fridge'), ing('cream', 100, 'ml', 'fridge'), ing('butter', 20, 'g', 'fridge', true)],
  4,
);
const mousse = recipe('choc-mousse', 'dessert', 5, [ing('cream', 150, 'ml', 'fridge')]);
const RECIPES = [omelette, chia, salad, quiche, mousse];

const plan = (...slots: [day: number, meal: Recipe['meal'], id: string][]): Plan =>
  slots.reduce((p, [d, m, id]) => setSlot(p, d, m, id), emptyPlan());

const allLines = (p: Plan) => shoppingList(p, RECIPES).flatMap((g) => g.lines);
const line = (p: Plan, item: string, unit: Ingredient['unit'] = null) => allLines(p).find((l) => l.key === lineKey(item, unit));

describe('shopping list', () => {
  it('is empty for an empty plan', () => {
    expect(shoppingList(emptyPlan(), RECIPES)).toEqual([]);
  });

  it('merges the same item and unit across recipes and records each dish', () => {
    const l = line(plan([0, 'breakfast', 'omelette'], [0, 'lunch', 'salmon-salad']), 'baby spinach', 'g');
    expect(l?.qty).toBe(119);
    expect(l?.dishes).toEqual(['omelette', 'salmon salad']);
  });

  it('multiplies by portions for single-serve recipes', () => {
    const l = line(plan([0, 'breakfast', 'omelette'], [1, 'breakfast', 'omelette'], [2, 'breakfast', 'omelette']), 'eggs', 'whole');
    expect(l?.qty).toBe(9);
  });

  it('rounds batch recipes up to whole batches', () => {
    const three = plan([0, 'lunch', 'mini-quiches'], [1, 'lunch', 'mini-quiches'], [2, 'lunch', 'mini-quiches']);
    expect(line(three, 'eggs', 'whole')?.qty).toBe(5); // 3 portions of a 4-serve batch = 1 batch
    const five = [3, 4].reduce((p, d) => setSlot(p, d, 'lunch', 'mini-quiches'), three);
    expect(line(five, 'eggs', 'whole')?.qty).toBe(10); // 5 portions = 2 batches
  });

  it('groups in shop order with staples last under "Check you have"', () => {
    const groups = shoppingList(plan([0, 'breakfast', 'omelette'], [0, 'lunch', 'salmon-salad'], [0, 'dessert', 'choc-mousse']), RECIPES);
    expect(groups.map((g) => g.id)).toEqual(['veg', 'meat-fish', 'fridge', 'staples']);
    const staples = groups.at(-1)!;
    expect(staples.label).toBe('Check you have');
    expect(staples.lines.map((l) => l.item)).toEqual(['butter', 'olive oil', 'salt']);
    expect(groups.slice(0, -1).flatMap((g) => g.lines).every((l) => !l.staple)).toBe(true);
  });

  it('lists a vague-amount item once with no number', () => {
    const l = allLines(plan([0, 'breakfast', 'omelette'], [1, 'breakfast', 'chia-pudding'])).filter((x) => x.item === 'salt');
    expect(l).toHaveLength(1);
    expect(l[0].qty).toBeNull();
    expect(formatQty(l[0].qty, l[0].unit)).toBe('');
    expect(l[0].dishes).toEqual(['omelette', 'chia pudding']);
  });

  it('folds a vague amount into the measured line for the same item, marked as a little more', () => {
    const lines = allLines(plan([0, 'breakfast', 'omelette'], [0, 'lunch', 'mini-quiches'])).filter((x) => x.item === 'butter');
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(20);
    expect(lines[0].plusALittle).toBe(true);
    expect(lineAmount(lines[0])).toBe('20 g + a little more');
    expect(lines[0].dishes).toEqual(['mini quiches', 'omelette']);
  });

  it('shows a measured-only line without the extra note', () => {
    const l = line(plan([0, 'lunch', 'mini-quiches']), 'butter', 'g')!;
    expect(l.plusALittle).toBe(false);
    expect(lineAmount(l)).toBe('20 g');
  });

  it('ignores ids missing from the recipe data', () => {
    expect(shoppingList(plan([0, 'dinner', 'gone']), RECIPES)).toEqual([]);
  });

  it('shares unticked lines as plain text', () => {
    const groups = shoppingList(plan([0, 'breakfast', 'omelette']), RECIPES);
    const text = shoppingListText(groups, new Set([lineKey('eggs', 'whole')]));
    expect(text).toContain('Vegetables\n- baby spinach, 40 g');
    expect(text).toContain('Check you have\n- butter\n- salt');
    expect(text).not.toContain('eggs');
  });
});

describe('formatQty', () => {
  it.each([
    [2.5, 'whole', '3'],
    [2, 'whole', '2'],
    [237, 'g', '240 g'],
    [12, 'g', '12 g'],
    [47, 'g', '45 g'],
    [1234, 'g', '1.2 kg'],
    [1000, 'g', '1 kg'],
    [1500, 'ml', '1.5 L'],
    [1.5, 'tbsp', '1½ tbsp'],
    [0.25, 'tsp', '½ tsp'],
    [1, 'tin', '1 tin'],
    [1.5, 'tin', '2 tins'],
    [4, 'slices', '4 slices'],
    [null, null, ''],
  ] as const)('%s %s → "%s"', (qty, unit, out) => {
    expect(formatQty(qty, unit)).toBe(out);
  });
});

describe('net carbs', () => {
  it('totals each day across every filled slot, including extras', () => {
    const p = plan([0, 'breakfast', 'omelette'], [0, 'lunch', 'salmon-salad'], [0, 'dessert', 'choc-mousse'], [2, 'breakfast', 'chia-pudding']);
    expect(weekNetCarbs(p, RECIPES)).toEqual([16, 0, 6, 0, 0, 0, 0]);
  });
});

describe('fill empty slots', () => {
  it('fills only empty slots of the given meal and keeps chosen ones', () => {
    const start = plan([3, 'breakfast', 'omelette'], [0, 'lunch', 'salmon-salad']);
    const filled = fillEmptySlots(start, RECIPES, 'breakfast', 1);
    expect(filled.every((d) => d.breakfast !== null)).toBe(true);
    expect(filled[3].breakfast).toBe('omelette');
    expect(filled[0].lunch).toBe('salmon-salad');
    expect(filled.every((d) => d.dinner === null)).toBe(true);
  });

  it('prefers recipes not yet used, then spreads use evenly', () => {
    const start = plan([0, 'breakfast', 'omelette']);
    const filled = fillEmptySlots(start, RECIPES, 'breakfast', 7);
    expect(filled[1].breakfast).toBe('chia-pudding');
    const counts = usageCounts(filled);
    expect(counts.get('omelette')! + counts.get('chia-pudding')!).toBe(7);
    expect(Math.abs(counts.get('omelette')! - counts.get('chia-pudding')!)).toBeLessThanOrEqual(1);
  });

  it('is deterministic for a seed', () => {
    expect(fillWeek(emptyPlan(), RECIPES, 42)).toEqual(fillWeek(emptyPlan(), RECIPES, 42));
  });

  it('leaves slots empty when a meal has no recipes', () => {
    const filled = fillWeek(emptyPlan(), RECIPES.filter((r) => r.meal !== 'dessert'), 3);
    expect(filled.every((d) => d.dessert === null && d.breakfast !== null)).toBe(true);
  });
});

describe('saved state', () => {
  it('round-trips', () => {
    const state = { ...freshState(), plan: plan([0, 'breakfast', 'omelette']), shopTicks: [lineKey('eggs', 'whole')], cook: { omelette: { ingredients: [0], steps: [1] } } };
    expect(loadState(saveState(state), RECIPES)).toEqual(state);
  });

  it('drops recipe ids that no longer exist or sit in the wrong meal', () => {
    const raw = JSON.stringify({
      version: STATE_VERSION,
      plan: [{ breakfast: 'gone', lunch: 'salmon-salad', dinner: 'omelette' }],
      shopTicks: [lineKey('salmon fillet', 'whole'), lineKey('eggs', 'whole'), 7],
      cook: { gone: { steps: [0] }, omelette: { ingredients: [0, 99, -1, 'x'], steps: [] } },
    });
    const s = loadState(raw, RECIPES);
    expect(s.plan[0]).toEqual({ breakfast: null, lunch: 'salmon-salad', dinner: null, dessert: null, extra: null });
    expect(s.plan).toHaveLength(7);
    expect(s.shopTicks).toEqual([lineKey('salmon fillet', 'whole')]);
    expect(s.cook).toEqual({ omelette: { ingredients: [0], steps: [] } });
  });

  it.each([null, '', 'not json', '[]', '{"plan": "x"}', JSON.stringify({ version: 0, plan: [] }), 'null'])(
    'starts fresh from %j without throwing',
    (raw) => {
      expect(loadState(raw, RECIPES)).toEqual(freshState());
    },
  );
});
