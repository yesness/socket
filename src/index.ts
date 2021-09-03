import YNEvents from '@yesness/events';

export interface IYNSocket {
    send(data: Buffer | string): void;
    close(): void;
    on(event: 'data', listener: (data: Buffer) => void): void;
    on(event: 'close', listener: () => void): void;
    once(event: 'data', listener: (data: Buffer) => void): void;
    once(event: 'close', listener: () => void): void;
    off(event: 'data', listener: (data: Buffer) => void): void;
    off(event: 'close', listener: () => void): void;
}

interface IWebSocket {
    close(): void;
    send(data: Buffer): void;
    addEventListener(
        method: 'message',
        cb: (event: { data: any }) => void
    ): void;
    addEventListener(method: 'close', cb: () => void): void;
}

export default class YNSocket extends YNEvents implements IYNSocket {
    static ws(ws: IWebSocket): IYNSocket {
        const socket = new YNSocket({
            send(data: Buffer | string) {
                YNSocket._convertData(data).then((buffer) => ws.send(buffer));
            },
            close() {
                ws.close();
            },
        });
        ws.addEventListener('message', ({ data }) => {
            YNSocket._convertData(data).then((buffer) =>
                socket.emit('data', buffer)
            );
        });
        ws.addEventListener('close', () => {
            socket.emit('close');
        });
        return socket;
    }

    private static async _convertData(data: any): Promise<Buffer> {
        if (typeof Blob === 'function' && data instanceof Blob) {
            data = await data.arrayBuffer();
        }
        if (typeof data === 'string') {
            return Buffer.from(data);
        } else if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
            return ArrayBuffer.isView(data)
                ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
                : Buffer.from(data);
        } else if (data instanceof Buffer) {
            return data;
        }
        console.log('DATA', data);
        throw new Error(`Unexpected data of type ${typeof data}: ${data}`);
    }

    private constructor(
        private callbacks: {
            send(data: Buffer | string): void;
            close(): void;
        }
    ) {
        super();
    }

    send(data: Buffer | string) {
        this.callbacks.send(data);
    }

    close() {
        this.callbacks.close();
    }
}
