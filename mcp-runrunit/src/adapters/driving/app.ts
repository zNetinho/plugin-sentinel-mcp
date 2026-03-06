import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server";
import * as tasks from "../../application/tasks.js";
import * as comments from "../../application/comments.js";
import { taskUpdateToApiPayload } from "../driven/custom_fields_mapper.js";
import * as projects from "../../application/projects.js";
import * as devSuggestions from "../../application/dev_suggestions.js";
import { detectPlatformFromTask } from "../../application/detect_platform.js";
import { RunrunitAPIError } from "../driven/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sdkTypesPath = path.join(__dirname, "..", "..", "..", "node_modules", "@modelcontextprotocol", "sdk", "dist", "esm", "types.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require(sdkTypesPath);

export const TOOLS = [
  {
    name: "runrunit_list_projects",
    description:
      "List all projects from Runrun.it. Optional filters: client_id, project_group_id, is_closed, is_active, page, limit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        client_id: { type: "number", description: "Filter by client ID" },
        project_group_id: { type: "number", description: "Filter by project group ID" },
        is_closed: { type: "boolean", description: "Filter by closed state" },
        is_active: { type: "boolean", description: "Filter by active state" },
        page: { type: "number", description: "Page number (default 1)" },
        limit: { type: "number", description: "Items per page (1-100)" },
      },
      required: [],
    },
  },
  {
    name: "runrunit_list_tasks",
    description:
      "List tasks from Runrun.it. Optional filters: ids, user_id, follower_id, project_id, is_closed, is_working_on, sort, sort_dir, page, limit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ids: { type: "string", description: "Comma-separated task IDs" },
        user_id: { type: "string", description: "Creator user ID" },
        follower_id: { type: "string", description: "Follower user ID" },
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
      "Update a task on Runrun.it. Pass task ID and an object with fields to update (e.g. title, desired_date). For the PR/branch link use link_da_branch (URL); it is stored in the custom field 'Link da branch' (custom_32).",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "Task ID" },
        task: {
          type: "object",
          description:
            "Fields to update (e.g. { title: 'New title' }, { link_da_branch: 'https://github.com/.../pull/21' }). link_da_branch maps to custom field Link da branch.",
          properties: {
            title: { type: "string", description: "Task title" },
            desired_date: { type: "string", description: "Desired date (ISO)" },
            link_da_branch: {
              type: "string",
              description: "URL of the PR or branch (stored in custom field 'Link da branch', e.g. https://github.com/org/repo/pull/21)",
            },
          },
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
    description:
      "Create a comment on a task in Runrun.it. Runrun.it does not support Markdown in comments; use plain text and raw URLs only. Optional: url_antes and url_depois. When both are provided, the agent should obtain visual evidence (e.g. use skill registrar-evidencias: capture screenshots, upload to Cloudinary), then append to the comment text plain labels and URLs (e.g. 'Antes: https://...' and 'Depois: https://...'), and call this tool with the enriched text.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task_id: { type: "number", description: "Task ID" },
        text: { type: "string", description: "Comment text (can be enriched with an evidence block when url_antes/url_depois are used)" },
        url_antes: { type: "string", description: "Optional. URL of the page in the 'before' state; when provided with url_depois, agent should capture evidence and append it to text" },
        url_depois: { type: "string", description: "Optional. URL of the page in the 'after' state; when provided with url_antes, agent should capture evidence and append it to text" },
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
    name: "runrunit_create_external_comment",
    description:
      "Create a comment in the external/guest channel on a task in Runrun.it. Use this for comments shared with external clients (channel_name: guest).",
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
            "Se verdadeiro, inclui devs elegíveis sem tarefas na coluna Task (padrão true).",
        },
        only_developers: {
          type: "boolean",
          description:
            "Se verdadeiro, considera apenas desenvolvedores; exclui Gestor, Social, Inovação, etc. (padrão true).",
        },
      },
      required: [],
    },
  },
  {
    name: "runrunit_project_detect_platform",
    description:
      "Identifica a plataforma do projeto a partir das tags da task no Runrun.it (Node, Python, Ruby, Go, Rust, etc.) e sugere o comando para subir o ambiente de desenvolvimento. A plataforma é definida pelas tags da task (tags_data/tag_list), não pelos arquivos do repositório.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task_id: {
          type: "number",
          description: "ID da task no Runrun.it. As tags dessa task definem a plataforma (ex.: node, react, python).",
        },
      },
      required: ["task_id"],
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
        case "runrunit_list_projects": {
          const params = {
            client_id: a.client_id as number | undefined,
            project_group_id: a.project_group_id as number | undefined,
            is_closed: a.is_closed as boolean | undefined,
            is_active: a.is_active as boolean | undefined,
            page: a.page as number | undefined,
            limit: a.limit as number | undefined,
          };
          result = await projects.listProjects(params);
          break;
        }
        case "runrunit_list_tasks": {
          const params = {
            ids: a.ids as string | undefined,
            user_id: a.user_id as string | undefined,
            follower_id: a.follower_id as string | undefined,
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
          const taskPayload = taskUpdateToApiPayload(a.task as Record<string, unknown>);
          result = await tasks.updateTask(Number(a.id), { task: taskPayload });
          break;
        }
        case "runrunit_delete_task":
          await tasks.deleteTask(Number(a.id));
          result = { deleted: true, id: a.id };
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
        case "runrunit_create_external_comment":
          result = await comments.createExternalComment(
            Number(a.task_id),
            String(a.text),
          );
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
            only_developers: a.only_developers as boolean | undefined,
          };
          result = await devSuggestions.suggestDevsWithFreeQueue(params);
          break;
        }
        case "runrunit_project_detect_platform": {
          const taskId = Number(a.task_id);
          if (!Number.isInteger(taskId) || taskId < 1) {
            result = {
              detected: false,
              message: "task_id deve ser um número inteiro positivo (ID da task no Runrun.it).",
            };
            break;
          }
          const task = (await tasks.getTask(taskId)) as Parameters<typeof detectPlatformFromTask>[0];
          const detected = detectPlatformFromTask(task);
          if (detected === null) {
            result = {
              detected: false,
              message:
                "Nenhuma plataforma conhecida encontrada nas tags da task. Adicione tags como node, react, python, php, go, rust, etc. na task no Runrun.it para identificar a plataforma.",
              task_id: taskId,
            };
          } else {
            result = {
              detected: true,
              platform: detected.platform,
              platform_label: detected.platformLabel,
              start_command: detected.startCommand,
              alternate_commands: detected.alternateCommands,
              package_manager: detected.packageManager,
              detected_by: detected.detectedBy,
              hint: detected.hint,
              task_id: taskId,
            };
          }
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
