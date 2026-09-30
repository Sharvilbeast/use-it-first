import { z } from 'zod';

export type StorageLocation = 'PANTRY' | 'FRIDGE' | 'FREEZER';
export type OpenStatus = 'STORED' | 'OPENED';
export type UrgencyStatus = 'USE_TODAY' | 'THIS_WEEK' | 'LATER' | 'EXPIRED';
export type TriageAction = 'CONSUMED' | 'DISCARDED' | 'OPENED';

export const StorageLocationSchema = z.enum(['PANTRY', 'FRIDGE', 'FREEZER']);
export const OpenStatusSchema = z.enum(['STORED', 'OPENED']);
export const UrgencyStatusSchema = z.enum(['USE_TODAY', 'THIS_WEEK', 'LATER', 'EXPIRED']);

export const PantryItemSchema = z.object({
  id: z.string().uuid(),
  pantryId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  brand: z.string().optional().nullable(),
  category: z.string().default('Produce'),
  quantity: z.number().positive(),
  unit: z.string().default('units'),
  purchasePrice: z.number().nonnegative().default(0),
  currency: z.string().default('INR'),
  purchaseDate: z.string(), // ISO 8601 YYYY-MM-DD
  expiryDate: z.string(),   // ISO 8601 YYYY-MM-DD
  location: StorageLocationSchema,
  openStatus: OpenStatusSchema,
  openedAt: z.string().optional().nullable(),
  urgencyStatus: UrgencyStatusSchema,
  daysRemaining: z.number().int(),
  barcode: z.string().optional().nullable(),
  ocrConfidence: z.number().min(0).max(1).optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PantryItem = z.infer<typeof PantryItemSchema>;

export const ReceiptItemDraftSchema = z.object({
  tempId: z.string(),
  name: z.string().min(1),
  quantity: z.number().positive().default(1),
  unit: z.string().default('units'),
  category: z.string().default('Produce'),
  estimatedShelfLifeDays: z.number().int().positive(),
  storageLocation: StorageLocationSchema,
  expiryDate: z.string(), // YYYY-MM-DD
  estimatedPrice: z.number().nonnegative().default(0),
  confidence: z.number().min(0).max(1).default(0.9),
  isSelected: z.boolean().default(true),
});

export type ReceiptItemDraft = z.infer<typeof ReceiptItemDraftSchema>;

export interface FreshnessSummary {
  score: number; // 0 to 100
  useTodayCount: number;
  thisWeekCount: number;
  laterCount: number;
  expiredCount: number;
  totalActiveCount: number;
  redRatio: number;
  amberRatio: number;
  greenRatio: number;
}

export type LocationFilter = 'ALL' | StorageLocation;
export type StateFilter = 'ALL' | OpenStatus | 'EXPIRED';

export interface PantryFilterState {
  location: LocationFilter;
  state: StateFilter;
  searchQuery: string;
  sortBy: 'URGENCY' | 'EXPIRY_ASC' | 'EXPIRY_DESC' | 'NAME_ASC';
}

export interface RecipeIngredientMatch {
  pantryItemId?: string;
  name: string;
  quantity: string;
  urgency: UrgencyStatus;
  isExpiring: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  wasteRescueScore: number; // 0 to 100
  expiringItemsUtilized: RecipeIngredientMatch[];
  additionalStaplesRequired: string[];
  stepByStepInstructions: string[];
  nutritionalHighlights?: string;
  estimatedMoneySaved: number;
}
