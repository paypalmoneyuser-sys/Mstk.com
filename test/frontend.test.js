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
