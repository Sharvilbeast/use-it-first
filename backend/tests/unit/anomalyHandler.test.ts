import { ReceiptAnomalyHandler } from '../../src/services/ReceiptAnomalyHandler';

export function runAnomalyHandlerUnitTests(): { passed: number; failed: number } {
  console.log('▶ [UNIT] Running Receipt Anomaly & Abbreviation Tests...');
  let passed = 0;
  let failed = 0;

  // 1. Abbreviation Expansion
  const abbrevTests = [
    { input: 'ORG SPNCH BNDL', expected: 'Organic Spinach Bundle' },
    { input: 'AMUL MLK TZA 1LTR', expected: 'Amul Milk Taaza 1L' },
    { input: 'PANEER BLK 200GM', expected: 'Paneer Block 200g' },
    { input: 'BRD WHL WHT', expected: 'Bread Whole Wheat' },
    { input: 'TOM CHRY 250GM', expected: 'Tomato Cherry 250g' },
  ];

  for (const tc of abbrevTests) {
    const res = ReceiptAnomalyHandler.expandAbbreviations(tc.input);
    if (res.toLowerCase() === tc.expected.toLowerCase()) {
      passed++;
      console.log(`  ✔ [PASS] Abbreviation "${tc.input}" -> "${res}"`);
    } else {
      failed++;
      console.error(`  ✕ [FAIL] "${tc.input}" Expected "${tc.expected}", got "${res}"`);
    }
  }

  // 2. OCR Optical Character Confusions
  const confusionTests = [
    { input: 'PRICE: 1O.5O', expected: 'PRICE: 10.50' },
    { input: 'QTY: 1O PCS', expected: 'QTY: 10 PCS' },
  ];

  for (const tc of confusionTests) {
    const res = ReceiptAnomalyHandler.fixOcrCharacterConfusions(tc.input);
    if (res === tc.expected) {
      passed++;
      console.log(`  ✔ [PASS] Character Correction "${tc.input}" -> "${res}"`);
    } else {
      failed++;
      console.error(`  ✕ [FAIL] "${tc.input}" Expected "${tc.expected}", got "${res}"`);
    }
  }

  // 3. Discount Identification
  const discountLines = [
    'BUY 1 GET 1 FREE -₹60.00',
    'PROMO DISCOUNT 10%',
    'COUPON SAVINGS APPLIED',
    'REGULAR CASHBACK -₹15.00',
  ];

  for (const line of discountLines) {
    const isPromo = ReceiptAnomalyHandler.isDiscountOrPromoLine(line);
    if (isPromo) {
      passed++;
      console.log(`  ✔ [PASS] Detected Discount/Promo: "${line}"`);
    } else {
      failed++;
      console.error(`  ✕ [FAIL] Failed to detect discount on line: "${line}"`);
    }
  }

  return { passed, failed };
}
