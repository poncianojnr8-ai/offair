import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface InputDialogProps {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | null;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

const InputDialog = ({
  open,
  title,
  label,
  placeholder = "",
  defaultValue = "",
  validate,
  onConfirm,
  onCancel,
}: InputDialogProps) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setError(null);
      requestAnimationFrame(() => {
        inputRef.current?.select();
        inputRef.current?.focus();
      });
    }
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (validate) {
      const err = validate(trimmed);
      if (err) { setError(err); return; }
    }
    onConfirm(trimmed);
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-white/10 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2">
          {label}
        </label>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
          placeholder={placeholder}
          className="w-full bg-black/30 border border-white/10 text-white text-sm placeholder-white/20 px-3 py-2.5 focus:outline-none focus:border-[var(--main)] transition-colors"
          autoFocus
        />
        {error && (
          <p className="mt-2 text-[11px] text-red-400">{error}</p>
        )}

        <div className="flex gap-2 mt-5 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-[10px] uppercase tracking-[0.15em] bg-[var(--main)] text-white hover:opacity-90 transition-opacity"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InputDialog;
