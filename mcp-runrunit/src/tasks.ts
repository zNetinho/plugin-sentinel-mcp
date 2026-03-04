import { runrunitFetch } from "./api.js";

export type ListTasksParams = {
  ids?: string;
  user_id?: string;
  follower_id?: string;
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
  return runrunitFetch<unknown>(`tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTask(id: number) {
  return runrunitFetch<void>(`tasks/${id}`, { method: "DELETE" });
}
