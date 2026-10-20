"use client";

import { createContext, useContext } from "react";
import type { MotionCapabilities } from "@/features/templates/cinematic/motion/capabilities";

/** "cover": envelope closed. "opening": timeline running. "open": invitation visible. */
export type Stage = "cover" | "opening" | "open";

export interface StageContextValue {
  stage: Stage;
  setStage: (stage: Stage) => void;
  capabilities: MotionCapabilities;
  /** True once the client has mounted and motion is allowed. */
  animated: boolean;
}

export const StageContext = createContext<StageContextValue>({
  stage: "open",
  setStage: () => undefined,
  capabilities: { reduced: true, lite: true },
  animated: false,
});

export function useStage() {
  return useContext(StageContext);
}
