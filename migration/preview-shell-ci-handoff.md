# Preview-shell CI — separate draft-review handoff

## 1. What I inspected

VERIFIED — README, constitution, collaboration protocol, changelog, site manifest,
preview package/scripts, isolated pnpm workspace/lockfile, current contract/server/Vite
tests and the prior shell handoff. PR #2 remained open/draft at
`3adc7c6fe47f96e7230c61f4f0f369be56f91575`; a read-only remote fetch confirmed that head.
The new `ci/preview-shell-checks` branch starts at that exact commit.

VERIFIED — The owner explicitly unblocked authoring CI from requirements without an
attachment. This is separately scoped automated verification, not changes to PR #2
runtime code or a competing portable implementation.

## 2. What changed / why

VERIFIED — Workflow commit `043a4a8aa86efbb1dab58d00555de6f1e51a4d0a` adds
`.github/workflows/preview-shell-checks.yml` to reproduce the current checks on
ordinary `pull_request` events targeting `implementation/portable-website-shell`
or `main`. Draft PR opening and updates are included. There is no push trigger,
privileged `pull_request_target`, manual deployment trigger, repository-writing step,
environment approval/access change, production browser access or supplied secret.

VERIFIED — `contents: read`; checkout does not persist credentials; Ubuntu 24.04
hosted job has a 15-minute timeout; dependency caches are disabled. Platform-provided
ephemeral read-only GitHub tokens may be used internally by checkout/setup-node;
no owner credentials or secret inputs are requested.

VERIFIED — Node `24.22.1` matches the existing tested local runtime and the documented
Node `22.12+` requirement. pnpm setup reads `pnpm@10.11.0` directly from the existing
package.json; runtime and pnpm versions are asserted. Dependencies install with
`--frozen-lockfile`. No package, lockfile or runtime requirements were upgraded.

VERIFIED — Order: install → typecheck → build → all existing contract/regression
tests. The build intentionally precedes tests because standalone and Vite built-preview
HTTP tests require `dist/public`. `pnpm build` also repeats the existing typecheck
internally; existing scripts were not rewritten to remove that duplication.

### Official action-pin verification before commit

VERIFIED — On 2026-11-01, GitHub's official repository API release/tag records
confirmed each release below. These were the reported latest releases at inspection;
the workflow uses immutable commits, not moving tags.

| Official release | Tag object | Actual pinned commit |
| --- | --- | --- |
| [actions/checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | Direct commit | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| [actions/setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) | Direct commit | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| [pnpm/action-setup v6.1.0](https://github.com/pnpm/action-setup/releases/tag/v6.1.0) | Annotated tag `d9184bf108216479bc5a137cc391f4d7b14c870b` | `ea17c68df8912ef543352723c149a84f56e3d413` |

Method: `GET /repos/{owner}/{repo}/releases/latest`, release-by-tag records,
`GET /repos/{owner}/{repo}/git/ref/tags/{tag}` and, for pnpm,
`GET /repos/pnpm/action-setup/git/tags/d9184bf108216479bc5a137cc391f4d7b14c870b`.
The annotated tag resolves to object type `commit` with the pinned SHA; the tag's
own SHA is deliberately not used as the action pin. Action input/runtime definitions
were also read from those official refs.

## 3. Files affected

- `.github/workflows/preview-shell-checks.yml`
- `CHANGELOG.md`
- `migration/preview-shell-ci-handoff.md`

VERIFIED — No application/runtime file, package definition, lockfile, dependency,
content manifest, course/Workbench internal, media asset, download, storage namespace,
privacy promise, indexing safeguard or original shell handoff changed.

## 4. Risks / uncertainties

VERIFIED — The workflow branch pushed successfully and separate
[draft PR #3](https://github.com/Yenimedibo/medibo/pull/3) targets
`implementation/portable-website-shell`. [Hosted run 41257164955](https://github.com/Yenimedibo/medibo/actions/runs/41257164955)
completed successfully at reported head `639f6a95c20cd7eaec15d811d03c196f4d76752d`.
The PR merge candidate was `246097ef11ce579131428f5539facd03463d47f9`.
This subsequent documentation-only update records that run; consult PR checks
for its own final-head run. No action or runtime file changed after the passing run.

UNKNOWN — Future runner/registry availability and future revision outcomes are
not guaranteed by one passing run. Local observations alone were not treated
as hosted evidence; the result above was read from the hosted job/step API and logs.

VERIFIED — Ordinary PR code still executes build/install scripts on a disposable
hosted runner. There are no owner-supplied secrets or write permissions. Workflow
SHA pinning does not eliminate dependency supply-chain risks.

VERIFIED — This job covers only tracked current checks, not the historical 28 browser
assertions, 157-request preview probe, visual checks, full payload integrity, cross-browser
accessibility or complete production parity. Original course/Workbench behavior is
not reconstructed or newly inspected. No actual user browser records are accessed.

## 5. Validation performed

VERIFIED — Newly run locally on Node `v24.22.1`, pnpm `10.11.0`:

1. Exact runtime/package-manager version checks passed.
2. `CI=true pnpm install --frozen-lockfile` passed; existing install was already
   up to date (not a clean hosted install).
3. `pnpm typecheck` passed.
4. `pnpm build` passed (existing TypeScript check plus Vite, 49 modules).
5. `pnpm test:contracts`: **10 passed, 0 failed**: six compatibility units, two
   standalone HTTP regressions, two actual Vite development/built-preview regressions.
   This includes 45 observed download endpoints/final aliases without fetching payloads.
6. package.json and pnpm-lock.yaml SHA-256 values unchanged before/after install/checks.
7. actionlint `1.7.12` passed with external shellcheck disabled; YAML duplicate-key,
   trigger/permission/action-pin/order assertions and `bash -n` for every run block
   passed separately. The temporary actionlint binary came from its official release;
   its release archive checksum matched the official checksums file. No validator
   dependency was added to the project.
8. `git diff --check` passed before the workflow commit.

VERIFIED — Newly run on GitHub-hosted Ubuntu 24.04, run `41257164955`:
checkout, pinned action setup, exact Node `24.22.1` / pnpm `10.11.0` assertions,
fresh frozen dependency install, typecheck and build all succeeded. Hosted logs
report **10 tests, 10 passed, 0 failed**; all job/post-job steps completed successfully.
This confirms hosted execution for that revision, not browser coverage or parity.

No browser run, production request, deployment, dependency upgrade, merge or access
change was performed. Previously reported browser/HTTP results are not relabeled as
CI results.

## 6. Recommended next reviewer / stop

PROPOSED — Claude reviews CI security/reproducibility; ChatGPT checks continuity and
that the separate draft PR targets `implementation/portable-website-shell`, not main.
The human owner retains merge authority. Preserve PR #2 as draft and unchanged.

Production deployment recommended: **NO**. This workflow is verification only;
the preview remains production-ineligible for the reasons in the original handoff.
Do not merge, deploy, publish, attach a domain, change access or modify bourkia.com.
