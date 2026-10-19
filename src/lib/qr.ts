// Shared between the WhatsApp QR card (components/ui/WhatsAppButton) and the reminder toast
// (components/layout/WhatsAppToast), so the toast stays away once the QR has been seen.

/** sessionStorage: this visitor has seen the QR this visit (card opened or toast shown). */
export const QR_SEEN = "rp-qr-seen";

/** window event: a QR card just opened, so the toast should get out of the way. */
export const QR_OPENED = "rp:qr-opened";
