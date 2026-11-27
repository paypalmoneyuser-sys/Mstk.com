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

## Official-source research batch — 2026-11-27

This batch adds source-backed findings for #1, #2, #6 and #11. These are **partially researched**, not fully audited: no age/legal eligibility confirmation, India/payment review, end-to-end integration test, or production approval is claimed.

| # | Official-source findings | Cost / quota | Integration fit | Remaining gates |
|---:|---|---|---|---|
| 1 Anime.js | Official site describes a JavaScript animation engine and documents npm/CDN installation. | Core library described as 100% free; hosted API/quota is not applicable because it is a client-side library. | Good candidate for local UI animation only; no external provider connection. | Confirm exact current package licence from its canonical repository/package metadata; check dependency/security posture and test in MSTK. Age/India are not service gates for local code, but normal project/legal review remains. |
| 2 Motion.dev | Official docs describe the Motion JavaScript/React library; Motion says the core library is MIT open source. Motion+ is a separate premium package. | Core library free. Motion+ has paid one-time and team subscription options; do not purchase. | Good candidate for local UI animation only. Premium Motion+ is not required. | Keep premium-only APIs/assets out unless separately licensed; test compatibility and bundle impact. |
| 6 Openverse | Official API docs state anonymous and registered API access; rate limits apply, and registration uses OAuth2. | Anonymous use is available; registered users get slightly higher limits; higher limits require a request. Terms reserve possible fees for commercial/heavy usage. | Potential server-side media-search adapter; respect rate limits and return attribution/licence metadata. | Terms require legal authority to accept them; age/authority for a minor not confirmed. Verify each item's licence independently, include attribution, review privacy/data handling and India availability, then perform a safe test. |
| 11 Blender | Blender Foundation describes Blender as free/open-source software under GPL; official licence page says user-created artwork belongs to its creator. | Blender software is free; local compute/hardware costs may apply. No hosted API quota. | Local creative tool / possible local automation workflow, not a cloud AI-provider integration. | Review GPL obligations before redistributing Blender or modified Blender; inspect each model/add-on licence separately; test local workflow and resource requirements. |

### Official sources for this batch

- Anime.js official site: https://animejs.com/ and installation docs: https://animejs.com/documentation/getting-started/installation
- Motion official docs: https://motion.dev/docs/quick-start ; MIT/core and paid Motion+ distinction: https://motion.dev/docs/gsap-vs-motion and https://motion.dev/terms
- Openverse API reference: https://api.openverse.org/v1/ ; terms: https://docs.openverse.org/terms_of_service
- Blender Foundation overview: https://www.blender.org/about/ ; licence: https://www.blender.org/about/license/

**Batch result:** 4 of 58 entries have fresh official-source notes. None of these four is yet marked fully audited or integrated. The safe near-term implementation candidates are local-only Anime.js and Motion; Openverse remains gated on terms/age review and attribution handling; Blender is a local workflow, not a hosted API.


## Official-source research batch 2 — 2026-11-27

This batch adds official-source findings for #21, #28, #34 and #54. These are **partially researched**, not full audits or integrations. API credentials were not created and no live service was connected.

| # | Official-source findings | Cost / quota | MSTK fit | Remaining gates |
|---:|---|---|---|---|
| 21 Google Slides | Official Slides API supports OAuth 2.0; scopes include sensitive presentation access. Google recommends narrow scopes such as `drive.file`; public apps using sensitive scopes may require verification. | Google documents no additional charge for Slides API usage. Quotas include 3,000 read requests/project/minute, 600 read requests/user/project/minute, 600 write requests/project/minute and 60 write requests/user/project/minute; 429 responses require backoff. | Strong candidate for a user-authorized document/presentation workflow, not a general AI model. | Confirm Google account/developer eligibility and guardian requirements; select minimal scopes; complete OAuth consent/app verification as applicable; review privacy and India data handling; implement/test consent and revocation. |
| 28 GitHub Copilot | Official GitHub docs list Copilot Free, Student and paid plans. It is a coding assistant, not a general-purpose public model API for MSTK. | Copilot Free has a limited AI-credit allowance and 2,000 monthly inline completions; paid plans and usage-based billing are separate. | Useful only for developer productivity, not as a runtime AI provider inside MSTK. | Confirm account eligibility and guardian permission where required; never treat a Copilot subscription as permission to proxy its model access to MSTK users; review current terms before any workflow. |
| 34 Canva | Official Canva API and App Developer Terms govern integrations. Developer is responsible for end-user terms, privacy and support; API use must follow published technical limits. Terms require restricting under-13 use (or local minimum consent age) or obtaining verifiable parental consent. | API pricing/quota was not established from the official terms page reviewed; do not assume Canva plan access includes free API usage. | Potential user-authorized design workflow, subject to app review and terms. | Verify API product-specific pricing/limits, developer account eligibility, privacy/data processing, India availability and whether MSTK's intended features are permitted. Do not use Canva API to build a competing Canva service. |
| 54 Replit | Official ToS (updated 2026-08-03) says users must be at least 13; users under 18 need parent/guardian permission. It also places responsibility on users to follow service quotas and applicable privacy obligations. | Pricing page/plan quotas and any metered usage must be checked separately; ToS says purchases, subscriptions and usage fees are payable and usage fees may be billed. | Development/hosting platform, not a general AI provider integration for MSTK. | Do not enable paid/usage-based billing. Any use by a minor requires guardian permission; review current free-tier quotas and privacy obligations before use. |

### Official sources for batch 2

- Google Slides OAuth scopes: https://developers.google.com/workspace/slides/api/scopes
- Google Slides quotas and pricing: https://developers.google.com/workspace/slides/api/limits
- GitHub Copilot plans and allowances: https://docs.github.com/en/copilot/get-started/plans
- Canva API and App Developer Terms: https://www.canva.com/policies/canva-developer-terms/
- Replit Terms of Service (updated 2026-08-03): https://replit.com/terms-of-service

**Batch result:** 4 more entries have official-source notes (8/58 researched across the first two batches). None is marked Fully audited or Successfully integrated. Google Slides is the clearest potential integration candidate, but OAuth, scope verification and privacy gates remain. Copilot and Replit are developer tools rather than MSTK runtime AI providers. Canva remains gated pending API pricing, eligibility and policy review.


## Official-source research batch 3 — 2026-11-27

This batch reviews original-list entries #8–#11. These notes are preliminary; no app has been connected or live-tested.

| # | Product | Official-source findings | Cost / quota | MSTK decision and remaining gates |
|---:|---|---|---|---|
| 8 | Real SFX Skills | The supplied name does not uniquely identify a canonical public project from the evidence located. | Unknown. | Keep blocked as identity unclear. Need the exact official URL/repository before assessing code, licence, security or runtime requirements. |
| 9 | Arena Skill | Identified as Jakeschincariol/arena-skill, an MIT-licensed Claude Code skill. It orchestrates multiple Claude Code sub-agents; it is not an independent model API. | Skill code is free; model usage still depends on the connected AI service and may consume paid usage. | Not a runtime MSTK integration. Claude Code dependency and its age/terms requirements must be respected; do not enable it for teen-facing use unless eligibility is independently confirmed. MIT licence does not override upstream service terms. |
| 10 | Higgsfield MAGI-2 | Official API docs describe text/image/reference-to-video endpoints, 1080p output, 4–30 second duration, and generated audio. | Official API price is USD 0.08 per second; one concurrent generation per account. | Exclude from teen-facing MSTK: API Terms require the developer and all end users to be 18+ (or higher local age of majority). No integration or paid account. |
| 11 | Blender | Blender Foundation describes Blender as free/open-source under GPL. Its FAQ says distributed scripts using Blender Python API calls must be made available under GPL; output artwork is generally the user's copyright. | Software is free; local compute/hardware costs may apply. No hosted API quota. | Local creative workflow candidate, not a hosted AI API. Before redistribution, review GPL obligations and each add-on/model asset's separate licence; test local workflow. |

### Official sources for batch 3

- Arena Skill publisher repository and MIT licence: https://github.com/Jakeschincariol/arena-skill
- Higgsfield MAGI-2 API pricing and limits: https://open.higgsfield.ai/models/sand/magi-2/text-to-video/api-reference
- Higgsfield API Terms (18+ developer and end-user requirements): https://open.higgsfield.ai/terms-of-service
- Blender Foundation overview and licence: https://www.blender.org/about/ and https://www.blender.org/about/license/
- Blender FAQ on GPL and Python API scripts: https://www.blender.org/support/faq/

**Batch result:** 3 of 4 entries have identifiable official-source findings; #8 remains blocked pending an exact source. No entries are fully audited or integrated. Total with batch notes: 11 of 58 original-list entries have some official-source research, not full audits.


## Optional / restricted integrations policy — 2026-11-27

MSTK may provide per-tool availability controls rather than requiring every user to see or enable every integration. This is a product-design proposal and does not override a provider's terms or legal eligibility rules.

### User-facing controls

- Show each tool's eligibility, supported countries, pricing, quota, data handling, required permissions and verification status before a user connects it.
- Keep integrations disabled by default until their full audit and required approvals are complete.
- Where a provider expressly permits age-restricted access, show an optional restricted-tools section and use only the provider's approved age-verification or account-eligibility flow.
- Prefer provider-hosted verification and receive only a minimal eligibility result where possible. Do not collect or store identity documents, birth dates or biometric data in MSTK unless a separately reviewed legal, privacy and security design makes it strictly necessary.
- A user toggle or self-declared age is not proof of eligibility. Do not offer workarounds, false age declarations, or alternate accounts to bypass restrictions.
- Keep developer eligibility separate from end-user eligibility. A provider's 18+ developer requirement cannot be satisfied by checking the age of each visitor.
- If the developer, account owner, or any intended end-user group is ineligible under provider terms, the integration remains unavailable. Verification does not override minimum-age rules, local law, guardian-consent requirements, or provider approval.
- Display a clear unavailable reason and a safe alternative when an integration is blocked. Never imply that a disabled tool is connected or approved.

### Higgsfield MAGI-2 decision

Higgsfield's API terms reviewed for this audit require both developers and end users to be at least 18 (or the higher applicable age of majority). An age-check option for visitors therefore does not make this API eligible for the current MSTK developer setup. Keep MAGI-2 excluded and disabled; reconsider only if the developer/account owner and every intended user meet the provider's requirements and the provider's terms still permit MSTK's use. No verification flow or integration should be built to bypass this restriction.

**Status:** Product-design policy documented only. No age-verification vendor, identity collection, restricted integration, or provider connection has been enabled.


## Official-source research batch 4 — 2026-11-27

This batch reviews original-list entries #12–#15. These are preliminary findings from official provider sources; no account was created, API key obtained, paid plan activated, or live integration tested.

| # | Product | Official-source findings | Cost / quota | MSTK decision and remaining gates |
|---:|---|---|---|---|
| 12 | Claude | Anthropic Consumer Terms (effective 2025-10-08) require an individual user to be at least 18 or the higher applicable local age. The Claude API is a separate product governed by Commercial Terms, not the consumer terms. Official API docs confirm a Console account and API key are required. The exact API account-owner age/eligibility requirements were not conclusively established in this pass. | Consumer Free plan has limited usage windows; paid plans are subscription-based. API is separately token-billed with model-specific input/output and optional caching/batch charges. | Do not enable consumer Claude for under-18 MSTK users. Treat Claude API as pending: obtain the current Commercial Terms and confirm eligible adult/legal account ownership, supported region, privacy/data processing, and cost controls before considering integration. The separate original-list #17 Claude entry is a duplicate, not another provider. |
| 13 | ChatGPT / OpenAI API | OpenAI consumer Terms effective 2026-01-01 set minimum age at 13 or local digital-consent age; users under 18 need parent/guardian permission. OpenAI's API under-18 guidance explicitly permits applications serving minors only with additional age-appropriate safeguards, disclosures, filters, monitoring/reporting, privacy-law compliance and, where appropriate, age assurance. Consumer ChatGPT access and API access are distinct products. | Consumer plan limits vary by plan. API is separately pay-as-you-go, with model/token and tool-specific pricing; a ChatGPT subscription does not establish free API usage. | Potential future candidate only after an eligible adult/legal project owner and required approvals are in place. Before any teen-facing API use, complete child-safety, privacy, moderation, abuse-reporting, retention and cost-limit reviews. No API key or paid usage enabled. |
| 14 | Gemini | Gemini consumer app and Gemini API have different eligibility rules. Google's consumer Gemini help page says most countries allow Gemini Apps from age 13 (or local applicable age), with some feature restrictions for under-18s. The Gemini API Additional Terms effective 2026-03-23 state API users must be 18+ and prohibit use in an API Client directed to or likely to be accessed by under-18s. | Gemini API offers limited free-tier model access and paid token/tool usage; limits and prices are model- and feature-specific and can change. | Do not treat consumer Gemini eligibility as API permission. Because MSTK is intended for a public audience that may include under-18 users, keep Gemini API blocked pending written provider clarification or a materially different product eligibility design that the provider confirms is allowed. No age-gate workaround. |
| 15 | Seedance | The official ByteDance Seed page documents Seedance API access through BytePlus for non-US users and partner access for US users. Official BytePlus ModelArk docs describe video-generation API access, model activation, API-key use and token-based billing. The public official sources reviewed did not establish a definitive minimum age for the API developer or all end users; do not infer it from unrelated third-party sites using the Seedance name. | Official ByteDance API pricing is token-based and depends on model/resolution/input. BytePlus activation documentation lists a USD 30 minimum threshold for credits, savings plan or resource pack routes; therefore this is not a zero-cost integration path. | Keep disabled. Before any future review, obtain the exact BytePlus/ByteDance contract and written age eligibility, verify India account/billing availability, calculate full generation costs and confirm data/content terms. No account activation or purchase. |

### Official sources for batch 4

- Anthropic Consumer Terms (effective 2025-10-08): https://assets.claude.com/ed7f1f94a2ecb7657fb4be5af6f66c66b38fb148.pdf
- Anthropic Legal Center and Commercial Terms index: https://www.anthropic.com/legal
- Claude API overview: https://platform.claude.com/docs/en/api/overview
- Claude pricing: https://claude.com/pricing
- OpenAI Terms of Use (effective 2026-01-01): https://openai.com/policies/terms-of-use/
- OpenAI Help Center age requirements: https://help.openai.com/en/articles/8313401-is-chatgpt-safe-for-all-ages
- OpenAI API under-18 guidance: https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance
- OpenAI API pricing: https://developers.openai.com/api/docs/pricing
- Gemini Apps age and usage information: https://support.google.com/gemini/answer/16275805?hl=en-IN
- Gemini API Additional Terms (official Google AI Developers terms page): https://ai.google.dev/gemini-api/terms
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- ByteDance Seedance Enterprise: https://seed.bytedance.com/en/seedance-enterprise
- ByteDance Seedance API pricing: https://seed.bytedance.com/en/seedance-enterprise/api
- BytePlus Seedance model activation and billing: https://console.byteplus.com/ark/region%3Aap-southeast-1/docs/seedance-model-activation-usage-and-refund
- BytePlus video generation API: https://docs.byteplus.com/en/docs/ModelArk/create-video-generation-task-api

**Batch result:** 4 more entries have official-source notes (15/58 entries with some preliminary research across the batches). This does not mean they are fully audited. Fully audited: 0. Successfully integrated and live-tested from this list: 0. Claude consumer and Gemini API have explicit age-based restrictions relevant to MSTK; OpenAI API has published safeguards for applications serving minors; Seedance API eligibility remains unresolved and its documented activation route requires paid funding. No paid services or integrations were enabled.


## Official-source research batch 5 — 2026-11-27

This batch covers original-list entries #18–#21. #21 Google Slides was already researched in batch 2; this batch revalidates and expands its OAuth/privacy/quota findings rather than counting it as a new unique app. No accounts, keys, paid plans or live integrations were created.

| # | Product | Official-source findings | Cost / quota | MSTK decision and remaining gates |
|---:|---|---|---|---|
| 18 | Grok / xAI | xAI consumer terms allow users aged 13+ or the local minimum age, with parent/legal-guardian permission for ages 13–17. This consumer rule does not apply to API access: xAI Enterprise FAQ says API users must be 18+. The same FAQ says the API cannot be used to run a competing service or a service similar to an xAI service. | API is paid by token/media usage; model-specific prices and rate limits vary. Rate-limit tiers are linked to cumulative spend, beginning at $0 for Tier 0; higher tiers require paid spend. | Do not enable xAI API for MSTK: adult-only API access and the competing-service restriction are material blockers for an AI workspace offering model access. Consumer Grok access is separate and must not be represented as an MSTK API integration. |
| 19 | Meta Muse Spark | Meta Model API is available as a developer API, but its Terms (last updated 2026-10-09) require both developers and end users to be at least 18 and prohibit creating Integrated Products targeted at under-18s. The geographic-use policy and model designation apply in addition to the Terms. | Pay-as-you-go; model-specific token pricing and rate limits. Standard and Contributor modes have different data-use implications; Contributor mode may use content to train future Meta models. | Exclude from current teen-facing MSTK. An age-verification gate for individual visitors cannot make an under-18-targeted product permissible under these terms. Reconsider only if provider terms and product audience change and are confirmed in writing. |
| 20 | Claude Design | Anthropic describes Claude Design as a visual design/prototyping product. It is a Claude consumer product/research-preview feature, not a separately documented general-purpose developer API in the official product announcement reviewed. Anthropic Consumer Terms require users to be at least 18 (or higher local minimum age). | Availability depends on eligible Claude plans; the feature announcement lists Pro, Max, Team and Enterprise during its initial research-preview rollout. No separate Claude Design API pricing or quota was identified. | Do not expose Claude Design as a direct MSTK integration. Treat it as a separate third-party product with the same consumer age restriction; no API integration is evidenced. |
| 21 | Google Slides | Revalidated official Slides API documentation. OAuth scopes include sensitive presentation-wide access and a recommended non-sensitive `drive.file` scope for files created/opened by the app. Public apps requesting sensitive scopes require verification; restricted Drive scopes can require restricted-scope verification and security assessment. Google Workspace user-data policy requires clear disclosure, affirmative consent, limited use, secure handling and user deletion controls. | Slides API is available at no additional cost. Published quotas include 3,000 read requests/minute/project, 600 read requests/minute/user/project, 300 expensive read requests/minute/project, 60 expensive reads/minute/user/project, 600 write requests/minute/project and 60 writes/minute/user/project. Quotas can change and 429 handling is required. | Remains a promising, relatively low-cost productivity integration candidate. Prefer least-privilege `drive.file` scope where the use case permits; complete OAuth verification, privacy policy, consent, data deletion, security and end-to-end testing before enabling. |

### Official sources for batch 5

- xAI Consumer Terms: https://x.ai/legal/x-subscription-terms-of-service
- xAI Enterprise FAQ (API age and competing-service restrictions): https://x.ai/legal/faq-enterprise
- xAI API pricing: https://docs.x.ai/developers/pricing
- xAI API rate limits: https://docs.x.ai/developers/rate-limits
- Meta Model API Terms (last updated 2026-10-09): https://dev.meta.ai/legal/terms-of-service
- Meta Model API geographic-use policy: https://dev.meta.ai/legal/geographic-use-policy
- Meta Muse Spark API docs and pricing: https://dev.meta.ai/docs/muse-spark
- Anthropic Claude Design announcement: https://www.anthropic.com/news/claude-design-anthropic-labs
- Anthropic Consumer Terms (effective 2025-10-08): https://assets.claude.com/ed7f1f94a2ecb7657fb4be5af6f66c66b38fb148.pdf
- Google Slides API scopes: https://developers.google.com/workspace/slides/api/scopes
- Google Slides API limits and pricing: https://developers.google.com/workspace/slides/api/limits
- Google Workspace user data and developer policy: https://developers.google.com/workspace/workspace-api-user-data-developer-policy
- Google API Services User Data Policy: https://developers.google.com/terms/api-services-user-data-policy

**Batch result:** 3 new unique entries (#18–#20) now have official-source notes; #21 was revalidated. Total unique original-list entries with some preliminary official-source research: 18/58. This is not a full audit. Fully audited: 0. Successfully integrated and live-tested from the list: 0. Grok API and Meta Model API are blocked by adult-only API terms; Claude Design is a consumer product with an 18+ age requirement and no separate integration API established. Google Slides remains a candidate pending OAuth and privacy work. No paid services or integrations were enabled.


## Official-source research batch 6 — 2026-11-27

This batch covers original-list entries #22–#25. These are preliminary official-source notes only; they do not constitute a full audit or a successful integration test. No accounts, keys, paid plans, credits or live integrations were enabled.

| # | Product | Official-source findings | Cost / quota | MSTK decision and remaining gates |
|---:|---|---|---|---|
| 22 | Fable 5.2 | Identified in Anthropic's model documentation as the Claude Fable 5.2 model (model ID `claude-fable-5-2`), released 2026-11-09. The documented interface accepts text and image input and returns text; the documentation lists a 1M-token context window and up to 128K output tokens. The reviewed documentation describes 30-day retention; zero-data-retention is not automatic and requires Anthropic authorization. | Published rates in the reviewed model/pricing documentation: $8 per million input tokens and $40 per million output tokens; caching and batch processing have separate rates. | Do not enable until adult-account eligibility, regional access, retention/privacy controls, provider terms, and hard cost limits are verified. It is a model/API candidate, not a verified live integration. |
| 23 | Higgsfield MCP | Official help material describes connecting an MCP client to the user's own Higgsfield account through OAuth. This is an account-connected workflow, not evidence of a general shared MSTK model API. Generation actions can consume the connected account's credits. Developer Terms make the account holder responsible for actions and costs initiated by an agent. Separate API Terms reviewed for this service require developers and end users to be 18+ and restrict competing/resale services without written consent. | Uses the connected account's credits; a website free/unlimited offer does not establish free MCP/API usage. | Do not connect a user's personal account or expose this as an MSTK-hosted integration. Reconsider only after written permission, adult eligibility and a safe delegated-authorization design are confirmed. |
| 24 | Midjourney | Official Terms effective 2026-05-27 require users to be at least 13 and to satisfy the applicable local digital-consent age; where the user cannot legally consent, a parent or legal guardian must agree. The reviewed official material describes paid subscription plans. No official public developer API was established in the sources reviewed. | Subscription-based access; no verified official public API quota or API price established. | Do not use unofficial APIs, browser automation or credential-sharing as a substitute. No direct MSTK integration unless Midjourney provides an authorized API or written permission and eligibility is confirmed. |
| 25 | Nano Banana | Identified as Google's Gemini image-model family. API pricing is model-specific and must be checked against the exact model/version before any cost estimate. Gemini API Additional Terms reviewed state that API users must be 18+ and API clients may not be targeted to, or likely accessed by, under-18 users. | Model-specific paid/token or image-generation pricing; no single family-wide price should be assumed. | Exclude from current teen-facing MSTK API access under the reviewed terms. Do not attempt to work around the age or audience restriction. |

### Official sources for batch 6

- Anthropic model overview: https://docs.anthropic.com/en/docs/about-claude/models/overview
- Anthropic API pricing: https://docs.anthropic.com/en/docs/about-claude/pricing
- Higgsfield MCP connection help: https://help.higgsfield.ai/
- Higgsfield Developer Terms: https://higgsfield.ai/legal/developer-terms
- Higgsfield API Terms: https://higgsfield.ai/legal/api-terms
- Midjourney Terms of Service: https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service
- Midjourney plans: https://www.midjourney.com/plans
- Gemini API Additional Terms: https://ai.google.dev/gemini-api/terms
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing

**Batch result:** 4 more entries have preliminary official-source notes (22/58 unique original-list entries with some preliminary research across all batches). This is not a full audit. Fully audited: 0. Successfully integrated and live-tested from this list: 0. Higgsfield MCP and Midjourney lack a verified authorized shared API route for the proposed use; Nano Banana is excluded under the reviewed Gemini API age/audience terms. No paid services, credits or integrations were enabled.


## Official-source research batch 7 — 2026-11-28

This batch reviews original-list entries #26–#29. These are preliminary source-backed findings only; no account, key, subscription, payment, or integration was created.

| # | Product | Official-source findings | Cost / quota | MSTK decision and remaining gates |
|---:|---|---|---|---|
| 26 | Perplexity | Consumer Terms distinguish consumer Services from API use; the consumer Terms require users to be 18+ and explicitly state that API use is governed by separate API Terms. The API Terms identify customer-controlled authorised users and API-key responsibility, but this pass did not conclusively establish the API account owner's minimum age or permission to resell/proxy access. | API is a separately governed product; current exact API pricing, quotas and India billing were not revalidated in this batch. | Keep consumer Perplexity unavailable in teen-facing MSTK. Keep API integration blocked pending direct review of current API Terms, account-owner eligibility, redistribution/competing-service rules, pricing, privacy and India access. Do not infer API eligibility from consumer rules or vice versa. |
| 27 | Consensus | Official Terms say users must be at least 13; users below local age of majority need a parent/guardian to accept the Terms on their behalf. Official API is available to integrate research search into apps and workflows; API and MCP calls share a monthly allowance. | Free plan includes 30 calls/month with no overage. Paid plans include larger pools; additional usage on eligible paid plans is $0.05/call, and additional usage is off by default. | Potential research-search candidate, but not approved or connected. Verify developer/account eligibility, guardian authority, commercial/redistribution rights, data handling, India availability and API-specific terms before any implementation. No paid plan or overage. |
| 28 | GitHub Copilot | Official GitHub documentation positions Copilot as coding assistance within GitHub/IDE workflows, not a general-purpose public model API for a third-party runtime workspace. | Copilot Free has a limited AI-credit allowance and 2,000 inline completions/month. Paid plans have separate prices and credit allowances; usage-based billing may apply on some plans. | Keep as a developer productivity tool only; do not proxy a personal Copilot subscription or credentials as an MSTK model endpoint. No runtime integration. |
| 29 | Cursor | Current official Terms (last updated 2026-09-03) require users to be at least 18 or the higher local age of majority. Terms cover the Cursor platform and related tools/APIs. | Paid features and subscription pricing may apply; no pricing/quota certification was completed in this batch. | Age blocked for the current teen-facing project. Do not connect, create accounts, or attempt to bypass the minimum age. |

### Official sources for batch 7

- Perplexity consumer Terms and distinction from API Terms: https://www.perplexity.ai/cs/hub/legal/terms-of-service
- Perplexity API Terms: https://www.perplexity.ai/en-GB/hub/legal/perplexity-api-terms-of-service
- Consensus Terms: https://www.consensus.app/home/terms-of-service/
- Consensus API guide and quotas: https://help.consensus.app/en/articles/16516328-the-consensus-api
- GitHub Copilot plans and usage allowances: https://docs.github.com/en/copilot/get-started/plans
- Cursor Terms (updated 2026-09-03): https://cursor.com/terms-of-service

**Batch result:** 4 more entries have preliminary official-source notes (26/58 unique original-list entries with some preliminary research). This is not a full audit. Fully audited: 0. Successfully integrated and live-tested from this list: 0. Cursor is explicitly age-blocked; Perplexity consumer access is age-blocked while API eligibility remains a separate unresolved review; Consensus is a possible candidate subject to guardian and commercial/API review; Copilot remains a developer-only tool. No paid services or integrations were enabled.
