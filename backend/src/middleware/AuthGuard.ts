export type SubscriptionTier = 'FREE' | 'PREMIUM';

export interface UserSessionPayload {
  userId: string;
  pantryId: string;
  email: string;
  tier: SubscriptionTier;
  issuedAt: number;
  expiresAt: number;
}

export interface MonthlyUsageQuota {
  aiRecipesUsed: number;
  receiptScansUsed: number;
  quotaMonth: string; // YYYY-MM
}

export class AuthGuard {
  // Free tier monthly quotas
  public static readonly FREE_TIER_RECIPE_QUOTA = 3;
  public static readonly FREE_TIER_RECEIPT_QUOTA = 5;

  // In-memory usage store (in production, backed by Redis cluster)
  private static userQuotas = new Map<string, MonthlyUsageQuota>();

  /**
   * Validates JWT token and expiration
   */
  public static verifyToken(bearerHeader?: string): UserSessionPayload {
    if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing or malformed Bearer authorization token.');
    }

    const token = bearerHeader.substring(7);

    // Mock token decoding / verification
    if (token === 'mock-invalid-token') {
      throw new Error('Unauthorized: Token signature is invalid or expired.');
    }

    // In production, jwt.verify(token, publicKey, { algorithms: ['RS256'] })
    const now = Math.floor(Date.now() / 1000);
    const isPremiumUser = token.includes('premium');

    return {
      userId: isPremiumUser ? 'usr-premium-999' : 'usr-free-111',
      pantryId: 'pantry-home-001',
      email: isPremiumUser ? 'premium@useitfirst.app' : 'free@useitfirst.app',
      tier: isPremiumUser ? 'PREMIUM' : 'FREE',
      issuedAt: now - 3600,
      expiresAt: now + 86400, // 24hr validity
    };
  }

  /**
   * Enforces feature gating for Premium subscription endpoints (₹150/month)
   */
  public static checkRecipeGenerationEntitlement(user: UserSessionPayload): {
    allowed: boolean;
    remainingQuota: number;
  } {
    if (user.tier === 'PREMIUM') {
      return { allowed: true, remainingQuota: 999999 };
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    const quota = this.getUserQuota(user.userId, currentMonth);

    if (quota.aiRecipesUsed >= this.FREE_TIER_RECIPE_QUOTA) {
      throw new Error(
        `Monthly free tier quota of ${this.FREE_TIER_RECIPE_QUOTA} AI recipes exceeded. Upgrade to UIF Premium for ₹150/month for unlimited recipes.`
      );
    }

    quota.aiRecipesUsed++;
    return {
      allowed: true,
      remainingQuota: this.FREE_TIER_RECIPE_QUOTA - quota.aiRecipesUsed,
    };
  }

  /**
   * Enforces receipt scan monthly quota
   */
  public static checkReceiptScanEntitlement(user: UserSessionPayload): {
    allowed: boolean;
    remainingQuota: number;
  } {
    if (user.tier === 'PREMIUM') {
      return { allowed: true, remainingQuota: 999999 };
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    const quota = this.getUserQuota(user.userId, currentMonth);

    if (quota.receiptScansUsed >= this.FREE_TIER_RECEIPT_QUOTA) {
      throw new Error(
        `Monthly free tier quota of ${this.FREE_TIER_RECEIPT_QUOTA} receipt scans exceeded. Upgrade to UIF Premium for ₹150/month for unlimited receipt scans.`
      );
    }

    quota.receiptScansUsed++;
    return {
      allowed: true,
      remainingQuota: this.FREE_TIER_RECEIPT_QUOTA - quota.receiptScansUsed,
    };
  }

  private static getUserQuota(userId: string, month: string): MonthlyUsageQuota {
    const key = `${userId}:${month}`;
    let record = this.userQuotas.get(key);
    if (!record) {
      record = { aiRecipesUsed: 0, receiptScansUsed: 0, quotaMonth: month };
      this.userQuotas.set(key, record);
    }
    return record;
  }

  public static resetQuotasForTesting() {
    this.userQuotas.clear();
  }
}
