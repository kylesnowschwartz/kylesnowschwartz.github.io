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

/** The plan is a run of seven days, not tied to weekdays. */
export const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'] as const;

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

/** The recipes on this week's plan, each once, in recipe-data order. */
export function plannedRecipes(plan: Plan, recipes: Recipe[]): Recipe[] {
  const counts = usageCounts(plan);
  return recipes.filter((r) => counts.has(r.id));
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
 * The week's combined list, one line per item. A recipe used in N slots needs
 * ceil(N / serves) batches, so a six-piece traybake planned on three days is
 * bought once. The recipe data measures each item in a single unit (a test
 * over the data holds it to that), so measured amounts add up directly. A
 * vague-amount line ("knob of butter") folds into the item's measured line
 * when one exists, marked as needing a little more.
 */
export function shoppingList(plan: Plan, recipes: Recipe[]): ShoppingGroup[] {
  const map = byId(recipes);
  const lines = new Map<string, ShoppingLine>(); // by item
  const vague: { ing: Ingredient; dish: string }[] = [];

  const lineFor = (ing: Ingredient, unit: Unit | null): ShoppingLine => {
    let line = lines.get(ing.item);
    if (!line) {
      line = { key: lineKey(ing.item, unit), item: ing.item, qty: unit === null ? null : 0, unit, aisle: ing.aisle, staple: true, plusALittle: false, dishes: [] };
      lines.set(ing.item, line);
    }
    return line;
  };
  const addUse = (line: ShoppingLine, ing: Ingredient, dish: string) => {
    // Anything one dish needs bought makes the whole line a buy, not a check.
    line.staple = line.staple && ing.staple;
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
      const line = lineFor(ing, ing.unit);
      line.qty = (line.qty ?? 0) + ing.qty * batches;
      addUse(line, ing, r.name);
    }
  }

  // Vague amounts go last so every measured line they could fold into exists.
  for (const { ing, dish } of vague) {
    const line = lineFor(ing, null);
    if (line.qty !== null) line.plusALittle = true;
    addUse(line, ing, dish);
  }

  const sorted = [...lines.values()].sort((a, b) => a.item.localeCompare(b.item));
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

// Rounding always goes up so the list never asks for less than the recipes need.
const ceilTo = (n: number, step: number) => Math.ceil(n / step - 1e-9) * step;

function roundMass(n: number): number {
  return ceilTo(n, n < 20 ? 1 : n < 100 ? 5 : 10);
}

function spoon(n: number): string {
  const halves = Math.max(1, Math.ceil(n * 2 - 1e-9));
  const whole = Math.floor(halves / 2);
  const half = halves % 2 === 1 ? '½' : '';
  return whole === 0 ? half : `${whole}${half}`;
}

/** Shopper-friendly amount: counts round up to whole items, weights up to a sensible step. */
export function formatQty(qty: number | null, unit: Unit | null): string {
  if (qty === null || unit === null) return '';
  switch (unit) {
    case 'g':
    case 'ml': {
      const rounded = roundMass(qty);
      if (rounded < 1000) return `${rounded} ${unit}`;
      const big = ceilTo(qty / 1000, 0.1);
      return `${Number(big.toFixed(1))} ${unit === 'g' ? 'kg' : 'L'}`;
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

/** What a line asked for when it was ticked. */
export interface Tick {
  qty: number | null;
  plusALittle: boolean;
}
/** Ticked shopping lines, by line key. */
export type ShopTicks = Record<string, Tick>;

export function tickLine(ticks: ShopTicks, line: ShoppingLine): ShopTicks {
  return { ...ticks, [line.key]: { qty: line.qty, plusALittle: line.plusALittle } };
}

export function untickLine(ticks: ShopTicks, key: string): ShopTicks {
  const rest = { ...ticks };
  delete rest[key];
  return rest;
}

/**
 * The ticks that still hold for this list. A tick lapses when its line leaves
 * the list or now asks for more than it did when ticked, so the extra amount
 * shows up as still to buy.
 */
export function currentTicks(groups: ShoppingGroup[], ticks: ShopTicks): ShopTicks {
  const out: ShopTicks = {};
  for (const line of groups.flatMap((g) => g.lines)) {
    const t = ticks[line.key];
    if (!t) continue;
    const moreNeeded = line.qty !== null && (t.qty === null || line.qty > t.qty + 1e-9);
    if (moreNeeded || (line.plusALittle && !t.plusALittle)) continue;
    out[line.key] = t;
  }
  return out;
}

/** A group's lines with the ticked ones moved after the rest, keeping order otherwise. */
export function tickedLast(lines: ShoppingLine[], ticks: ShopTicks): ShoppingLine[] {
  return [...lines.filter((l) => !(l.key in ticks)), ...lines.filter((l) => l.key in ticks)];
}

/** Markdown checklist for sharing, ticked lines checked and listed last in their group. */
export function shoppingListText(groups: ShoppingGroup[], ticks: ShopTicks): string {
  const out: string[] = ['# Shopping list'];
  for (const g of groups) {
    out.push('', `## ${g.label}`);
    for (const l of tickedLast(g.lines, ticks)) {
      const amt = lineAmount(l);
      out.push(`- [${l.key in ticks ? 'x' : ' '}] ${l.item}${amt ? `, ${amt}` : ''}`);
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
 * Fill one day's empty main-meal slots (the optional extra stays as it is).
 * Each pick comes from the recipes used least so far this week, unused
 * first; ties break by the seeded shuffle.
 */
export function fillDay(plan: Plan, day: number, recipes: Recipe[], seed: number): Plan {
  const rand = seededRandom(seed);
  const counts = usageCounts(plan);
  let next = plan;
  for (const meal of MAIN_MEALS) {
    if (plan[day][meal]) continue;
    const pool = recipes.filter((r) => r.meal === meal);
    if (pool.length === 0) continue;
    const order = new Map(pool.map((r) => [r.id, rand()]));
    let best = pool[0];
    for (const r of pool) {
      const diff = (counts.get(r.id) ?? 0) - (counts.get(best.id) ?? 0);
      if (diff < 0 || (diff === 0 && order.get(r.id)! < order.get(best.id)!)) best = r;
    }
    counts.set(best.id, (counts.get(best.id) ?? 0) + 1);
    next = setSlot(next, day, meal, best.id);
  }
  return next;
}

export function emptyMainSlots(day: DayPlan): number {
  return MAIN_MEALS.filter((m) => !day[m]).length;
}

// ---------------------------------------------------------------- storage

export const STORAGE_KEY = 'weekly-menu';
export const STATE_VERSION = 2;

export interface MenuState {
  version: typeof STATE_VERSION;
  plan: Plan;
  /** Shopping lines already in the basket. */
  shopTicks: ShopTicks;
}

export function freshState(): MenuState {
  return { version: STATE_VERSION, plan: emptyPlan(), shopTicks: {} };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

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

  const savedTicks: ShopTicks = {};
  if (isObject(data.shopTicks)) {
    for (const [key, t] of Object.entries(data.shopTicks)) {
      if (isObject(t) && (t.qty === null || typeof t.qty === 'number') && typeof t.plusALittle === 'boolean') {
        savedTicks[key] = { qty: t.qty, plusALittle: t.plusALittle };
      }
    }
  }
  const shopTicks = currentTicks(shoppingList(plan, recipes), savedTicks);

  return { version: STATE_VERSION, plan, shopTicks };
}

export function saveState(state: MenuState): string {
  return JSON.stringify(state);
}
