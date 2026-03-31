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
        // Hỗ trợ cả single event (từ admin update) và batch event (từ sensor worker)
        if (message.event === "SLOT_STATUS_CHANGE") {
            const realtimeMessage = message as ParkingRealtimeMessage & { event: "SLOT_STATUS_CHANGE" };

            if (realtimeMessage.data.lot_id !== lotId) return;

            handler(realtimeMessage);
        }

        if (message.event === "SLOT_STATUS_CHANGE_BATCH") {
            const realtimeMessage = message as ParkingRealtimeMessage & { event: "SLOT_STATUS_CHANGE_BATCH" };

            // Filter: chỉ xử lý events thuộc lot đang xem
            const relevantData = realtimeMessage.data.filter(
                (item) => item.lot_id === lotId
            );

            if (relevantData.length === 0) return;

            handler({
                event: "SLOT_STATUS_CHANGE_BATCH",
                data: relevantData,
            });
        }
    });

    webTransportClient.connect(url.toString()).catch((error) => {
        console.error("[WT] connect parking realtime failed:", error);
    });

    return () => {
        unsubscribe();
        webTransportClient.close();
    };
};