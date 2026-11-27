import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../Index.html", import.meta.url), "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);

test("frontend contains a parseable inline JavaScript bundle", () => {
  assert.ok(scriptMatch, "expected one inline script block");
  assert.doesNotThrow(() => new vm.Script(scriptMatch[1]));
});

test("account UI exposes sign-in, sign-up, sign-out and session verification", () => {
  for (const id of ["account", "account-email", "account-password", "signin-button", "signup-button", "signout-button", "verify-button"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
});

test("browser configuration does not include privileged Supabase secrets", () => {
  assert.match(html, /supabaseAnonKey/);
  assert.doesNotMatch(html, /service_role|serviceRoleKey|jwt_secret/i);
});

test("authentication UI clearly reports that missing configuration is not live authentication", () => {
  assert.match(html, /Authentication is not configured yet/);
  assert.match(html, /Sign-in and sign-up are disabled until the public Supabase project settings are added/);
});

test("MSTK protected API verification uses a separately configured API base URL", () => {
  assert.match(html, /MSTK_CONFIG\.apiBase/);
  assert.match(html, /new URL\('\/api\/me',config\.apiBase\)/);
});

test("AI workspace sends prompts only through the authenticated MSTK API", () => {
  assert.match(html, /new URL\('\/api\/ai\/chat',config\.apiBase\)/);
  assert.match(html, /authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(html, /AI provider is not enabled yet/);
});


test("tool directory includes all 58 original catalogue entries with stable numbered identities", () => {
  assert.match(html, /const MSTK_TOOLS = \[/);
  assert.match(html, /\[58,"Kling AI"/);
  assert.match(html, /\[1,"Anime\.js"/);
  const rows = [...html.matchAll(/^\[(\d+),"([^"]+)","([^"]+)","([^"]+)","([^"]+)"\],?$/gm)];
  assert.equal(rows.length, 58);
  assert.deepEqual(rows.map((row) => Number(row[1])), Array.from({ length: 58 }, (_, index) => index + 1));
});

test("tool directory exposes search, category filters and honest connection count", () => {
  for (const id of ["tool-search", "tool-category", "tool-count", "tool-list"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /addEventListener\('input',renderToolDirectory\)/);
  assert.match(html, /addEventListener\('change',renderToolDirectory\)/);
  assert.match(html, /0 connected/);
});

test("tool directory renders catalogue data as text rather than injecting HTML", () => {
  assert.match(html, /title\.textContent='\#'/);
  assert.match(html, /detail\.textContent=tool\[4\]/);
  assert.match(html, /card\.append\(title,tags,detail\)/);
  assert.match(html, /No age-check bypass is offered/);
});


test("home dashboard reports current project status without claiming integrations are live", () => {
  for (const text of ["58", "22", "0", "Catalogue entries", "Fully audited", "Connected & live-tested"]) {
    assert.ok(html.includes(text), "expected dashboard status text: " + text);
  }
  assert.match(html, /Provider connections remain disabled until they pass review and testing/);
});

test("dashboard shortcuts navigate to existing workspace sections", () => {
  for (const id of ["workspace", "tools", "account", "image", "video", "audio", "development"]) {
    assert.match(html, new RegExp("show\\('" + id + "'\\)"));
  }
  assert.match(html, /class="shortcut-grid"/);
});


test("workspace UI exposes create, refresh and live status controls", () => {
  for (const id of ["workspace-name", "create-workspace-button", "refresh-workspaces-button", "workspace-status", "workspace-list"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /Create workspace/);
  assert.match(html, /Your Workspaces/);
});

test("workspace data requests use the signed-in Supabase session and RLS REST API", () => {
  assert.match(html, /config\.base\+'\/rest\/v1\/'+path/);
  assert.match(html, /authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(html, /owner_id:mstkSession\.user\.id/);
  assert.match(html, /workspaces\?select=id,name,created_at&order=created_at\.desc/);
  assert.match(html, /Workspace database tables are not available yet/);
  assert.match(html, /database row-level security policies/);
});

test("workspace list renders names and identifiers as text, not HTML", () => {
  assert.match(html, /name\.textContent=workspace\.name/);
  assert.match(html, /id\.textContent='Workspace ID: '\+workspace\.id/);
  assert.match(html, /card\.append\(name,id\)/);
});
