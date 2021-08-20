declare module 'typedarray-to-buffer' {
    export default function <T extends ArrayBuffer>(array: T): Buffer;
}
