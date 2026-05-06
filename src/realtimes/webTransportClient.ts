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

        console.log("[WT] connecting:", url);
        console.log("[WT] has cert hash:", Boolean(certHashValue));

        const transport = new WebTransport(url, options);
        this.transport = transport;

        try {
            await transport.ready;

            if (this.connectVersion !== version) {
                transport.close();
                return;
            }

            console.log("[WT] connected:", url);

            this.listenIncomingStreams(transport, version);
            this.listenClosed(transport, version);
        } catch (error) {
            if (this.transport === transport) {
                this.transport = null;
            }

            throw error;
        }
    }

    private async listenIncomingStreams(transport: WebTransport, version: number) {
        const reader = transport.incomingUnidirectionalStreams.getReader();

        try {
            while (true) {
                if (this.connectVersion !== version) break;

                const { value: stream, done } = await reader.read();

                if (done) break;
                if (!stream) continue;

                this.readStream(stream, version);
            }
        } catch (error) {
            if (this.connectVersion === version) {
                console.error("[WT] incoming stream error:", error);
            }
        } finally {
            reader.releaseLock();
        }
    }

    private async readStream(stream: ReadableStream<Uint8Array>, version: number) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        let text = "";

        try {
            while (true) {
                if (this.connectVersion !== version) return;

                const { value, done } = await reader.read();

                if (done) break;
                if (value) text += decoder.decode(value, { stream: true });
            }

            text += decoder.decode();

            if (!text.trim()) return;

            const message = JSON.parse(text) as WebTransportEvent;

            if (this.connectVersion !== version) return;

            this.handlers.forEach((handler) => handler(message));
        } catch (error) {
            if (this.connectVersion === version) {
                console.error("[WT] read stream failed:", error);
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

export const webTransportClient = new WebTransportClient();