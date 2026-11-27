import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../Index.html", import.meta.url), "utf8");
const schema = await readFile(new URL("../supabase/migrations/0001_initial_workspace_schema.sql", import.meta.url), "utf8");
const frontendConfigTemplate = await readFile(new URL("../mstk-config.example.js", import.meta.url), "utf8");
const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
const appScript = await readFile(new URL("../app.js", import.meta.url), "utf8");
const source = html + "\n" + appScript;
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const frontendSecurity = await readFile(new URL("../docs/FRONTEND-SECURITY.md", import.meta.url), "utf8");

test("frontend application JavaScript is external and parseable", () => {
  assert.match(source, /<script src="\/app\.js"><\/script>/);
  assert.doesNotThrow(() => new vm.Script(appScript));
});

test("account UI exposes sign-in, sign-up, sign-out and session verification", () => {
  for (const id of ["account", "account-email", "account-password", "signin-button", "signup-button", "signout-button", "verify-button"]) {
    assert.match(source, new RegExp('id="' + id + '"'));
  }
});

test("browser configuration does not include privileged Supabase secrets", () => {
  assert.match(source, /supabaseAnonKey/);
  assert.doesNotMatch(html, /service_role|serviceRoleKey|jwt_secret/i);
});

test("authentication UI clearly reports that missing configuration is not live authentication", () => {
  assert.match(source, /Authentication is not configured yet/);
  assert.match(source, /Sign-in and sign-up are disabled until the public Supabase project settings are added/);
});

test("MSTK protected API verification uses a separately configured API base URL", () => {
  assert.match(source, /MSTK_CONFIG\.apiBase/);
  assert.match(source, /new URL\('\/api\/me',config\.apiBase\)/);
});

test("AI workspace sends prompts only through the authenticated MSTK API", () => {
  assert.match(source, /new URL\('\/api\/ai\/chat',config\.apiBase\)/);
  assert.match(source, /authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(source, /AI provider is not enabled yet/);
});


test("tool directory includes all 58 original catalogue entries with stable numbered identities", () => {
  assert.match(source, /const MSTK_TOOLS = \[/);
  assert.match(source, /\[58,"Kling AI"/);
  assert.match(source, /\[1,"Anime\.js"/);
  const rows = [...source.matchAll(/^\[(\d+),"([^"]+)","([^"]+)","([^"]+)","([^"]+)"\],?$/gm)];
  assert.equal(rows.length, 58);
  assert.deepEqual(rows.map((row) => Number(row[1])), Array.from({ length: 58 }, (_, index) => index + 1));
});

test("tool directory exposes search, category filters and honest connection count", () => {
  for (const id of ["tool-search", "tool-category", "tool-count", "tool-list"]) {
    assert.match(source, new RegExp('id="' + id + '"'));
  }
  assert.match(source, /addEventListener\('input',renderToolDirectory\)/);
  assert.match(source, /addEventListener\('change',renderToolDirectory\)/);
  assert.match(source, /0 connected/);
});

test("tool directory renders catalogue data as text rather than injecting HTML", () => {
  assert.match(source, /title\.textContent='\#'/);
  assert.match(source, /detail\.textContent=tool\[4\]/);
  assert.match(source, /card\.append\(title,tags,detail\)/);
  assert.match(source, /Age restricted/);
});


test("home dashboard reports current project status without claiming integrations are live", () => {
  for (const text of ["58", "22", "0", "Catalogue entries", "Fully audited", "Connected & live-tested"]) {
    assert.ok(html.includes(text), "expected dashboard status text: " + text);
  }
  assert.match(source, /Provider connections remain disabled until they pass review and testing/);
});

test("dashboard shortcuts navigate to existing workspace sections", () => {
  for (const id of ["workspace", "tools", "account", "image", "video", "audio", "development"]) {
    assert.match(source, new RegExp('data-mstk-action="show" data-mstk-value="' + id + '"'));
  }
  assert.match(source, /class="shortcut-grid"/);
});


test("workspace UI exposes create, refresh and live status controls", () => {
  for (const id of ["workspace-name", "create-workspace-button", "refresh-workspaces-button", "workspace-status", "workspace-list"]) {
    assert.match(source, new RegExp('id="' + id + '"'));
  }
  assert.match(source, /Create workspace/);
  assert.match(source, /Your Workspaces/);
});

test("workspace data requests use the signed-in Supabase session and RLS REST API", () => {
  assert.match(source, /config\.base\+'\/rest\/v1\/'\+path/);
  assert.match(source, /authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(source, /owner_id:mstkSession\.user\.id/);
  assert.match(source, /workspaces\?select=id,name,created_at&order=created_at\.desc/);
  assert.match(source, /Workspace database tables are not available yet/);
  assert.match(source, /database row-level security policies/);
});

test("workspace list renders names and identifiers as text, not HTML", () => {
  assert.match(source, /name\.textContent=workspace\.name/);
  assert.match(source, /id\.textContent='Workspace ID: '\+workspace\.id/);
  assert.match(source, /card\.append\(name,id,select\)/);
});


test("workspace supports project creation and scoped project listing", () => {
  for (const id of ["project-name", "create-project-button", "project-list", "selected-workspace-title"]) {
    assert.match(source, new RegExp('id="' + id + '"'));
  }
  assert.match(source, /workspaceRequest\('projects','POST'/);
  assert.match(source, /projects\?select=id,name,description,created_at&workspace_id=eq\./);
});

test("workspace supports conversation creation and selected conversation history", () => {
  for (const id of ["conversation-title", "create-conversation-button", "conversation-list", "message-history", "history-status"]) {
    assert.match(source, new RegExp('id="' + id + '"'));
  }
  assert.match(source, /workspaceRequest\('conversations','POST'/);
  assert.match(source, /conversations\?select=id,title,created_at&workspace_id=eq\./);
  assert.match(source, /messages\?select=id,role,content,created_at&conversation_id=eq\./);
});

test("user messages are saved only to the selected conversation and rendered as text", () => {
  assert.match(source, /conversation_id:selectedConversation\.id,workspace_id:selectedWorkspace\.id,created_by:mstkSession\.user\.id,role:'user',content:value/);
  assert.match(source, /content\.textContent=message\.content/);
  assert.match(source, /AI replies are not saved yet/);
});

test("workspace state is cleared on sign out", () => {
  assert.match(source, /selectedWorkspace=null;selectedConversation=null;resetWorkspacePanels\(\)/);
  assert.match(source, /if\(!selectedWorkspace\)return/);
});


test("saved message flow does not leave the send button disabled when AI is unavailable", () => {
  assert.match(source, /Your message is saved\. Configure the MSTK API URL to enable AI replies/);
  assert.match(source, /sendButton\.disabled=false;\s*return;/);
  assert.match(source, /finally\{sendButton\.disabled=false;\}/);
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
    assert.match(source, new RegExp('id="' + id + '"'));
  }
  assert.match(source, /Sources are hidden\. Choose the response you prefer/);
  assert.match(source, /blindComparison=\{items:/);
  assert.match(source, /blindComparison\.items\[0\]\.text/);
  assert.match(source, /blindComparison\.items\[1\]\.text/);
});

test("blind comparison requires a choice before revealing provider labels", () => {
  assert.match(source, /if\(!blindComparison\|\|blindComparison\.choice===null\)return/);
  assert.match(source, /if\(!blindComparison\|\|blindComparison\.revealed\|\|!\[0,1\]\.includes\(index\)\)return/);
  assert.match(source, /selected\.source/);
  assert.match(source, /does not call AI providers or incur API charges/);
});


test("blind comparison reveals and displays the selected best response", () => {
  assert.match(source, /id="best-result"/);
  assert.match(source, /id="best-result-source"/);
  assert.match(source, /id="best-result-text"/);
  assert.match(source, /best-result-text'\)\.textContent=selected\.text/);
  assert.match(source, /best-result-source'\)\.textContent='Winning source: '\+selected\.source/);
  assert.match(source, /best-result'\)\.hidden=false/);
  assert.match(source, /best-result'\)\.hidden=true/);
});


test("Supabase session expiry is tracked and refreshed before protected requests", () => {
  assert.match(source, /function trackSessionExpiry\(session\)/);
  assert.match(source, /session\._mstkExpiresAt=Date\.now\(\)\+Math\.max\(0,Number\(session\.expires_in\)\)\*1000/);
  assert.match(source, /function refreshSessionIfNeeded\(\)/);
  assert.match(source, /token\?grant_type=refresh_token/);
  assert.match(source, /refresh_token:sessionAtStart\.refresh_token/);
  assert.match(source, /await refreshSessionIfNeeded\(\);\s*const headers=\{apikey:config\.key,authorization:'Bearer '\+mstkSession\.access_token/);
  assert.match(source, /await refreshSessionIfNeeded\(\);\s*if\(!config\.apiBase\)/);
});

test("failed Supabase refresh clears the in-memory session and asks the user to sign in", () => {
  assert.match(source, /Your sign-in session could not be refreshed\. Please sign in again\./);
  assert.match(source, /mstkSession=null;setSignedIn\(false\);resetWorkspacePanels\(\)/);
  assert.match(source, /Your sign-in session expired\. Please sign in again\./);
});


test("account UI exposes a password recovery request and reset panel", () => {
  assert.match(source, /id="recover-button"/);
  assert.match(source, /data-mstk-action="recover"/);
  assert.match(source, /id="password-recovery-panel"/);
  assert.match(source, /id="recovery-password"/);
  assert.match(source, /id="reset-password-button"/);
  assert.match(source, /autocomplete="new-password"/);
});

test("password recovery sends only the entered email and redirects to the current page", () => {
  assert.match(source, /authRequest\('recover\?redirect_to='\+encodeURIComponent\(redirectTo\),\{email\}\)/);
  assert.match(source, /const redirectTo=location\.origin\+location\.pathname/);
  assert.match(source, /If an account exists for that address/);
});

test("recovery callback accepts recovery tokens from the URL fragment and cleans the fragment", () => {
  assert.match(source, /function handlePasswordRecoveryCallback\(\)/);
  assert.match(source, /params\.get\('access_token'\)/);
  assert.match(source, /params\.get\('refresh_token'\)/);
  assert.match(source, /params\.get\('type'\)/);
  assert.match(source, /type==='recovery'/);
  assert.match(source, /history\.replaceState\(null,'',location\.pathname\+location\.search\)/);
  assert.match(source, /handlePasswordRecoveryCallback\(\);/);
});

test("password reset updates the authenticated Supabase user and clears the temporary recovery session", () => {
  assert.match(source, /config\.base\+'\/auth\/v1\/user'/);
  assert.match(source, /method:'PUT'/);
  assert.match(source, /JSON\.stringify\(\{password\}\)/);
  assert.match(source, /Password updated\. Sign in with your new password\./);
  assert.match(source, /document\.getElementById\('recovery-password'\)\.value=''/);
});

test("browser auth tokens are not persisted in web storage", () => {
  assert.doesNotMatch(appScript, /localStorage|sessionStorage/);
  assert.match(source, /keeps the session in page memory only/);
});


test("session refresh is serialized so parallel protected requests cannot reuse a rotating refresh token", () => {
  assert.match(source, /let mstkRefreshPromise=null/);
  assert.match(source, /if\(mstkRefreshPromise\)return mstkRefreshPromise/);
  assert.match(source, /mstkRefreshPromise=\(async\(\)=>\{/);
  assert.match(source, /finally\{mstkRefreshPromise=null;\}/);
});

test("a refresh completing after sign-out cannot restore the previous session", () => {
  assert.match(source, /const sessionAtStart=mstkSession/);
  assert.match(source, /if\(mstkSession!==sessionAtStart\)return null/);
  assert.match(source, /const sessionAtSignOut=mstkSession/);
  assert.match(source, /authorization:'Bearer '\+sessionAtSignOut\.access_token/);
});

test("refresh failure only clears the session that initiated the failed refresh", () => {
  assert.match(source, /if\(mstkSession===sessionAtStart\)\{mstkSession=null;setSignedIn\(false\);resetWorkspacePanels\(\);\}/);
});


test("frontend configuration template loads before the application script", () => {
  const configScript = html.indexOf('<script src="/mstk-config.js"></script>');
  const appScriptIndex = html.indexOf('<script src="/app.js"></script>');
  assert.ok(configScript >= 0, "expected the optional local config script");
  assert.ok(appScriptIndex > configScript, "app code must run after frontend config");
  assert.match(frontendConfigTemplate, /window\.MSTK_CONFIG\s*=\s*Object\.freeze/);
  assert.match(frontendConfigTemplate, /supabaseUrl:/);
  assert.match(frontendConfigTemplate, /supabaseAnonKey:/);
  assert.match(frontendConfigTemplate, /apiBase:/);
});

test("local frontend config is ignored by Git and example contains no real credentials", () => {
  assert.match(gitignore, /^mstk-config\.js$/m);
  assert.match(frontendConfigTemplate, /YOUR-PROJECT/);
  assert.match(frontendConfigTemplate, /YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY/);
  assert.doesNotMatch(frontendConfigTemplate, /service_role|serviceRoleKey|eyJ[A-Za-z0-9_-]{20,}/i);
});

test("frontend uses delegated data-action events and contains no inline event handlers", () => {
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.match(source, /document\.addEventListener\('click'/);
  for (const action of ["show", "signin", "signup", "recover", "signout", "complete-recovery", "verify-session", "create-workspace", "load-workspaces", "create-project", "create-conversation", "start-comparison", "choose-response", "reveal-comparison", "send-prompt"]) {
    assert.ok(html.includes('data-mstk-action="' + action + '"'), "missing action " + action);
  }
});

test("frontend CSS and application JavaScript are external assets", () => {
  assert.match(html, /<link rel="stylesheet" href="\/styles\.css">/);
  assert.equal((html.match(/\sstyle\s*=/gi) || []).length, 0);
  assert.equal((html.match(/<script>(?!\s*src)/gi) || []).length, 0);
  assert.ok(css.includes("body{"));
  assert.ok(css.includes(".panel{"));
});

test("frontend remains compatible with a strict external-asset CSP", () => {
  assert.equal((html.match(/<style\b/gi) || []).length, 0);
  assert.equal((html.match(/\\sstyle\\s*=/gi) || []).length, 0);
  assert.equal((html.match(/\son[a-z]+\s*=/gi) || []).length, 0);
  assert.equal((html.match(/javascript\s*:/gi) || []).length, 0);
  const scriptTags = [...html.matchAll(/<script\b([^>]*)>/gi)];
  assert.ok(scriptTags.length >= 2);
  assert.ok(scriptTags.every((tag) => /\bsrc\s*=/.test(tag[1])));
  assert.match(frontendSecurity, /script-src 'self'/);
  assert.match(frontendSecurity, /style-src 'self'/);
  assert.doesNotMatch(frontendSecurity, /unsafe-inline|unsafe-eval/);
});
