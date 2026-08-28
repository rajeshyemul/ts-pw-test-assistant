export class PathConstants {
  static readonly FOLDER_VIDEOS = "./videos/";
  static readonly FOLDER_SCREENSHOTS = "./screenshots/";

  static readonly FOLDER_TESTS = "./tests";
  static readonly FOLDER_REPORTS = "reports";

  //static readonly FOLDER_REPORTS_BASE = `${this.FOLDER_REPORTS}/${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19)}`;
  static readonly FOLDER_DOWNLOAD = `${this.FOLDER_REPORTS}/downloads`;

  static readonly LOG_FOLDER_PATH = `logFiles`;
  static readonly FOLDER_ARTIFACTS = `artifacts`;
  static readonly BLOB_REPORTS_PATH = `blob-report`;
  static readonly ORDERED_RESULTS_PATH = `ordered-results`;
  static readonly ALLURE_REPORTS_PATH = `allure-results`;
  static readonly HTML_REPORTS_PATH = `html`;
  static readonly JSON_REPORTS_PATH = `results/results.json`;
  static readonly JUNIT_REPORTS_PATH = `results/results.xml`;
  static readonly ORDERED_SUMMARY_JSON_PATH = `ordered-summary.json`;
  static readonly ORDERED_SUMMARY_HTML_PATH = `ordered-summary.html`;
}
