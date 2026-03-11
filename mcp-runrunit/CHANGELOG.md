# Changelog

All notable changes to the mcp-runrunit package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2025-03-10

### Added
- Tool `runrunit_project_detect_platform` to detect platform and dev command from task tags (e.g. node, react, python).
- Tool `runrunit_list_projects` with optional filters (client_id, project_group_id, is_closed, is_active, page, limit).
- Tools `runrunit_list_task_filters`, `runrunit_list_board_stages`, `runrunit_create_workflow`, `runrunit_assignment_play` for workflow and board stages.
- Support for `link_da_branch` in task updates (custom field "Link da branch").
- Cursor skills: comentar-task-runrunit, code-reviewer; docs for evidências + PR flow.
- Optional Cloudinary env vars (CLOUDINARY_*) for image upload in skills.
- Documentation: Fluxos-Tasks-MCP-Runrunit.md, Workflow-Config-Exemplo.md, .env.example.

### Changed
- Rules: project detect platform, link_da_branch usage, and flow for commenting with evidence + PR link.
- README: npx usage, Cloudinary config, Cursor skills section, publish/registry instructions.

## [1.0.1] - 2025-03-01

### Added
- Initial MCP server for Runrun.it API (Tasks, Comments, Projects).
