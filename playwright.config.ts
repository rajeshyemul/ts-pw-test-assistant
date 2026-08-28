import { defineConfig } from "@playwright/test";
import { ConfigManager } from "./src/config/ConfigManager";
import { PlaywrightConfigFactory } from "./src/config/PlaywrightConfigFactory";

export default defineConfig({
  testDir: PlaywrightConfigFactory.TEST_DIR,
  timeout: PlaywrightConfigFactory.getTestTimeout(),
  fullyParallel: true,
  forbidOnly: ConfigManager.isCI(),
  retries: PlaywrightConfigFactory.getRetries(),
  workers: PlaywrightConfigFactory.getConfiguredWorkers(),
  outputDir: PlaywrightConfigFactory.getOutputDirectory(),
  reporter: PlaywrightConfigFactory.getReporters(),
  globalSetup: PlaywrightConfigFactory.GLOBAL_SETUP_PATH,
  globalTeardown: PlaywrightConfigFactory.GLOBAL_TEARDOWN_PATH,
  use: PlaywrightConfigFactory.getUseOptions(),
  projects: PlaywrightConfigFactory.getProjects(),
});
