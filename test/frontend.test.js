import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../Index.html", import.meta.url), "utf8");
const schema = await readFile(new URL("../supabase/migrations/0001_initial_workspace_schema.sql", import.meta.url), "utf8");
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
  assert.match(html, /Age restricted/);
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
  assert.match(html, /config\.base\+'\/rest\/v1\/'\+path/);
  assert.match(html, /authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(html, /owner_id:mstkSession\.user\.id/);
  assert.match(html, /workspaces\?select=id,name,created_at&order=created_at\.desc/);
  assert.match(html, /Workspace database tables are not available yet/);
  assert.match(html, /database row-level security policies/);
});

test("workspace list renders names and identifiers as text, not HTML", () => {
  assert.match(html, /name\.textContent=workspace\.name/);
  assert.match(html, /id\.textContent='Workspace ID: '\+workspace\.id/);
  assert.match(html, /card\.append\(name,id,select\)/);
});


test("workspace supports project creation and scoped project listing", () => {
  for (const id of ["project-name", "create-project-button", "project-list", "selected-workspace-title"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /workspaceRequest\('projects','POST'/);
  assert.match(html, /projects\?select=id,name,description,created_at&workspace_id=eq\./);
});

test("workspace supports conversation creation and selected conversation history", () => {
  for (const id of ["conversation-title", "create-conversation-button", "conversation-list", "message-history", "history-status"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /workspaceRequest\('conversations','POST'/);
  assert.match(html, /conversations\?select=id,title,created_at&workspace_id=eq\./);
  assert.match(html, /messages\?select=id,role,content,created_at&conversation_id=eq\./);
});

test("user messages are saved only to the selected conversation and rendered as text", () => {
  assert.match(html, /conversation_id:selectedConversation\.id,workspace_id:selectedWorkspace\.id,created_by:mstkSession\.user\.id,role:'user',content:value/);
  assert.match(html, /content\.textContent=message\.content/);
  assert.match(html, /AI replies are not saved yet/);
});

test("workspace state is cleared on sign out", () => {
  assert.match(html, /selectedWorkspace=null;selectedConversation=null;resetWorkspacePanels\(\)/);
  assert.match(html, /if\(!selectedWorkspace\)return/);
});


test("saved message flow does not leave the send button disabled when AI is unavailable", () => {
  assert.match(html, /Your message is saved\. Configure the MSTK API URL to enable AI replies/);
  assert.match(html, /sendButton\.disabled=false;\s*return;/);
  assert.match(html, /finally\{sendButton\.disabled=false;\}/);
});

test("workspace schema includes projects, conversations and messages with membership RLS", () => {
  for (const table of ["public.projects", "public.conversations", "public.messages"]) {
    assert.ok(schema.includes("create table if not exists " + table), "missing schema for " + table);
  }
  assert.match(schema, /create policy projects_member_all/);
  assert.match(schema, /create policy conversations_member_select/);
  assert.match(schema, /create policy messages_member_select/);
  assert.match(schema, /role = 'user'/);
});


test("blind comparison accepts two manual responses and hides source labels", () => {
  for (const id of ["compare-source-a", "compare-answer-a", "compare-source-b", "compare-answer-b", "start-comparison-button", "comparison-stage", "comparison-status", "reveal-comparison-button"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /Sources are hidden\. Choose the response you prefer/);
  assert.match(html, /blindComparison=\{items:/);
  assert.match(html, /blindComparison\.items\[0\]\.text/);
  assert.match(html, /blindComparison\.items\[1\]\.text/);
});

test("blind comparison requires a choice before revealing provider labels", () => {
  assert.match(html, /if\(!blindComparison\|\|blindComparison\.choice===null\)return/);
  assert.match(html, /if\(!blindComparison\|\|blindComparison\.revealed\|\|!\[0,1\]\.includes\(index\)\)return/);
  assert.match(html, /selected\.source/);
  assert.match(html, /does not call AI providers or incur API charges/);
});


test("blind comparison reveals and displays the selected best response", () => {
  assert.match(html, /id="best-result"/);
  assert.match(html, /id="best-result-source"/);
  assert.match(html, /id="best-result-text"/);
  assert.match(html, /best-result-text'\)\.textContent=selected\.text/);
  assert.match(html, /best-result-source'\)\.textContent='Winning source: '\+selected\.source/);
  assert.match(html, /best-result'\)\.hidden=false/);
  assert.match(html, /best-result'\)\.hidden=true/);
});


test("Supabase session expiry is tracked and refreshed before protected requests", () => {
  assert.match(html, /function trackSessionExpiry\(session\)/);
  assert.match(html, /session\._mstkExpiresAt=Date\.now\(\)\+Math\.max\(0,Number\(session\.expires_in\)\)\*1000/);
  assert.match(html, /function refreshSessionIfNeeded\(\)/);
  assert.match(html, /token\?grant_type=refresh_token/);
  assert.match(html, /refresh_token:mstkSession\.refresh_token/);
  assert.match(html, /await refreshSessionIfNeeded\(\);\s*const headers=\{apikey:config\.key,authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(html, /await refreshSessionIfNeeded\(\);\s*if\(!config\.apiBase\)/);
});

test("failed Supabase refresh clears the in-memory session and asks the user to sign in", () => {
  assert.match(html, /Your sign-in session could not be refreshed\. Please sign in again\./);
  assert.match(html, /mstkSession=null;setSignedIn\(false\);resetWorkspacePanels\(\)/);
  assert.match(html, /Your sign-in session expired\. Please sign in again\./);
});


test("account UI exposes a password recovery request and reset panel", () => {
  assert.match(html, /id="recover-button"/);
  assert.match(html, /onclick="recoverAccount\(\)"/);
  assert.match(html, /id="password-recovery-panel"/);
  assert.match(html, /id="recovery-password"/);
  assert.match(html, /id="reset-password-button"/);
  assert.match(html, /autocomplete="new-password"/);
});

test("password recovery sends only the entered email and redirects to the current page", () => {
  assert.match(html, /authRequest\('recover\?redirect_to='\+encodeURIComponent\(redirectTo\),\{email\}\)/);
  assert.match(html, /const redirectTo=location\.origin\+location\.pathname/);
  assert.match(html, /If an account exists for that address/);
});

test("recovery callback accepts recovery tokens from the URL fragment and cleans the fragment", () => {
  assert.match(html, /function handlePasswordRecoveryCallback\(\)/);
  assert.match(html, /params\.get\('access_token'\)/);
  assert.match(html, /params\.get\('refresh_token'\)/);
  assert.match(html, /params\.get\('type'\)/);
  assert.match(html, /type==='recovery'/);
  assert.match(html, /history\.replaceState\(null,'',location\.pathname\+location\.search\)/);
  assert.match(html, /handlePasswordRecoveryCallback\(\);/);
});

test("password reset updates the authenticated Supabase user and clears the temporary recovery session", () => {
  assert.match(html, /config\.base\+'\/auth\/v1\/user'/);
  assert.match(html, /method:'PUT'/);
  assert.match(html, /JSON\.stringify\(\{password\}\)/);
  assert.match(html, /Password updated\. Sign in with your new password\./);
  assert.match(html, /document\.getElementById\('recovery-password'\)\.value=''/);
});

test("browser auth tokens are not persisted in web storage", () => {
  assert.doesNotMatch(scriptMatch[1], /localStorage|sessionStorage/);
  assert.match(html, /keeps the session in page memory only/);
});


test("session refresh is serialized so parallel protected requests cannot reuse a rotating refresh token", () => {
  assert.match(html, /let mstkRefreshPromise=null/);
  assert.match(html, /if\(mstkRefreshPromise\)return mstkRefreshPromise/);
  assert.match(html, /mstkRefreshPromise=\(async\(\)=>\{/);
  assert.match(html, /finally\{mstkRefreshPromise=null;\}/);
});

test("a refresh completing after sign-out cannot restore the previous session", () => {
  assert.match(html, /const sessionAtStart=mstkSession/);
  assert.match(html, /if\(mstkSession!==sessionAtStart\)return null/);
  assert.match(html, /const sessionAtSignOut=mstkSession/);
  assert.match(html, /authorization:'Bearer '\+sessionAtSignOut\.access_token/);
});

test("refresh failure only clears the session that initiated the failed refresh", () => {
  assert.match(html, /if\(mstkSession===sessionAtStart\)\{mstkSession=null;setSignedIn\(false\);resetWorkspacePanels\(\);\}/);
});
