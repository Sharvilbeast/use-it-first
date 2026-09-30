import { StorageLocation } from '../types';

export interface FoodTaxonomyEntry {
  canonicalName: string;
  category: string;
  keywords: string[];
  defaultLocation: StorageLocation;
  shelfLifeDays: {
    PANTRY: number;
    FRIDGE: number;
    FREEZER: number;
  };
  afterOpeningDays: {
    PANTRY?: number;
    FRIDGE?: number;
    FREEZER?: number;
  };
}

// Master reference catalog for household foods
export const MASTER_FOOD_TAXONOMY: FoodTaxonomyEntry[] = [
  // --- PRODUCE ---
  {
    canonicalName: 'Spinach (Palak)',
    category: 'Produce',
    keywords: ['spinach', 'palak', 'baby spinach', 'greens', 'leafy'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 1, FRIDGE: 4, FREEZER: 180 },
    afterOpeningDays: { FRIDGE: 3 },
  },
  {
    canonicalName: 'Bananas',
    category: 'Produce',
    keywords: ['banana', 'bananas', 'kela', 'robusta', 'yelakki'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 4, FRIDGE: 6, FREEZER: 90 },
    afterOpeningDays: { PANTRY: 2, FRIDGE: 3 },
  },
  {
    canonicalName: 'Tomatoes',
    category: 'Produce',
    keywords: ['tomato', 'tomatoes', 'tamatar', 'cherry tomato'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 6, FRIDGE: 10, FREEZER: 120 },
    afterOpeningDays: { FRIDGE: 3 },
  },
  {
    canonicalName: 'Apples',
    category: 'Produce',
    keywords: ['apple', 'apples', 'seb', 'fuji', 'gala', 'shimla'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 14, FRIDGE: 30, FREEZER: 180 },
    afterOpeningDays: { FRIDGE: 5 },
  },
  {
    canonicalName: 'Coriander / Cilantro',
    category: 'Produce',
    keywords: ['coriander', 'cilantro', 'dhaniya', 'kothmir', 'herbs'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 1, FRIDGE: 5, FREEZER: 60 },
    afterOpeningDays: { FRIDGE: 4 },
  },
  {
    canonicalName: 'Potatoes / Onions',
    category: 'Produce',
    keywords: ['potato', 'potatoes', 'aloo', 'onion', 'onions', 'pyaz'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 28, FRIDGE: 40, FREEZER: 180 },
    afterOpeningDays: { PANTRY: 14, FRIDGE: 7 },
  },

  // --- DAIRY ---
  {
    canonicalName: 'Milk (Pasteurized / Homogenized)',
    category: 'Dairy',
    keywords: ['milk', 'doodh', 'taaza', 'toned', 'cow milk', 'full cream'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 0, FRIDGE: 5, FREEZER: 90 },
    afterOpeningDays: { FRIDGE: 3 },
  },
  {
    canonicalName: 'Greek / Natural Yogurt',
    category: 'Dairy',
    keywords: ['yogurt', 'curd', 'dahi', 'greek yogurt', 'epigamia'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 0, FRIDGE: 14, FREEZER: 60 },
    afterOpeningDays: { FRIDGE: 7 },
  },
  {
    canonicalName: 'Paneer (Cottage Cheese)',
    category: 'Dairy',
    keywords: ['paneer', 'cottage cheese', 'chenna'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 0, FRIDGE: 7, FREEZER: 120 },
    afterOpeningDays: { FRIDGE: 2 },
  },
  {
    canonicalName: 'Butter',
    category: 'Dairy',
    keywords: ['butter', 'makhan', 'amul butter', 'salted butter'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 7, FRIDGE: 90, FREEZER: 270 },
    afterOpeningDays: { FRIDGE: 30 },
  },
  {
    canonicalName: 'Cheddar / Mozzarella Cheese',
    category: 'Dairy',
    keywords: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'cheese slice'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 0, FRIDGE: 45, FREEZER: 180 },
    afterOpeningDays: { FRIDGE: 14 },
  },

  // --- BAKERY ---
  {
    canonicalName: 'Sandwich Bread (White/Wheat)',
    category: 'Bakery',
    keywords: ['bread', 'sandwich bread', 'multigrain', 'whole wheat', 'roti'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 5, FRIDGE: 10, FREEZER: 90 },
    afterOpeningDays: { PANTRY: 4, FRIDGE: 7 },
  },
  {
    canonicalName: 'Tortillas / Pita / Naan',
    category: 'Bakery',
    keywords: ['tortilla', 'pita', 'naan', 'wrap', 'lavash'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 10, FRIDGE: 21, FREEZER: 120 },
    afterOpeningDays: { PANTRY: 5, FRIDGE: 10 },
  },

  // --- PANTRY STAPLES ---
  {
    canonicalName: 'Rice & Whole Grains',
    category: 'Pantry',
    keywords: ['rice', 'basmati', 'chawal', 'quinoa', 'oats', 'poha'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 365, FRIDGE: 500, FREEZER: 730 },
    afterOpeningDays: { PANTRY: 180 },
  },
  {
    canonicalName: 'Pasta & Noodles',
    category: 'Pantry',
    keywords: ['pasta', 'spaghetti', 'penne', 'macaroni', 'noodles', 'maggi'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 365, FRIDGE: 500, FREEZER: 730 },
    afterOpeningDays: { PANTRY: 180 },
  },
  {
    canonicalName: 'Canned Beans & Pulses',
    category: 'Pantry',
    keywords: ['canned beans', 'chickpeas', 'kidney beans', 'rajma', 'tin'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 730, FRIDGE: 730, FREEZER: 730 },
    afterOpeningDays: { FRIDGE: 3 },
  },
  {
    canonicalName: 'Lentils & Dals',
    category: 'Pantry',
    keywords: ['dal', 'lentils', 'toor dal', 'moong', 'urad', 'chana'],
    defaultLocation: 'PANTRY',
    shelfLifeDays: { PANTRY: 365, FRIDGE: 500, FREEZER: 730 },
    afterOpeningDays: { PANTRY: 180 },
  },

  // --- MEAT & PROTEINS ---
  {
    canonicalName: 'Fresh Eggs',
    category: 'Dairy',
    keywords: ['egg', 'eggs', 'anda'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 10, FRIDGE: 28, FREEZER: 0 },
    afterOpeningDays: { FRIDGE: 21 },
  },
  {
    canonicalName: 'Chicken Breast / Poultry',
    category: 'Meat',
    keywords: ['chicken', 'breast', 'drumstick', 'poultry', 'murg'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 0, FRIDGE: 2, FREEZER: 180 },
    afterOpeningDays: { FRIDGE: 1, FREEZER: 90 },
  },
  {
    canonicalName: 'Fish & Seafood',
    category: 'Meat',
    keywords: ['fish', 'salmon', 'prawns', 'shrimp', 'machli'],
    defaultLocation: 'FRIDGE',
    shelfLifeDays: { PANTRY: 0, FRIDGE: 2, FREEZER: 120 },
    afterOpeningDays: { FRIDGE: 1 },
  },
];

export class ShelfLifeEstimator {
  /**
   * Matches a raw line item description to a taxonomy entry using fuzzy keyword matching
   */
  public static matchTaxonomy(itemDescription: string): FoodTaxonomyEntry | null {
    const normalized = itemDescription.toLowerCase().trim();

    // Direct keyword scan
    for (const entry of MASTER_FOOD_TAXONOMY) {
      for (const kw of entry.keywords) {
        if (normalized.includes(kw)) {
          return entry;
        }
      }
    }

    return null;
  }

  /**
   * Computes baseline estimated shelf life days
   */
  public static estimateShelfLife(
    itemDescription: string,
    location?: StorageLocation,
    isOpen: boolean = false
  ): { days: number; category: string; suggestedLocation: StorageLocation } {
    const entry = this.matchTaxonomy(itemDescription);

    if (!entry) {
      // Sensible conservative default for uncataloged grocery items
      const fallbackLoc: StorageLocation = location || 'FRIDGE';
      return {
        days: fallbackLoc === 'FREEZER' ? 90 : fallbackLoc === 'FRIDGE' ? 7 : 14,
        category: 'Grocery',
        suggestedLocation: fallbackLoc,
      };
    }

    const targetLocation: StorageLocation = location || entry.defaultLocation;

    if (isOpen) {
      const openedOverride = entry.afterOpeningDays[targetLocation];
      if (openedOverride !== undefined) {
        return {
          days: openedOverride,
          category: entry.category,
          suggestedLocation: targetLocation,
        };
      }
    }

    const baselineDays = entry.shelfLifeDays[targetLocation] || 7;

    return {
      days: baselineDays,
      category: entry.category,
      suggestedLocation: targetLocation,
    };
  }
}
