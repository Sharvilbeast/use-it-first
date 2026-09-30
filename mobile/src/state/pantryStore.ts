import { create } from 'zustand';
import {
  PantryItem,
  ReceiptItemDraft,
  PantryFilterState,
  FreshnessSummary,
  UrgencyStatus,
  StorageLocation,
  OpenStatus,
} from '../types/pantry';

interface PantryStoreState {
  items: PantryItem[];
  filter: PantryFilterState;
  isSyncing: boolean;
  totalSavedINR: number;
  totalWastedINR: number;

  // Actions
  consumeItem: (id: string) => void;
  discardItem: (id: string) => void;
  toggleOpenItem: (id: string) => void;
  batchAddItems: (drafts: ReceiptItemDraft[]) => void;
  setFilter: (patch: Partial<PantryFilterState>) => void;
  resetFilters: () => void;

  // Selectors / Computations
  getFreshnessSummary: () => FreshnessSummary;
  getFilteredItems: () => PantryItem[];
  getExpiringItemNames: () => string[];
  getLocationCounts: () => { all: number; pantry: number; fridge: number; freezer: number };
  getStateCounts: () => { all: number; stored: number; opened: number; expired: number };
}

// Initial realistic seed data for immediate high-fidelity rendering
const initialSeedItems: PantryItem[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    pantryId: 'pantry-home-001',
    name: 'Amul Taaza Homogenised Milk 1L',
    brand: 'Amul',
    category: 'Dairy',
    quantity: 1,
    unit: 'liter',
    purchasePrice: 68.0,
    currency: 'INR',
    purchaseDate: '2026-09-27',
    expiryDate: '2026-09-30',
    location: 'FRIDGE',
    openStatus: 'OPENED',
    openedAt: '2026-09-28T08:00:00Z',
    urgencyStatus: 'USE_TODAY',
    daysRemaining: 0,
    barcode: '8901262010053',
    ocrConfidence: 0.98,
    createdAt: '2026-09-27T10:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    pantryId: 'pantry-home-001',
    name: 'Fresh Paneer 200g',
    brand: 'Mother Dairy',
    category: 'Dairy',
    quantity: 1,
    unit: 'pack',
    purchasePrice: 95.0,
    currency: 'INR',
    purchaseDate: '2026-09-28',
    expiryDate: '2026-10-01',
    location: 'FRIDGE',
    openStatus: 'STORED',
    urgencyStatus: 'USE_TODAY',
    daysRemaining: 1,
    ocrConfidence: 0.95,
    createdAt: '2026-09-28T14:30:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    pantryId: 'pantry-home-001',
    name: 'Fresh Farm Spinach (Palak)',
    brand: null,
    category: 'Produce',
    quantity: 1,
    unit: 'bundle',
    purchasePrice: 35.0,
    currency: 'INR',
    purchaseDate: '2026-09-29',
    expiryDate: '2026-10-04',
    location: 'FRIDGE',
    openStatus: 'STORED',
    urgencyStatus: 'THIS_WEEK',
    daysRemaining: 4,
    ocrConfidence: 0.92,
    createdAt: '2026-09-29T09:15:00Z',
    updatedAt: '2026-09-29T09:15:00Z',
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    pantryId: 'pantry-home-001',
    name: 'Greek Yogurt Blueberry 100g',
    brand: 'Epigamia',
    category: 'Dairy',
    quantity: 2,
    unit: 'cups',
    purchasePrice: 120.0,
    currency: 'INR',
    purchaseDate: '2026-09-25',
    expiryDate: '2026-10-06',
    location: 'FRIDGE',
    openStatus: 'STORED',
    urgencyStatus: 'THIS_WEEK',
    daysRemaining: 6,
    ocrConfidence: 0.96,
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-25T11:00:00Z',
  },
  {
    id: '55555555-5555-4555-a555-555555555555',
    pantryId: 'pantry-home-001',
    name: 'Daawat Rozana Basmati Rice 5kg',
    brand: 'Daawat',
    category: 'Pantry',
    quantity: 1,
    unit: 'bag',
    purchasePrice: 420.0,
    currency: 'INR',
    purchaseDate: '2026-09-01',
    expiryDate: '2027-03-31',
    location: 'PANTRY',
    openStatus: 'STORED',
    urgencyStatus: 'LATER',
    daysRemaining: 182,
    barcode: '8901537001421',
    ocrConfidence: 0.99,
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: '66666666-6666-4666-a666-666666666666',
    pantryId: 'pantry-home-001',
    name: 'Green Peas 1kg',
    brand: 'Safal',
    category: 'Produce',
    quantity: 1,
    unit: 'pack',
    purchasePrice: 150.0,
    currency: 'INR',
    purchaseDate: '2026-08-15',
    expiryDate: '2027-02-15',
    location: 'FREEZER',
    openStatus: 'STORED',
    urgencyStatus: 'LATER',
    daysRemaining: 138,
    ocrConfidence: 0.94,
    createdAt: '2026-08-15T16:00:00Z',
    updatedAt: '2026-08-15T16:00:00Z',
  },
];

export const usePantryStore = create<PantryStoreState>((set, get) => ({
  items: initialSeedItems,
  filter: {
    location: 'ALL',
    state: 'ALL',
    searchQuery: '',
    sortBy: 'URGENCY',
  },
  isSyncing: false,
  totalSavedINR: 1420.0,
  totalWastedINR: 165.0,

  consumeItem: (id: string) => {
    set((state) => {
      const target = state.items.find((i) => i.id === id);
      const savedAmount = target ? target.purchasePrice : 0;
      return {
        items: state.items.filter((i) => i.id !== id),
        totalSavedINR: state.totalSavedINR + savedAmount,
      };
    });
  },

  discardItem: (id: string) => {
    set((state) => {
      const target = state.items.find((i) => i.id === id);
      const wastedAmount = target ? target.purchasePrice : 0;
      return {
        items: state.items.filter((i) => i.id !== id),
        totalWastedINR: state.totalWastedINR + wastedAmount,
      };
    });
  },

  toggleOpenItem: (id: string) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        const newStatus: OpenStatus = item.openStatus === 'STORED' ? 'OPENED' : 'STORED';

        // Accelerate expiry when seal broken
        let newDays = item.daysRemaining;
        if (newStatus === 'OPENED' && item.daysRemaining > 3) {
          newDays = Math.min(item.daysRemaining, 3);
        }

        let newUrgency: UrgencyStatus = item.urgencyStatus;
        if (newDays <= 0) newUrgency = 'EXPIRED';
        else if (newDays <= 2) newUrgency = 'USE_TODAY';
        else if (newDays <= 7) newUrgency = 'THIS_WEEK';
        else newUrgency = 'LATER';

        return {
          ...item,
          openStatus: newStatus,
          daysRemaining: newDays,
          urgencyStatus: newUrgency,
          openedAt: newStatus === 'OPENED' ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  batchAddItems: (drafts: ReceiptItemDraft[]) => {
    const selectedDrafts = drafts.filter((d) => d.isSelected);
    const newItems: PantryItem[] = selectedDrafts.map((draft, idx) => {
      let urgency: UrgencyStatus = 'LATER';
      if (draft.estimatedShelfLifeDays <= 0) urgency = 'EXPIRED';
      else if (draft.estimatedShelfLifeDays <= 2) urgency = 'USE_TODAY';
      else if (draft.estimatedShelfLifeDays <= 7) urgency = 'THIS_WEEK';

      return {
        id: `item-${Date.now()}-${idx}`,
        pantryId: 'pantry-home-001',
        name: draft.name,
        category: draft.category,
        quantity: draft.quantity,
        unit: draft.unit,
        purchasePrice: draft.estimatedPrice,
        currency: 'INR',
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: draft.expiryDate,
        location: draft.storageLocation,
        openStatus: 'STORED',
        urgencyStatus: urgency,
        daysRemaining: draft.estimatedShelfLifeDays,
        ocrConfidence: draft.confidence,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    set((state) => ({
      items: [...newItems, ...state.items],
    }));
  },

  setFilter: (patch) => {
    set((state) => ({
      filter: { ...state.filter, ...patch },
    }));
  },

  resetFilters: () => {
    set({
      filter: {
        location: 'ALL',
        state: 'ALL',
        searchQuery: '',
        sortBy: 'URGENCY',
      },
    });
  },

  getFreshnessSummary: () => {
    const items = get().items;
    const total = items.length;
    if (total === 0) {
      return {
        score: 100,
        useTodayCount: 0,
        thisWeekCount: 0,
        laterCount: 0,
        expiredCount: 0,
        totalActiveCount: 0,
        redRatio: 0,
        amberRatio: 0,
        greenRatio: 1,
      };
    }

    const useTodayCount = items.filter((i) => i.urgencyStatus === 'USE_TODAY').length;
    const thisWeekCount = items.filter((i) => i.urgencyStatus === 'THIS_WEEK').length;
    const laterCount = items.filter((i) => i.urgencyStatus === 'LATER').length;
    const expiredCount = items.filter((i) => i.urgencyStatus === 'EXPIRED').length;

    // Freshness score calculation:
    // Safe items: 100 pts, This Week: 60 pts, Use Today: 20 pts, Expired: 0 pts
    const weightedPoints = laterCount * 100 + thisWeekCount * 60 + useTodayCount * 20 + expiredCount * 0;
    const score = Math.round(weightedPoints / total);

    return {
      score,
      useTodayCount,
      thisWeekCount,
      laterCount,
      expiredCount,
      totalActiveCount: total,
      redRatio: (useTodayCount + expiredCount) / total,
      amberRatio: thisWeekCount / total,
      greenRatio: laterCount / total,
    };
  },

  getFilteredItems: () => {
    const { items, filter } = get();

    return items
      .filter((item) => {
        // Location filter
        if (filter.location !== 'ALL' && item.location !== filter.location) {
          return false;
        }

        // State filter
        if (filter.state === 'STORED' && item.openStatus !== 'STORED') return false;
        if (filter.state === 'OPENED' && item.openStatus !== 'OPENED') return false;
        if (filter.state === 'EXPIRED' && item.urgencyStatus !== 'EXPIRED') return false;

        // Search Query
        if (filter.searchQuery.trim().length > 0) {
          const query = filter.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchCategory = item.category.toLowerCase().includes(query);
          const matchBrand = item.brand ? item.brand.toLowerCase().includes(query) : false;
          if (!matchName && !matchCategory && !matchBrand) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'URGENCY') {
          const priorityOrder: Record<UrgencyStatus, number> = {
            USE_TODAY: 1,
            THIS_WEEK: 2,
            LATER: 3,
            EXPIRED: 4,
          };
          return priorityOrder[a.urgencyStatus] - priorityOrder[b.urgencyStatus];
        }
        if (filter.sortBy === 'EXPIRY_ASC') {
          return a.daysRemaining - b.daysRemaining;
        }
        if (filter.sortBy === 'EXPIRY_DESC') {
          return b.daysRemaining - a.daysRemaining;
        }
        return a.name.localeCompare(b.name);
      });
  },

  getExpiringItemNames: () => {
    return get()
      .items.filter((i) => i.urgencyStatus === 'USE_TODAY' || i.urgencyStatus === 'THIS_WEEK')
      .map((i) => i.name);
  },

  getLocationCounts: () => {
    const items = get().items;
    return {
      all: items.length,
      pantry: items.filter((i) => i.location === 'PANTRY').length,
      fridge: items.filter((i) => i.location === 'FRIDGE').length,
      freezer: items.filter((i) => i.location === 'FREEZER').length,
    };
  },

  getStateCounts: () => {
    const items = get().items;
    return {
      all: items.length,
      stored: items.filter((i) => i.openStatus === 'STORED' && i.urgencyStatus !== 'EXPIRED').length,
      opened: items.filter((i) => i.openStatus === 'OPENED' && i.urgencyStatus !== 'EXPIRED').length,
      expired: items.filter((i) => i.urgencyStatus === 'EXPIRED').length,
    };
  },
}));
