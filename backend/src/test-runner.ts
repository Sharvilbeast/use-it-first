import { UIFBackendApp } from './index';
import { ShelfLifeEstimator } from './services/ShelfLifeEstimator';
import { RecipeGenerationRequest } from './types';

async function runVerificationSuite() {
  console.log('================================================================');
  console.log('USE IT FIRST (UIF) - CORE MICROSERVICE VERIFICATION TEST');
  console.log('================================================================\n');

  const app = new UIFBackendApp();

  // Test 1: ShelfLifeEstimator
  console.log('▶ TEST 1: ShelfLifeEstimator Taxonomy Calculations');
  const spinachEst = ShelfLifeEstimator.estimateShelfLife('Organic Palak Spinach', 'FRIDGE', false);
  console.log('  • Spinach (Fridge, Unopened):', spinachEst);

  const milkOpened = ShelfLifeEstimator.estimateShelfLife('Amul Taaza Milk 1L', 'FRIDGE', true);
  console.log('  • Milk (Fridge, Opened):', milkOpened);

  const pastaEst = ShelfLifeEstimator.estimateShelfLife('Barilla Penne Pasta 500g', 'PANTRY', false);
  console.log('  • Pasta (Pantry):', pastaEst);

  if (spinachEst.days > 0 && milkOpened.days === 3 && pastaEst.days >= 365) {
    console.log('  ✔ TEST 1 PASSED\n');
  } else {
    throw new Error('TEST 1 FAILED');
  }

  // Test 2: ReceiptProcessingService
  console.log('▶ TEST 2: ReceiptProcessingService OCR & Non-Food Filtering');
  const mockBuffer = Buffer.from('MOCK_RECEIPT_IMAGE_BINARY_DATA_TEST_PURPOSES');
  const receiptResult = await app.handleReceiptScan(mockBuffer, 'image/jpeg');
  console.log('  • Processed Job ID:', receiptResult.jobId);
  console.log('  • Store Name:', receiptResult.storeName);
  console.log('  • Raw Extracted Lines:', receiptResult.rawItemCount);
  console.log('  • Filtered Non-Food / Tax Lines:', receiptResult.filteredNonFoodCount);
  console.log('  • Validated Food Items Count:', receiptResult.items.length);
  console.log('  • First 2 Extracted Items:', receiptResult.items.slice(0, 2));

  if (receiptResult.items.length >= 3 && receiptResult.filteredNonFoodCount >= 5) {
    console.log('  ✔ TEST 2 PASSED\n');
  } else {
    throw new Error('TEST 2 FAILED');
  }

  // Test 3: RecipeGenerationService (Zero-Waste Chef)
  console.log('▶ TEST 3: RecipeGenerationService (Zero-Waste Chef)');
  const recipePayload: RecipeGenerationRequest = {
    userId: 'user-sharvil-001',
    pantryId: 'pantry-home-001',
    expiringItems: [
      {
        pantryItemId: 'item-1',
        name: 'Fresh Spinach',
        category: 'Produce',
        quantity: '1 bundle',
        daysRemaining: 1,
        urgencyStatus: 'USE_TODAY',
      },
      {
        pantryItemId: 'item-2',
        name: 'Paneer 200g',
        category: 'Dairy',
        quantity: '1 pack',
        daysRemaining: 1,
        urgencyStatus: 'USE_TODAY',
      },
    ],
    pantryStaples: ['Cooking Oil', 'Salt', 'Black Pepper', 'Garlic', 'Onion', 'Cumin'],
    dietaryConstraints: ['VEGETARIAN'],
    maxPrepTimeMinutes: 25,
    servings: 2,
  };

  const recipe = await app.handleRecipeGenerate(recipePayload);
  console.log('  • Recipe Title:', recipe.recipeTitle);
  console.log('  • Prep / Cook Time:', `${recipe.prepTimeMinutes}m prep / ${recipe.cookTimeMinutes}m cook`);
  console.log('  • Waste Rescue Score:', `${recipe.wasteRescueScore}%`);
  console.log('  • Utilized Expiring Items:', recipe.exactExpiringItemsUtilized);
  console.log('  • Step Count:', recipe.stepByStepCookingDirections.length);
  console.log('  • Estimated INR Saved:', `₹${recipe.estimatedMoneySavedINR}`);

  if (recipe.wasteRescueScore >= 80 && recipe.stepByStepCookingDirections.length >= 2) {
    console.log('  ✔ TEST 3 PASSED\n');
  } else {
    throw new Error('TEST 3 FAILED');
  }

  // Test 4: NotificationDaemon
  console.log('▶ TEST 4: NotificationDaemon Timezone-Aware Batching');
  const mockPantryItems = [
    {
      id: 'item-1',
      userId: 'user-001',
      userToken: 'fcm-token-user-001-xyz',
      userTimezone: 'Asia/Kolkata',
      name: 'Amul Taaza Milk 1L',
      expiryDate: '2026-09-30',
      daysRemaining: 0,
      location: 'FRIDGE',
    },
    {
      id: 'item-2',
      userId: 'user-001',
      userToken: 'fcm-token-user-001-xyz',
      userTimezone: 'Asia/Kolkata',
      name: 'Paneer 200g',
      expiryDate: '2026-10-01',
      daysRemaining: 1,
      location: 'FRIDGE',
    },
  ];

  const queued = app.handleNotificationBatch(mockPantryItems, 'EVENING');
  console.log('  • Total Notifications Generated:', queued.length);
  console.log('  • Notification Title:', queued[0]?.title);
  console.log('  • Notification Body:', queued[0]?.body);
  console.log('  • Deep Link Payload:', queued[0]?.data.deepLink);

  if (queued.length === 1 && queued[0].data.urgencyLevel === 'URGENT') {
    console.log('  ✔ TEST 4 PASSED\n');
  } else {
    throw new Error('TEST 4 FAILED');
  }

  console.log('================================================================');
  console.log('ALL PRODUCTION TESTS COMPLETED SUCCESSFULLY (4/4 PASSED)');
  console.log('================================================================');
}

runVerificationSuite().catch((err) => {
  console.error('VERIFICATION SUITE ERROR:', err);
  process.exit(1);
});
