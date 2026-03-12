# Sentinel Assistent

## Code style
- Typescript strict mode
- Clean code
- Use functional patterns where possible

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

## Discord (MCP)
- In category Tasks, only create a new channel if the project does not already have one; search by project name first.
- Bot token can be set via BOT_RUNRUNIT_REPORT or BOT_RUNRUNIT_REPORT_PRIVATE_KEY.
- To list Discord channels, set DISCORD_GUILD_ID (server ID); list_channels requires guild, not only channel.
