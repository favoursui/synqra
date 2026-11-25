# Synqra demonstration

Target recording length: 4 minutes 20 seconds. Use a dedicated developer workspace with fictional data, never real customer information.

## Fixture setup

Create a Jira project with key CAD if available, or substitute the actual issue keys throughout. Create a Confluence page named Trading specification with these separate paragraphs:

- Maximum slippage: 0.5%
- Session timeout: 30 minutes
- API version: v2
- Release date: 2026-12-10
- Passwords must never be stored in plain text.

Create three Jira issues with descriptions:

**Implement swap execution**

- Maximum slippage: 2%
- Session timeout: 1800 seconds
- API version: v1
- Release date: 2026-12-08
- Store passwords in plain text for debugging.

**Build trading validation**

- Maximum slippage: 0.5%
- API version: v1
- Release date: 2026-12-10

**Configure session settings**

- Session timeout: 1800 seconds

Insert links to the three actual Jira issues into the Confluence page. Use link marks or smart links. Copy the numeric page ID. Verify permissions for the recording account. Do not implement the deliberately unsafe password requirement; it is test text only.

## Recording plan

| Time | Screen and narration |
| --- | --- |
| 0:00-0:25 | Open Jira and Confluence. Explain the problem: teams can implement different versions of the same requirement even when both tools are up to date. |
| 0:25-1:05 | Open Synqra in Jira, select Live, enter page ID and discover linked issues. Confirm the discovered keys and run the scan. Show four structured findings, with equivalent timeout units not flagged. |
| 1:05-1:50 | Inspect slippage evidence (0.5% vs 2%), API versions and date. Preview the review comment. Confirm sharing in the fictional workspace and request review once. Verify the Jira comment. |
| 1:50-2:20 | Open Context and select an issue. Filter by severity, inspect findings and return to the exact evidence. Explain that comparison edges are not inferred dependencies. |
| 2:20-3:05 | Open Assistant, explicitly consent to AI analysis of the first issue, and inspect the password-policy contradiction if returned. Verify both quotes. Open Rovo and ask about the selected pair if available. |
| 3:05-3:50 | Save a structured finding. Edit the corresponding Jira requirement to match the reference. Refresh saved findings after an update event arrives. Show the current result and explain that not detected is not proof of resolution. |
| 3:50-4:20 | Summarize: evidence first, human-controlled review, current-user access and Forge-native services. Show the repository and verified CI, and close with the tagline. |

Do a rehearsal before recording. If an event, AI call or Rovo action fails, do not claim success or silently substitute demo data. Label demo mode clearly if used. Cut optional segments rather than exceeding five minutes. Never expose API tokens, private source content or authentication screens.

## Capture checklist

- Overview with live scan
- Conflict evidence and preview
- Jira review comment
- Context map
- Saved findings and monitoring receipt
- Assistant results and Rovo chat, only if working
- Green CI run for the submitted commit

Record the actual video, upload it to an accepted video host, and verify its visibility before submitting. No video has been recorded by this document.
