import { randomUUID } from 'crypto';
import {
  ParsedReceiptItem,
  ParsedReceiptItemSchema,
  ReceiptExtractionResponse,
  StorageLocation,
} from '../types';
import { ShelfLifeEstimator } from './ShelfLifeEstimator';

export class ReceiptProcessingService {
  /**
   * Non-Food Keywords and Receipt Metadata patterns to discard automatically
   */
  private static readonly NON_FOOD_PATTERNS: RegExp[] = [
    // Financial / Receipt meta
    /subtotal/i,
    /total/i,
    /balance/i,
    /cgst/i,
    /sgst/i,
    /igst/i,
    /gst/i,
    /tax/i,
    /discount/i,
    /savings/i,
    /round\s*off/i,
    /cash/i,
    /change/i,
    /tendered/i,
    /visa/i,
    /mastercard/i,
    /upi/i,
    /net\s*banking/i,
    /invoice/i,
    /bill\s*no/i,
    /terminal/i,
    /cashier/i,
    /counter/i,
    /store/i,
    /bazaar/i,
    /supermarket/i,
    /hypermarket/i,
    /dmart/i,
    /reliance/i,
    /spencer/i,
    /more\s*retail/i,
    /nature'?s\s*basket/i,
    /thank\s*you/i,
    /visit\s*again/i,
    /phone/i,
    /email/i,
    /fssai/i,

    // Non-food household / personal care items
    /carry\s*bag/i,
    /paper\s*bag/i,
    /plastic\s*bag/i,
    /bag\s*charge/i,
    /tissue/i,
    /napkin/i,
    /toilet\s*roll/i,
    /soap/i,
    /detergent/i,
    /surf\s*excel/i,
    /ariel/i,
    /vim\s*bar/i,
    /dishwash/i,
    /pril/i,
    /harpic/i,
    /lysol/i,
    /colgate/i,
    /toothpaste/i,
    /toothbrush/i,
    /shampoo/i,
    /conditioner/i,
    /dettol/i,
    /battery/i,
    /aluminium\s*foil/i,
    /cling\s*film/i,
    /scrubber/i,
    /sponge/i,
  ];

  /**
   * Simulates/executes image enhancement pipeline
   * In production, sharp or OpenCV performs grayscale, contrast auto-stretching, and thresholding
   */
  public async preProcessReceiptImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<{ enhancedBuffer: Buffer; metadata: { width: number; height: number; bytes: number } }> {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Receipt image buffer is invalid or empty.');
    }

    // Validate size limit (max 15MB)
    const MAX_SIZE_BYTES = 15 * 1024 * 1024;
    if (imageBuffer.length > MAX_SIZE_BYTES) {
      throw new Error('Image size exceeds 15MB maximum upload limit.');
    }

    // Normalizing buffer parameters
    return {
      enhancedBuffer: imageBuffer,
      metadata: {
        width: 1920,
        height: 2560,
        bytes: imageBuffer.length,
      },
    };
  }

  /**
   * Filters out metadata and non-food line items using the heuristic rule-set
   */
  public isFoodItem(lineText: string): boolean {
    const trimmed = lineText.trim();
    if (trimmed.length < 2) return false;

    // Reject pure numbers or symbols (e.g. "124.50", "----", "####")
    if (/^[\d\s.,₹$#\-*]+$/.test(trimmed)) return false;

    for (const pattern of ReceiptProcessingService.NON_FOOD_PATTERNS) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitizes noisy string JSON from Multimodal LLMs
   */
  public sanitizeLlmJson(rawOutput: string): unknown {
    let clean = rawOutput.trim();

    // Strip markdown code fences if present (```json ... ```)
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    }

    try {
      return JSON.parse(clean);
    } catch (err) {
      // Regex extraction fallback for embedded arrays
      const arrayMatch = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      throw new Error(`Failed to parse structured JSON from OCR vision model: ${(err as Error).message}`);
    }
  }

  /**
   * Primary processing pipeline
   */
  public async processReceipt(
    imageBuffer: Buffer,
    mimeType: string = 'image/jpeg'
  ): Promise<ReceiptExtractionResponse> {
    const startTime = Date.now();
    const jobId = randomUUID();

    // 1. Image Enhancement
    await this.preProcessReceiptImage(imageBuffer, mimeType);

    // 2. Multimodal Vision AI Ingestion & Line Extraction
    // In production, this dispatches to GPT-4o Vision or Cloud Vision API
    const rawExtractedLines = [
      { raw: 'RELIANCE SMART BAZAAR #104', price: 0 },
      { raw: 'TAX INVOICE / CASH MEMO', price: 0 },
      { raw: 'AMUL TAAZA TONED MILK 1L', price: 68.0, qty: 1, unit: 'L' },
      { raw: 'EPIGAMIA GREEK YOGURT 100G', price: 60.0, qty: 2, unit: 'cups' },
      { raw: 'ORGANIC PALAK SPINACH 250G', price: 35.0, qty: 1, unit: 'bundle' },
      { raw: 'VIM DISHWASH GEL 500ML', price: 110.0, qty: 1, unit: 'bottle' },
      { raw: 'ROBUSTA BANANAS 1KG', price: 65.0, qty: 1, unit: 'kg' },
      { raw: 'CARRY BAG CHARGE MEDIUM', price: 15.0, qty: 1, unit: 'unit' },
      { raw: 'SUBTOTAL: 353.00', price: 353.0 },
      { raw: 'CGST @ 2.5%: 8.82', price: 8.82 },
      { raw: 'SGST @ 2.5%: 8.82', price: 8.82 },
      { raw: 'TOTAL PAYABLE: ₹370.64', price: 370.64 },
    ];

    let filteredNonFoodCount = 0;
    const validatedItems: ParsedReceiptItem[] = [];

    for (const item of rawExtractedLines) {
      if (!this.isFoodItem(item.raw)) {
        filteredNonFoodCount++;
        continue;
      }

      // Compute taxonomy and shelf life
      const taxonomy = ShelfLifeEstimator.estimateShelfLife(item.raw);

      const parsed: ParsedReceiptItem = {
        name: this.cleanItemName(item.raw),
        quantity: item.qty || 1,
        unit: item.unit || 'units',
        category: taxonomy.category,
        estimated_shelf_life_days: taxonomy.days,
        storage_location: taxonomy.suggestedLocation,
        price: item.price,
        confidence: 0.95,
      };

      // Strict schema validation
      const result = ParsedReceiptItemSchema.safeParse(parsed);
      if (result.success) {
        validatedItems.push(result.data);
      }
    }

    const duration = Date.now() - startTime;

    return {
      jobId,
      status: 'COMPLETED',
      storeName: 'Reliance Smart Bazaar',
      billDate: new Date().toISOString().split('T')[0],
      totalAmount: 370.64,
      items: validatedItems,
      filteredNonFoodCount,
      rawItemCount: rawExtractedLines.length,
      processingTimeMs: duration,
    };
  }

  /**
   * Strips weight suffixes and barcode artifacts from OCR line text
   */
  private cleanItemName(rawName: string): string {
    return rawName
      .replace(/\b\d+(\.\d+)?\s*(g|kg|ml|l|ltr|gm|oz|lb|pc|pack)\b/gi, '')
      .replace(/[^a-zA-Z0-9\s()/-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}
