import React from "react";
import { X, Loader2 } from "lucide-react";

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
}

export function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
  children,
  submitText = "Lưu",
  cancelText = "Hủy",
}: FormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto">{children}</div>

          <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
