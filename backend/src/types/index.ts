import { z } from 'zod';

export const StorageLocationSchema = z.enum(['FRIDGE', 'FREEZER', 'PANTRY']);
export type StorageLocation = z.infer<typeof StorageLocationSchema>;

export const UrgencyStatusSchema = z.enum(['USE_TODAY', 'THIS_WEEK', 'LATER', 'EXPIRED']);
export type UrgencyStatus = z.infer<typeof UrgencyStatusSchema>;

export const ParsedReceiptItemSchema = z.object({
  name: z.string().min(1, 'Item name cannot be empty'),
  quantity: z.number().positive().default(1),
  unit: z.string().default('units'),
  category: z.string().default('Produce'),
  estimated_shelf_life_days: z.number().int().positive(),
  storage_location: StorageLocationSchema,
  price: z.number().nonnegative().optional(),
  confidence: z.number().min(0).max(1).default(0.9),
});

export type ParsedReceiptItem = z.infer<typeof ParsedReceiptItemSchema>;

export const ReceiptExtractionResponseSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['COMPLETED', 'FAILED']),
  storeName: z.string().nullable(),
  billDate: z.string().nullable(),
  totalAmount: z.number().nullable(),
  items: z.array(ParsedReceiptItemSchema),
  filteredNonFoodCount: z.number().int().nonnegative(),
  rawItemCount: z.number().int().nonnegative(),
  processingTimeMs: z.number().nonnegative(),
});

export type ReceiptExtractionResponse = z.infer<typeof ReceiptExtractionResponseSchema>;

export const DietaryConstraintSchema = z.enum([
  'VEGETARIAN',
  'VEGAN',
  'GLUTEN_FREE',
  'DAIRY_FREE',
  'JAIN',
  'NUT_FREE',
  'HALAL',
  'LOW_CARB',
]);
export type DietaryConstraint = z.infer<typeof DietaryConstraintSchema>;

export const ExpiringIngredientSchema = z.object({
  pantryItemId: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: numberOrStringToString(),
  daysRemaining: z.number(),
  urgencyStatus: z.enum(['USE_TODAY', 'THIS_WEEK']),
});

function numberOrStringToString() {
  return z.union([z.string(), z.number()]).transform((val) => String(val));
}

export type ExpiringIngredient = z.infer<typeof ExpiringIngredientSchema>;

export const RecipeGenerationRequestSchema = z.object({
  userId: z.string(),
  pantryId: z.string(),
  expiringItems: z.array(ExpiringIngredientSchema).min(1, 'At least one expiring item required'),
  pantryStaples: z.array(z.string()).default([
    'Salt',
    'Black Pepper',
    'Cooking Oil',
    'Garlic',
    'Onion',
    'Cumin Seeds',
    'Turmeric',
  ]),
  dietaryConstraints: z.array(DietaryConstraintSchema).default([]),
  maxPrepTimeMinutes: z.number().positive().default(30),
  servings: z.number().positive().default(2),
});

export type RecipeGenerationRequest = z.infer<typeof RecipeGenerationRequestSchema>;

export const GeneratedRecipeSchema = z.object({
  recipeTitle: z.string().min(3),
  description: z.string(),
  prepTimeMinutes: z.number().int().positive(),
  cookTimeMinutes: z.number().int().positive(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  servings: z.number().int().positive(),
  wasteRescueScore: z.number().int().min(0).max(100),
  exactExpiringItemsUtilized: z.array(
    z.object({
      name: z.string(),
      pantryItemId: z.string().optional(),
      amountUsed: z.string(),
    })
  ),
  additionalPantryItemsRequired: z.array(z.string()),
  stepByStepCookingDirections: z.array(z.string()).min(2),
  chefTips: z.string().optional(),
  estimatedMoneySavedINR: z.number().nonnegative(),
});

export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;

export interface PushNotificationPayload {
  userId: string;
  recipientToken: string;
  title: string;
  body: string;
  category: 'EXPIRY_ALERT' | 'RECIPE_PROMPT' | 'WEEKLY_DIGEST';
  data: {
    expiringItemIds: string[];
    deepLink: string;
    urgencyLevel: 'URGENT' | 'WARNING';
  };
  scheduledTimeUTC: string;
}
