import { createHash } from 'crypto';
import { DietaryConstraint, ExpiringIngredient, GeneratedRecipe } from '../types';
import { RecipeGenerationService } from './RecipeGenerationService';

export interface CachedRecipeEntry {
  cacheKey: string;
  recipe: GeneratedRecipe;
  ingredientFingerprint: string;
  dietaryFingerprint: string;
  createdAt: number;
  expiresAt: number; // TTL (e.g. 24 hours)
  hitCount: number;
}

export class SpeculativeRecipeCache {
  private cache = new Map<string, CachedRecipeEntry>();
  private readonly DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24-hour cache TTL
  private recipeGenerator: RecipeGenerationService;

  constructor(recipeGenerator?: RecipeGenerationService) {
    this.recipeGenerator = recipeGenerator || new RecipeGenerationService();
  }

  /**
   * Generates a deterministic semantic fingerprint for an ingredient collection
   * Example: ['Paneer 200g', 'Fresh Spinach'] -> sha256("paneer:spinach|diet:VEGETARIAN")
   */
  public generateFingerprint(
    items: ExpiringIngredient[],
    dietary: DietaryConstraint[]
  ): string {
    const sortedNormalizedIngredients = items
      .map((i) => i.name.toLowerCase().trim().replace(/[^a-z0-9]/g, ''))
      .sort()
      .join(':');

    const sortedDietary = [...dietary].sort().join(',');
    const rawSignature = `${sortedNormalizedIngredients}|diet:${sortedDietary}`;

    return createHash('sha256').update(rawSignature).digest('hex').substring(0, 16);
  }

  /**
   * Fetches cached recipe or executes generation on miss
   */
  public async getOrGenerate(
    userId: string,
    pantryId: string,
    expiringItems: ExpiringIngredient[],
    dietary: DietaryConstraint[] = []
  ): Promise<{ recipe: GeneratedRecipe; isCacheHit: boolean; latencyMs: number }> {
    const startTime = Date.now();
    const fingerprint = this.generateFingerprint(expiringItems, dietary);
    const cacheKey = `recipe:user:${userId}:${fingerprint}`;

    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      cached.hitCount++;
      const latencyMs = Date.now() - startTime;
      return {
        recipe: cached.recipe,
        isCacheHit: true,
        latencyMs,
      };
    }

    // Cache Miss: Invoke generation service
    const recipe = await this.recipeGenerator.generateRecipe({
      userId,
      pantryId,
      expiringItems,
      pantryStaples: ['Cooking Oil', 'Salt', 'Black Pepper', 'Garlic', 'Onion'],
      dietaryConstraints: dietary,
      maxPrepTimeMinutes: 30,
      servings: 2,
    });

    // Store in cache with TTL
    this.cache.set(cacheKey, {
      cacheKey,
      recipe,
      ingredientFingerprint: fingerprint,
      dietaryFingerprint: dietary.join(','),
      createdAt: now,
      expiresAt: now + this.DEFAULT_TTL_MS,
      hitCount: 0,
    });

    const latencyMs = Date.now() - startTime;
    return {
      recipe,
      isCacheHit: false,
      latencyMs,
    };
  }

  /**
   * Speculative Pre-generator: Called by background worker when items enter USE_TODAY status
   */
  public async prewarmCacheForUser(
    userId: string,
    pantryId: string,
    urgentItems: ExpiringIngredient[],
    dietary: DietaryConstraint[] = []
  ): Promise<boolean> {
    if (urgentItems.length === 0) return false;

    const fingerprint = this.generateFingerprint(urgentItems, dietary);
    const cacheKey = `recipe:user:${userId}:${fingerprint}`;

    if (this.cache.has(cacheKey)) {
      return true; // Already warm
    }

    try {
      await this.getOrGenerate(userId, pantryId, urgentItems, dietary);
      return true;
    } catch {
      return false;
    }
  }

  public getCacheStats(): { size: number; totalHits: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
    }
    return {
      size: this.cache.size,
      totalHits,
    };
  }
}
