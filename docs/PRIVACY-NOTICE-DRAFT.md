# MSTK.COM privacy notice — draft for review

> **Not a published policy.** This draft describes the current software scaffold and known limitations. The project owner must verify every statement, fill in the contact and operator details, choose retention/deletion procedures, and obtain appropriate legal review before enabling public accounts or publishing the service.

## 1. Who operates MSTK.COM

MSTK.COM's operator and data controller: **[insert legal name and contact details before launch]**.

Privacy questions and requests: **[insert monitored privacy contact email before launch]**.

## 2. Current service status

The repository contains a development preview. No production hosting, live Supabase project, custom domain, or AI provider has been configured in this project state. Account and workspace features must not be described as live until the production services and safeguards have been tested.

## 3. Information the software may process when configured

Depending on which features are enabled, the application may process:

- Account email address and authentication data handled by the configured Supabase Auth service. MSTK's browser code does not store the account password in its own application database.
- Workspace, project, conversation, and user-authored message content saved to the configured Supabase database.
- Prompts submitted to the MSTK AI endpoint, but only if an eligible provider is deliberately configured and the AI endpoint is enabled. The endpoint is disabled by default in the current code.
- Basic technical request information processed by the hosting, database, and API providers to deliver and protect the service.

Do not enter sensitive personal information into prompts or workspace content.

## 4. Why information is processed

If the corresponding services are enabled, information is used to authenticate accounts, provide workspace features, respond to user requests, protect the API against abuse, and maintain service reliability.

## 5. Service providers and sharing

MSTK may rely on separately selected hosting, database/authentication, and AI providers. Each provider processes information under its own terms and privacy documentation. Before launch, the operator must name the actual providers, link their current privacy notices, identify relevant processing locations, and confirm age eligibility and data-processing terms.

The current repository does not configure a live AI provider. If AI is later enabled, prompts will be sent to the selected provider for processing. Do not enable a provider until its age rules, privacy practices, retention, regional availability, and pricing have been reviewed.

## 6. Storage and security

The current browser implementation keeps the authentication session in page memory and does not intentionally persist access or refresh tokens in browser local storage. A page refresh therefore signs the user out.

The application uses database row-level security migrations, but these have only been tested in a disposable local PostgreSQL environment. They have not yet been verified against a live Supabase project. No production security guarantee should be inferred from the development tests.

## 7. Retention and deletion

**This section is incomplete and must be finalized before launch.** The project does not yet provide a verified user-facing account deletion and data export process, a published retention schedule, or a tested backup-deletion procedure.

Before launch, specify:
- How users request account and workspace-data deletion.
- The timeframe for deletion from primary systems and backups.
- What limited records may be retained for legal, security, or operational reasons.
- How provider-side prompt retention is handled and what the operator can or cannot control.

## 8. Children and age eligibility

MSTK must not allow access to a provider or feature where the user's age is below that provider's minimum age. The operator must confirm applicable age rules, parental-consent requirements, and local law before making the service available to minors. Do not bypass age verification or eligibility controls.

## 9. Changes and contact

The operator must add an effective date and version history before publication. Material changes should be communicated through an appropriate notice.

**Effective date:** [add before publication]  
**Privacy contact:** [add before publication]

---

## Launch review checklist

- [ ] Identify the legal operator and monitored privacy contact.
- [ ] Confirm actual hosting, database, authentication, and AI providers.
- [ ] Verify the real data collected, data locations, and provider terms.
- [ ] Define retention, export, deletion, and backup-deletion procedures.
- [ ] Complete age eligibility and parental-consent review.
- [ ] Have the final notice reviewed for applicable jurisdictions.
- [ ] Publish only after the deployed service matches this notice.
