import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth.service';
import { Board } from '../../models/board.model';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="board-list-container">
      <header class="header">
        <h1>My Boards</h1>
        <div class="header-actions">
          <button class="btn-primary" (click)="showCreateModal = true">+ New Board</button>
          <button class="btn-secondary" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="boards-grid">
        @for (board of boards; track board.id) {
        <div class="board-card" (click)="openBoard(board.id)">
          <h3>{{ board.name }}</h3>
          @if (board.description) {
          <p>{{ board.description }}</p>
          }
          <div class="board-meta">
            <span>{{ board.columns.length }} columns</span>
            <span>{{ getTotalTasks(board) }} tasks</span>
          </div>
        </div>
        } @empty {
        <div class="empty-state">
          <h2>No boards yet</h2>
          <p>Create your first board to get started!</p>
        </div>
        }
      </div>

      @if (showCreateModal) {
      <div class="modal-overlay" (click)="showCreateModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Create New Board</h2>
          <form (ngSubmit)="createBoard()">
            <div class="form-group">
              <label>Board Name</label>
              <input type="text" [(ngModel)]="newBoardName" name="name" required />
            </div>
            <div class="form-group">
              <label>Description (optional)</label>
              <textarea [(ngModel)]="newBoardDescription" name="description" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showCreateModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" [disabled]="!newBoardName">Create</button>
            </div>
          </form>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .board-list-container {
        min-height: 100vh;
        background: #f5f5f5;
      }

      .header {
        background: white;
        padding: 20px 40px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header h1 {
        margin: 0;
        color: #333;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
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

      .boards-grid {
        padding: 40px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .board-card {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .board-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .board-card h3 {
        margin: 0 0 10px 0;
        color: #333;
      }

      .board-card p {
        color: #666;
        margin: 0 0 15px 0;
        font-size: 14px;
      }

      .board-meta {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #999;
      }

      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-state h2 {
        margin: 0 0 10px 0;
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
    `,
  ],
})
export class BoardListComponent implements OnInit {
  private boardService = inject(BoardService);
  private authService = inject(AuthService);
  private router = inject(Router);

  boards: Board[] = [];
  showCreateModal = false;
  newBoardName = '';
  newBoardDescription = '';

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.boardService.getBoards().subscribe({
      next: (boards) => (this.boards = boards),
      error: (error) => console.error('Failed to load boards', error),
    });
  }

  getTotalTasks(board: Board): number {
    return board.columns.reduce((total, col) => total + col.tasks.length, 0);
  }

  openBoard(boardId: string): void {
    this.router.navigate(['/boards', boardId]);
  }

  createBoard(): void {
    if (!this.newBoardName) return;

    this.boardService.createBoard(this.newBoardName, this.newBoardDescription).subscribe({
      next: (board) => {
        this.boards.unshift(board);
        this.showCreateModal = false;
        this.newBoardName = '';
        this.newBoardDescription = '';
      },
      error: (error) => console.error('Failed to create board', error),
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
