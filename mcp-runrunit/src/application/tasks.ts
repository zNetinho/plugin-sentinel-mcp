import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runrunitFetch } from "../adapters/driven/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBUG_LOG = path.resolve(__dirname, "..", "..", "..", "debug-6b964c.log");
function dbg(payload: Record<string, unknown>) {
  try { fs.appendFileSync(DEBUG_LOG, JSON.stringify({ ...payload, timestamp: Date.now() }) + "\n"); } catch { /* ignore */ }
}

export type ListTasksParams = {
  ids?: string;
  user_id?: string;
  follower_id?: string;
  responsible_id?: string;
  assignee_id?: string;
  filter_id?: number | string;
  board_stage_id?: number;
  project_id?: number;
  is_closed?: boolean;
  is_working_on?: boolean;
  sort?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  limit?: number;
  bypass_status_default?: boolean;
};

export async function listTasks(params: ListTasksParams = {}) {
  return runrunitFetch<unknown[]>("tasks", { query: params as Record<string, string | number | boolean | undefined> });
}

export async function listTaskFilters() {
  return runrunitFetch<unknown[]>("tasks/filters");
}

export async function getTask(id: number) {
  return runrunitFetch<unknown>(`tasks/${id}`);
}

export async function listSubtasks(taskId: number) {
  return runrunitFetch<unknown[]>(`tasks/${taskId}/subtasks`);
}

export type CreateTaskBody = {
  task: {
    title: string;
    type_id: number;
    project_id?: number;
    on_going?: boolean;
    desired_start_date?: string;
    desired_date?: string;
    tag_list?: string;
    assignments?: Array<{ assignee_id: string; team_id?: number }>;
    task_prerequisite_ids?: number[];
    task_descendant_ids?: number[];
    follower_ids?: string[];
    document_ids?: number[];
  };
};

export async function createTask(body: CreateTaskBody) {
  return runrunitFetch<unknown>("tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type UpdateTaskBody = {
  task: Record<string, unknown>;
};

export async function updateTask(id: number, body: UpdateTaskBody) {
  // #region agent log
  dbg({ hypothesisId: "H2", location: "updateTask:entry", message: "updateTask called", data: { id, body, taskKeys: body?.task ? Object.keys(body.task) : [] } });
  // #endregion
  try {
    const result = await runrunitFetch<unknown>(`tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    // #region agent log
    dbg({ hypothesisId: "H3", location: "updateTask:success", message: "updateTask API success", data: { id, boardStageId: (body?.task as Record<string, unknown>)?.board_stage_id } });
    // #endregion
    return result;
  } catch (err) {
    // #region agent log
    dbg({ hypothesisId: "H3", location: "updateTask:error", message: "updateTask API error", data: { id, error: String(err), status: (err as { status?: number })?.status, body: (err as { body?: unknown })?.body } });
    // #endregion
    throw err;
  }
}

export async function deleteTask(id: number) {
  return runrunitFetch<void>(`tasks/${id}`, { method: "DELETE" });
}

export async function createWorkflow(taskId: number) {
  return runrunitFetch<unknown>("workflows", {
    method: "POST",
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function assignmentPlay(taskId: number, assignmentId: string) {
  return runrunitFetch<unknown>(`tasks/${taskId}/assignments/${assignmentId}/play`, {
    method: "POST",
    body: "{}",
  });
}

export async function listBoardStages(boardId: number) {
  // #region agent log
  dbg({ hypothesisId: "H4", location: "listBoardStages:entry", message: "listBoardStages called", data: { boardId } });
  // #endregion
  const stages = await runrunitFetch<unknown[]>(`boards/${boardId}/stages`);
  // #region agent log
  dbg({ hypothesisId: "H4", location: "listBoardStages:result", message: "listBoardStages result", data: { boardId, stageCount: Array.isArray(stages) ? stages.length : 0, stageNames: Array.isArray(stages) ? stages.map((s: unknown) => (s as { name?: string })?.name) : [] } });
  // #endregion
  return stages;
}
