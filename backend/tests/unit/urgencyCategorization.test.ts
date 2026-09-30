import { UrgencyStatus } from '../../src/types';

export function computeUrgency(daysRemaining: number): UrgencyStatus {
  if (daysRemaining < 0) return 'EXPIRED';
  if (daysRemaining <= 2) return 'USE_TODAY';
  if (daysRemaining <= 7) return 'THIS_WEEK';
  return 'LATER';
}

export function runUrgencyCategorizationUnitTests(): { passed: number; failed: number } {
  console.log('▶ [UNIT] Running Tri-Color Urgency Categorization Tests...');
  let passed = 0;
  let failed = 0;

  const testMatrix: Array<{ days: number; expected: UrgencyStatus; label: string }> = [
    { days: -5, expected: 'EXPIRED', label: 'Expired 5 days ago' },
    { days: -1, expected: 'EXPIRED', label: 'Expired yesterday' },
    { days: 0, expected: 'USE_TODAY', label: 'Expires today (Day 0)' },
    { days: 1, expected: 'USE_TODAY', label: 'Expires tomorrow (Day 1 - RED)' },
    { days: 2, expected: 'USE_TODAY', label: 'Expires in 48 hours (Day 2 - RED boundary)' },
    { days: 3, expected: 'THIS_WEEK', label: 'Expires in 3 days (Day 3 - AMBER boundary)' },
    { days: 5, expected: 'THIS_WEEK', label: 'Expires in 5 days (AMBER)' },
    { days: 7, expected: 'THIS_WEEK', label: 'Expires in 7 days (AMBER upper boundary)' },
    { days: 8, expected: 'LATER', label: 'Expires in 8 days (GREEN boundary)' },
    { days: 30, expected: 'LATER', label: 'Expires in 1 month (GREEN)' },
    { days: 365, expected: 'LATER', label: 'Pantry staple 1 year (GREEN)' },
  ];

  for (const tc of testMatrix) {
    const result = computeUrgency(tc.days);
    if (result === tc.expected) {
      passed++;
      console.log(`  ✔ [PASS] ${tc.label} (${tc.days}d) -> ${result}`);
    } else {
      failed++;
      console.error(`  ✕ [FAIL] ${tc.label} Expected ${tc.expected}, got ${result}`);
    }
  }

  return { passed, failed };
}
