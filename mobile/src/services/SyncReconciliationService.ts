import { PantryItem, TriageAction } from '../types/pantry';

export interface MutationLogEntry {
  id: string; // UUID of mutation
  itemId: string;
  action: TriageAction | 'CREATE' | 'UPDATE_LOCATION' | 'UPDATE_NAME';
  payload: Record<string, any>;
  lamportTimestamp: number;
  clientGeneratedAt: string; // ISO 8601
  idempotencyKey: string;
}

export interface RemoteServerDelta {
  itemId: string;
  serverTimestamp: number;
  item: PantryItem | null; // null if deleted/consumed
  isDeleted: boolean;
  version: number;
}

export class SyncReconciliationService {
  private currentLamportClock: number = 0;
  private offlineMutationQueue: MutationLogEntry[] = [];

  /**
   * Generates next Lamport timestamp for causal event ordering
   */
  public tick(remoteClock: number = 0): number {
    this.currentLamportClock = Math.max(this.currentLamportClock, remoteClock) + 1;
    return this.currentLamportClock;
  }

  /**
   * Enqueues an offline action with an idempotency key to prevent double-submitting
   */
  public enqueueMutation(
    itemId: string,
    action: TriageAction | 'CREATE' | 'UPDATE_LOCATION' | 'UPDATE_NAME',
    payload: Record<string, any>
  ): MutationLogEntry {
    const lamport = this.tick();
    const idempotencyKey = `idemp-${itemId}-${action}-${Date.now()}`;

    const entry: MutationLogEntry = {
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      action,
      payload,
      lamportTimestamp: lamport,
      clientGeneratedAt: new Date().toISOString(),
      idempotencyKey,
    };

    this.offlineMutationQueue.push(entry);
    return entry;
  }

  /**
   * Reconciles local items against incoming remote server deltas
   * Deterministic Conflict Resolution Matrix:
   * 1. Terminal State Dominance: CONSUMED or DISCARDED records win over open/stored status.
   * 2. Highest Lamport/Server Timestamp wins if field conflict occurs.
   */
  public reconcile(
    localItems: PantryItem[],
    remoteDeltas: RemoteServerDelta[]
  ): { reconciledItems: PantryItem[]; appliedDeltaCount: number; conflictCount: number } {
    const itemMap = new Map<string, PantryItem>(localItems.map((item) => [item.id, { ...item }]));
    let appliedDeltaCount = 0;
    let conflictCount = 0;

    for (const delta of remoteDeltas) {
      const localItem = itemMap.get(delta.itemId);

      if (delta.isDeleted || delta.item === null) {
        // Remote indicates item was consumed or deleted
        if (localItem) {
          itemMap.delete(delta.itemId);
          appliedDeltaCount++;
        }
        continue;
      }

      if (!localItem) {
        // Item exists on server but not locally (e.g. added by partner in same household)
        itemMap.set(delta.itemId, delta.item);
        appliedDeltaCount++;
        continue;
      }

      // Conflict: Item exists both locally and remotely
      const localClock = localItem.updatedAt ? new Date(localItem.updatedAt).getTime() : 0;
      const remoteClock = delta.serverTimestamp;

      // Terminal state check: If local has marked item as consumed, do NOT resurrect
      const hasPendingTerminalAction = this.offlineMutationQueue.some(
        (m) => m.itemId === delta.itemId && (m.action === 'CONSUMED' || m.action === 'DISCARDED')
      );

      if (hasPendingTerminalAction) {
        conflictCount++;
        // Maintain local consumption; discard server state
        itemMap.delete(delta.itemId);
        continue;
      }

      if (remoteClock >= localClock) {
        // Server wins
        itemMap.set(delta.itemId, delta.item);
        appliedDeltaCount++;
      } else {
        // Local is newer, keep local item
        conflictCount++;
      }
    }

    return {
      reconciledItems: Array.from(itemMap.values()),
      appliedDeltaCount,
      conflictCount,
    };
  }

  public getPendingQueue(): MutationLogEntry[] {
    return [...this.offlineMutationQueue];
  }

  public clearPendingQueue(processedIdempotencyKeys: string[]) {
    const set = new Set(processedIdempotencyKeys);
    this.offlineMutationQueue = this.offlineMutationQueue.filter((m) => !set.has(m.idempotencyKey));
  }
}
