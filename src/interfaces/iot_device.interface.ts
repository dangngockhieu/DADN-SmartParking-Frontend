export type IoTDeviceStatus = "ACTIVE" | "INACTIVE" | "ERROR";

export interface IoTDevice {
  mac_address: string;
  device_name: string;
  status: IoTDeviceStatus;
  lot_id?: number | null;
  lot_name?: string | null;
  last_seen?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateIoTDeviceRequest = {
  mac_address: string;
  device_name: string;
  lot_id?: number | null;
};

export type UpdateIoTDeviceRequest = {
  device_name?: string;
  status?: IoTDeviceStatus;
  lot_id?: number | null;
};
