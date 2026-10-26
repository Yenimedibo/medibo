# Medibo / TALK TO AI — Source of Truth

This repository is the canonical, portable source for the Medibo website and the free course **TALK TO AI — From Introduction to Mastery**.

## Current production
- Production domain: https://bourkia.com
- Current live platform: ChatGPT Sites
- Migration policy: keep the live Site stable while the portable source is built and validated.

## Core workflow
1. Inspect the current source and manifests.
2. Propose the smallest useful change.
3. Record the change in CHANGELOG.md.
4. Implement on a branch or working copy.
5. Validate content, links, downloads, accessibility, and mobile behavior.
6. Human review/approval.
7. Deploy.
8. Confirm production behavior.

## Roles
- ChatGPT: product-owner assistant, integrator, final consistency reviewer.
- Gemini: independent UX/content/design reviewer and alternative designer.
- Claude: independent reasoning, editorial, architecture, and QA reviewer.
- Replit Agent: implementation, preview, debugging, and deployment candidate.
- Human owner: final authority on product, content, publication, accounts, and irreversible decisions.
