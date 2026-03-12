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
    board_stage_id?: number;
    board_name?: string;
    board_stage_name?: string;
    project_id?: number;
    project_name?: string;
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
  try {
    const result = await runrunitFetch<unknown>(`tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
   
    return result;
  } catch (err) {
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
  const stages = await runrunitFetch<unknown[]>(`boards/${boardId}/stages`);
  return stages;
}

export async function moveTask(id: number, boardStageId: number) {
  return runrunitFetch<unknown>(`tasks/${id}/move`, {
    method: "POST",
    body: JSON.stringify({ board_stage_id: boardStageId }),
  });
}
