import { ESLintUtils } from "@typescript-eslint/utils";
import fs from "fs";
import path from "path";

const createRule = ESLintUtils.RuleCreator(() => "");

// File to store global title state across ESLint runs
const TITLES_CACHE_FILE = path.join(
  process.cwd(),
  "output",
  ".eslint-titles-cache.json",
);

// Function to read existing titles from cache
function readTitlesCache() {
  try {
    if (fs.existsSync(TITLES_CACHE_FILE)) {
      const data = fs.readFileSync(TITLES_CACHE_FILE, "utf8");
      const parsed = JSON.parse(data);
      return new Map(parsed);
    }
  } catch {
    // Cache file doesn't exist or is corrupted
  }
  return new Map();
}

// Function to write titles to cache
function writeTitlesCache(titlesMap) {
  try {
    fs.mkdirSync(path.dirname(TITLES_CACHE_FILE), { recursive: true });
    const data = JSON.stringify([...titlesMap]);
    fs.writeFileSync(TITLES_CACHE_FILE, data, "utf8");
  } catch {
    // Could not write cache (permissions, etc.)
  }
}

function normalizePath(filePath) {
  if (!filePath) return "";
  return path.normalize(filePath).toLowerCase();
}

export default createRule({
  name: "prevent-duplicate-titles",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow duplicate test titles across files",
      recommended: true,
    },
    messages: {
      duplicateTitle:
        "Title '{{title}}' is duplicated. First occurrence in '{{file}}').",
      duplicateTitleInFile:
        "Title '{{title}}' is already used in this file at line {{line}}.",
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    // Get global titles map from cache
    const globalTitlesMap = readTitlesCache();

    // Track titles within current file
    const currentFileTitles = new Map();

    // Get current filename for reference
    const currentFileName = context.getFilename();
    const normalizedCurrentFile = normalizePath(currentFileName);

    // Purge any stale cache entries for this file before processing
    for (const [key, value] of globalTitlesMap.entries()) {
      if (normalizePath(value.filePath) === normalizedCurrentFile) {
        globalTitlesMap.delete(key);
      }
    }

    return {
      // Clean up cache at the end of file processing
      "Program:exit"() {
        // Update global cache with titles from this file
        const allTitles = new Map(globalTitlesMap);
        for (const [titleKey, info] of currentFileTitles) {
          allTitles.set(titleKey, info);
        }
        writeTitlesCache(allTitles);
      },

      CallExpression(node) {
        if (!isTestFunction(node) && !isDescribeFunction(node)) return;

        const arg = node.arguments[0];
        let title = null;

        if (arg?.type === "Literal" && typeof arg.value === "string") {
          title = arg.value;
        } else if (arg?.type === "TemplateLiteral") {
          title = arg.quasis.map((q) => q.value.cooked).join("");
        }

        if (!title) return;

        const titleKey = title.toUpperCase();

        // Check for duplicate within the same file
        if (currentFileTitles.has(titleKey)) {
          context.report({
            node,
            messageId: "duplicateTitleInFile",
            data: {
              title,
              line: currentFileTitles.get(titleKey).line,
            },
          });
          return;
        }

        // Check for duplicate in other files using cache
        const existing = globalTitlesMap.get(titleKey);
        if (existing && normalizePath(existing.filePath) !== normalizedCurrentFile) {
          context.report({
            node,
            messageId: "duplicateTitle",
            data: {
              title,
              file: existing.filePath,
            },
          });
          return;
        }

        // Store this title in current file tracking
        currentFileTitles.set(titleKey, {
          filePath: currentFileName,
          line: node.loc.start.line,
        });
      },
    };
  },
});

/**
 * Strict test detection: test(...), test.only(...), test.skip(...)
 */
function isTestFunction(node) {
  if (node.callee.type === "Identifier") {
    return node.callee.name === "test";
  }

  if (node.callee.type === "MemberExpression") {
    const object = node.callee.object;
    const property = node.callee.property;

    if (
      object?.type === "Identifier" &&
      object.name === "test" &&
      property?.type === "Identifier"
    ) {
      return ["only", "skip", "fixme", "fail"].includes(property.name);
    }
  }

  return false;
}

/**
 * Describe detection: test.describe(...), test.describe.only(...), test.describe.skip(...)
 */
function isDescribeFunction(node) {
  if (node.callee.type === "MemberExpression") {
    const object = node.callee.object;
    const property = node.callee.property;

    if (
      object?.type === "Identifier" &&
      object.name === "test" &&
      property?.type === "Identifier"
    ) {
      return ["describe"].includes(property.name);
    }
  }

  return false;
}
