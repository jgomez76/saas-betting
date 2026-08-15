"use client";

import { useEffect, useState } from "react";

import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

type Props = React.ComponentProps<typeof DesktopNavbar>;

export default function Navbar(props: Props) {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const update = () => {
      setIsMobile(window.innerWidth < 768);
    };

    update();

    window.addEventListener("resize", update);

    return () =>
      window.removeEventListener("resize", update);

  }, []);

  if (isMobile) {
    return <MobileNavbar {...props} />;
  }

  return <DesktopNavbar {...props} />;
}