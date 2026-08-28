import { logger } from "@helper/logger/Logger";

export default async function globalSetup(): Promise<void> {
  try {
    logger.info("═══════════════════════════════════════════════════════════");
    logger.info("Global Setup - UI framework run started");
    logger.info("═══════════════════════════════════════════════════════════");

    // Ensure setup completes quickly
    await Promise.resolve();

    logger.info("Global Setup completed successfully");
  } catch (error) {
    console.error("Global setup failed:", error);
    // Don't throw to prevent hanging
  }
}
