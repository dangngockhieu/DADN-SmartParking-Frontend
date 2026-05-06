import { webTransportClient } from "./webTransportClient";
import type { ParkingRealtimeMessage } from "./realtime-events";

type ParkingRealtimeHandler = (message: ParkingRealtimeMessage) => void;

export const connectParkingRealtime = (
    lotId: number,
    handler: ParkingRealtimeHandler
) => {
    const baseUrl = import.meta.env.VITE_WEBTRANSPORT_URL as string | undefined;

    if (!baseUrl) {
        throw new Error("Thiếu VITE_WEBTRANSPORT_URL trong .env");
    }

    if (!lotId || Number.isNaN(lotId)) {
        throw new Error("lotId không hợp lệ khi connect WebTransport");
    }

    const url = new URL(baseUrl);
    url.searchParams.set("lotId", String(lotId));

    const unsubscribe = webTransportClient.onMessage((message) => {
        if (message.event !== "SLOT_STATUS_CHANGE") return;

        const realtimeMessage = message as ParkingRealtimeMessage;

        if (realtimeMessage.data.lot_id !== lotId) return;

        handler(realtimeMessage);
    });

    webTransportClient.connect(url.toString()).catch((error) => {
        console.error("[WT] connect parking realtime failed:", error);
    });

    return () => {
        unsubscribe();
        webTransportClient.close();
    };
};