"use client";

import { useEffect } from "react";
import { usePageTransition } from "@/components/TransitionProvider";

export default function GradesPage() {
  const { navigate } = usePageTransition();
  useEffect(() => {
    navigate("/me");
  }, [navigate]);
  return null;
}
