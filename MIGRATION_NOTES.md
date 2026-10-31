# Migration Notes

## Authority and recovery sources
- VERIFIED — bourkia.com remains production authority; GitHub is the controlled migration source until parity and explicit human approval. No production deployment or DNS change is authorized by this document.
- UNKNOWN — No complete original authoring/source export or original build/dependency/deployment configuration has been recovered. Do not infer these from generated client bundles.
- VERIFIED — Waiting indefinitely for an unavailable export is not a migration prerequisite. Owner-authorized public production recovery is valid: observed text, public client behavior, route/asset URLs and downloadable materials can inform reconstruction with provenance. Do not invent inaccessible implementation details or represent newly authored reconstruction as recovered original code.

## Reconciled baseline
- VERIFIED — Audit a6055e3 records 7 stages, 24 bilingual foundation lessons and 6 applied labs (EN/Darija). See [observed course inventory](content/course-inventory.observed.json).
- VERIFIED — [45 observed download endpoints](content/downloads.observed.json) replace the earlier eight proposed filenames as the recovery inventory. The original placeholders were never verified public paths; withdrawing those assumptions does not remove live URLs. No binaries are imported or regenerated here.
- VERIFIED — Audit observations remain historical evidence, not automatic approval of the whole audit as canonical. Proposed information architecture is recorded separately in [the IA specification](site/information-architecture.proposed.md).

## Evidence limits and first parity
- VERIFIED — HTTP availability is header/status evidence only. File integrity needs payload/format/content checks; functional success needs actual flow tests. The 45 endpoint observations do not establish PDF/ZIP/XLSX correctness or online/offline parity.
- PROPOSED — Reconstruct only approved scope against [first-parity contracts](migration/first-parity-contracts.md); preserve current routes/aliases, RTL, storage keys/schema and privacy promises. Use isolated synthetic fixtures, never actual user browser records.
- PROPOSED — Keep original-source/build questions UNKNOWN until recovery. Maintain a provenance record for any recovered content, public asset and newly authored implementation. Rights/source masters remain subject to owner confirmation.
- PROPOSED — Implement only after an approved task, following branch → validation → PR → independent review → human approval → merge. This documentation PR does not authorize rebuilding, redirects, deployments or source imports.
