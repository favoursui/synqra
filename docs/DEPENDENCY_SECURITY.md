# Dependency security

The v0.11 audit failed with 11 findings (5 high and 6 moderate), propagated through Forge SDK dependencies. The direct underlying advisories were:

| Package | Advisory | Patched version targeted |
| --- | --- | --- |
| prosemirror-view | [GHSA-c8x8-7fp4-3x9w](https://github.com/advisories/GHSA-c8x8-7fp4-3x9w) | 1.42.3 |
| glob | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | 14.0.2 |
| minimatch | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | 11.0.1 |

Source run: https://github.com/favoursui/synqra/actions/runs/45303027857.

Version-scoped npm overrides target vulnerable versions only. This avoids forcing a downgrade of the direct Forge SDKs, which could remove required APIs. The glob and minimatch updates may cross major version boundaries; compatibility with the SDKs is not established by applying the overrides. Verify dependency resolution, the full tests, frontend build, audit, Forge lint and backend calls before shipping. Revisit the overrides when upstream SDKs adopt patched versions. Do not suppress audit findings or use npm audit fix --force without reviewing the resulting dependency changes.

CI uploads the generated lockfile for review even when a subsequent build or audit fails. Commit the reviewed lockfile and switch to npm ci before release. The high-severity runtime audit remains a required successful step in the workflow.
