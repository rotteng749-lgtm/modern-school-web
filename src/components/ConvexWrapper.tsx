/**
 * ConvexProvider wrapper required by the @vly-ai/integrations platform plugin.
 * The platform auto-injects Convex auth components that need ConvexProvider
 * as an ancestor. This provides one so the injected code doesn't crash.
 */
import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";

// Always create a ConvexReactClient — the platform plugin needs it in the tree.
// Without a real VITE_CONVEX_URL, queries will fail gracefully (which is fine
// since our app uses localStorage-based auth and doesn't call Convex queries).
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://placeholder.convex.cloud";

const convexClient = new ConvexReactClient(CONVEX_URL);

export function ConvexWrapper({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
