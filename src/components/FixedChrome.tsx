"use client";

import { IconArrowUp } from "@/components/marketplace/icons";

export function FixedChrome() {
  return (
    <>
      <button
        type="button"
        title="Toggle RTL (demo)"
        className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-l-full bg-[color:var(--color-primary)] px-2 py-4 text-[10px] font-bold uppercase tracking-wide text-white shadow-md lg:block"
        onClick={() => {
          document.documentElement.dir =
            document.documentElement.dir === "rtl" ? "ltr" : "rtl";
        }}
      >
        RTL
      </button>
      <button
        type="button"
        aria-label="Back to top"
        className="fixed bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white shadow-lg transition hover:bg-[color:var(--color-primary-hover)] sm:right-6 md:bottom-6 md:h-12 md:w-12"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <IconArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
