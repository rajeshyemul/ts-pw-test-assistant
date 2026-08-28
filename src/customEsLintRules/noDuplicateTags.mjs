import { ESLintUtils } from "@typescript-eslint/utils";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ quiet: true });

const createRule = ESLintUtils.RuleCreator(() => "");

// Safe TAG handling
const tagPrefixes = (process.env.TAG || "")
  .split(",")
  .map((p) => p.trim().toUpperCase())
  .filter(Boolean);

// File to store global tag state across ESLint runs
const TAGS_CACHE_FILE = path.join(
  process.cwd(),
  "output",
  ".eslint-tags-cache.json",
);

// Function to read existing tags from cache
function readTagsCache() {
  try {
    if (fs.existsSync(TAGS_CACHE_FILE)) {
      const data = fs.readFileSync(TAGS_CACHE_FILE, "utf8");
      const parsed = JSON.parse(data);
      return new Map(parsed);
    }
  } catch {
    // Cache file doesn't exist or is corrupted
  }
  return new Map();
}

// Function to write tags to cache
function writeTagsCache(tagsMap) {
  try {
    fs.mkdirSync(path.dirname(TAGS_CACHE_FILE), { recursive: true });
    const data = JSON.stringify([...tagsMap]);
    fs.writeFileSync(TAGS_CACHE_FILE, data, "utf8");
  } catch {
    // Could not write cache (permissions, etc.)
  }
}

export default createRule({
  name: "no-duplicate-tags",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow duplicate tags in test names across files",
      recommended: true,
    },
    messages: {
      duplicateTag:
        "Tag '{{tag}}' is duplicated. First occurrence in '{{file}}'.",
      duplicateTagInFile:
        "Tag '{{tag}}' is already used in this file at line {{line}}.",
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    // Get global tags map from cache
    const globalTagsMap = readTagsCache();

    // Track tags within current file
    const currentFileTags = new Map();

    // Get current filename for reference
    const currentFileName = context.getFilename();

    return {
      // Clean up cache at the end of file processing
      "Program:exit"() {
        // Update global cache with tags from this file
        const allTags = new Map(globalTagsMap);
        for (const [tag, info] of currentFileTags) {
          // Only add if not already present or if we have more recent info
          if (!allTags.has(tag)) {
            allTags.set(tag, info);
          }
        }
        writeTagsCache(allTags);
      },

      CallExpression(node) {
        if (!isTestFunction(node)) return;

        const arg = node.arguments[0];
        let title = null;

        if (arg?.type === "Literal" && typeof arg.value === "string") {
          title = arg.value;
        } else if (arg?.type === "TemplateLiteral") {
          title = arg.quasis.map((q) => q.value.cooked).join("");
        }

        if (!title) return;

        // Strict tag extraction - matches @EG-T021, @ABC-T123, etc.
        const extractedTags = title.match(/@[A-Z]+-T\d+/gi) || [];

        for (const rawTag of extractedTags) {
          const tag = rawTag.toUpperCase();

          // Check if tag matches our configured prefixes
          if (tagPrefixes.length) {
            const hasValidPrefix = tagPrefixes.some((prefix) =>
              tag.startsWith(prefix.toUpperCase()),
            );
            if (!hasValidPrefix) continue;
          }

          const tagKey = tag.toUpperCase();

          // Check for duplicate within the same file
          if (currentFileTags.has(tagKey)) {
            context.report({
              node,
              messageId: "duplicateTagInFile",
              data: {
                tag,
                line: currentFileTags.get(tagKey).line,
              },
            });
            continue;
          }

          // Check for duplicate in other files using cache
          const existing = globalTagsMap.get(tagKey);
          if (existing && existing.filePath !== currentFileName) {
            context.report({
              node,
              messageId: "duplicateTag",
              data: {
                tag,
                file: existing.filePath,
              },
            });
            continue;
          }

          // Store this tag in current file tracking
          currentFileTags.set(tagKey, {
            filePath: currentFileName,
            line: node.loc.start.line,
          });
        }
      },
    };
  },
});

/**
 * Strict test detection
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
