import type { CyberClient } from "./cyberClient";

export interface Feature {
  name: string;
  description: string;
  enabled: boolean;
  init: (client: CyberClient) => Promise<void> | void;
  destroy?: () => Promise<void> | void;
}
