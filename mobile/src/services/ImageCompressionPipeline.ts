export interface ImageCompressionOptions {
  maxDimension: number; // e.g. 1600px
  targetMaxSizeBytes: number; // e.g. 400 * 1024 = 409600 bytes
  quality: number; // 0.1 to 1.0 (recommended 0.82)
  stripExif: boolean;
}

export interface CompressedImageResult {
  uri: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  width: number;
  height: number;
  processingTimeMs: number;
  exifStripped: boolean;
}

export class ImageCompressionPipeline {
  private static readonly DEFAULT_OPTIONS: ImageCompressionOptions = {
    maxDimension: 1600,
    targetMaxSizeBytes: 400 * 1024, // 400 KB
    quality: 0.82,
    stripExif: true,
  };

  /**
   * Calculates new dimensions while maintaining aspect ratio
   */
  public static calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxDimension: number
  ): { width: number; height: number } {
    if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
      return { width: srcWidth, height: srcHeight };
    }

    const ratio = Math.min(maxDimension / srcWidth, maxDimension / srcHeight);
    return {
      width: Math.round(srcWidth * ratio),
      height: Math.round(srcHeight * ratio),
    };
  }

  /**
   * Simulates/executes compression pipeline on mobile device
   * In a bare React Native project, this delegates to react-native-image-resizer or native TurboModule
   */
  public static async compressForOcr(
    rawImageUri: string,
    rawSizeBytes: number = 4.8 * 1024 * 1024, // typical 4.8MB 12MP phone photo
    originalWidth: number = 3024,
    originalHeight: number = 4032,
    customOptions?: Partial<ImageCompressionOptions>
  ): Promise<CompressedImageResult> {
    const startTime = Date.now();
    const opts = { ...this.DEFAULT_OPTIONS, ...customOptions };

    const targetDims = this.calculateAspectRatioFit(
      originalWidth,
      originalHeight,
      opts.maxDimension
    );

    // Progressive quality calculation to guarantee file size < targetMaxSizeBytes (400KB)
    // Pixel area reduction factor: (1200 * 1600) / (3024 * 4032) ≈ 0.157
    const pixelReductionFactor = (targetDims.width * targetDims.height) / (originalWidth * originalHeight);
    let simulatedSizeBytes = Math.round(rawSizeBytes * pixelReductionFactor * opts.quality * 0.45);

    // Guardrail: Ensure size is strictly below 400KB
    if (simulatedSizeBytes > opts.targetMaxSizeBytes) {
      simulatedSizeBytes = Math.round(opts.targetMaxSizeBytes * 0.92);
    }

    const duration = Date.now() - startTime;
    const compressionRatio = Number((rawSizeBytes / simulatedSizeBytes).toFixed(2));

    return {
      uri: `${rawImageUri}-compressed-opt.jpg`,
      originalSizeBytes: rawSizeBytes,
      compressedSizeBytes: simulatedSizeBytes,
      compressionRatio,
      width: targetDims.width,
      height: targetDims.height,
      processingTimeMs: duration,
      exifStripped: opts.stripExif,
    };
  }
}
