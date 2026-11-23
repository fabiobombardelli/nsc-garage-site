import QRCode from "qrcode";

/** QR code em SVG, escuro sobre o painel de luz (tinta sobre a luz do site). */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#121416", light: "#f2f4f5" },
  });
}
