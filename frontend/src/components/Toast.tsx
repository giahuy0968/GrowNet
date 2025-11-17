import React, { useEffect, useState } from "react";
import "../styles/Toast.css";

type ToastProps = {
  open: boolean;
  message: string;
  onOpenChange?: (open: boolean) => void;
  duration?: number; // mặc định 5000 ms
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

export default function Toast({
  open,
  message,
  onOpenChange,
  duration = 5000,
  position = "top-right",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onOpenChange?.(false), 300); // đợi animation out
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open, duration, onOpenChange]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${position} toast-enter`} role="status">
      <span>{message}</span>

      {/* Progress bar */}
      <div
        className="toast-progress"
        style={{ animationDuration: `${duration}ms` }}
      />

      <button
        className="toast-close"
        aria-label="Đóng thông báo"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onOpenChange?.(false), 300);
        }}
      >
        ✕
      </button>
    </div>
  );
}
