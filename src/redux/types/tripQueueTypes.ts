export const QUEUE_REPLACE = 'QUEUE_REPLACE' as const;          // ← hydrate
export const QUEUE_ENQUEUE = 'QUEUE_ENQUEUE' as const;
export const QUEUE_MARK_UPLOADING = 'QUEUE_MARK_UPLOADING' as const;
export const QUEUE_MARK_UPLOADED = 'QUEUE_MARK_UPLOADED' as const; // (dequeue by id)
export const QUEUE_MARK_ERROR = 'QUEUE_MARK_ERROR' as const;
export const QUEUE_CLEAR_ERRORS = 'QUEUE_CLEAR_ERRORS' as const;
export type QueueKind = 'trip' | 'trip_bundle';

export type QueueStatus = 'queued' | 'uploading' | 'error' | 'uploaded';

export type TripBundleJob = {
  kind: 'trip_bundle';
  id: string;                 // job id `${tripId}:${ts}`
  status: 'queued' | 'uploading' | 'error' | 'uploaded';
  error?: string | null;
  createdAt: string;
  draft: any;                 // TripDraft
  lots: any[];                // LotDraft[]
  progress?: { uploadedLots: number; totalLots: number };
};

export type TripQueueItem = TripBundleJob | {
  kind: 'trip';
  id: string;
  status: 'queued' | 'uploading' | 'error' | 'uploaded';
  error?: string | null;
  draft: any;                 // TripDraft
  createdAt: string;
};

// export type TripQueueItem = {
//   id: string;                       // job id `${tripId}:${ts}`
//   status: QueueStatus;
//   error?: string | null;
//   draft: any;                       
//   createdAt: string;                
// };

export type TripQueueState = {
  queue: TripQueueItem[];
};

export type TripQueueAction =
  | { type: typeof QUEUE_REPLACE; payload: TripQueueItem[] }
  | { type: typeof QUEUE_ENQUEUE; payload: TripQueueItem }
  | { type: typeof QUEUE_MARK_UPLOADING; payload: string }
  | { type: typeof QUEUE_MARK_UPLOADED; payload: string }
  | { type: typeof QUEUE_MARK_ERROR; payload: { id: string; error: string } }
  | { type: typeof QUEUE_CLEAR_ERRORS };
