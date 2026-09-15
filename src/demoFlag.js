import { useEffect, useState } from "react";

export const DEMO_USER = "demo";
export const DEMO_FLAG = "aog-demo";
export const DEMO_EVENT = "aog-demo";

export function readDemo(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(DEMO_FLAG) === "1";
  } catch {
    return false;
  }
}

export function writeDemo(on, storage = globalThis.localStorage) {
  try {
    if (on) storage?.setItem(DEMO_FLAG, "1");
    else storage?.removeItem(DEMO_FLAG);
  } catch {
    /* quota */
  }
  try {
    globalThis.dispatchEvent?.(new Event(DEMO_EVENT));
  } catch {
    /* node tests */
  }
}

export function chatOwnerId(clerkId, storage = globalThis.localStorage) {
  const signed = String(clerkId || "").trim();
  if (signed) return signed;
  return readDemo(storage) ? DEMO_USER : "";
}

export function useDemo() {
  const [on, setOn] = useState(() => readDemo());
  useEffect(() => {
    const sync = () => setOn(readDemo());
    window.addEventListener(DEMO_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
