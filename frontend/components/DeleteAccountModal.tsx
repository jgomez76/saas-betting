"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAccountModal({ onClose, onConfirm }: Props) {
  const { t } = useLanguage();
  const [text, setText] = useState("");

  const isValid = text === "DELETE";

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="w-[90%] max-w-md bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">

        <h2 className="text-lg font-bold mb-3">
          ⚠️ {t.deleteAccount}
        </h2>

        <p className="text-sm text-[var(--muted)] mb-4">
          {t.deleteWarning}
        </p>

        <p className="text-xs mb-2">
          {t.typeDelete}
        </p>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 rounded bg-[var(--bg)] border border-[var(--border)] mb-4"
        />

        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 border border-[var(--border)] py-2 rounded"
          >
            {t.cancel}
          </button>

          <button
            disabled={!isValid}
            onClick={onConfirm}
            className={`flex-1 py-2 rounded text-white ${
              isValid ? "bg-red-600" : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {t.deleteAccount}
          </button>

        </div>
      </div>
    </div>,
    document.body
  );
}