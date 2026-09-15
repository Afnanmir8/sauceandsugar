import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Check, ExternalLink, Smartphone, QrCode } from "lucide-react";

interface UPIQRCodeProps {
  upiId?: string;
  payeeName?: string;
  amount: number;
  note?: string;
  isPaid: boolean;
  onPaymentToggle: (paid: boolean) => void;
}

export default function UPIQRCode({
  upiId = "khushpreetkaur8822-2@okhdfcbank",
  payeeName = "Sauce And Sugar",
  amount,
  note = "Sauce And Sugar Order",
  isPaid,
  onPaymentToggle,
}: UPIQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Exact amount formatted with 2 decimals (e.g. 249.00)
  // This standard NPCI parameter instructs Paytm, GPay, PhonePe & BHIM
  // to automatically lock and pre-fill the exact order amount!
  const formattedAmount = amount.toFixed(2);

  // Construct NPCI standard UPI intent URI
  // In UPI specs, 'pa' MUST retain literal '@' (not '%40') so scanners recognise VPA!
  const upiUri = useMemo(() => {
    const encName = encodeURIComponent(payeeName);
    const encNote = encodeURIComponent(note);
    return `upi://pay?pa=${upiId}&pn=${encName}&am=${formattedAmount}&cu=INR&tn=${encNote}`;
  }, [upiId, payeeName, formattedAmount, note]);

  // Generate 100% standard compliant QR Code image using official 'qrcode' library
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [upiUri]);

  // Immediate fallback URL while client-side canvas dataURL renders
  const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#EAD9BE] bg-[#FFFBF2] shadow-sm">
      {/* Header Banner */}
      <div className="bg-[#6E1E2B] px-4 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#C9A24B]" />
          <span className="text-xs font-black tracking-wide uppercase">Scan & Pay via UPI</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col items-center">
        {/* Dynamic Amount Banner */}
        <div className="w-full text-center pb-3 border-b border-[#EAD9BE]/60">
          <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#7A5C4A]">Amount to Pay</p>
          <div className="mt-0.5 flex items-baseline justify-center gap-1">
            <span className="font-serif text-3xl font-black text-[#2D1E14]">₹{amount}</span>
            <span className="text-xs font-semibold text-[#7A5C4A]">INR</span>
          </div>
        </div>

        {/* QR Code Box */}
        <div className="my-4 relative flex flex-col items-center">
          <div className="relative p-3.5 bg-white rounded-2xl border-2 border-[#EAD9BE] shadow-md transition-transform hover:scale-[1.01]">
            {/* Corner Scan Accent Marks */}
            <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#6E1E2B] rounded-tl" />
            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#6E1E2B] rounded-tr" />
            <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#6E1E2B] rounded-bl" />
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#6E1E2B] rounded-br" />

            <img
              src={qrDataUrl || fallbackUrl}
              alt={`UPI QR Code to pay ₹${amount} to ${payeeName}`}
              className="w-52 h-52 sm:w-56 sm:h-56 block rounded-xl"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>

        {/* Supported Apps Badges */}
        <div className="w-full text-center">
          <p className="text-[11px] font-bold text-[#7A5C4A]">Scan with Paytm, Google Pay, PhonePe or BHIM</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-extrabold text-[#2D1E14]">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAD9BE] shadow-xs">Paytm</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAD9BE] shadow-xs">Google Pay</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAD9BE] shadow-xs">PhonePe</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAD9BE] shadow-xs">BHIM</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAD9BE] shadow-xs">Cred</span>
          </div>
        </div>

        {/* Mobile Deep Link: Open UPI App Button */}
        <div className="mt-4 w-full">
          <a
            href={upiUri}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#1c7a3d] hover:bg-[#155f2f] text-white px-4 py-3 text-sm font-black transition-all active:scale-[0.99] shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in UPI App (Pay ₹{amount})</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* Payment Confirmation Toggle */}
        <div className="mt-3.5 w-full">
          <button
            type="button"
            onClick={() => onPaymentToggle(!isPaid)}
            className={`w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-black transition-all active:scale-[0.99] border ${
              isPaid
                ? "bg-[#1c7a3d]/15 border-[#1c7a3d] text-[#1c7a3d]"
                : "bg-[#2D1E14] border-[#2D1E14] text-white hover:bg-[#4E1420]"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                isPaid ? "border-[#1c7a3d] bg-[#1c7a3d] text-white" : "border-white/40 bg-white/10"
              }`}
            >
              {isPaid && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </span>
            <span>{isPaid ? `Payment of ₹${amount} Confirmed ✓` : `I have paid ₹${amount} via UPI`}</span>
          </button>
          {!isPaid && (
            <p className="mt-1.5 text-center text-[11px] font-semibold text-[#A44E27]">
              Please scan the QR code and tap the button above to proceed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
