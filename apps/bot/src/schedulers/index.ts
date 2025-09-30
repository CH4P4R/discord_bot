import type { CyberClient } from "../core/cyberClient";
import { startReportScheduler } from "./reportScheduler";

export const startSchedulers = (client: CyberClient) => {
  startReportScheduler(client);
};
