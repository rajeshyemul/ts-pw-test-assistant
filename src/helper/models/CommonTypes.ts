export type ParsedXML = {
  id: string;
  name: string;
  tests: string;
  failures: string;
  skipped: string;
  errors: string;
  time: string;
};

export type Link = {
  id: string;
  url?: string;
};

export type Severity = "blocker" | "critical" | "normal" | "minor" | "trivial";
