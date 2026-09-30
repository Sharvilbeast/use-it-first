import { ReceiptProcessingService } from '../../src/services/ReceiptProcessingService';
import { ParsedReceiptItem } from '../../src/types';

export async function runReceiptPipelineIntegrationTests(): Promise<{ passed: number; failed: number }> {
  console.log('▶ [INTEGRATION] Running Receipt Pipeline End-to-End Tests...');
  let passed = 0;
  let failed = 0;

  const receiptService = new ReceiptProcessingService();

  // Simulated raw thermal receipt image buffer
  const sampleThermalBillBuffer = Buffer.from(
    'MOCK_THERMAL_RECEIPT_BYTES_CONTAINING_GROCERY_BILL_DATA'
  );

  try {
    const response = await receiptService.processReceipt(sampleThermalBillBuffer, 'image/jpeg');

    // Assertion 1: Job completed successfully
    if (response.status === 'COMPLETED' && response.jobId) {
      passed++;
      console.log(`  ✔ [PASS] Asynchronous job succeeded with UUID: ${response.jobId}`);
    } else {
      failed++;
      console.error('  ✕ [FAIL] Receipt job did not complete with UUID');
    }

    // Assertion 2: Non-food items were pruned
    if (response.filteredNonFoodCount > 0) {
      passed++;
      console.log(`  ✔ [PASS] Filtered out ${response.filteredNonFoodCount} non-food / metadata lines`);
    } else {
      failed++;
      console.error('  ✕ [FAIL] Expected non-food lines to be filtered');
    }

    // Assertion 3: Food items have calculated shelf-life and storage locations
    const hasValidFoodItems = response.items.every(
      (item: ParsedReceiptItem) =>
        item.name.length > 0 &&
        item.estimated_shelf_life_days > 0 &&
        ['FRIDGE', 'FREEZER', 'PANTRY'].includes(item.storage_location)
    );

    if (hasValidFoodItems && response.items.length >= 3) {
      passed++;
      console.log(`  ✔ [PASS] Extracted ${response.items.length} validated grocery items with taxonomy`);
      for (const item of response.items) {
        console.log(`     • ${item.name} (${item.quantity} ${item.unit}) -> ${item.storage_location} [Shelf-life: ${item.estimated_shelf_life_days}d]`);
      }
    } else {
      failed++;
      console.error('  ✕ [FAIL] Extracted items failed schema validation');
    }
  } catch (err) {
    failed++;
    console.error('  ✕ [FAIL] Unexpected exception in receipt pipeline:', err);
  }

  return { passed, failed };
}
