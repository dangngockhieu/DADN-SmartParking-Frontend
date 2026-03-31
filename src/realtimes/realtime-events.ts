export type RealtimeEventName = "SLOT_STATUS_CHANGE" | "SLOT_STATUS_CHANGE_BATCH";

export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "MAINTAIN";

export type SlotStatusChangeData = {
    changed: boolean;
    id: number;
    lot_id: number;
    name: string;
    message: string;
    old_status: SlotStatus;
    new_status: SlotStatus;
};

export type ParkingRealtimeMessage =
    | {
          event: "SLOT_STATUS_CHANGE";
          data: SlotStatusChangeData;
      }
    | {
          event: "SLOT_STATUS_CHANGE_BATCH";
          data: SlotStatusChangeData[];
      };