import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Board, BoardColumn, Task } from '../models/board.model';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/boards`);
  }

  getBoard(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/boards/${id}`);
  }

  createBoard(name: string, description?: string): Observable<Board> {
    return this.http.post<Board>(`${this.apiUrl}/boards`, { name, description });
  }

  updateBoard(id: string, data: Partial<Board>): Observable<Board> {
    return this.http.patch<Board>(`${this.apiUrl}/boards/${id}`, data);
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boards/${id}`);
  }

  // Columns
  createColumn(boardId: string, name: string, position: number): Observable<BoardColumn> {
    return this.http.post<BoardColumn>(`${this.apiUrl}/boards/${boardId}/columns`, {
      name,
      position,
    });
  }

  updateColumn(
    boardId: string,
    columnId: string,
    data: Partial<BoardColumn>
  ): Observable<BoardColumn> {
    return this.http.patch<BoardColumn>(
      `${this.apiUrl}/boards/${boardId}/columns/${columnId}`,
      data
    );
  }

  deleteColumn(boardId: string, columnId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}`);
  }

  // Tasks
  createTask(
    boardId: string,
    columnId: string,
    title: string,
    description: string,
    position: number
  ): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks`, {
      title,
      description,
      position,
    });
  }

  updateTask(
    boardId: string,
    columnId: string,
    taskId: string,
    data: Partial<Task>
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      data
    );
  }

  moveTask(
    boardId: string,
    columnId: string,
    taskId: string,
    newColumnId: string,
    newPosition: number
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move`,
      {
        newColumnId,
        newPosition,
      }
    );
  }

  deleteTask(boardId: string, columnId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`
    );
  }
}
