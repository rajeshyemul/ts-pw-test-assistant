import { Link, Severity } from "@helper/models/CommonTypes";

export type TestMetadataOptions = {
  // ===== Core hierarchy =====
  epic?: string;
  feature?: string;
  story?: string | string[];
  severity?: Severity;

  // ===== Ownership =====
  owner?: string;
  component?: string;

  // ===== Classification =====
  tags?: string[];

  // ===== External references =====
  issues?: Link[];
  tmsLinks?: Link[];

  // ===== Optional =====
  description?: string;
};
