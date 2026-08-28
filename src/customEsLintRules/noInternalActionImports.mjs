import { ESLintUtils } from "@typescript-eslint/utils";
import path from "node:path";

const createRule = ESLintUtils.RuleCreator(() => "");

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function isAllowedInternalActionImporter(filePath) {
  const normalizedFilePath = normalizePath(filePath);

  return (
    normalizedFilePath.endsWith("/src/helper/actions/UIActions.ts") ||
    normalizedFilePath.includes("/src/helper/actions/internal/")
  );
}

function importsInternalActionModule(source, filePath) {
  if (
    source === "@helper/actions/internal" ||
    source.startsWith("@helper/actions/internal/")
  ) {
    return true;
  }

  if (
    source === "src/helper/actions/internal" ||
    source.startsWith("src/helper/actions/internal/")
  ) {
    return true;
  }

  if (!source.startsWith(".")) {
    return false;
  }

  const resolvedImportPath = normalizePath(
    path.resolve(path.dirname(filePath), source),
  );
  return resolvedImportPath.includes("/src/helper/actions/internal/");
}

export default createRule({
  name: "no-internal-action-imports",

  meta: {
    type: "problem",

    docs: {
      description:
        "Disallow importing internal UI action classes outside the action facade.",
      recommended: true,
    },

    messages: {
      internalActionImport:
        "Use UIActions instead of importing internal action classes directly.",
    },

    schema: [],
  },

  defaultOptions: [],

  create(context) {
    const filePath = context.getFilename();

    function reportInternalActionImport(node, source) {
      if (
        typeof source === "string" &&
        importsInternalActionModule(source, filePath) &&
        !isAllowedInternalActionImporter(filePath)
      ) {
        context.report({
          node,
          messageId: "internalActionImport",
        });
      }
    }

    return {
      ImportDeclaration(node) {
        reportInternalActionImport(node, node.source.value);
      },

      ExportAllDeclaration(node) {
        reportInternalActionImport(node, node.source.value);
      },

      ExportNamedDeclaration(node) {
        if (node.source) {
          reportInternalActionImport(node, node.source.value);
        }
      },
    };
  },
});
