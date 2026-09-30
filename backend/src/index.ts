import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
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

/**
 * Builds and returns the Fastify HTTP server instance
 */
export async function buildFastifyServer() {
  const server = Fastify({ logger: false });
  const app = new UIFBackendApp();

  await server.register(cors, { origin: true });
  await server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  // Health Check
  server.get('/health', async () => {
    return {
      status: 'ok',
      service: 'use-it-first-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });

  // Estimate Shelf Life
  server.get('/api/v1/pantry/estimate-shelf-life', async (request, reply) => {
    const query = request.query as { item?: string; location?: string; isOpen?: string };
    if (!query.item) {
      return reply.status(400).send({ error: 'Query parameter "item" is required' });
    }
    const isOpen = query.isOpen === 'true' || query.isOpen === '1';
    return app.handleShelfLifeEstimation(query.item, query.location, isOpen);
  });

  // Recipe Generation
  server.post('/api/v1/recipes/generate', async (request, reply) => {
    try {
      const result = await app.handleRecipeGenerate(request.body);
      return result;
    } catch (err: any) {
      return reply.status(400).send({ error: 'Validation Error', message: err.message });
    }
  });

  // Receipt Scan
  server.post('/api/v1/receipts/scan', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No receipt file uploaded' });
      }
      const buffer = await data.toBuffer();
      const result = await app.handleReceiptScan(buffer, data.mimetype);
      return result;
    } catch (err: any) {
      return reply.status(500).send({ error: 'Receipt processing error', message: err.message });
    }
  });

  return server;
}

/**
 * CLI Server Entry Point
 */
export async function startServer(port: number = Number(process.env.PORT) || 8080) {
  const server = await buildFastifyServer();
  try {
    const address = await server.listen({ port, host: '0.0.0.0' });
    console.log(`================================================================`);
    console.log(`USE IT FIRST (UIF) - FASTIFY BACKEND API RUNNING`);
    console.log(`API URL: ${address}`);
    console.log(`Health:  ${address}/health`);
    console.log(`================================================================`);
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
