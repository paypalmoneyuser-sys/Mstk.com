import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function publicOrigin(value, name, { optional = false } = {}) {
  if (value === undefined || value === "") {
    if (optional) return "";
    return "";
  }
  if (typeof value !== "string") throw new Error(name + " must be a string.");
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error(name + " must be a valid HTTPS origin."); }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
      parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.origin !== value.replace(/\/$/, "")) {
    throw new Error(name + " must be an HTTPS origin without credentials, path, query, or fragment.");
  }
  return parsed.origin;
}

export async function buildPages({ rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), outputDir = path.join(rootDir, "dist"), env = process.env } = {}) {
  const supabaseUrl = publicOrigin(env.MSTK_PUBLIC_SUPABASE_URL || "", "MSTK_PUBLIC_SUPABASE_URL");
  const apiBase = publicOrigin(env.MSTK_PUBLIC_API_BASE || "", "MSTK_PUBLIC_API_BASE", { optional: true });
  const anonKey = env.MSTK_PUBLIC_SUPABASE_ANON_KEY || "";
  if (typeof anonKey !== "string") throw new Error("MSTK_PUBLIC_SUPABASE_ANON_KEY must be a string.");
  if (anonKey.length > 4096 || /service[_ -]?role|secret|private[_ -]?key/i.test(anonKey)) {
    throw new Error("MSTK_PUBLIC_SUPABASE_ANON_KEY has an invalid or secret-like value.");
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(path.join(rootDir, "index.html"), path.join(outputDir, "index.html"));
  await cp(path.join(rootDir, "_headers"), path.join(outputDir, "_headers"));
  await cp(path.join(rootDir, "app.js"), path.join(outputDir, "app.js"));
  await cp(path.join(rootDir, "styles.css"), path.join(outputDir, "styles.css"));

  const config = {
    supabaseUrl,
    supabaseAnonKey: anonKey,
    apiBase
  };
  await writeFile(
    path.join(outputDir, "mstk-config.js"),
    "// Generated at build time. Values in this file are public browser configuration only.\n" +
      "window.MSTK_CONFIG = Object.freeze(" + JSON.stringify(config) + ");\n",
    { encoding: "utf8", flag: "w" }
  );
  return { outputDir, files: ["index.html", "app.js", "styles.css", "mstk-config.js"] };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  try {
    const result = await buildPages();
    process.stdout.write("MSTK Pages build created " + result.files.join(", ") + " in " + result.outputDir + "\n");
  } catch (error) {
    process.stderr.write("MSTK Pages build failed: " + error.message + "\n");
    process.exitCode = 1;
  }
}
