export interface CreateTransactionInput {
  userId: string;
  categoryId: number;
  sourceId: number;
  /** String form of a positive decimal, e.g. "120.50" for DB `numeric` */
  amount: string;
  /** ISO calendar date `YYYY-MM-DD` */
  transactionDate: string;
  description: string | null;
  actorUserId: string;
}

/** Row for list UI (non-deleted transactions only). */
export interface TransactionListItem {
  id: number;
  amount: string;
  transactionDate: string;
  description: string | null;
  categoryId: number | null;
  sourceId: number | null;
  categoryName: string | null;
  sourceName: string | null;
  attachmentCount: number;
}

export interface TransactionAttachmentItem {
  id: number;
  filePath: string;
  fileType: string;
  /** Time-limited URL for private bucket viewing */
  viewUrl: string | null;
}

export interface TransactionDetail {
  id: number;
  amount: string;
  transactionDate: string;
  description: string | null;
  categoryId: number | null;
  sourceId: number | null;
  categoryName: string | null;
  sourceName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  attachments: TransactionAttachmentItem[];
}

export interface TransactionListQuery {
  userId: string;
  dateFrom: string | null;
  dateTo: string | null;
  sourceId: number | null;
  /** Filter transactions whose category has this type */
  categoryType: "inbound" | "outbound" | null;
  page: number;
  pageSize: number;
}

export interface TransactionListPage {
  items: TransactionListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionRepository {
  createTransaction(input: CreateTransactionInput): Promise<number>;
  listForUserPaged(query: TransactionListQuery): Promise<TransactionListPage>;
  getDetailForUser(userId: string, transactionId: number): Promise<TransactionDetail | null>;
  /** Soft-delete so failed attachment flows can roll back the header row. */
  softDeleteTransaction(id: number, actorUserId: string): Promise<void>;
}
