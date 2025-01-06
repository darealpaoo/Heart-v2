function encodeMessage(message) {
  const utf8Message = new TextEncoder().encode(message);
  const base64Message = btoa(String.fromCharCode(...utf8Message));
  return base64Message
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeMessage(encodedMessage) {
  try {
    const base64Message = encodedMessage
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        encodedMessage.length + ((4 - (encodedMessage.length % 4)) % 4),
        "="
      );

    const decodedBase64 = atob(base64Message);
    const decodedBytes = Uint8Array.from(decodedBase64, (c) => c.charCodeAt(0));
    const decodedMessage = new TextDecoder("utf-8").decode(decodedBytes);

    return decodedMessage;
  } catch (e) {
    console.error("Error while decoding:", e);
    return null;
  }
}

function isBase64(str) {
  try {
    const base64Message = str
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");

    return btoa(atob(base64Message)) === base64Message;
  } catch (e) {
    return false;
  }
}
