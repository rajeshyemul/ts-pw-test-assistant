export class RunnerConstants {
  static readonly RUN_FIRST_TAG = "@runFirst";
  static readonly RUN_LAST_TAG = "@runLast";
  static readonly PRIORITY_TAGS = ["@P1", "@P2", "@P3", "@P4"] as const;
  static readonly NO_PRIORITY_TOKEN = "NoPriority";
}
