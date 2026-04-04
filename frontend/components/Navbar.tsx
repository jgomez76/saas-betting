"use client";

import { useState } from "react";
import TopValueModal from "@/components/TopValueModal";

type MenuItemProps = {
  label: string;
  children?: React.ReactNode;
};

function MenuItem({ label, children }: MenuItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="px-4 py-2 cursor-pointer hover:text-cyan-400">
        {label}
      </div>

      {open && children && (
        <div className="absolute top-full left-0 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-lg min-w-[220px] z-50">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer"
    >
      {label}
    </div>
  );
}

export default function Navbar() {
  const [openTopBets, setOpenTopBets] = useState(false);

  return (
    <>
      <div className="w-full bg-slate-950 text-white border-b border-cyan-500/30">
        <div className="flex justify-between px-6 h-14 items-center">

          <div className="text-xl font-bold text-cyan-400">
            ⚡ Betting AI
          </div>

          <div className="flex gap-6">

            <MenuItem label="🧠 Apuestas">
              <DropdownItem
                label="🔥 Top Apuestas (Premium)"
                onClick={() => setOpenTopBets(true)}
              />
            </MenuItem>

          </div>
        </div>
      </div>

      <TopValueModal
        open={openTopBets}
        onClose={() => setOpenTopBets(false)}
      />
    </>
  );
}