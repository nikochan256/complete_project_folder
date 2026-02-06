"use client";

import { useEffect } from "react";

export default function ClearStorageOnClose({ children }) {
  useEffect(() => {
    const handleUnload = () => {
      localStorage.clear();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return children;
}
