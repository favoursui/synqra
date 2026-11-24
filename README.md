# Synqra

**Keep everything in sync.**

A context-integrity application for Atlassian workspaces. Synqra compares a user-selected Confluence reference with related Jira issues and surfaces evidence-backed potential contradictions before teams implement outdated requirements.

## Status: v0.3: Personal scan history

- Compare one explicitly selected Confluence page with up to eight Jira issues, using bounded concurrent reads and current-user permissions.
- Inspect and filter potential mismatches, see source evidence, and explore a graph of explicitly selected relationships.
- Request review by posting an evidence-backed Jira comment after explicit confirmation; the backend re-fetches both sources and rejects stale evidence. The issue description is never modified.
- Preview the exact comment before submitting. Only share Confluence evidence with Jira audiences authorized to see it. Jira comments may be visible to users who cannot read the original Confluence page; the user must confirm sharing is appropriate.
- Local demo simulates review actions and never writes to Jira. Current-scan activity and dismissals are in memory; live comments persist in Jira. Rescanning resets session review state. Check the existing issue comments before retrying a failed or ambiguous response; no durable idempotency is implemented.
- Five structured fields are supported: maximum slippage, session timeout, API version, release date, and authentication method. The engine is rule-based, not semantic AI. Unsupported, duplicate or missing fields are not assessed; no findings does not establish alignment.
- No Forge SQL, Rovo, background jobs, automatic relationship discovery or automatic description changes yet.

The user explicitly selects a reference; Synqra does not infer approval. Live installation, build and API behavior must still be verified on a development site.

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
2. Verify personal history on a live Forge installation and add permission-aware conflict history.
3. Discover explicit links between Jira issues and Confluence pages; support bounded scans.
4. Add Forge LLM semantic comparisons with strict evidence validation and Rovo agent actions.
5. Add durable review state and idempotency, authorized resolution, background events, and discovered dependency relationships.
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

All 14 rule-engine, workflow and history tests passed under Node.js 22.16.0. React build, Forge lint, deployment and live API calls have not yet been verified in the development environment.
