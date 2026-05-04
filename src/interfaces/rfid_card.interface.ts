export interface RfidCard {
  id: number;
  cardUid: string;
  userId?: number | null;
  ownerName?: string | null;
  status: "REGISTERED" | "GUEST";
  isActive: boolean;
  registeredAt?: string | null;
}