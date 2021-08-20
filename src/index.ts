import YNEvents from '@yesness/events';
import toBuffer from 'typedarray-to-buffer';

export interface IYNSocket {
    send(data: Buffer): void;
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
            send(data: Buffer) {
                ws.send(data);
            },
            close() {
                ws.close();
            },
        });
        ws.addEventListener('message', ({ data }) => {
            socket.emit('data', YNSocket._convertData(data));
        });
        ws.addEventListener('close', () => {
            socket.emit('close');
        });
        return socket;
    }

    private static _convertData(data: any): Buffer {
        if (typeof data === 'string') {
            return Buffer.from(data);
        } else if (data instanceof Uint8Array) {
            return toBuffer(data);
        } else if (data instanceof Buffer) {
            return data;
        }

        throw new Error(`Unexpected data of type ${typeof data}: ${data}`);
    }

    private constructor(
        private callbacks: {
            send(data: Buffer): void;
            close(): void;
        }
    ) {
        super();
    }

    send(data: Buffer) {
        this.callbacks.send(data);
    }

    close() {
        this.callbacks.close();
    }
}
