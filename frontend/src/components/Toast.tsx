import React, { useEffect } from "react";
import "../styles/Toast.css";

type ToastProps = {
  open: boolean;
  message: string;
  onOpenChange?: (open: boolean) => void;
  duration?: number; // ms, mặc định 5000
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

export default function Toast({
  open,
  message,
  onOpenChange,
  duration = 5000,
  position = "top-right",
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => onOpenChange?.(false), duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onOpenChange]);

  if (!open) return null;

  return (
    <div className={`toast toast-${position}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button
        className="toast-close"
        aria-label="Đóng thông báo"
        onClick={() => onOpenChange?.(false)}
      >
        ✕
      </button>
    </div>
  );
}
