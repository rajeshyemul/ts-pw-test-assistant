import { Logger } from "@helper/logger/Logger";

export default async function globalTeardown(): Promise<void> {
  Logger.info("═══════════════════════════════════════════════════════════");
  Logger.info("Global Teardown - UI framework run complete");
  Logger.info("═══════════════════════════════════════════════════════════");
}
