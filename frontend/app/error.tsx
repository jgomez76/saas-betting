"use client";

import { useEffect } from "react";
import Link from "next/link";

import { COMPANY } from "@/lib/branding";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-6
      "
    >
      <div className="max-w-lg text-center">

        <h1
          className="
            text-6xl
            font-bold
            mb-4
          "
        >
          500
        </h1>

        <h2
          className="
            text-2xl
            font-semibold
            mb-4
          "
        >
          Something went wrong
        </h2>

        <p
          className="
            opacity-70
            mb-8
          "
        >
          An unexpected error occurred while loading this page.
        </p>

        <div className="flex justify-center gap-4">

          <button
            onClick={reset}
            className="
              px-6
              py-3
              rounded-xl
              bg-[var(--primary)]
              text-white
              hover:opacity-90
              transition
            "
          >
            Try again
          </button>

          <Link
            href="/"
            className="
              px-6
              py-3
              rounded-xl
              border
              hover:bg-white/5
              transition
            "
          >
            Home
          </Link>

        </div>

        <div className="mt-12 space-y-1">

          <p className="text-sm font-medium opacity-70">
            {COMPANY.name}
          </p>

          <p className="text-sm opacity-50">
            {COMPANY.slogan}
          </p>

        </div>

      </div>

    </main>
  );
}