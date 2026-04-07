---
name: deploy-mcp-runrunit
description: Deploy new releases of the mcp-runrunit npm package. Use when publishing a new version, bumping version numbers, updating changelog, or releasing features, fixes, or breaking changes for mcp-runrunit.
---

# Deploy mcp-runrunit Release

Guides **version bump and changelog** for the **mcp-runrunit** npm package. Build and publish run automatically on **merge to `main`** (GitHub Actions).

## When to Use

- User asks to release, deploy, or publish a new version of mcp-runrunit
- New feature, fix, or breaking change is ready to ship
- Version numbers or changelog need to be updated for release

## Release Workflow

**Publish is automatic:** the workflow `.github/workflows/release-mcp-runrunit.yml` runs on push to `main` (when `mcp-runrunit/**` or the workflow file change). It builds, publishes to npm, and creates the git tag. You only need to **update the version and changelog** before merging to `main`.

Copy and track progress:

```
Release progress:
- [ ] 1. Bump version (semver)
- [ ] 2. Update package.json version
- [ ] 3. Update server.json version (both places)
- [ ] 4. Update CHANGELOG.md
- [ ] 5. Commit, push, and open/merge PR to main (CI will publish)
```

---

## Step 1: Choose Version Bump (Semver)

| Bump   | When to use | Example |
|--------|-------------|---------|
| **Patch** (x.y.**Z**) | Bug fixes, small changes, no API change | 1.0.1 → 1.0.2 |
| **Minor** (x.**Y**.0) | New features, backward compatible | 1.0.2 → 1.1.0 |
| **Major** (**X**.0.0) | Breaking changes, incompatible API | 1.1.0 → 2.0.0 |

Use the new version (e.g. `1.0.2`) in all following steps.

---

## Step 2: Update package.json

**File:** `mcp-runrunit/package.json`

Update only the `version` field (line 3):

```json
"version": "1.0.2",
```

---

## Step 3: Update server.json (Two Places)

**File:** `mcp-runrunit/server.json`

Update **both** version fields to the same value:

1. **Root `version`** (around line 10):
   ```json
   "version": "1.0.2",
   ```

2. **Inside `packages[0]`** (around line 15):
   ```json
   "version": "1.0.2",
   ```

Keep all three version values identical (package.json + server.json root + server.json packages[0]).

---

## Step 4: Update CHANGELOG.md

**File:** `mcp-runrunit/CHANGELOG.md`

Use [Keep a Changelog](https://keepachangelog.com/) format. Add a new section at the **top** (below the title) for the release.

### Changelog section template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description.

### Changed
- Change description.

### Fixed
- Bug fix description.

### Removed
- Removed feature (if any).
```

- Use only the sections that apply (Added, Changed, Fixed, Deprecated, Removed, Security).
- Date in ISO format: `YYYY-MM-DD`.
- One bullet per item; be concise.

### Example

```markdown
# Changelog

## [1.0.2] - 2025-03-09

### Fixed
- Correct task filter when using `ids` in list_tasks.

### Added
- Support for `link_da_branch` in task updates.

## [1.0.1] - 2025-03-01
...
```

---

## Step 5: Commit and Merge to main

After updating version and changelog:

1. **Commit** the version files:
   ```bash
   git add mcp-runrunit/package.json mcp-runrunit/server.json mcp-runrunit/CHANGELOG.md
   git commit -m "chore(mcp-runrunit): release vX.Y.Z"
   ```

2. **Push** your branch and open (or merge) a **PR to `main`**.

3. **On merge to `main`**, the GitHub Action will:
   - Install dependencies, build, and publish to npm
   - Create and push the tag `vX.Y.Z`

No local `npm publish` or manual tagging is required.

---

## Summary Checklist

Before merging to main:

- [ ] Same version in `package.json`, `server.json` (root), and `server.json` → `packages[0].version`
- [ ] CHANGELOG.md has new `[X.Y.Z] - date` section at the top with correct sections (Added/Changed/Fixed/…)
- [ ] Build passes locally (optional): `npm run build` in mcp-runrunit

## File Reference

| File | What to update |
|------|----------------|
| `mcp-runrunit/package.json` | `"version": "X.Y.Z"` |
| `mcp-runrunit/server.json` | `"version": "X.Y.Z"` (root and inside `packages[0]`) |
| `mcp-runrunit/CHANGELOG.md` | New release section at top |

---

## Troubleshooting: npm publish fails with EOTP (one-time password)

If the CI workflow fails with `npm error code EOTP` or "This operation requires a one-time password", the **NPM_TOKEN** does not bypass 2FA. Fix:

1. Go to **https://www.npmjs.com/access-tokens** (or Profile → Access Tokens).
2. Click **Generate New Token** (create a **granular** token, not classic).
3. Set token name (e.g. `mcp-runrunit-github-actions`).
4. **Check** the option **"Bypass two-factor authentication"** — this is required for accounts with 2FA.
5. In **Packages and scopes**, select the `mcp-runrunit` package (or "All packages").
6. Set expiration and generate.
7. Copy the token and update **GitHub repository secret** `NPM_TOKEN` at Settings → Secrets and variables → Actions.

Token types like "Automation" (classic) can still require OTP with 2FA enabled; only granular tokens with "Bypass 2FA" work in CI.
