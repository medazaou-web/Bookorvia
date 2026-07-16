"use client";
import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  const getConfirmButtonClasses = () => {
    const base = "px-6 py-3 rounded-xl font-bold hover:shadow-lg active:scale-95 disabled:opacity-60 transition-all duration-300 ease-out smooth-hover";
    switch (variant) {
      case "danger":
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      case "warning":
        return `${base} bg-amber-600 text-white hover:bg-amber-700`;
      default:
        return `${base} bg-indigo-600 text-white hover:bg-indigo-700`;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-8 animate-in scale-100">
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {description}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 disabled:opacity-60 transition-all duration-300 ease-out smooth-hover"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={getConfirmButtonClasses()}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
