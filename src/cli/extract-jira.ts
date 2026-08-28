import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

interface JiraIssueResponse {
  key: string;
  fields: {
    summary?: string;
    description?: any;
    components?: Array<{ name: string }>;
    issuetype?: { name: string };
    priority?: { name: string };
    status?: { name: string };
    customfield_10014?: string; // Acceptance criteria custom field if any
    comment?: {
      comments?: Array<{
        author?: { displayName?: string };
        body?: any;
      }>;
    };
  };
}

/**
 * Helper to convert ADF (Atlassian Document Format) or raw text to plain string/markdown
 */
function parseJiraText(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && content.content) {
    // Basic ADF traversal
    return content.content
      .map((block: any) => {
        if (block.content) {
          return block.content.map((c: any) => c.text || "").join("");
        }
        return "";
      })
      .join("\n");
  }
  return JSON.stringify(content);
}

export async function extractJiraIssue(issueKey: string): Promise<string> {
  const jiraServer = process.env.JIRA_SERVER || "https://rajeshyemul.atlassian.net";
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;

  console.log(`\n🔍 JiraExtractor: Processing ticket [${issueKey}]...`);
  console.log(`🔗 Target Server: ${jiraServer}`);

  let jiraData: any;

  if (jiraEmail && jiraToken) {
    console.log(`🔑 Authenticating using JIRA_EMAIL (${jiraEmail})...`);
    const authHeader = Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64");
    const apiUrl = `${jiraServer.replace(/\/$/, "")}/rest/api/3/issue/${issueKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`JIRA API HTTP error ${response.status}: ${response.statusText}`);
      }

      const issue: JiraIssueResponse = await response.json();
      const componentName =
        issue.fields.components && issue.fields.components.length > 0
          ? issue.fields.components[0].name
          : "admin";

      const descText = parseJiraText(issue.fields.description);
      const acLines = descText
        .split("\n")
        .filter(line => line.toLowerCase().includes("ac:") || line.toLowerCase().includes("given") || line.startsWith("-") || line.startsWith("*"));

      jiraData = {
        jira_issue_key: issue.key,
        summary: issue.fields.summary || "No Summary",
        component: componentName,
        issue_type: issue.fields.issuetype?.name || "Story",
        priority: issue.fields.priority?.name || "Medium",
        status: issue.fields.status?.name || "Open",
        description: descText,
        acceptance_criteria: acLines.length > 0 ? acLines : ["AC 1: Verify feature functionality matching description."],
        affected_components: [componentName],
        comments: (issue.fields.comment?.comments || []).map(c => ({
          author: c.author?.displayName || "Unknown",
          body: parseJiraText(c.body),
        })),
        extracted_at: new Date().toISOString(),
      };

      console.log(`✅ Live JIRA data successfully retrieved for ${issueKey}!`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to fetch live JIRA ticket (${err.message}). Falling back to local template output.`);
      jiraData = getFallbackJiraData(issueKey);
    }
  } else {
    console.log(`ℹ️ JIRA_EMAIL and JIRA_API_TOKEN not set in .env.`);
    console.log(`💡 To connect to live JIRA (https://rajeshyemul.atlassian.net), add to your .env file:`);
    console.log(`   JIRA_SERVER=https://rajeshyemul.atlassian.net`);
    console.log(`   JIRA_EMAIL=your-email@domain.com`);
    console.log(`   JIRA_API_TOKEN=your-atlassian-token\n`);
    jiraData = getFallbackJiraData(issueKey);
  }

  const component = jiraData.component || "admin";
  const outputDir = path.join(process.cwd(), "test_artifacts", component, issueKey, "phases");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "jira_data.json");
  fs.writeFileSync(outputPath, JSON.stringify(jiraData, null, 2), "utf-8");

  console.log(`📁 Saved extracted JIRA artifact to: ${outputPath}`);
  return outputPath;
}

function getFallbackJiraData(issueKey: string) {
  return {
    jira_issue_key: issueKey,
    summary: "Admin Room Management and Inventory Verification",
    component: "admin",
    issue_type: "Story",
    priority: "High",
    status: "In Progress",
    description: "As an admin user, I need to log into the admin portal and manage hotel room inventory. The admin room management page should show the login form, authenticate admin credentials, and display room inventory populated with existing rooms.",
    acceptance_criteria: [
      "AC 1: Navigating to admin login shows the admin login form with username and password fields.",
      "AC 2: Logging in as admin opens room management page.",
      "AC 3: Room management page displays header and populates room inventory list."
    ],
    affected_components: ["admin-login", "admin-rooms"],
    comments: [
      {
        author: "QE Lead",
        body: "Ensure smoke tag @smoke is added for critical path tests."
      }
    ],
    extracted_at: new Date().toISOString()
  };
}

// CLI Execution Entry Point
if (require.main === module) {
  const issueKey = process.argv[2] || "APP-1";
  extractJiraIssue(issueKey).catch(console.error);
}

