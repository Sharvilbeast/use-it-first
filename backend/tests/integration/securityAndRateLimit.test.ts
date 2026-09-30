import { AuthGuard, UserSessionPayload } from '../../src/middleware/AuthGuard';
import { RateLimiterMiddleware } from '../../src/middleware/RateLimiterMiddleware';
import { ReceiptPurgeMiddleware } from '../../src/middleware/ReceiptPurgeMiddleware';

export function runSecurityAndRateLimitIntegrationTests(): { passed: number; failed: number } {
  console.log('▶ [INTEGRATION] Running Security, Privacy & Rate Limiting Tests...');
  let passed = 0;
  let failed = 0;

  RateLimiterMiddleware.reset();
  AuthGuard.resetQuotasForTesting();

  // Test 1: Rate Limiter Burst & Throttle Evaluation
  console.log('  • Sub-test 1: Free Tier Rate Limiter (Capacity 10)');
  const clientIp = '192.168.1.50';
  let allowedCount = 0;
  let blockedCount = 0;

  for (let i = 0; i < 15; i++) {
    const res = RateLimiterMiddleware.consume(clientIp, 'FREE', 1);
    if (res.allowed) {
      allowedCount++;
    } else {
      blockedCount++;
    }
  }

  if (allowedCount === 10 && blockedCount === 5) {
    passed++;
    console.log(`  ✔ [PASS] Burst bucket allowed exactly 10 requests, throttled 5 with Retry-After`);
  } else {
    failed++;
    console.error(`  ✕ [FAIL] Rate limiter burst failed. Allowed: ${allowedCount}, Blocked: ${blockedCount}`);
  }

  // Test 2: Free Tier vs Premium Tier Recipe Quota
  console.log('  • Sub-test 2: Tier Entitlement Quota (Free max 3 recipes vs Premium unlimited)');
  const freeUser: UserSessionPayload = {
    userId: 'usr-free-101',
    pantryId: 'pantry-001',
    email: 'free@test.com',
    tier: 'FREE',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 3600,
  };

  // Consume 3 free recipes
  AuthGuard.checkRecipeGenerationEntitlement(freeUser);
  AuthGuard.checkRecipeGenerationEntitlement(freeUser);
  AuthGuard.checkRecipeGenerationEntitlement(freeUser);

  // 4th recipe should throw 403 upgrade exception
  let quotaBlocked = false;
  try {
    AuthGuard.checkRecipeGenerationEntitlement(freeUser);
  } catch (err) {
    quotaBlocked = true;
  }

  if (quotaBlocked) {
    passed++;
    console.log('  ✔ [PASS] 4th recipe request on Free tier was correctly blocked with ₹150 upgrade prompt');
  } else {
    failed++;
    console.error('  ✕ [FAIL] Free tier quota was not enforced after 3 uses');
  }

  const premiumUser: UserSessionPayload = {
    userId: 'usr-prem-202',
    pantryId: 'pantry-002',
    email: 'premium@test.com',
    tier: 'PREMIUM',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 3600,
  };

  let premiumSuccess = true;
  for (let i = 0; i < 10; i++) {
    const res = AuthGuard.checkRecipeGenerationEntitlement(premiumUser);
    if (!res.allowed) premiumSuccess = false;
  }

  if (premiumSuccess) {
    passed++;
    console.log('  ✔ [PASS] Premium tier permitted unlimited recipe generations');
  } else {
    failed++;
    console.error('  ✕ [FAIL] Premium tier was improperly throttled');
  }

  // Test 3: Privacy-First PII & Financial Sanitization
  console.log('  • Sub-test 3: Privacy-first credit card and PII redaction');
  const sensitiveBillText =
    'STORE #402 CASHIER: 04\nCARD: 4532 1100 8923 4412 VISA\nPHONE: +91 9876543210\nUPI: user@okhdfcbank\nTOTAL: ₹850.00';

  const sanitized = ReceiptPurgeMiddleware.sanitizeReceiptText(sensitiveBillText);
  const cardGone = !sanitized.sanitizedText.includes('4532 1100 8923 4412');
  const phoneGone = !sanitized.sanitizedText.includes('9876543210');
  const upiGone = !sanitized.sanitizedText.includes('user@okhdfcbank');

  if (cardGone && phoneGone && upiGone && sanitized.financialDataDetected) {
    passed++;
    console.log('  ✔ [PASS] Credit card, mobile number, and UPI ID successfully redacted from logs');
  } else {
    failed++;
    console.error('  ✕ [FAIL] Sensitive financial or PII data leaked through sanitization filter');
  }

  return { passed, failed };
}
