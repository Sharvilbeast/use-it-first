import { ReceiptProcessingService } from './services/ReceiptProcessingService';
import { RecipeGenerationService } from './services/RecipeGenerationService';
import { ShelfLifeEstimator } from './services/ShelfLifeEstimator';
import { NotificationDaemon } from './services/NotificationDaemon';
import {
  RecipeGenerationRequest,
  RecipeGenerationRequestSchema,
} from './types';

export * from './types';
export * from './services/ReceiptProcessingService';
export * from './services/RecipeGenerationService';
export * from './services/ShelfLifeEstimator';
export * from './services/NotificationDaemon';

/**
 * Production Microservice Controller Integration
 */
export class UIFBackendApp {
  public receiptService: ReceiptProcessingService;
  public recipeService: RecipeGenerationService;
  public notificationDaemon: NotificationDaemon;

  constructor() {
    this.receiptService = new ReceiptProcessingService();
    this.recipeService = new RecipeGenerationService();
    this.notificationDaemon = new NotificationDaemon();
  }

  /**
   * Endpoint handler: POST /api/v1/receipts/scan
   */
  public async handleReceiptScan(imageBuffer: Buffer, mimeType: string = 'image/jpeg') {
    return await this.receiptService.processReceipt(imageBuffer, mimeType);
  }

  /**
   * Endpoint handler: POST /api/v1/recipes/generate
   */
  public async handleRecipeGenerate(rawPayload: unknown) {
    const validatedRequest: RecipeGenerationRequest = RecipeGenerationRequestSchema.parse(rawPayload);
    return await this.recipeService.generateRecipe(validatedRequest);
  }

  /**
   * Endpoint handler: GET /api/v1/pantry/estimate-shelf-life
   */
  public handleShelfLifeEstimation(itemQuery: string, location?: any, isOpen: boolean = false) {
    return ShelfLifeEstimator.estimateShelfLife(itemQuery, location, isOpen);
  }

  /**
   * Cron Trigger: Run notification evaluation batch
   */
  public handleNotificationBatch(items: any[], slot: 'MORNING' | 'EVENING' = 'EVENING') {
    return this.notificationDaemon.evaluateAndQueueNotifications(items, slot);
  }
}
