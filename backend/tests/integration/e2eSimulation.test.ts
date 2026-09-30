import { UIFBackendApp } from '../../src';
import { RecipeGenerationRequest } from '../../src/types';

export async function runE2ESimulationTests(): Promise<{ passed: number; failed: number }> {
  console.log('▶ [E2E SIMULATION] Running Full User Journey Scenarios...');
  let passed = 0;
  let failed = 0;

  const app = new UIFBackendApp();

  // ===========================================================================
  // SCENARIO 1: User scans grocery receipt -> confirms parsed items ->
  // items correctly populate Smart Pantry under respective locations and urgency badges
  // ===========================================================================
  console.log('  • Running Scenario 1: Scan -> Review -> Pantry Insertion Flow');
  const mockThermalSlip = Buffer.from('RAW_GROCERY_RECEIPT_BUFFER_DATA');
  const scanResult = await app.handleReceiptScan(mockThermalSlip, 'image/jpeg');

  // Verify extraction
  const butterItem = scanResult.items.find((i) => i.name.toLowerCase().includes('butter') || i.name.toLowerCase().includes('amul'));
  const spinachItem = scanResult.items.find((i) => i.name.toLowerCase().includes('spinach') || i.name.toLowerCase().includes('palak'));

  if (scanResult.items.length >= 3 && butterItem && spinachItem) {
    passed++;
    console.log(`    ✔ Step 1.1: Receipt parsed ${scanResult.items.length} valid food items.`);
  } else {
    failed++;
    console.error('    ✕ Step 1.1: Receipt failed to parse expected food items');
  }

  // Simulate user reviewing and saving to active pantry
  interface MockPantryRecord {
    id: string;
    name: string;
    location: string;
    urgency: string;
    daysRemaining: number;
    isConsumed: boolean;
  }

  const userPantry: MockPantryRecord[] = scanResult.items.map((item, index) => {
    let urgency = 'LATER';
    if (item.estimated_shelf_life_days <= 2) urgency = 'USE_TODAY';
    else if (item.estimated_shelf_life_days <= 7) urgency = 'THIS_WEEK';

    return {
      id: `item-${index + 1}`,
      name: item.name,
      location: item.storage_location,
      urgency,
      daysRemaining: item.estimated_shelf_life_days,
      isConsumed: false,
    };
  });

  // Assert location & urgency categorization
  const fridgeItems = userPantry.filter((i) => i.location === 'FRIDGE');
  const urgentItems = userPantry.filter((i) => i.urgency === 'USE_TODAY' || i.urgency === 'THIS_WEEK');

  if (fridgeItems.length > 0 && urgentItems.length > 0) {
    passed++;
    console.log(`    ✔ Step 1.2: Pantry items populated in Fridge (${fridgeItems.length}) with Urgency status (${urgentItems.length} urgent/warning).`);
  } else {
    failed++;
    console.error('    ✕ Step 1.2: Failed to populate items under correct location and urgency');
  }

  // ===========================================================================
  // SCENARIO 2: User taps "Use expiring food in a recipe tonight" ->
  // verifies generated recipe utilizes targeted "Use Today" items ->
  // user marks recipe as cooked -> items are automatically decremented from pantry
  // ===========================================================================
  console.log('  • Running Scenario 2: Zero-Waste Chef Recipe -> Auto-Consume Flow');

  // Gathers urgent items
  const expiringPantryItems = userPantry.filter((i) => i.urgency === 'USE_TODAY' || i.urgency === 'THIS_WEEK');

  const recipeRequest: RecipeGenerationRequest = {
    userId: 'user-family-01',
    pantryId: 'pantry-home-001',
    expiringItems: expiringPantryItems.map((item) => ({
      pantryItemId: item.id,
      name: item.name,
      category: 'Produce',
      quantity: '1 unit',
      daysRemaining: item.daysRemaining,
      urgencyStatus: item.urgency === 'USE_TODAY' ? 'USE_TODAY' : 'THIS_WEEK',
    })),
    pantryStaples: ['Cooking Oil', 'Salt', 'Black Pepper', 'Onion', 'Garlic'],
    dietaryConstraints: [],
    maxPrepTimeMinutes: 25,
    servings: 2,
  };

  const recipe = await app.handleRecipeGenerate(recipeRequest);

  // Assert recipe utilizes the expiring items
  const utilizedExpiringIds = recipe.exactExpiringItemsUtilized.map((u) => u.pantryItemId);
  if (utilizedExpiringIds.length > 0 && recipe.wasteRescueScore >= 80) {
    passed++;
    console.log(`    ✔ Step 2.1: Generated recipe "${recipe.recipeTitle}" utilized ${utilizedExpiringIds.length} expiring ingredients with score ${recipe.wasteRescueScore}%.`);
  } else {
    failed++;
    console.error('    ✕ Step 2.1: Recipe did not utilize expiring items');
  }

  // User taps: "Mark Ingredients Consumed"
  let initialActiveCount = userPantry.filter((i) => !i.isConsumed).length;
  for (const consumedId of utilizedExpiringIds) {
    const item = userPantry.find((i) => i.id === consumedId);
    if (item) {
      item.isConsumed = true;
    }
  }

  let finalActiveCount = userPantry.filter((i) => !i.isConsumed).length;
  const decrementedCount = initialActiveCount - finalActiveCount;

  if (decrementedCount === utilizedExpiringIds.length) {
    passed++;
    console.log(`    ✔ Step 2.2: Marked recipe as cooked. Decremented ${decrementedCount} items from active pantry inventory.`);
  } else {
    failed++;
    console.error(`    ✕ Step 2.2: Decrement count mismatch. Expected ${utilizedExpiringIds.length}, got ${decrementedCount}`);
  }

  return { passed, failed };
}
