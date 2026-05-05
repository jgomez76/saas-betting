"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ReactivatePage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");

    if (!token) return;

    fetch(`http://localhost:8000/reactivate-account?token=${token}`, {
      credentials: "include",
    }).then(() => {
      router.push("/"); // 🔥 login automático → dashboard
    });
  }, [params, router]);

  return <p>Activating account...</p>;
}