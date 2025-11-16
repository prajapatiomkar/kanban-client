export interface Board {
  id: string;
  name: string;
  description?: string;
  columns: BoardColumn[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}
