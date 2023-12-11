import pako from "pako";

function uint8ArrayToBase64(buffer: Iterable<number>) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToUint8Array(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export function encodeData(data: string) {
  const compressed = pako.gzip(data);
  const base64Encoded = uint8ArrayToBase64(compressed);
  return base64Encoded;
}

export function decodeData(data: string) {
  const base64Decoded = base64ToUint8Array(data);
  const restored = pako.ungzip(base64Decoded, { to: "string" });
  return restored;
}
