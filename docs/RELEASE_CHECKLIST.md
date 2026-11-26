# Synqra development release checklist

## Verified baseline

The v0.10 GitHub Actions run completed shared tests, dependency installation and a frontend production build: https://github.com/favoursui/synqra/actions/runs/45302590951. The v0.11 run (https://github.com/favoursui/synqra/actions/runs/45303027857) also passed all 83 tests and the frontend build, but failed the runtime dependency audit. The v0.11.1 run passed 83 tests and the frontend build, but five high-severity findings remained. The v0.12 main run and subsequent locked-installation run passed all 87 tests, production frontend build and runtime audit with zero findings. See https://github.com/favoursui/synqra/actions/runs/45633084599. Subsequent changes require their own CI check. This is not a Forge deployment. Check the CI results for the current commit separately.

## Before deployment

- Merge the reviewed feature PRs into main.
- Confirm Node 22 and install dependencies with npm ci. The reviewed lockfile is committed and has passed CI. Verify dependency overrides against the Forge runtime, not just the frontend build.
- Run npm test, node scripts/check-backend.mjs, npm run build and npm audit --omit=dev --audit-level=high. The offline backend check is not a replacement for Forge lint.
- Create an Atlassian developer site with Jira and Confluence; enable Rovo if available.
- Install the Forge CLI and authenticate locally using your own account. Never paste API tokens into chat or commit them. Register the app once if no app ID exists; preserve the registered ID on subsequent updates.
- Run forge lint and fix every blocking error. Deploy to development only after lint succeeds.
- Install into required Jira first, then connect optional Confluence on the same site. Review requested scopes and the LLM module before approving an upgrade. Do not deploy production for this test.

## Owner-controlled development deployment

From a reviewed checkout containing the committed lockfile, run:

~~~sh
npm install -g @forge/cli@latest
forge login
forge register Synqra
npm run verify:forge
npm run deploy:dev
forge install --environment development --site YOUR-SITE.atlassian.net --product jira
forge install --environment development --site YOUR-SITE.atlassian.net --product confluence
~~~

Skip register if an app ID already exists. Registration changes the manifest; preserve that ID. For a previously installed app use the CLI upgrade flow, not another registration. Never run the commands against production during testing. Review all requested permissions. The helper command refuses to deploy if any local gate fails and does not install into a site. Use the official CLI install documentation if optional product enablement requires a different flow in your tenant.

Official references reviewed November 25, 2026: https://developer.atlassian.com/platform/forge/cli-reference/register/, https://developer.atlassian.com/platform/forge/cli-reference/install/, https://developer.atlassian.com/platform/forge/cli-reference/deploy/, https://developer.atlassian.com/platform/forge/app-compatibility/, https://developer.atlassian.com/platform/forge/runtime-reference/forge-llms-models/, https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/, https://developer.atlassian.com/platform/forge/events-reference/confluence/, https://developer.atlassian.com/platform/forge/storage-reference/kvs-api/.

## Live acceptance tests

| Test | Expected result |
| --- | --- |
| Demo scan | Sample findings; no live reads or writes |
| Live scan | Correct reference and issue quotes, explicit unavailable results |
| Restricted page | No page evidence or review write |
| Restricted Jira issue | Failed read, no evidence exposed |
| Equivalent timeout units | No mismatch |
| Changed requirement | Fresh review rejects stale evidence |
| Confirmed review | Exactly one Jira comment with current evidence |
| Same-account identical retry | Blocked while reservation exists, including concurrent requests |
| Ambiguous network failure | Reservation retained; check Jira before retry |
| Storage outage | No comment posted if reservation cannot be acquired |
| Saved findings | Personal records survive reload; inaccessible pairs reveal no identifiers |
| Source updates | Registered events flag receipts, then refresh checks current access |
| Link discovery | Only supported same-site Jira links; no arbitrary URL fetch |
| AI analysis | Explicit consent, exact evidence validation, model failures preserve rule results |
| Rovo | Enabled site opens chat; read-only action respects both source permissions |
| Context map | Unreadable issues not presented as aligned; correct evidence navigation |
| Light/dark and mobile | Legible, usable navigation and controls |

Record the actual outcomes, the tested commit SHA, site/environment (no secrets), and any blocking failures before preparing the demo. Event delivery, cross-product access, LLM model availability and Rovo execution are not proven by the frontend build.

## References

- https://developer.atlassian.com/platform/forge/getting-started/
- https://developer.atlassian.com/platform/forge/app-compatibility/
- https://developer.atlassian.com/platform/forge/cli-reference/lint/
- https://developer.atlassian.com/platform/forge/cli-reference/register/
- https://developer.atlassian.com/platform/forge/storage-reference/kvs-api/

## Forge bundler compatibility

A development deployment passed Forge lint but failed packaging with TS5097 (explicit .ts imports) and TS2802 (Set iteration target). The compatibility patch uses extensionless shared imports, Array.from for Set conversion, and a backend tsconfig targeting ES2022. Tests are bundled with the locked esbuild copy before Node executes them, so shared imports resolve consistently. CI installs dependencies before testing and performs a real TypeScript no-emit check in addition to the offline bundle check. This patch still requires a successful Forge deployment to verify actual packaging. Preserve your existing registered app ID when pulling updates; do not register again.
