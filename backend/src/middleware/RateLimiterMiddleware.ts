import { SubscriptionTier } from './AuthGuard';

export interface RateLimitConfig {
  refillRatePerSec: number; // Token replenishment speed
  bucketCapacity: number;   // Maximum burst allowance
}

export interface RateLimitStatus {
  allowed: boolean;
  tokensRemaining: number;
  retryAfterSec: number;
  tier: SubscriptionTier;
}

export class RateLimiterMiddleware {
  // Rate configuration per subscription tier
  private static readonly TIER_CONFIGS: Record<SubscriptionTier, RateLimitConfig> = {
    FREE: {
      refillRatePerSec: 5 / 60, // 5 requests per minute
      bucketCapacity: 10,       // Burst capacity of 10
    },
    PREMIUM: {
      refillRatePerSec: 60 / 60, // 60 requests per minute (1 per sec)
      bucketCapacity: 120,       // Burst capacity of 120
    },
  };

  // In-memory buckets: Key -> { tokens, lastRefillTimestamp }
  // In production, executed via Redis Lua script
  private static buckets = new Map<
    string,
    { tokens: number; lastRefillMs: number }
  >();

  /**
   * Applies Token Bucket algorithm
   */
  public static consume(
    clientIdentifier: string,
    tier: SubscriptionTier = 'FREE',
    cost: number = 1
  ): RateLimitStatus {
    const config = this.TIER_CONFIGS[tier];
    const now = Date.now();
    const key = `ratelimit:${tier}:${clientIdentifier}`;

    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: config.bucketCapacity, lastRefillMs: now };
      this.buckets.set(key, bucket);
    }

    // 1. Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefillMs) / 1000;
    const tokensToAdd = elapsedSeconds * config.refillRatePerSec;
    bucket.tokens = Math.min(config.bucketCapacity, bucket.tokens + tokensToAdd);
    bucket.lastRefillMs = now;

    // 2. Evaluate consumption
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return {
        allowed: true,
        tokensRemaining: Math.floor(bucket.tokens),
        retryAfterSec: 0,
        tier,
      };
    }

    // 3. Rate limited: calculate wait time needed to replenish required tokens
    const missingTokens = cost - bucket.tokens;
    const retryAfterSec = Math.ceil(missingTokens / config.refillRatePerSec);

    return {
      allowed: false,
      tokensRemaining: 0,
      retryAfterSec,
      tier,
    };
  }

  public static reset() {
    this.buckets.clear();
  }
}
