export interface WalletInfo{
  money?: number;
  balance?: number;
};

export interface WalletTransaction {
  id: number;
  userId?: number;
  type: "DEPOSIT" | "DEDUCT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELED";
  orderCode?: number;
  transactionId?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
};

export interface WalletCursor {
  createdAt: string;
  id: number;
};

export interface TransactionResponse {
  data: WalletTransaction[];
  nextCursor: WalletCursor | null;
  hasNextPage: boolean;
};

export interface TransactionGroup {
  dateKey: string;
  dateLabel: string;
  items: WalletTransaction[];
};