import { ShelfLifeEstimator } from '../../src/services/ShelfLifeEstimator';

export function runShelfLifeUnitTests(): { passed: number; failed: number } {
  console.log('▶ [UNIT] Running Shelf-Life & Taxonomy Tests...');
  let passed = 0;
  let failed = 0;

  const testCases = [
    // 1. Unopened Produce
    { name: 'Fresh Spinach', loc: 'FRIDGE', isOpen: false, expectedDays: 4, cat: 'Produce' },
    { name: 'Tomatoes', loc: 'PANTRY', isOpen: false, expectedDays: 6, cat: 'Produce' },
    { name: 'Apples', loc: 'FRIDGE', isOpen: false, expectedDays: 30, cat: 'Produce' },

    // 2. Opened Produce / Dairy Decay Acceleration
    { name: 'Amul Taaza Milk 1L', loc: 'FRIDGE', isOpen: false, expectedDays: 5, cat: 'Dairy' },
    { name: 'Amul Taaza Milk 1L', loc: 'FRIDGE', isOpen: true, expectedDays: 3, cat: 'Dairy' }, // 3 days after opening!
    { name: 'Fresh Paneer 200g', loc: 'FRIDGE', isOpen: true, expectedDays: 2, cat: 'Dairy' },
    { name: 'Greek Yogurt', loc: 'FRIDGE', isOpen: true, expectedDays: 7, cat: 'Dairy' },

    // 3. Pantry Staples
    { name: 'Daawat Basmati Rice', loc: 'PANTRY', isOpen: false, expectedDays: 365, cat: 'Pantry' },
    { name: 'Barilla Pasta Penne', loc: 'PANTRY', isOpen: false, expectedDays: 365, cat: 'Pantry' },

    // 4. Freezer Longevity
    { name: 'Chicken Breast', loc: 'FREEZER', isOpen: false, expectedDays: 180, cat: 'Meat' },
    { name: 'Fresh Spinach', loc: 'FREEZER', isOpen: false, expectedDays: 180, cat: 'Produce' },
  ];

  for (const tc of testCases) {
    const res = ShelfLifeEstimator.estimateShelfLife(tc.name, tc.loc as any, tc.isOpen);
    const pass = res.days === tc.expectedDays && res.category === tc.cat;
    if (pass) {
      passed++;
      console.log(`  ✔ [PASS] ${tc.name} (${tc.loc}, ${tc.isOpen ? 'Opened' : 'Unopened'}) -> ${res.days}d [${res.category}]`);
    } else {
      failed++;
      console.error(
        `  ✕ [FAIL] ${tc.name} Expected: ${tc.expectedDays}d (${tc.cat}), Got: ${res.days}d (${res.category})`
      );
    }
  }

  return { passed, failed };
}
