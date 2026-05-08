"use client";

import { useEffect } from "react";

export default function OAuthDisabledPage() {

  useEffect(() => {

    const params = new URLSearchParams(
      window.location.search
    );

    const email =
      params.get("email");

    if (email) {
      localStorage.setItem(
        "reactivate_email",
        email
      );
    }

    localStorage.setItem(
      "oauth_disabled",
      "1"
    );

    localStorage.setItem(
      "oauth_disabled_email",
      email || ""
    );

    window.location.href = "/";

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>
        Cuenta desactivada...
      </p>
    </div>
  );
}