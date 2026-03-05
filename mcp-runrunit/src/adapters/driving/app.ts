import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server";
import * as tasks from "../../application/tasks.js";
import * as comments from "../../application/comments.js";
import * as devSuggestions from "../../application/dev_suggestions.js";
import { RunrunitAPIError } from "../driven/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sdkTypesPath = path.join(__dirname, "..", "..", "..", "node_modules", "@modelcontextprotocol", "sdk", "dist", "esm", "types.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require(sdkTypesPath);

export const TOOLS = [
  {
    name: "runrunit_list_tasks",
    description:
      "List tasks from Runrun.it. Optional filters: ids, user_id, follower_id, responsible_id, assignee_id, filter_id, board_stage_id, project_id, is_closed, is_working_on, sort, sort_dir, page, limit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ids: { type: "string", description: "Comma-separated task IDs" },
        user_id: { type: "string", description: "Creator user ID" },
        follower_id: { type: "string", description: "Follower user ID" },
        responsible_id: { type: "string", description: "Responsible/assignee user ID (e.g. for 'Minhas partes abertas')" },
        assignee_id: { type: "string", description: "Assignee/executor principal user ID" },
        filter_id: { type: "number", description: "ID of a task filter (e.g. 'Minhas partes abertas')" },
        board_stage_id: { type: "number", description: "Filter by board stage (e.g. Ongoing)" },
        project_id: { type: "number", description: "Project ID" },
        is_closed: { type: "boolean", description: "Filter by delivered tasks" },
        is_working_on: { type: "boolean", description: "Filter by in progress" },
        sort: { type: "string", description: "Sort field (e.g. close_date, queue_position)" },
        sort_dir: { type: "string", enum: ["asc", "desc"], description: "Sort direction" },
        page: { type: "number", description: "Page number (default 1)" },
        limit: { type: "number", description: "Items per page (1-100)" },
      },
      required: [],
    },
  },
  {
    name: "runrunit_list_task_filters",
    description:
      "List all task filters available to the current user. Use to find filter_id for 'Minhas partes abertas' or other filters.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "runrunit_list_board_stages",
    description:
      "List board stages (Task, Ongoing, Manager Validation, etc.). Use board_id from a task. Returns stages with id and name — use to get board_stage_id for runrunit_update_task when moving tasks.",
    inputSchema: {
      type: "object" as const,
      properties: {
        board_id: { type: "number", description: "Board ID (from task.board_id)" },
      },
      required: ["board_id"],
    },
  },
  {
    name: "runrunit_get_task",
    description: "Get a single task by ID from Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: { id: { type: "number", description: "Task ID" } },
      required: ["id"],
    },
  },
  {
    name: "runrunit_list_subtasks",
    description: "List subtasks of a task from Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: { task_id: { type: "number", description: "Parent task ID" } },
      required: ["task_id"],
    },
  },
  {
    name: "runrunit_create_task",
    description:
      "Create a task on Runrun.it. Requires title and type_id. Optional: project_id, assignments, desired_date, etc.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Task title" },
        type_id: { type: "number", description: "Task type ID" },
        project_id: { type: "number", description: "Project ID" },
        on_going: { type: "boolean", description: "Ongoing task" },
        desired_date: { type: "string", description: "Desired delivery date (ISO)" },
        desired_start_date: { type: "string", description: "Desired start date (ISO)" },
        tag_list: { type: "string", description: "Comma-separated tags" },
        assignments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              assignee_id: { type: "string" },
              team_id: { type: "number" },
            },
            required: ["assignee_id"],
          },
          description: "Assignments",
        },
      },
      required: ["title", "type_id"],
    },
  },
  {
    name: "runrunit_update_task",
  description:
    "Update a task on Runrun.it. Pass task ID and an object with fields to update (e.g. title, desired_date, board_stage_id). Use board_stage_id to move tasks between columns (Task, Ongoing, Manager Validation).",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "Task ID" },
        task: {
          type: "object",
          description: "Fields to update (e.g. { title: 'New title' })",
          additionalProperties: true,
        },
      },
      required: ["id", "task"],
    },
  },
  {
    name: "runrunit_delete_task",
    description: "Delete a task on Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: { id: { type: "number", description: "Task ID" } },
      required: ["id"],
    },
  },
  {
    name: "runrunit_create_workflow",
    description: "Create a workflow for a task (starts tracking eligibility). Task must not be closed, ongoing, or already have a workflow.",
    inputSchema: {
      type: "object" as const,
      properties: { task_id: { type: "number", description: "Task ID" } },
      required: ["task_id"],
    },
  },
  {
    name: "runrunit_assignment_play",
    description: "Start tracking work on a task (play). Pauses current task if assignee is already working on another.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task_id: { type: "number", description: "Task ID" },
        assignment_id: { type: "string", description: "Assignment ID (from task.assignments[].id)" },
      },
      required: ["task_id", "assignment_id"],
    },
  },
  {
    name: "runrunit_list_task_comments",
    description: "List all comments on a task in Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: { task_id: { type: "number", description: "Task ID" } },
      required: ["task_id"],
    },
  },
  {
    name: "runrunit_get_comment",
    description: "Get a single comment by ID from Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: { id: { type: "number", description: "Comment ID" } },
      required: ["id"],
    },
  },
  {
    name: "runrunit_create_comment",
    description: "Create a comment on a task in Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task_id: { type: "number", description: "Task ID" },
        text: { type: "string", description: "Comment text" },
      },
      required: ["task_id", "text"],
    },
  },
  {
    name: "runrunit_update_comment",
    description: "Update a comment's text on Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "Comment ID" },
        text: { type: "string", description: "New comment text" },
      },
      required: ["id", "text"],
    },
  },
  {
    name: "runrunit_delete_comment",
    description: "Delete a comment on Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: { id: { type: "number", description: "Comment ID" } },
      required: ["id"],
    },
  },
  {
    name: "runrunit_comment_reaction",
    description: "Add a reaction (emoji) to a comment on Runrun.it.",
    inputSchema: {
      type: "object" as const,
      properties: {
        comment_id: { type: "number", description: "Comment ID" },
        emoji: { type: "string", description: "Emoji character (e.g. 👍)" },
      },
      required: ["comment_id", "emoji"],
    },
  },
  {
    name: "runrunit_suggest_devs_with_free_queue",
    description:
      "Sugere desenvolvedores com fila mais livre com base em tarefas na coluna Task, considerando estimativas e filtros opcionais (time, projeto, tags).",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Número máximo de devs sugeridos (1 a 10, padrão 3).",
          minimum: 1,
          maximum: 10,
        },
        team_id: {
          type: "string",
          description: "ID de time para filtrar desenvolvedores.",
        },
        tribe_id: {
          type: "string",
          description: "ID de tribo para filtrar desenvolvedores.",
        },
        squad_id: {
          type: "string",
          description: "ID de squad para filtrar desenvolvedores.",
        },
        project_tag: {
          type: "string",
          description: "Tag de projeto para filtrar tarefas.",
        },
        project_id: {
          type: "number",
          description: "ID de projeto para filtrar tarefas.",
        },
        developer_ids: {
          type: "array",
          items: { type: "string" },
          description:
            "Lista explícita de IDs de desenvolvedores candidatos (Runrun.it).",
        },
        only_active_devs: {
          type: "boolean",
          description:
            "Se verdadeiro, tenta considerar apenas desenvolvedores ativos (por exemplo, não de férias).",
        },
        board_id: {
          type: "number",
          description:
            "ID do board Kanban onde está a coluna Task. Necessário se task_stage_ids não for informado.",
        },
        task_stage_ids: {
          type: "array",
          items: { type: "number" },
          description:
            "IDs de estágios/colunas que representam a coluna Task. Se não informado, tenta identificar por convenção de nome no board informado.",
        },
        load_strategy: {
          type: "string",
          enum: ["tasks_and_time", "only_tasks", "only_time"],
          description:
            "Estratégia de cálculo de carga: tasks_and_time (padrão), only_tasks ou only_time.",
        },
        include_zero_tasks: {
          type: "boolean",
          description:
            "Se verdadeiro, inclui devs elegíveis sem tarefas na coluna Task (carga zero).",
        },
      },
      required: [],
    },
  },
];

function textContent(text: string): { type: "text"; text: string }[] {
  return [{ type: "text", text }];
}

/**
 * Cria e configura a instância do MCP Server com todas as tools Runrun.it.
 * Usado tanto pelo entry stdio (index.ts) quanto pelo servidor HTTP (server.ts).
 */
export function createMcpServer(): Server {
  const server = new Server(
    {
      name: "mcp-runrunit",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, unknown>;

    try {
      let result: unknown;

      switch (name) {
        case "runrunit_list_tasks": {
          const params = {
            ids: a.ids as string | undefined,
            user_id: a.user_id as string | undefined,
            follower_id: a.follower_id as string | undefined,
            responsible_id: a.responsible_id as string | undefined,
            assignee_id: a.assignee_id as string | undefined,
            filter_id: a.filter_id as number | string | undefined,
            board_stage_id: a.board_stage_id as number | undefined,
            project_id: a.project_id as number | undefined,
            is_closed: a.is_closed as boolean | undefined,
            is_working_on: a.is_working_on as boolean | undefined,
            sort: a.sort as string | undefined,
            sort_dir: a.sort_dir as "asc" | "desc" | undefined,
            page: a.page as number | undefined,
            limit: a.limit as number | undefined,
          };
          result = await tasks.listTasks(params);
          break;
        }
        case "runrunit_list_task_filters":
          result = await tasks.listTaskFilters();
          break;
        case "runrunit_list_board_stages":
          result = await tasks.listBoardStages(Number(a.board_id));
          break;
        case "runrunit_get_task":
          result = await tasks.getTask(Number(a.id));
          break;
        case "runrunit_list_subtasks":
          result = await tasks.listSubtasks(Number(a.task_id));
          break;
        case "runrunit_create_task": {
          result = await tasks.createTask({
            task: {
              title: String(a.title),
              type_id: Number(a.type_id),
              project_id: a.project_id != null ? Number(a.project_id) : undefined,
              on_going: a.on_going as boolean | undefined,
              desired_date: a.desired_date != null ? String(a.desired_date) : undefined,
              desired_start_date: a.desired_start_date != null ? String(a.desired_start_date) : undefined,
              tag_list: a.tag_list != null ? String(a.tag_list) : undefined,
              assignments: a.assignments as Array<{ assignee_id: string; team_id?: number }> | undefined,
            },
          });
          break;
        }
        case "runrunit_update_task": {
          // #region agent log
          const DEBUG_LOG = path.resolve(__dirname, "..", "..", "..", "..", "debug-6b964c.log");
          try { fs.appendFileSync(DEBUG_LOG, JSON.stringify({ hypothesisId: "H1", location: "app:runrunit_update_task", message: "runrunit_update_task invoked", data: { id: a.id, task: a.task, hasBoardStageId: !!(a.task as Record<string, unknown>)?.board_stage_id }, timestamp: Date.now() }) + "\n"); } catch { /* ignore */ }
          // #endregion
          result = await tasks.updateTask(Number(a.id), { task: a.task as Record<string, unknown> });
          break;
        }
        case "runrunit_delete_task":
          await tasks.deleteTask(Number(a.id));
          result = { deleted: true, id: a.id };
          break;
        case "runrunit_create_workflow":
          result = await tasks.createWorkflow(Number(a.task_id));
          break;
        case "runrunit_assignment_play":
          result = await tasks.assignmentPlay(Number(a.task_id), String(a.assignment_id));
          break;
        case "runrunit_list_task_comments":
          result = await comments.listTaskComments(Number(a.task_id));
          break;
        case "runrunit_get_comment":
          result = await comments.getComment(Number(a.id));
          break;
        case "runrunit_create_comment":
          result = await comments.createComment({
            task_id: Number(a.task_id),
            text: String(a.text),
          });
          break;
        case "runrunit_update_comment":
          result = await comments.updateComment(Number(a.id), String(a.text));
          break;
        case "runrunit_delete_comment":
          await comments.deleteComment(Number(a.id));
          result = { deleted: true, id: a.id };
          break;
        case "runrunit_comment_reaction":
          result = await comments.commentReaction(Number(a.comment_id), String(a.emoji));
          break;
        case "runrunit_suggest_devs_with_free_queue": {
          const params = {
            limit: a.limit as number | undefined,
            team_id: a.team_id as string | undefined,
            tribe_id: a.tribe_id as string | undefined,
            squad_id: a.squad_id as string | undefined,
            project_tag: a.project_tag as string | undefined,
            project_id: a.project_id as number | undefined,
            developer_ids: a.developer_ids as string[] | undefined,
            only_active_devs: a.only_active_devs as boolean | undefined,
            board_id: a.board_id as number | undefined,
            task_stage_ids: a.task_stage_ids as number[] | undefined,
            load_strategy: a.load_strategy as
              | "tasks_and_time"
              | "only_tasks"
              | "only_time"
              | undefined,
            include_zero_tasks: a.include_zero_tasks as boolean | undefined,
          };
          result = await devSuggestions.suggestDevsWithFreeQueue(params);
          break;
        }
        default:
          return {
            content: textContent(`Unknown tool: ${name}`),
            isError: true,
          };
      }

      return {
        content: textContent(JSON.stringify(result, null, 2)),
      };
    } catch (err) {
      const message =
        err instanceof RunrunitAPIError
          ? `${err.message}${err.body ? ` ${JSON.stringify(err.body)}` : ""}`
          : err instanceof Error
            ? err.message
            : String(err);
      return {
        content: textContent(`Error: ${message}`),
        isError: true,
      };
    }
  });

  return server;
}
