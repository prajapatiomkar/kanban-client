import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { BoardService } from '../../services/board.service';
import { Board, BoardColumn, Task } from '../../models/board.model';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="board-container">
      <header class="board-header">
        <button class="btn-back" (click)="goBack()">← Back</button>
        @if (board) {
        <h1>{{ board.name }}</h1>
        }
        <button class="btn-add-column" (click)="showAddColumn = true">+ Add Column</button>
      </header>

      @if (board) {
      <div class="kanban-board" cdkDropListGroup>
        @for (column of board.columns; track column.id) {
        <div class="kanban-column">
          <div class="column-header">
            <h3>{{ column.name }}</h3>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>

          <div
            class="tasks-container"
            cdkDropList
            [cdkDropListData]="column.tasks"
            [id]="column.id"
            (cdkDropListDropped)="onTaskDrop($event, column)"
          >
            @for (task of column.tasks; track task.id) {
            <div class="task-card" cdkDrag>
              <div class="task-content">
                <h4>{{ task.title }}</h4>
                @if (task.description) {
                <p>{{ task.description }}</p>
                }
              </div>
              <button class="btn-delete-task" (click)="deleteTask(column, task)">×</button>
            </div>
            }
          </div>

          <button class="btn-add-task" (click)="openTaskModal(column)">+ Add Task</button>
        </div>
        }
      </div>
      } @if (showAddColumn) {
      <div class="modal-overlay" (click)="showAddColumn = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Add New Column</h2>
          <form (ngSubmit)="createColumn()">
            <div class="form-group">
              <label>Column Name</label>
              <input type="text" [(ngModel)]="newColumnName" name="name" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showAddColumn = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" [disabled]="!newColumnName">Create</button>
            </div>
          </form>
        </div>
      </div>
      } @if (showTaskModal) {
      <div class="modal-overlay" (click)="showTaskModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Add New Task</h2>
          <form (ngSubmit)="createTask()">
            <div class="form-group">
              <label>Task Title</label>
              <input type="text" [(ngModel)]="newTaskTitle" name="title" required />
            </div>
            <div class="form-group">
              <label>Description (optional)</label>
              <textarea [(ngModel)]="newTaskDescription" name="description" rows="4"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showTaskModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" [disabled]="!newTaskTitle">Create</button>
            </div>
          </form>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .board-container {
        min-height: 100vh;
        background: #f5f5f5;
        overflow-x: auto;
      }

      .board-header {
        background: white;
        padding: 20px 40px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .board-header h1 {
        margin: 0;
        color: #333;
      }

      .btn-back,
      .btn-add-column {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-back {
        background: #e0e0e0;
        color: #333;
      }

      .btn-back:hover {
        background: #d0d0d0;
      }

      .btn-add-column {
        background: #667eea;
        color: white;
      }

      .btn-add-column:hover {
        background: #5568d3;
      }

      .kanban-board {
        display: flex;
        gap: 20px;
        padding: 40px;
        min-height: calc(100vh - 100px);
      }

      .kanban-column {
        flex: 0 0 300px;
        background: #e8e8e8;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 140px);
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .column-header h3 {
        margin: 0;
        color: #333;
        font-size: 16px;
      }

      .task-count {
        background: #999;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
      }

      .tasks-container {
        flex: 1;
        overflow-y: auto;
        min-height: 100px;
        padding: 5px;
      }

      .task-card {
        background: white;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: move;
        position: relative;
        transition: box-shadow 0.2s;
      }

      .task-card:hover {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
      }

      .task-card.cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .task-card.cdk-drag-placeholder {
        opacity: 0;
      }

      .task-content h4 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 14px;
      }

      .task-content p {
        margin: 0;
        color: #666;
        font-size: 12px;
        line-height: 1.4;
      }

      .btn-delete-task {
        position: absolute;
        top: 5px;
        right: 5px;
        background: transparent;
        border: none;
        color: #999;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-delete-task:hover {
        color: #e74c3c;
      }

      .btn-add-task {
        width: 100%;
        padding: 10px;
        background: rgba(255, 255, 255, 0.8);
        border: 2px dashed #999;
        border-radius: 5px;
        color: #666;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.3s;
      }

      .btn-add-task:hover {
        background: white;
        border-color: #667eea;
        color: #667eea;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal {
        background: white;
        padding: 30px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
      }

      .modal h2 {
        margin: 0 0 20px 0;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #555;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-primary:hover {
        background: #5568d3;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      .btn-secondary:hover {
        background: #d0d0d0;
      }
    `,
  ],
})
export class BoardDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);

  board: Board | null = null;
  showAddColumn = false;
  showTaskModal = false;
  newColumnName = '';
  newTaskTitle = '';
  newTaskDescription = '';
  selectedColumn: BoardColumn | null = null;

  ngOnInit(): void {
    const boardId = this.route.snapshot.paramMap.get('id');
    if (boardId) {
      this.loadBoard(boardId);
    }
  }

  loadBoard(boardId: string): void {
    this.boardService.getBoard(boardId).subscribe({
      next: (board) => (this.board = board),
      error: (error) => console.error('Failed to load board', error),
    });
  }

  goBack(): void {
    this.router.navigate(['/boards']);
  }

  createColumn(): void {
    if (!this.board || !this.newColumnName) return;

    const position = this.board.columns.length;
    this.boardService.createColumn(this.board.id, this.newColumnName, position).subscribe({
      next: (column) => {
        if (this.board) {
          this.board.columns.push({ ...column, tasks: [] });
          this.showAddColumn = false;
          this.newColumnName = '';
        }
      },
      error: (error) => console.error('Failed to create column', error),
    });
  }

  openTaskModal(column: BoardColumn): void {
    this.selectedColumn = column;
    this.showTaskModal = true;
  }

  createTask(): void {
    if (!this.board || !this.selectedColumn || !this.newTaskTitle) return;

    const position = this.selectedColumn.tasks.length;
    this.boardService
      .createTask(
        this.board.id,
        this.selectedColumn.id,
        this.newTaskTitle,
        this.newTaskDescription,
        position
      )
      .subscribe({
        next: (task) => {
          if (this.selectedColumn) {
            this.selectedColumn.tasks.push(task);
            this.showTaskModal = false;
            this.newTaskTitle = '';
            this.newTaskDescription = '';
            this.selectedColumn = null;
          }
        },
        error: (error) => console.error('Failed to create task', error),
      });
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumn: BoardColumn): void {
    if (!this.board) return;

    if (event.previousContainer === event.container) {
      // Same column - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Different column - transfer
      const task = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update on server
      const sourceColumn = this.board.columns.find((col) => col.id === event.previousContainer.id);

      if (sourceColumn) {
        this.boardService
          .moveTask(this.board.id, sourceColumn.id, task.id, targetColumn.id, event.currentIndex)
          .subscribe({
            error: (error) => {
              console.error('Failed to move task', error);
              // Revert on error
              transferArrayItem(
                event.container.data,
                event.previousContainer.data,
                event.currentIndex,
                event.previousIndex
              );
            },
          });
      }
    }
  }

  deleteTask(column: BoardColumn, task: Task): void {
    if (!this.board || !confirm('Delete this task?')) return;

    this.boardService.deleteTask(this.board.id, column.id, task.id).subscribe({
      next: () => {
        const index = column.tasks.indexOf(task);
        if (index > -1) {
          column.tasks.splice(index, 1);
        }
      },
      error: (error) => console.error('Failed to delete task', error),
    });
  }
}
