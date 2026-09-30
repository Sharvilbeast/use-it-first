/**
 * Privacy-First Receipt Ingestion & Data Sanitization Engine
 * Complies with India Digital Personal Data Protection (DPDP) Act 2023 and GDPR Article 5(1)(e).
 */

export interface SanitizedReceiptMetadata {
  sanitizedText: string;
  financialDataDetected: boolean;
  redactedCardMatchesCount: number;
  redactedPiiMatchesCount: number;
}

export class ReceiptPurgeMiddleware {
  // Regex pattern matching 13-16 digit credit/debit cards with optional spaces or dashes
  private static readonly CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;

  // Regex pattern matching 10-digit Indian/international mobile numbers
  private static readonly PHONE_REGEX = /\b(?:\+91[\-\s]?)?[6789]\d{9}\b/g;

  // Regex pattern matching UPI IDs (e.g. rohan@okhdfcbank, user@upi)
  private static readonly UPI_REGEX = /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g;

  /**
   * Redacts sensitive financial numbers, phone numbers, and UPI handles from OCR text
   */
  public static sanitizeReceiptText(rawOcrText: string): SanitizedReceiptMetadata {
    let sanitizedText = rawOcrText;
    let redactedCardMatchesCount = 0;
    let redactedPiiMatchesCount = 0;

    // 1. Redact Payment Cards
    const cardMatches = sanitizedText.match(this.CARD_REGEX);
    if (cardMatches) {
      redactedCardMatchesCount = cardMatches.length;
      sanitizedText = sanitizedText.replace(this.CARD_REGEX, '[REDACTED_CARD_NUMBER]');
    }

    // 2. Redact Phone Numbers
    const phoneMatches = sanitizedText.match(this.PHONE_REGEX);
    if (phoneMatches) {
      redactedPiiMatchesCount += phoneMatches.length;
      sanitizedText = sanitizedText.replace(this.PHONE_REGEX, '[REDACTED_PHONE]');
    }

    // 3. Redact UPI Handles
    const upiMatches = sanitizedText.match(this.UPI_REGEX);
    if (upiMatches) {
      // Exclude generic email domains if needed, otherwise redact
      redactedPiiMatchesCount += upiMatches.length;
      sanitizedText = sanitizedText.replace(this.UPI_REGEX, '[REDACTED_UPI_ID]');
    }

    return {
      sanitizedText,
      financialDataDetected: redactedCardMatchesCount > 0,
      redactedCardMatchesCount,
      redactedPiiMatchesCount,
    };
  }

  /**
   * Secure in-memory buffer purge to prevent residual forensic extraction from RAM
   */
  public static secureWipeBuffer(buffer: Buffer): void {
    if (buffer && buffer.length > 0) {
      buffer.fill(0); // Zero out all memory addresses
    }
  }

  /**
   * S3 Lifecycle Rule Configuration for 48-Hour Auto-Purge
   */
  public static getS3AutoPurgePolicy() {
    return {
      Rules: [
        {
          ID: 'UIF-Ephemeral-Receipt-Auto-Purge-48H',
          Status: 'Enabled',
          Filter: {
            Prefix: 'receipts/raw/',
          },
          Expiration: {
            Days: 2, // Auto-delete after 48 hours
          },
          AbortIncompleteMultipartUpload: {
            DaysAfterInitiation: 1,
          },
        },
      ],
    };
  }
}
