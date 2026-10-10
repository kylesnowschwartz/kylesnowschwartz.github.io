/**
 * Weekly Menu — plan, shopping and storage model.
 *
 * Pure, DOM-free logic shared by the page script and the unit tests. Recipe
 * shape matches the `menuRecipes` collection schema in `src/content.config.ts`.
 */

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'extra';
export type Aisle = 'veg' | 'fruit-frozen' | 'meat-fish' | 'fridge' | 'nuts-seeds' | 'pantry';
export type Unit = 'g' | 'ml' | 'whole' | 'tbsp' | 'tsp' | 'slices' | 'tin';

export interface Ingredient {
  text: string;
  item: string;
  qty: number | null;
  unit: Unit | null;
  aisle: Aisle;
  staple: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  meal: Meal;
  tags: string[];
  netCarbsG: number;
  serves: number;
  ingredients: Ingredient[];
  method: string[];
  tip?: string;
}

/** Slots every day shows; `extra` is the optional add-on slot. */
export const MAIN_MEALS = ['breakfast', 'lunch', 'dinner', 'dessert'] as const satisfies readonly Meal[];
export const SLOTS = [...MAIN_MEALS, 'extra'] as const satisfies readonly Meal[];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  dessert: 'Dessert',
  extra: 'Extra',
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

/** Walking order through a typical supermarket. */
export const AISLE_ORDER: readonly Aisle[] = ['veg', 'fruit-frozen', 'meat-fish', 'fridge', 'nuts-seeds', 'pantry'];

export const AISLE_LABELS: Record<Aisle | 'staples', string> = {
  veg: 'Vegetables',
  'fruit-frozen': 'Fruit & frozen',
  'meat-fish': 'Meat & fish',
  fridge: 'Fridge',
  'nuts-seeds': 'Nuts & seeds',
  pantry: 'Pantry',
  staples: 'Check you have',
};

export type DayPlan = Record<Meal, string | null>;
/** Seven days, Monday first. */
export type Plan = DayPlan[];

export function emptyDay(): DayPlan {
  return { breakfast: null, lunch: null, dinner: null, dessert: null, extra: null };
}

export function emptyPlan(): Plan {
  return DAYS.map(() => emptyDay());
}

export function setSlot(plan: Plan, day: number, meal: Meal, recipeId: string | null): Plan {
  return plan.map((d, i) => (i === day ? { ...d, [meal]: recipeId } : d));
}

export function byId(recipes: Recipe[]): Map<string, Recipe> {
  return new Map(recipes.map((r) => [r.id, r]));
}

/** How many slots each recipe fills this week. */
export function usageCounts(plan: Plan): Map<string, number> {
  const counts = new Map<string, number>();
  for (const day of plan) {
    for (const meal of SLOTS) {
      const id = day[meal];
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return counts;
}

export function dayNetCarbs(day: DayPlan, recipes: Map<string, Recipe>): number {
  let total = 0;
  for (const meal of SLOTS) {
    const id = day[meal];
    const r = id ? recipes.get(id) : undefined;
    if (r) total += r.netCarbsG;
  }
  return total;
}

export function weekNetCarbs(plan: Plan, recipes: Recipe[]): number[] {
  const map = byId(recipes);
  return plan.map((day) => dayNetCarbs(day, map));
}

// ---------------------------------------------------------------- shopping

export interface ShoppingLine {
  /** Stable across rebuilds of the list, so ticks survive plan edits. */
  key: string;
  item: string;
  qty: number | null;
  unit: Unit | null;
  aisle: Aisle;
  staple: boolean;
  /** Some dish also wants an unmeasured splash or pinch on top of `qty`. */
  plusALittle: boolean;
  /** Names of the planned dishes that use this line. */
  dishes: string[];
}

export interface ShoppingGroup {
  id: Aisle | 'staples';
  label: string;
  lines: ShoppingLine[];
}

export function lineKey(item: string, unit: Unit | null): string {
  return `${item}|${unit ?? ''}`;
}

/**
 * The week's combined list. A recipe used in N slots needs ceil(N / serves)
 * batches, so a six-piece traybake planned on three days is bought once.
 * Lines merge on item + unit; a vague-amount line ("knob of butter") folds
 * into a measured line for the same item when one exists, so each product
 * appears once where possible.
 */
export function shoppingList(plan: Plan, recipes: Recipe[]): ShoppingGroup[] {
  const map = byId(recipes);
  const lines = new Map<string, ShoppingLine>();
  const vague: { ing: Ingredient; dish: string }[] = [];

  const addDish = (line: ShoppingLine, dish: string) => {
    if (!line.dishes.includes(dish)) line.dishes.push(dish);
  };

  for (const [id, portions] of usageCounts(plan)) {
    const r = map.get(id);
    if (!r) continue;
    const batches = Math.ceil(portions / r.serves);
    for (const ing of r.ingredients) {
      if (ing.qty === null || ing.unit === null) {
        vague.push({ ing, dish: r.name });
        continue;
      }
      const key = lineKey(ing.item, ing.unit);
      let line = lines.get(key);
      if (!line) {
        line = { key, item: ing.item, qty: 0, unit: ing.unit, aisle: ing.aisle, staple: true, plusALittle: false, dishes: [] };
        lines.set(key, line);
      }
      line.qty = (line.qty ?? 0) + ing.qty * batches;
      // Anything one dish needs bought makes the whole line a buy, not a check.
      line.staple = line.staple && ing.staple;
      addDish(line, r.name);
    }
  }

  for (const { ing, dish } of vague) {
    const measured = [...lines.values()].find((l) => l.item === ing.item && l.qty !== null);
    if (measured) {
      measured.plusALittle = true;
      measured.staple = measured.staple && ing.staple;
      addDish(measured, dish);
      continue;
    }
    const key = lineKey(ing.item, null);
    let line = lines.get(key);
    if (!line) {
      line = { key, item: ing.item, qty: null, unit: null, aisle: ing.aisle, staple: true, plusALittle: false, dishes: [] };
      lines.set(key, line);
    }
    line.staple = line.staple && ing.staple;
    addDish(line, dish);
  }

  const sorted = [...lines.values()].sort((a, b) => a.item.localeCompare(b.item) || a.key.localeCompare(b.key));
  const groups: ShoppingGroup[] = AISLE_ORDER.map((aisle) => ({
    id: aisle,
    label: AISLE_LABELS[aisle],
    lines: sorted.filter((l) => !l.staple && l.aisle === aisle),
  }));
  groups.push({ id: 'staples', label: AISLE_LABELS.staples, lines: sorted.filter((l) => l.staple) });
  return groups.filter((g) => g.lines.length > 0);
}

const COUNTED_UNITS: Partial<Record<Unit, [string, string]>> = {
  tin: ['tin', 'tins'],
  slices: ['slice', 'slices'],
};

function trim(n: number): string {
  return String(Number(n.toFixed(1)));
}

function roundMass(n: number): number {
  const step = n < 20 ? 1 : n < 100 ? 5 : 10;
  return Math.max(step, Math.round(n / step) * step);
}

function spoon(n: number): string {
  const halves = Math.max(1, Math.round(n * 2));
  const whole = Math.floor(halves / 2);
  const half = halves % 2 === 1 ? '½' : '';
  return whole === 0 ? half : `${whole}${half}`;
}

/** Shopper-friendly amount: whole items round up, weights to a sensible step. */
export function formatQty(qty: number | null, unit: Unit | null): string {
  if (qty === null || unit === null) return '';
  switch (unit) {
    case 'g':
    case 'ml': {
      const big = unit === 'g' ? 'kg' : 'L';
      if (qty >= 1000) return `${trim(qty / 1000)} ${big}`;
      return `${roundMass(qty)} ${unit}`;
    }
    case 'tbsp':
    case 'tsp':
      return `${spoon(qty)} ${unit}`;
    case 'whole':
      return String(Math.ceil(qty - 1e-9));
    default: {
      const n = Math.ceil(qty - 1e-9);
      const [one, many] = COUNTED_UNITS[unit] ?? [unit, unit];
      return `${n} ${n === 1 ? one : many}`;
    }
  }
}

/** The amount as a shopping line shows it, e.g. "30 g + a little more". */
export function lineAmount(line: Pick<ShoppingLine, 'qty' | 'unit' | 'plusALittle'>): string {
  const amt = formatQty(line.qty, line.unit);
  return amt && line.plusALittle ? `${amt} + a little more` : amt;
}

/** Plain-text list for sharing; ticked lines are left off. */
export function shoppingListText(groups: ShoppingGroup[], ticked: ReadonlySet<string>): string {
  const out: string[] = ['Shopping list'];
  for (const g of groups) {
    const left = g.lines.filter((l) => !ticked.has(l.key));
    if (left.length === 0) continue;
    out.push('', g.label);
    for (const l of left) {
      const amt = lineAmount(l);
      out.push(`- ${l.item}${amt ? `, ${amt}` : ''}`);
    }
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- fill

/** Small seeded PRNG (mulberry32) so filling is repeatable in tests. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fill every empty `meal` slot. Each pick comes from the recipes used least
 * so far this week (unused first); ties break by the seeded shuffle.
 */
export function fillEmptySlots(plan: Plan, recipes: Recipe[], meal: Meal, seed: number): Plan {
  const rand = seededRandom(seed);
  const pool = recipes.filter((r) => r.meal === meal);
  if (pool.length === 0) return plan;
  const order = new Map(pool.map((r) => [r.id, rand()]));
  const counts = usageCounts(plan);
  let next = plan;
  plan.forEach((day, i) => {
    if (day[meal]) return;
    let best = pool[0];
    for (const r of pool) {
      const diff = (counts.get(r.id) ?? 0) - (counts.get(best.id) ?? 0);
      if (diff < 0 || (diff === 0 && order.get(r.id)! < order.get(best.id)!)) best = r;
    }
    counts.set(best.id, (counts.get(best.id) ?? 0) + 1);
    order.set(best.id, rand());
    next = setSlot(next, i, meal, best.id);
  });
  return next;
}

export function fillWeek(plan: Plan, recipes: Recipe[], seed: number): Plan {
  return MAIN_MEALS.reduce((p, meal, i) => fillEmptySlots(p, recipes, meal, seed + i), plan);
}

// ---------------------------------------------------------------- storage

export const STORAGE_KEY = 'weekly-menu';
export const STATE_VERSION = 1;

export interface CookTicks {
  ingredients: number[];
  steps: number[];
}

export interface MenuState {
  version: typeof STATE_VERSION;
  plan: Plan;
  /** Shopping line keys already in the basket. */
  shopTicks: string[];
  /** Per recipe id, which ingredient and step indexes are ticked. */
  cook: Record<string, CookTicks>;
}

export function freshState(): MenuState {
  return { version: STATE_VERSION, plan: emptyPlan(), shopTicks: [], cook: {} };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function indexes(v: unknown, length: number): number[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < length))].sort((a, b) => a - b);
}

/**
 * Read saved state against the current recipes. Anything unreadable or from
 * another version starts a fresh week; ids that no longer exist (or no longer
 * belong to that slot's meal) are dropped rather than shown as blanks.
 */
export function loadState(raw: string | null, recipes: Recipe[]): MenuState {
  if (!raw) return freshState();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return freshState();
  }
  if (!isObject(data) || data.version !== STATE_VERSION || !Array.isArray(data.plan)) return freshState();

  const map = byId(recipes);
  const savedPlan = data.plan as unknown[];
  const plan = DAYS.map((_, i) => {
    const day = emptyDay();
    const saved = savedPlan[i];
    if (!isObject(saved)) return day;
    for (const meal of SLOTS) {
      const id = saved[meal];
      if (typeof id === 'string' && map.get(id)?.meal === meal) day[meal] = id;
    }
    return day;
  });

  const listKeys = new Set(shoppingList(plan, recipes).flatMap((g) => g.lines.map((l) => l.key)));
  const shopTicks = Array.isArray(data.shopTicks)
    ? [...new Set(data.shopTicks.filter((k): k is string => typeof k === 'string' && listKeys.has(k)))]
    : [];

  const cook: Record<string, CookTicks> = {};
  if (isObject(data.cook)) {
    for (const [id, ticks] of Object.entries(data.cook)) {
      const r = map.get(id);
      if (!r || !isObject(ticks)) continue;
      const entry = {
        ingredients: indexes(ticks.ingredients, r.ingredients.length),
        steps: indexes(ticks.steps, r.method.length),
      };
      if (entry.ingredients.length || entry.steps.length) cook[id] = entry;
    }
  }

  return { version: STATE_VERSION, plan, shopTicks, cook };
}

export function saveState(state: MenuState): string {
  return JSON.stringify(state);
}
