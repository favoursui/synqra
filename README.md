# Synqra

**Keep everything in sync.**

A context-integrity application for Atlassian workspaces. Synqra compares a user-selected Confluence reference with related Jira issues and surfaces evidence-backed potential contradictions before teams implement outdated requirements.

## Status: v0.12: Development release preparation

- Compare one explicitly selected Confluence page with up to eight Jira issues, using bounded concurrent reads and current-user permissions.
- Inspect and filter potential mismatches, see source evidence, and explore a graph of explicitly selected relationships.
- Request review by posting an evidence-backed Jira comment after explicit confirmation; the backend re-fetches both sources and rejects stale evidence. The issue description is never modified.
- Preview the exact comment before submitting. Only share Confluence evidence with Jira audiences authorized to see it. Jira comments may be visible to users who cannot read the original Confluence page; the user must confirm sharing is appropriate.
- Local demo simulates review actions and never writes to Jira. Current-scan activity and dismissals are in memory; live comments persist in Jira. Rescanning resets session review state. Check Jira before retrying a failed or ambiguous response. A hashed atomic reservation blocks identical same-account review requests while the reservation exists (configured for one day; storage deletion can lag).
- Five structured fields are supported: maximum slippage, session timeout, API version, release date, and authentication method. The base scan is rule-based, with an optional read-only semantic analysis. Unsupported, duplicate or missing fields are not assessed; no findings does not establish alignment.
- No Forge SQL, unattended conflict scans, semantic relationship discovery or automatic description changes yet.

The user explicitly selects a reference; Synqra does not infer approval. Live installation, build and API behavior must still be verified on a development site.

## Release hardening

Review requests validate fresh evidence and comment size, then acquire an atomic Forge KVS reservation before posting. The reservation uses a hash of the account, stable source identifiers and exact mismatch evidence; it stores no raw evidence. Storage failure blocks the write. The reservation is not released after an ambiguous response because Jira may already have accepted the comment. This is bounded duplicate protection, not a permanent exactly-once guarantee, and does not prevent another user from requesting review. See [the development release checklist](docs/RELEASE_CHECKLIST.md).

## Workspace UI

The navigation separates the overview, conflict review, context map, saved findings, assistant and activity. Demo/live mode is available in the header on every page. The theme starts from the system preference, with a manual toggle saved locally when browser storage is available. Only the theme preference is stored locally. The assistant needs a completed scan; saved findings can be refreshed without one. Layout and navigation adapt to narrow screens.

## Context map

Open Context after a scan to explore the reference and every selected Jira issue, including unavailable issues. The map groups structured findings by issue and provides search, severity filters and resource selection. The details panel shows exact scan evidence values and opens the existing conflict review flow. Source links are available in live mode. Unavailable resources are clearly distinguished from readable issues without detected findings. This is a snapshot of explicit comparisons, not an inferred dependency graph or a live permission check. Run a new scan to refresh it. AI suggestions are not included.

## Source change monitoring

Saving a finding also registers its Confluence page and Jira issue (stable numeric IDs) for update monitoring. Forge product events can arrive when the dashboard is closed. The handler only looks up registered resource hashes and records the receipt timestamp. It does not persist event bodies, user IDs, source contents or raw resource IDs in the monitoring keys or values. Unregistered resources are ignored. Watch registrations and receipts expire after 30 days; expiry is checked explicitly because physical deletion may lag. Removing a personal bookmark does not immediately remove shared resource markers, which may still serve other saved findings.

Refreshing Saved findings re-reads both resources with current-user access before exposing any monitoring signal or evidence. The signal describes an update event received since the record was saved, not necessarily a requirement change or new conflict. Duplicate and delayed events may produce conservative warnings; missed events and registration races are possible. No received event does not prove no changes. Existing records need to be saved again to register monitoring. No offline user impersonation, background source fetches, automatic comments or AI calls are used.

The manifest adds the read-only `read:confluence-content.summary` scope and Jira and Confluence update triggers. Upgrade the installed app and connect both products on the same site. Test by saving a finding, closing Synqra, editing the page or issue, then refreshing saved findings. Test expired registrations, duplicate events, and revoked source access. Confirm event delivery and shared installation storage on a live developer site.

References: https://developer.atlassian.com/platform/forge/events-reference/jira/ and https://developer.atlassian.com/platform/forge/events-reference/confluence/.

## Saved findings

Save a structured conflict for personal follow-up from Overview or Conflicts. The server re-reads both sources under the current user's permissions and rejects stale evidence before saving. The record contains only the page ID, issue key, supported field and save timestamp. No quotes, values, source titles, or document bodies are persisted. A deterministic identity prevents duplicates, and saving again renews the 30-day expiry. Records are scoped to the current account and Forge installation.

Refresh saved findings to re-read both sources under current permissions. The view shows five records at a time, ordered by storage key rather than date, with a cursor for additional records. Unreadable pairs reveal no source identifiers or evidence. A missing finding is labeled not detected, not resolved, because the field may have disappeared or become unsupported. Removing a record deletes only the personal bookmark. No source data or comments are modified. KVS queries may be eventually consistent. Demo data and AI candidates are not saved. No new scopes are required.

## Synqra Assistant

The Forge app includes a Rovo agent and a read-only comparison action. After a live scan, select an issue and click Ask Synqra. The Forge bridge opens the Rovo sidebar if Rovo is enabled on the site. The launch prompt includes only the selected page ID and issue key. The action reads both resources as the invoking user, runs the existing rule engine, and returns bounded evidence and limitations. It does not use app-level access, save history, post comments or edit sources. Oversized or unreadable sources return an error; oversized findings are omitted and counted. Natural-language interpretations are generated by Rovo and need review.

To test, deploy and upgrade the app on a development site with Rovo enabled, scan the sample reference and issue, launch Synqra Assistant, verify the returned quotes and confirm that denied access returns no evidence. Also test the action directly in Rovo chat with explicit IDs. The separate Forge LLM analysis panel remains optional and independent.

References: https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-agent/ and https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/rovo/.

## AI conflict analysis

After a live scan, select one readable Jira issue and explicitly opt in to AI analysis. Synqra re-fetches both sources as the current user and sends their text to Atlassian-hosted Forge LLMs using an active supported Claude Haiku model selected from the Forge model list. If neither supported Haiku model is active, the analysis fails closed rather than silently selecting a higher-priced model. Each source is limited to 12,000 characters and the model can return at most four candidates. Exact quotes are verified against both source texts; this does not prove the interpretation is correct. Invalid or incomplete responses are rejected. AI findings are read-only, not stored in personal history, and cannot trigger comments or issue edits. The rule-based scan remains available if AI fails. No model calls occur in demo mode. Forge LLM usage can incur charges; the new manifest module requires installation upgrade approval. See https://developer.atlassian.com/platform/forge/runtime-reference/forge-llms-api-reference/.

## Find linked Jira issues

Enter a Confluence page ID and select Find linked issues. Synqra reads the page as the current user, inspects Jira link marks and smart links, and verifies link origins against Jira server metadata. It suggests up to eight unique keys in the editable scan field. Review the selection before running a scan. Cross-site links and unlinked text mentions are ignored. No linked URL is fetched directly. Link discovery does not establish approval, dependency or issue accessibility. Each issue is read separately under the current user when a scan runs. Demo discovery uses fictional link cards. No new scopes are required.

## Personal history

Live scans and successful Jira review requests save personal activity summaries in Forge KVS. Records are scoped to the authenticated user and installation, expire after 30 days, and the Activity page displays up to 20 recent events. No source IDs, titles, evidence, or comment bodies are retained in history. History writes are best effort; a failure does not undo a completed scan or comment. Refresh may be needed because KVS queries are eventually consistent. Demo data is never persisted. Upgrade the Forge installation to grant the new `storage:app` scope.

## Local development

Use Node.js 22.13+ and npm.

~~~sh
git clone https://github.com/favoursui/synqra.git
cd synqra
npm install
npm test
npm run dev
~~~

Open the local URL printed by Vite. Demo mode runs without an Atlassian account. Live mode only works inside an installed Forge app. `npm run build` generates `web/dist`.

## Deploy to your Atlassian developer site

1. Create a Jira and Confluence developer site: https://go.atlassian.com/cloud-dev (or provision a Forge demo site).
2. Install the Forge CLI and log in to your own account. Do not commit credentials.
3. Register this source tree once to generate your app ID; Jira is the required app and Confluence is optional, but both must be installed to run live comparisons.

~~~sh
npm install -g @forge/cli@latest
forge login
forge register
npm run build
forge lint
forge deploy
forge install --site YOUR-SITE.atlassian.net --product jira
forge install --site YOUR-SITE.atlassian.net --product confluence
~~~

Open Synqra from Jira's Apps navigation. In Live mode enter a numeric Confluence page ID and one to eight Jira issue keys separated by commas. Grant user consent when prompted. This version adds `write:jira-work` for review comments; upgrade an existing installation after deploying (`forge install --upgrade` with the appropriate site/product flags). Ensure the current user has read access to both sources. Check the current Forge CLI help for environment and product flags if needed. The app ID in the generated manifest is not a credential.

The development release commands require the reviewed lockfile and the real registered app ID. Run `npm run verify:forge` to install the locked dependencies, run tests and audit, build, and lint without deploying. Run `npm run deploy:dev` to repeat those gates and deploy only to development. The owner must complete Forge login, registration, installation and consent locally. See the [development release checklist](docs/RELEASE_CHECKLIST.md).

## Demo workflow

Create a Confluence page containing separate paragraphs:

~~~text
Maximum slippage: 0.5%
Session timeout: 30 minutes
API version: v2
Release date: 2026-12-10
~~~

Create a Jira issue with this description:

~~~text
Maximum slippage: 2%
Session timeout: 1800 seconds
API version: v1
Release date: 2026-12-08
~~~

Scan the pair. Review the three findings and their evidence. Preview a review comment, confirm sharing is appropriate, and request review. Verify the comment in Jira. Manually correct the Jira issue to agree with the approved specification and run another scan. Add other issue keys to test batch scanning and unavailable-issue reporting.

## Architecture

- `shared/engine.ts` - pure comparison and Atlassian Document Format text extraction.
- `src/index.ts` - Forge resolver; access as the current user, validates IDs, fetches bounded batches and posts explicitly authorized review comments.
- `web/` - React dashboard, Vite build, responsive CSS.
- `shared/workflow.ts` - batch aggregation, validation, stale-evidence guards and review comment generation.
- `tests/` - Node test runner covering the rule engine and review workflow.

## Next milestones

1. Verify install, permissions, live scan, and frontend build in the development environment; commit the generated dependency lockfile.
2. Verify personal history and saved findings on a live Forge installation.
3. Verify link discovery against real Confluence pages; add additional relationship sources.
4. Verify Forge LLMs and the Rovo agent on a live installation.
5. Verify update event delivery and add durable review state, idempotency, authorized resolution and discovered dependency relationships.
6. Test realistic workspaces and prepare the hackathon demonstration.

## Contribution workflow

Submit changes via a feature branch and pull request. Include the implementation summary, test results and known limitations. The repository owner reviews and merges changes. Preserve any registered Forge app ID when updating a local development checkout.

## References

- https://developer.atlassian.com/platform/forge/app-compatibility/
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-global-page/
- https://developer.atlassian.com/platform/forge/cli-reference/register/
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/
- https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/

## Verification

The previous 20 tests passed locally. Nine additional semantic validation checks passed in the development runtime. The semantic test file is included for Node test execution. Nine Rovo helper checks also passed in the development runtime. Nine saved-finding helper checks passed in the development runtime. Ten monitoring helper checks passed in the development runtime. Ten context-map helper checks passed in the development runtime. Five new presentation helper checks passed in the development runtime. The v0.10 GitHub Actions run passed the full shared test suite, dependency installation and frontend production build. Eleven new review guard checks passed in the development runtime. The v0.11 CI run passed all 83 tests and the frontend build, but the dependency audit failed (11 findings: 5 high, 6 moderate). v0.11.1 adds version-scoped overrides for patched transitive dependencies; its CI results, Forge lint, deployment and live API calls require separate verification. See [dependency security notes](docs/DEPENDENCY_SECURITY.md).
