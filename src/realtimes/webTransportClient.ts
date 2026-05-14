export type WebTransportEvent<T = unknown> = {
    event: string;
    data: T;
};

type EventHandler = (message: WebTransportEvent) => void;

type WebTransportHash = {
    algorithm: "sha-256";
    value: BufferSource;
};

type WebTransportOptionsWithHash = {
    serverCertificateHashes?: WebTransportHash[];
};

const base64ToUint8Array = (base64: string) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

const hexToUint8Array = (hex: string) => {
    const cleanHex = hex.replace(/:/g, "").replace(/\s/g, "");

    if (cleanHex.length % 2 !== 0) {
        throw new Error("VITE_WEBTRANSPORT_CERT_HASH hex không hợp lệ");
    }

    const bytes = new Uint8Array(cleanHex.length / 2);

    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
    }

    return bytes;
};

const getCertificateHashValue = () => {
    const hash = import.meta.env.VITE_WEBTRANSPORT_CERT_HASH as string | undefined;

    if (!hash) return null;

    const cleanHash = hash.trim();

    const isHex = /^[0-9a-fA-F:\s]+$/.test(cleanHash);

    if (isHex) {
        return hexToUint8Array(cleanHash);
    }

    return base64ToUint8Array(cleanHash);
};

class WebTransportClient {
    private transport: WebTransport | null = null;
    private handlers: EventHandler[] = [];
    private reconnectTimer: number | null = null;
    private manuallyClosed = false;
    private currentUrl = "";
    private connectVersion = 0;

    async connect(url: string) {
        if (!("WebTransport" in window)) {
            throw new Error("Browser không hỗ trợ WebTransport");
        }

        if (this.transport && this.currentUrl === url) {
            return;
        }

        this.close();

        this.currentUrl = url;
        this.manuallyClosed = false;

        const version = this.connectVersion + 1;
        this.connectVersion = version;

        const certHashValue = getCertificateHashValue();

        const options: WebTransportOptionsWithHash = {};

        if (certHashValue) {
            options.serverCertificateHashes = [
                {
                    algorithm: "sha-256",
                    value: certHashValue,
                },
            ];
        }

        const transport = new WebTransport(url, options);
        this.transport = transport;

        try {
            await transport.ready;

            if (this.connectVersion !== version) {
                transport.close();
                return;
            }

            console.log("[WT] connected:", url);

            this.listenPersistentStream(transport, version);
            this.listenClosed(transport, version);
        } catch (error) {
            if (this.transport === transport) {
                this.transport = null;
            }

            throw error;
        }
    }

    /**
     * Đọc persistent unidirectional stream từ server.
     * Server gửi length-prefixed frames: [4 bytes big-endian length][JSON payload]
     * Thay vì nhận mỗi message trên 1 stream riêng (overhead lớn),
     * tất cả messages đều đi qua 1 stream duy nhất.
     */
    private async listenPersistentStream(transport: WebTransport, version: number) {
        const reader = transport.incomingUnidirectionalStreams.getReader();

        try {
            while (true) {
                if (this.connectVersion !== version) break;

                const { value: stream, done } = await reader.read();

                if (done) break;
                if (!stream) continue;

                // Server mở 1 persistent stream, đọc length-prefixed frames từ stream đó
                this.readFramedStream(stream, version);
            }
        } catch (error) {
            if (this.connectVersion === version) {
                console.error("[WT] incoming stream error:", error);
            }
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Đọc length-prefixed frames từ 1 persistent stream.
     * Frame format: [4 bytes big-endian uint32 = length][JSON payload of that length]
     * Xử lý partial reads bằng cách buffer dữ liệu cho đến khi đủ frame.
     */
    private async readFramedStream(stream: ReadableStream<Uint8Array>, version: number) {
        const reader = stream.getReader();
        let buffer = new Uint8Array(0) as Uint8Array<ArrayBuffer>;

        try {
            while (true) {
                if (this.connectVersion !== version) return;

                const { value, done } = await reader.read();

                if (done) break;
                if (!value) continue;

                // Append chunk vào buffer
                buffer = concatUint8Arrays(buffer, value);

                // Parse tất cả complete frames trong buffer
                while (buffer.length >= 4) {
                    // Đọc 4-byte length header (big-endian)
                    const frameLen =
                        (buffer[0] << 24) |
                        (buffer[1] << 16) |
                        (buffer[2] << 8) |
                        buffer[3];

                    // Chưa đủ dữ liệu cho frame này → chờ chunk tiếp
                    if (buffer.length < 4 + frameLen) break;

                    // Extract JSON payload
                    const payload = buffer.slice(4, 4 + frameLen);
                    buffer = buffer.slice(4 + frameLen);

                    // Parse và dispatch
                    try {
                        const text = new TextDecoder().decode(payload);
                        const message = JSON.parse(text) as WebTransportEvent;

                        if (this.connectVersion !== version) return;

                        this.handlers.forEach((handler) => handler(message));
                    } catch (parseError) {
                        console.error("[WT] frame parse error:", parseError);
                    }
                }
            }
        } catch (error) {
            if (this.connectVersion === version) {
                console.error("[WT] framed stream read failed:", error);
            }
        } finally {
            reader.releaseLock();
        }
    }

    private async listenClosed(transport: WebTransport, version: number) {
        try {
            await transport.closed;

            if (this.connectVersion === version) {
                console.log("[WT] closed");
            }
        } catch (error) {
            if (this.connectVersion === version) {
                console.error("[WT] closed with error:", error);
            }
        }

        if (!this.manuallyClosed && this.connectVersion === version) {
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.manuallyClosed || !this.currentUrl) return;

        if (this.reconnectTimer) {
            window.clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = window.setTimeout(() => {
            this.connect(this.currentUrl).catch((error) => {
                console.error("[WT] reconnect failed:", error);
            });
        }, 3000);
    }

    onMessage(handler: EventHandler) {
        this.handlers.push(handler);

        return () => {
            this.handlers = this.handlers.filter((item) => item !== handler);
        };
    }

    close() {
        this.manuallyClosed = true;
        this.connectVersion += 1;

        if (this.reconnectTimer) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.transport) {
            this.transport.close();
            this.transport = null;
        }
    }
}

/**
 * Helper: nối 2 Uint8Array thành 1.
 * Dùng ArrayBuffer explicitly để tránh TypeScript strict type mismatch.
 */
function concatUint8Arrays(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBufferLike>): Uint8Array<ArrayBuffer> {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(new Uint8Array(b.buffer, b.byteOffset, b.byteLength), a.length);
    return result;
}

export const webTransportClient = new WebTransportClient();