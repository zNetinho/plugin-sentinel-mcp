# Sentinel Assistent

## Code style
- Typescript strict mode
- Clean code
- Use functional patterns where possible

## Pull Requests
- Always follow the `create-pr-github` skill flow (or equivalent) to open PRs with clear title, description, checklist, and the required output fields: PR link, branch name, and target environment.
- Open feature PRs into `development` first and only then create a separate PR from `development` to `main` for releases; merges into `main` are approved manually by the user.
- Do not open PRs diretamente para branches de produção (`main`); releases devem sempre vir de `development` ou outra branch de homologação configurada.
- Only comment and update Runrun.it tasks as completed after the PR link exists and is included both in the comment text and in the `link_da_branch` field.

## Comments in task standard
- Context of what has been changed. E.g.: The slider on the home page has been changed.
- Step by step for testing. E.g.: 1. Go to the link https://example.com..., 2. Scroll down to the area below the top, 3. Test the functionality and responsiveness of the element.

## Runrun.it (MCP)
- Tasks must only advance between board stages; backward move is allowed only to "Task" or "Blocked Task" (e.g. impediment or not finished).
- Use runrunit_move_task_stage to move tasks between columns; do not use runrunit_update_task for stage changes.
- Fill link_da_branch via runrunit_update_task before moving to stages that require it (e.g. Ongoing, Manager Validation).

## mcp-runrunit architecture
- DTOs, types, and API contracts belong in src/domain; application and adapters consume from domain.
- Keep this separation consistent across all modules (tasks, comments, projects, etc.).
- Releases of the `mcp-runrunit` package are triggered by a GitHub Actions workflow on push to `main` when `mcp-runrunit/**` or the release workflow file changes.
- Do not run `npm publish` for `mcp-runrunit` locally; instead, bump the version and changelog, merge to `main`, and let CI handle build, publish, and tag creation.
- NPM authentication for CI uses a `NPM_TOKEN` repository secret exposed as `NODE_AUTH_TOKEN`; do not rely on GitHub variables for this token.
- Release tags for `mcp-runrunit` are created automatically by CI (format `vX.Y.Z`); avoid creating or rewriting these tags manually.

## Discord (MCP)
- In category Tasks, only create a new channel if the project does not already have one; search by project name first.
- Bot token can be set via BOT_RUNRUNIT_REPORT or BOT_RUNRUNIT_REPORT_PRIVATE_KEY.
- To list Discord channels, set DISCORD_GUILD_ID (server ID); list_channels requires guild, not only channel.
