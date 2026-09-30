import { runShelfLifeUnitTests } from './unit/shelfLife.test';
import { runUrgencyCategorizationUnitTests } from './unit/urgencyCategorization.test';
import { runAnomalyHandlerUnitTests } from './unit/anomalyHandler.test';
import { runReceiptPipelineIntegrationTests } from './integration/receiptPipeline.test';
import { runSecurityAndRateLimitIntegrationTests } from './integration/securityAndRateLimit.test';
import { runE2ESimulationTests } from './integration/e2eSimulation.test';

async function main() {
  console.log('========================================================================');
  console.log('USE IT FIRST (UIF) - ENTERPRISE AUTOMATED TEST SUITE');
  console.log('========================================================================\n');

  let totalPassed = 0;
  let totalFailed = 0;

  // 1. Unit Tests
  const r1 = runShelfLifeUnitTests();
  totalPassed += r1.passed;
  totalFailed += r1.failed;
  console.log();

  const r2 = runUrgencyCategorizationUnitTests();
  totalPassed += r2.passed;
  totalFailed += r2.failed;
  console.log();

  const r3 = runAnomalyHandlerUnitTests();
  totalPassed += r3.passed;
  totalFailed += r3.failed;
  console.log();

  // 2. Integration Tests
  const r4 = await runReceiptPipelineIntegrationTests();
  totalPassed += r4.passed;
  totalFailed += r4.failed;
  console.log();

  const r5 = runSecurityAndRateLimitIntegrationTests();
  totalPassed += r5.passed;
  totalFailed += r5.failed;
  console.log();

  // 3. E2E User Scenarios
  const r6 = await runE2ESimulationTests();
  totalPassed += r6.passed;
  totalFailed += r6.failed;
  console.log();

  console.log('========================================================================');
  console.log(`TEST SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED (TOTAL: ${totalPassed + totalFailed})`);
  console.log('========================================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
