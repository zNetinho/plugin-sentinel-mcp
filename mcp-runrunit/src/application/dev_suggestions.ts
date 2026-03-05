import { runrunitFetch } from "../adapters/driven/api.js";

export type LoadStrategy = "tasks_and_time" | "only_tasks" | "only_time";

export type SuggestDevsInput = {
  limit?: number;
  team_id?: string;
  tribe_id?: string;
  squad_id?: string;
  project_tag?: string;
  project_id?: number;
  developer_ids?: string[];
  only_active_devs?: boolean;
  board_id?: number;
  task_stage_ids?: number[];
  load_strategy?: LoadStrategy;
  include_zero_tasks?: boolean;
};

type BoardStage = {
  id: number;
  name: string;
  stage_group: string;
  board_id: number;
};

type User = {
  id: string;
  name: string;
  on_vacation?: boolean;
  team_ids?: number[];
};

type TaskAssignment = {
  assignee_id: string;
  team_id: number | null;
  current_estimate_seconds?: number | null;
  time_worked?: number | null;
};

type Task = {
  id: number;
  title: string;
  board_id?: number | null;
  board_stage_id?: number | null;
  project_id?: number | null;
  tags_data?: Array<{ name: string }>;
  assignments?: TaskAssignment[];
};

export type DeveloperSuggestion = {
  developer_id: string;
  developer_name: string;
  task_count_in_task_column: number;
  total_estimated_load: number;
  load_unit: "hours";
  justification: string;
  tasks?: Array<{ id: number; title: string }>;
};

export type SuggestDevsResult =
  | {
      developers: DeveloperSuggestion[];
      filters_applied: Record<string, unknown>;
      task_stage_ids_used: number[];
    }
  | {
      developers: [];
      message: string;
      filters_applied: Record<string, unknown>;
      task_stage_ids_used: number[];
    }
  | {
      error_code: string;
      message: string;
      details?: unknown;
    };

async function fetchUsers(): Promise<User[]> {
  return runrunitFetch<User[]>("users");
}

async function fetchBoardStages(boardId: number): Promise<BoardStage[]> {
  return runrunitFetch<BoardStage[]>(`boards/${boardId}/stages`);
}

async function fetchTasks(params: {
  project_id?: number;
}): Promise<Task[]> {
  return runrunitFetch<Task[]>("tasks", {
    query: {
      project_id: params.project_id,
      is_closed: false,
      bypass_status_default: true,
      limit: 100,
    },
  });
}

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit as number)) return 3;
  const n = Math.floor(limit as number);
  if (n < 1) return 1;
  if (n > 10) return 10;
  return n;
}

function resolveTaskStageIds(
  input: SuggestDevsInput,
  stages: BoardStage[]
): number[] {
  if (input.task_stage_ids && input.task_stage_ids.length > 0) {
    return input.task_stage_ids;
  }

  const candidates = stages.filter((stage) =>
    stage.name.toLowerCase().includes("task")
  );

  if (candidates.length === 0) {
    throw new Error(
      "Não foi possível identificar a coluna \"Task\" automaticamente. Informe explicitamente os IDs de estágio em task_stage_ids ou ajuste a configuração do board."
    );
  }

  return candidates.map((stage) => stage.id);
}

function isUserActive(user: User, onlyActiveDevs?: boolean): boolean {
  if (!onlyActiveDevs) return true;
  return !user.on_vacation;
}

function userMatchesFilters(
  user: User,
  input: SuggestDevsInput
): boolean {
  if (!isUserActive(user, input.only_active_devs)) return false;

  if (input.developer_ids && input.developer_ids.length > 0) {
    if (!input.developer_ids.includes(user.id)) return false;
  }

  const teamIds = user.team_ids ?? [];

  if (input.team_id && teamIds.length > 0) {
    const id = Number(input.team_id);
    if (!Number.isNaN(id) && !teamIds.includes(id)) return false;
  }

  if (input.tribe_id && teamIds.length > 0) {
    const id = Number(input.tribe_id);
    if (!Number.isNaN(id) && !teamIds.includes(id)) return false;
  }

  if (input.squad_id && teamIds.length > 0) {
    const id = Number(input.squad_id);
    if (!Number.isNaN(id) && !teamIds.includes(id)) return false;
  }

  return true;
}

function taskMatchesFilters(task: Task, input: SuggestDevsInput): boolean {
  if (input.project_id && task.project_id && task.project_id !== input.project_id) {
    return false;
  }

  if (input.project_tag && task.tags_data && task.tags_data.length > 0) {
    const hasTag = task.tags_data.some(
      (tag) => tag.name.toLowerCase() === input.project_tag!.toLowerCase()
    );
    if (!hasTag) return false;
  }

  return true;
}

function isTaskInTaskStages(task: Task, taskStageIds: number[]): boolean {
  if (!task.board_stage_id) return false;
  return taskStageIds.includes(task.board_stage_id);
}

function computeAssignmentLoadSeconds(
  assignment: TaskAssignment,
  strategy: LoadStrategy
): number {
  const estimate = assignment.current_estimate_seconds ?? undefined;
  const worked = assignment.time_worked ?? undefined;

  if (strategy === "only_tasks") {
    return 1;
  }

  if (strategy === "only_time") {
    if (typeof estimate === "number" && estimate > 0) return estimate;
    if (typeof worked === "number" && worked > 0) return worked;
    return 3600;
  }

  if (typeof estimate === "number" && estimate > 0) return estimate;
  if (typeof worked === "number" && worked > 0) return worked;
  return 3600;
}

function secondsToHours(value: number): number {
  return Math.round((value / 3600) * 100) / 100;
}

export async function suggestDevsWithFreeQueue(
  input: SuggestDevsInput
): Promise<SuggestDevsResult> {
  try {
    const limit = normalizeLimit(input.limit);
    const loadStrategy: LoadStrategy = input.load_strategy ?? "tasks_and_time";

    const [users, boardStages, tasks] = await Promise.all([
      fetchUsers(),
      input.board_id ? fetchBoardStages(input.board_id) : Promise.resolve<BoardStage[]>([]),
      fetchTasks({ project_id: input.project_id }),
    ]);

    const taskStageIds =
      input.task_stage_ids && input.task_stage_ids.length > 0
        ? input.task_stage_ids
        : input.board_id
          ? resolveTaskStageIds(input, boardStages)
          : [];

    if (taskStageIds.length === 0) {
      return {
        error_code: "TASK_STAGE_NOT_RESOLVED",
        message:
          "Não foi possível identificar a coluna \"Task\". Informe board_id e/ou task_stage_ids para configurar corretamente.",
      };
    }

    const eligibleUsers = users.filter((user) =>
      userMatchesFilters(user, input)
    );

    if (eligibleUsers.length === 0) {
      return {
        developers: [],
        message:
          "Nenhum desenvolvedor elegível encontrado com os filtros atuais.",
        filters_applied: {
          limit,
          team_id: input.team_id,
          tribe_id: input.tribe_id,
          squad_id: input.squad_id,
          project_tag: input.project_tag,
          project_id: input.project_id,
          developer_ids: input.developer_ids,
          only_active_devs: input.only_active_devs,
          board_id: input.board_id,
          load_strategy: loadStrategy,
          include_zero_tasks: input.include_zero_tasks,
        },
        task_stage_ids_used: taskStageIds,
      };
    }

    const eligibleUserIds = new Set(eligibleUsers.map((u) => u.id));

    const tasksInTaskStage = tasks.filter(
      (task) =>
        isTaskInTaskStages(task, taskStageIds) &&
        taskMatchesFilters(task, input)
    );

    const loadByDev = new Map<
      string,
      {
        taskCount: number;
        totalSeconds: number;
        tasks: Array<{ id: number; title: string }>;
      }
    >();

    for (const task of tasksInTaskStage) {
      const assignments = task.assignments ?? [];
      for (const assignment of assignments) {
        const devId = assignment.assignee_id;

        if (!eligibleUserIds.has(devId)) continue;

        if (input.team_id) {
          const teamId = Number(input.team_id);
          if (
            !Number.isNaN(teamId) &&
            assignment.team_id !== null &&
            assignment.team_id !== teamId
          ) {
            continue;
          }
        }

        const loadSeconds = computeAssignmentLoadSeconds(
          assignment,
          loadStrategy
        );

        const current = loadByDev.get(devId) ?? {
          taskCount: 0,
          totalSeconds: 0,
          tasks: [],
        };

        current.taskCount += 1;
        current.totalSeconds += loadSeconds;
        current.tasks.push({ id: task.id, title: task.title });

        loadByDev.set(devId, current);
      }
    }

    const suggestions: DeveloperSuggestion[] = [];

    for (const user of eligibleUsers) {
      const aggregate = loadByDev.get(user.id);

      if (!aggregate) {
        if (!input.include_zero_tasks) continue;

        suggestions.push({
          developer_id: user.id,
          developer_name: user.name,
          task_count_in_task_column: 0,
          total_estimated_load: 0,
          load_unit: "hours",
          justification: "Nenhuma tarefa na coluna Task no momento.",
          tasks: [],
        });
        continue;
      }

      const hours =
        loadStrategy === "only_tasks"
          ? aggregate.totalSeconds
          : secondsToHours(aggregate.totalSeconds);

      const justification =
        loadStrategy === "only_tasks"
          ? `${aggregate.taskCount} tarefas na coluna Task.`
          : `${aggregate.taskCount} tarefas na coluna Task, carga total aproximada de ${hours} horas.`;

      suggestions.push({
        developer_id: user.id,
        developer_name: user.name,
        task_count_in_task_column: aggregate.taskCount,
        total_estimated_load: hours,
        load_unit: "hours",
        justification,
        tasks: aggregate.tasks,
      });
    }

    if (suggestions.length === 0) {
      return {
        developers: [],
        message:
          "Não há tarefas na coluna Task neste momento; todos os devs parecem estar livres ou sem tarefas ativas nesse estágio.",
        filters_applied: {
          limit,
          team_id: input.team_id,
          tribe_id: input.tribe_id,
          squad_id: input.squad_id,
          project_tag: input.project_tag,
          project_id: input.project_id,
          developer_ids: input.developer_ids,
          only_active_devs: input.only_active_devs,
          board_id: input.board_id,
          load_strategy: loadStrategy,
          include_zero_tasks: input.include_zero_tasks,
        },
        task_stage_ids_used: taskStageIds,
      };
    }

    suggestions.sort((a, b) => {
      if (a.task_count_in_task_column !== b.task_count_in_task_column) {
        return a.task_count_in_task_column - b.task_count_in_task_column;
      }

      if (a.total_estimated_load !== b.total_estimated_load) {
        return a.total_estimated_load - b.total_estimated_load;
      }

      return a.developer_name.localeCompare(b.developer_name);
    });

    const limited = suggestions.slice(0, limit);

    return {
      developers: limited,
      filters_applied: {
        limit,
        team_id: input.team_id,
        tribe_id: input.tribe_id,
        squad_id: input.squad_id,
        project_tag: input.project_tag,
        project_id: input.project_id,
        developer_ids: input.developer_ids,
        only_active_devs: input.only_active_devs,
        board_id: input.board_id,
        load_strategy: loadStrategy,
        include_zero_tasks: input.include_zero_tasks,
      },
      task_stage_ids_used: taskStageIds,
    };
  } catch (error) {
    return {
      error_code: "UNEXPECTED_ERROR",
      message:
        error instanceof Error
          ? `Falha ao sugerir desenvolvedores: ${error.message}`
          : "Falha desconhecida ao sugerir desenvolvedores.",
      details: error instanceof Error ? { name: error.name } : undefined,
    };
  }
}

