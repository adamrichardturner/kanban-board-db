export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  full_name: string | null;
  is_demo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  due_date: Date | null;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: SubtaskStatus;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export type TaskStatus = 'todo' | 'doing' | 'done';
export type SubtaskStatus = 'todo' | 'doing' | 'done';
