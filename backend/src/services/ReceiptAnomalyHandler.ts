/**
 * Advanced Receipt Anomaly & Abbreviation Normalization Engine
 * Handles real-world supermarket thermal slips: crumpled paper, faded ink,
 * common OCR character confusions, store discount lines, and non-standard abbreviations.
 */

export interface NormalizedLineItem {
  rawLine: string;
  normalizedName: string;
  price: number;
  discountApplied: number;
  isDiscountOrPromo: boolean;
  isStoreHeader: boolean;
  confidenceAdjustment: number;
}

export class ReceiptAnomalyHandler {
  // Common supermarket and inventory abbreviations dictionary
  private static readonly ABBREVIATION_MAP: Record<string, string> = {
    // Produce
    'ORG': 'Organic',
    'SPNCH': 'Spinach',
    'BNDL': 'Bundle',
    'TOM': 'Tomato',
    'CHRY': 'Cherry',
    'POT': 'Potato',
    'ONN': 'Onion',
    'COR': 'Coriander',
    'BAN': 'Banana',
    'ROB': 'Robusta',
    'APL': 'Apple',
    'CAR': 'Carrot',
    'CUC': 'Cucumber',

    // Dairy
    'MLK': 'Milk',
    'TZA': 'Taaza',
    'PANEER': 'Paneer',
    'BLK': 'Block',
    'YGT': 'Yogurt',
    'BTR': 'Butter',
    'CHZ': 'Cheese',
    'SLCS': 'Slices',
    'CURD': 'Curd',
    'DHI': 'Dahi',

    // Bakery & Pantry
    'BRD': 'Bread',
    'WHL': 'Whole',
    'WHT': 'Wheat',
    'RCE': 'Rice',
    'BSMTI': 'Basmati',
    'PSTA': 'Pasta',
    'OAT': 'Oats',
    'FLR': 'Flour',
    'ATT': 'Atta',

    // Units & Measures
    'KG': 'kg',
    'GM': 'g',
    'GMS': 'g',
    'LTR': 'L',
    'LT': 'L',
    'ML': 'ml',
    'PKT': 'Pack',
    'PC': 'Piece',
    'PCS': 'Pieces',
  };

  // OCR Character Confusion Map for Thermal Slips
  private static readonly OCR_CHAR_CONFUSIONS: Array<[RegExp, string]> = [
    // Zero confused with capital O or o adjacent to digits or decimals
    [/(?<=[\d.])O(?=[\d.\s]|$)/g, '0'],
    [/(?<=[\d.])o(?=[\d.\s]|$)/g, '0'],
    [/(?<=^|\s)O(?=[\d.])/g, '0'],
    // One confused with uppercase I, lowercase l, or pipe | in digits
    [/(?<=\d)[I|l](?=\d)/g, '1'],
    // Five confused with S in price tails
    [/(?<=\d\.)S/g, '5'],
    // Eight confused with capital B in digits
    [/(?<=\d)B(?=\d)/g, '8'],
  ];

  // Regex patterns detecting discount, promo, or cashback adjustments
  private static readonly DISCOUNT_PATTERNS: RegExp[] = [
    /(?:disc(?:ount)?|promo(?:tion)?|rebate|savings|deal|bogo|off)\b/i,
    /buy\s*\d+\s*get\s*\d+/i,
    /-\s*[₹$]?\s*\d+(?:\.\d{2})?/,
    /cashback/i,
    /coupon/i,
  ];

  /**
   * Pre-sanitizes OCR text by resolving known optical character confusions
   */
  public static fixOcrCharacterConfusions(line: string): string {
    let corrected = line;
    for (const [pattern, replacement] of this.OCR_CHAR_CONFUSIONS) {
      corrected = corrected.replace(pattern, replacement);
    }
    return corrected;
  }

  /**
   * Identifies discount, voucher, or BOGO promotional lines
   */
  public static isDiscountOrPromoLine(line: string): boolean {
    return this.DISCOUNT_PATTERNS.some((pattern) => pattern.test(line));
  }

  /**
   * Expands dense grocery abbreviations into standardized food names
   * Example: "ORG SPNCH BNDL 250G" -> "Organic Spinach Bundle 250g"
   */
  public static expandAbbreviations(rawItemName: string): string {
    // 1. Separate attached quantities and unit suffixes (e.g. "1LTR" -> "1 LTR", "200GM" -> "200 GM")
    let prepared = rawItemName.replace(/(\d+)\s*(KG|GMS|GM|G|LTR|LT|L|ML|PKT|PCS|PC)\b/gi, '$1 $2');

    // 2. Tokenize
    const tokens = prepared.split(/[\s,._/-]+/);
    const expandedTokens = tokens.map((token, index) => {
      const upper = token.toUpperCase();
      if (this.ABBREVIATION_MAP[upper]) {
        return this.ABBREVIATION_MAP[upper];
      }

      // Convert ALL-CAPS words to Title Case for visual polish (e.g. "AMUL" -> "Amul")
      if (/^[A-Z]{2,}$/.test(token) && token.length > 2) {
        return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
      }

      return token;
    });

    // 3. Re-combine units into standard formatting (e.g. "200 g" -> "200g", "1 L" -> "1L")
    return expandedTokens
      .join(' ')
      .replace(/(\d+)\s+(g|kg|ml|L|pack)\b/gi, '$1$2')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Normalizes a raw scanned receipt line into a validated, discount-aware line item
   */
  public static normalizeReceiptLine(rawLine: string): NormalizedLineItem {
    const cleanedLine = this.fixOcrCharacterConfusions(rawLine.trim());
    const isPromo = this.isDiscountOrPromoLine(cleanedLine);

    // Extract potential price at end of line (e.g. "95.00", "₹120.50", "35.0")
    const priceMatch = cleanedLine.match(/[-]?\s*[₹$]?\s*(\d+(?:\.\d{1,2})?)\s*$/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

    // Remove price portion to isolate name
    const rawNameOnly = priceMatch
      ? cleanedLine.substring(0, priceMatch.index).trim()
      : cleanedLine;

    const normalizedName = this.expandAbbreviations(rawNameOnly);

    return {
      rawLine,
      normalizedName,
      price,
      discountApplied: isPromo ? Math.abs(price) : 0,
      isDiscountOrPromo: isPromo,
      isStoreHeader: /tax\s*invoice|cashier|supermarket|mart|store/i.test(cleanedLine),
      confidenceAdjustment: isPromo ? 0.5 : 0.95,
    };
  }
}
