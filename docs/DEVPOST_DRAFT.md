# Devpost submission draft

Project: Synqra

Tagline: Keep everything in sync.

## Inspiration

Teams often agree on requirements in Confluence and implement them in Jira. When those requirements drift apart, the discrepancy may only become visible during QA or release review. Synqra was built to make conflicting context easier to identify and investigate before teams act on it.

## What it does

Synqra compares a selected Confluence reference with related Jira issues and highlights potential contradictions with source evidence. Teams can discover linked issues, explore comparisons in a context map, request a review, and save findings for follow-up. Optional Forge LLM analysis examines natural-language requirements, while a Rovo assistant helps users investigate structured findings. Update event receipts can flag saved resources for a fresh comparison.

## How we built it

The application uses Forge Custom UI with React, TypeScript and Vite, Forge resolvers for current-user Jira and Confluence access, Forge KVS for personal history and monitoring metadata, Forge LLMs for optional semantic analysis, and a read-only Rovo action. Structured comparison, evidence validation and duplicate-request protection are covered by automated tests. GitHub Actions checks the shared tests, production frontend build and runtime dependencies.

## Challenges

The main design challenge was distinguishing verified evidence from AI interpretation and maintaining source permissions across products. Synqra checks verbatim quotes, treats inaccessible resources as unavailable, and requires explicit confirmation before posting a Jira review comment. Background event handlers record update receipts rather than reading private documents.

## Accomplishments

The implemented MVP brings conflict discovery, evidence review, a context map, saved findings and an assistant into a single interface. The merged v0.12 CI run passed 87 automated tests and reported zero runtime vulnerabilities at the time of its audit. Replace these figures with the final verified run when submitting.

## What is next

Verify the full Forge installation on a developer site, expand supported requirement patterns, and improve authorized relationship discovery and monitoring. Fully unattended semantic scanning and automatic resolution are not implemented.

## Submission fields to finalize

- Repository: https://github.com/favoursui/synqra
- Hackathon: https://codegeist2026.devpost.com/
- Rules: https://codegeist2026.devpost.com/rules
- Video: pending actual recording and upload (under five minutes).
- Installation/testing instructions: see README and docs/RELEASE_CHECKLIST.md; add the actual judge-accessible installation method after verification.
- Screenshots: pending capture from a verified deployment.
- Category, bonus prizes, eligibility, contributor details and disclosure requirements: owner must confirm against the current submission form and official rules.
- No claim of live deployment, production readiness, or successful submission until independently verified.

This is draft submission copy, not a submitted entry.
