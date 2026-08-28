import { ESLintUtils } from "@typescript-eslint/utils";
import fs from "fs";
import path from "path";

const createRule = ESLintUtils.RuleCreator(() => "");

const PROJECT_ROOT = process.cwd();
const PROJECT_SRC_DIR = path.join(PROJECT_ROOT, "src");
const CONSTANTS_DIR = path.join(PROJECT_SRC_DIR, "support", "constants");
const LOCATORS_DIR = path.join(PROJECT_SRC_DIR, "support", "locators");
const PLAYWRIGHT_DIR = path.join(PROJECT_ROOT, "playwright.config.ts");

// ==============================
// HELPERS
// ==============================
/**
 * Extract:
 * static readonly SOMETHING =
 */
function extractStaticReadonlyProperties(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const properties = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const match = line.match(/^\s*static\s+readonly\s+(\w+)\s*=/);

      if (match) {
        properties.push({
          name: match[1],
          className: extractClassName(lines, i),
          filePath: path.relative(PROJECT_ROOT, filePath),
          line: i + 1,
        });
      }
    }

    return properties;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);

    return [];
  }
}

/**
 * Extract class name
 */
function extractClassName(lines, propertyLineIndex) {
  for (let i = propertyLineIndex - 1; i >= 0; i--) {
    const line = lines[i];
    const match = line.match(/^\s*export\s+class\s+(\w+)/);

    if (match) {
      return match[1];
    }
  }

  return "UnknownClass";
}

/**
 * Scan usages like:
 *
 * HomeConstants.TITLE
 * this.TITLE
 */
function scanFileForUsage(filePath, className, propertyName, sourceFilePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, "utf8");

    const lines = content.split("\n");

    const usages = [];

    /**
     * Detect same file
     */
    const isSameFile = path.resolve(filePath) === path.resolve(sourceFilePath);

    /**
     * Global usage:
     * HomeConstants.TITLE
     */
    const patterns = [new RegExp(`\\b${className}\\.${propertyName}\\b`)];

    /**
     * Allow:
     * this.TITLE
     *
     * ONLY in same file
     */
    if (isSameFile) {
      patterns.push(new RegExp(`\\bthis\\.${propertyName}\\b`));
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const isUsed = patterns.some((pattern) => pattern.test(line));

      if (isUsed) {
        usages.push({
          file: path.relative(PROJECT_ROOT, filePath),
          line: i + 1,
        });
      }
    }

    return usages;
  } catch {
    return [];
  }
}

/**
 * Get all TS files
 */
function getAllTypeScriptFiles() {
  const files = [];

  function walkDir(dir) {
    try {
      if (!fs.existsSync(dir)) {
        return;
      }

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);

        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          walkDir(itemPath);
        } else if (
          stat.isFile() &&
          (item.endsWith(".ts") || item.endsWith(".tsx"))
        ) {
          files.push(itemPath);
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  walkDir(PROJECT_SRC_DIR);
  if (fs.existsSync(PLAYWRIGHT_DIR)) {
    files.push(PLAYWRIGHT_DIR);
  }
  return files;
}

// ==============================
// RULE
// ==============================
export default createRule({
  name: "no-unused-constants",

  meta: {
    type: "problem",

    docs: {
      description: "Disallow unused constants and locators",
      recommended: true,
    },

    schema: [],

    messages: {
      unusedConstant:
        "Constant '{{constantName}}' in class '{{className}}' is not used anywhere inside src.",
      unusedLocator:
        "Locator '{{locatorName}}' in class '{{className}}' is not used anywhere inside src.",
    },
  },

  defaultOptions: [],

  create(context) {
    const currentFileName = context.getFilename();
    const relativeFilePath = path.relative(PROJECT_ROOT, currentFileName);
    const isConstantsFile = currentFileName.startsWith(CONSTANTS_DIR);
    const isLocatorsFile = currentFileName.startsWith(LOCATORS_DIR);

    /**
     * Only validate:
     * support/constants
     * support/locators
     */
    if (!isConstantsFile && !isLocatorsFile) {
      return {};
    }

    /**
     * Extract static readonly properties
     */
    const properties = extractStaticReadonlyProperties(currentFileName);

    return {
      "Program:exit"() {
        if (properties.length === 0) {
          return;
        }

        /**
         * Get all project TS files
         */
        const allFiles = getAllTypeScriptFiles();

        /**
         * Validate each property
         */
        for (const property of properties) {
          let totalUsages = [];

          for (const file of allFiles) {
            const usages = scanFileForUsage(
              file,
              property.className,
              property.name,
              currentFileName,
            );

            totalUsages.push(...usages);
          }

          /**
           * Remove self declaration
           */
          const actualUsages = totalUsages.filter((usage) => {
            const isSelfDeclaration =
              usage.file === relativeFilePath && usage.line === property.line;

            return !isSelfDeclaration;
          });

          /**
           * Report unused
           */
          if (actualUsages.length === 0) {
            const messageType = isConstantsFile
              ? "unusedConstant"
              : "unusedLocator";

            context.report({
              loc: {
                start: {
                  line: property.line,
                  column: 0,
                },
                end: {
                  line: property.line,
                  column: 999,
                },
              },

              messageId: messageType,

              data: {
                constantName: property.name,
                locatorName: property.name,
                className: property.className,
              },
            });
          }
        }
      },
    };
  },
});
