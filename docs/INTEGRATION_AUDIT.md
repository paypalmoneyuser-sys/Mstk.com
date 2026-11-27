# MSTK.COM — Original 58-tool audit register

Snapshot: 2026-11-27. This is preliminary research, not a final certification. No entry is fully audited or successfully integrated.

## Strict completion rule
An entry is Fully audited only after evidence for: exact identity; official owner/site; category; app price; API price; free quota; hidden costs; India access/payment; age/terms/commercial use; integration method; MSTK compatibility; and an actual safe test.

Research status is separate from implementation status. A free app does not imply a free API. Unknown age rules mean blocked pending verification. Do not enable 18+ services in teen-facing MSTK. Do not bypass age checks. Provider credentials must remain server-side.

## Original list

| # | Product | Preliminary finding | MSTK status |
|---:|---|---|---|
| 1 | Anime.js | Free open-source JS animation library; local package, not hosted AI API | Local library candidate; not tested |
| 2 | Motion.dev | Free core motion library; some advanced features paid | Local library candidate; not tested |
| 3 | Kokonut UI | Free core; Pro offering reported, current licence/price needs recheck | Pricing/terms pending |
| 4 | Bklit UI | Free chart/UI core reported; Studio licence/price needs recheck | Terms pending |
| 5 | Manus | Reported 18+ eligibility | Age blocked |
| 6 | Openverse | Open media discovery API; anonymous access with rate limits; item licences and attribution must be checked | Candidate; not tested |
| 7 | Earshot | Exact identity assumed to be earshotlabs.com; paid plan reported; no public API confirmed | Identity/terms pending |
| 8 | Real SFX Skills | Local sound-design skill; not a hosted generation API | Local-only; review code/licences |
| 9 | Arena Skill | Claude Code skill; dependency age restrictions apply | Age blocked |
| 10 | Higgsfield MAGI-2 | Reported 18+ terms and usage pricing | Age blocked |
| 11 | Blender | Free GPL desktop software with local Python API; hardware costs may apply | Local-only; model licences apply |
| 12 | Claude | Anthropic service; reported 18+ terms | Age blocked |
| 13 | ChatGPT | Consumer plan and API are separate; API separately billed; account/guardian terms require review | Terms pending; no provider configured |
| 14 | Gemini | API developer eligibility/product terms conflict with teen-facing use | Age blocked |
| 15 | Seedance | API usage pricing reported; age, India access and redistribution terms unclear | Terms pending |
| 16 | Google Flow | Reported 18+ eligibility | Age blocked |
| 17 | Claude (duplicate of #12) | Duplicate retained for traceability | Duplicate; age blocked |
| 18 | Grok | Consumer eligibility differs from paid API eligibility; guardian terms need review | Terms pending |
| 19 | Meta Muse Spark | API access reportedly requires adult developer | Age blocked |
| 20 | Claude Design | Anthropic service; reported 18+ terms | Age blocked |
| 21 | Google Slides | Slides API with OAuth and documented quotas | Candidate; not tested |
| 22 | Fable 5.2 | Exact identity and reported token prices need official confirmation | Identity/price pending |
| 23 | Higgsfield MCP | Reported 18+ eligibility | Age blocked |
| 24 | Midjourney | Paid subscription; no supported public API confirmed; automation restrictions apply | No supported integration identified |
| 25 | Nano Banana | Gemini image model family; provider age/API terms require review | Age blocked pending eligibility |
| 26 | Perplexity | Consumer service reported 18+; API separately billed | Age blocked for teen-facing use |
| 27 | Consensus | Research service with reported limited API/MCP allowance; age/terms need recheck | Terms pending |
| 28 | GitHub Copilot | Free/paid coding assistant; no general-purpose public model API established | Coding workflow only; not general AI provider |
| 29 | Cursor | Reported 18+ eligibility | Age blocked |
| 30 | Runway ML | Free/paid plans and paid API credits reported; age/redistribution need confirmation | Terms pending |
| 31 | Stable Diffusion | Self-hostable models; hosted API and model licences differ; reported hosted 18+ terms | Local/model licence review; hosted use blocked pending terms |
| 32 | Adobe Firefly | Free limited and paid/API products; age/guardian and API terms need confirmation | Terms pending |
| 33 | Hailuo AI | Minimum age reported as 16+; API credit and regional terms need confirmation | Terms pending; not enabled |
| 34 | Canva | Free/paid plans and developer APIs; account age and feature-specific terms apply | Candidate; not tested |
| 35 | Lovart | Credit plans; guardian/supervision conditions reported; public API unconfirmed | Terms pending |
| 36 | CapCut | Consumer editing app; no general public editing API confirmed | Manual file workflow only |
| 37 | Instagram Edits | Mobile editor; no public developer editing API confirmed | Manual file workflow only |
| 38 | Maestro Video Generator | Exact product identity unresolved | Identity unclear; blocked |
| 39 | DeepSeek Harness | Experimental open-source harness; model API billed separately; sandboxing required | Experimental; security/terms pending |
| 40 | Headroom | Several unrelated products share this name | Identity unclear; blocked |
| 41 | Claude-Mem | Depends on Claude Code; upstream age restrictions apply | Age blocked |
| 42 | Anthropic free Claude Code setup | Claude Code is not a free Claude API; paid plan and 18+ terms reported | Age blocked |
| 43 | Task Observer | Claude Code plugin; dependency age restrictions apply | Age blocked |
| 44 | OmniRoute | Self-hosted multi-provider gateway; upstream provider terms and costs still apply | Security/provider review pending |
| 45 | Poe | Consumer points/plans and bot API costs differ; guardian conditions apply | Terms pending |
| 46 | Ollama | Free local model runner; local API must not be exposed publicly; hardware costs apply | Local-only candidate; model licences apply |
| 47 | Kixi.ai | Exact identity not verified; similar names must not be conflated | Identity unclear; blocked |
| 48 | Flashloop | Credit-based image/video; MCP does not make generation free; age/features vary | Terms pending |
| 49 | Artflow.ai | Free trial and paid plans reported; API unclear; regional age rules vary | Terms/privacy pending |
| 50 | ElevenLabs | Free quota and paid API reported; minor-directed use restricted without written approval | Age blocked unless provider approval |
| 51 | Fish Audio | Free quota and paid API reported; guardian and voice-cloning consent rules apply | Terms pending; cloning disabled |
| 52 | Everygen.ai | Reported 18+ terms | Age blocked |
| 53 | ClipFlux.ai | MCP endpoint reported; paid credits and age/redistribution terms unclear | Terms pending |
| 54 | Replit | Free Starter and paid plans; development platform, not general model API | Developer workflow only |
| 55 | Saner.AI | Free/paid tiers reported; public API not confirmed; external keys may add costs | API/terms pending |
| 56 | Jasper | Paid plans and Business-tier API pricing reported; regional age terms need confirmation | Terms/cost pending |
| 57 | Tripo AI | Free Studio credits reported; API separately paid; commercial and attribution restrictions apply | Terms pending |
| 58 | Kling AI | Limited free credits and paid API packages reported; redistribution/automation and regional terms need confirmation | Terms pending |

## Evidence and next steps

- No entry is marked Fully audited or Successfully integrated.
- The generic MSTK /api/ai/chat adapter remains disabled; no provider is selected, configured, or live-tested.
- No API key or paid plan has been added.
- Resolve exact identities for #7, #38, #40 and #47 first.
- For eligible candidates, verify official pricing, quotas, rate limits, India availability, age rules, data handling and redistribution rights before implementation.
- The list can grow beyond 58; the original count is not a product limit.

### Openverse evidence checked

- API documentation: https://api.openverse.org/v1/ — anonymous and registered access, rate limits, OAuth2 registration and rate-limit response headers.
- Terms: https://docs.openverse.org/terms_of_service — prohibits scraping and rate-limit circumvention; requires respecting item licences and attribution; Openverse does not verify every item's licence; fees may apply for commercial or heavy use.
- Individual media licences must be checked per result. Openverse is a candidate, not yet an MSTK integration.