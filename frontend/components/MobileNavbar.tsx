"use client";

import { memo } from "react";

type Props = React.ComponentProps<
  typeof import("./DesktopNavbar").default
>;

const MobileNavbar = memo(function MobileNavbar(
  _props: Props
) {

  return (

    <div
      className="
        w-full
        bg-[var(--bg)]
        border-b
        border-[var(--border)]
        rounded-xl
        shadow
        p-4
        mb-6
      "
    >

      <div className="text-center">

        <h2 className="font-bold text-lg">
          📱 Mobile Navbar
        </h2>

        <p className="text-sm text-[var(--muted)] mt-2">
          Building responsive version...
        </p>

      </div>

    </div>

  );

});

export default MobileNavbar;