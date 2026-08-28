import noDuplicateTags from "./noDuplicateTags.mjs";
import noInternalActionImports from "./noInternalActionImports.mjs";
import noUnusedConstants from "./noUnusedConstants.mjs";
import preventDuplicatedTitles from "./preventDuplicateTitles.mjs";

const rules = {
  "no-duplicate-tags": noDuplicateTags,
  "no-internal-action-imports": noInternalActionImports,
  "no-unused-constants": noUnusedConstants,
  "prevent-duplicate-titles": preventDuplicatedTitles,
};

export default { rules };
