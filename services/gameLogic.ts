import { BoardState, CellStack, Difficulty, PieceSize, PlayerColor, PlayerSupply } from '../types';
import { BOARD_SIZE } from '../constants';

// --- Helpers ---

export const createEmptyBoard = (): BoardState => {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null).map(() => [])
  );
};

export const getTopPiece = (stack: CellStack) => {
  if (stack.length === 0) return null;
  return stack[stack.length - 1];
};

export const isValidMove = (
  board: BoardState,
  player: PlayerColor,
  pieceSize: PieceSize,
  row: number,
  col: number,
  playerSupply: PlayerSupply
): boolean => {
  // Check supply
  if (playerSupply[pieceSize] <= 0) return false;

  // Check board boundaries
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;

  const stack = board[row][col];
  const topPiece = getTopPiece(stack);

  // Can place if empty or if new piece is larger than top piece
  if (!topPiece) return true;
  return pieceSize > topPiece.size;
};

export const checkWinner = (board: BoardState): PlayerColor | null => {
  const size = BOARD_SIZE;

  // Helper to get owner of a cell
  const getOwner = (r: number, c: number): PlayerColor | null => {
    const top = getTopPiece(board[r][c]);
    return top ? top.color : null;
  };

  // Check Rows
  for (let r = 0; r < size; r++) {
    const first = getOwner(r, 0);
    if (first && getOwner(r, 1) === first && getOwner(r, 2) === first) {
      return first;
    }
  }

  // Check Cols
  for (let c = 0; c < size; c++) {
    const first = getOwner(0, c);
    if (first && getOwner(1, c) === first && getOwner(2, c) === first) {
      return first;
    }
  }

  // Check Diagonals
  const center = getOwner(1, 1);
  if (center) {
    if (getOwner(0, 0) === center && getOwner(2, 2) === center) return center;
    if (getOwner(0, 2) === center && getOwner(2, 0) === center) return center;
  }

  return null;
};

// --- AI Logic ---

interface Move {
  size: PieceSize;
  row: number;
  col: number;
  score?: number;
}

const getAllValidMoves = (board: BoardState, player: PlayerColor, supply: PlayerSupply): Move[] => {
  const moves: Move[] = [];
  // For each available piece size in supply
  ([PieceSize.LARGE, PieceSize.MEDIUM, PieceSize.SMALL] as PieceSize[]).forEach(size => {
    if (supply[size] > 0) {
      // Try every cell
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const stack = board[r][c];
          const top = getTopPiece(stack);
          // Standard validation logic inline for speed
          if (!top || size > top.size) {
            moves.push({ size, row: r, col: c });
          }
        }
      }
    }
  });
  return moves;
};

// Simulate a move on a cloned board/supply
const simulateMove = (
  board: BoardState, 
  supplies: Record<PlayerColor, PlayerSupply>,
  player: PlayerColor, 
  move: Move
): { newBoard: BoardState, newSupplies: Record<PlayerColor, PlayerSupply> } => {
  // Deep clone
  const newBoard = board.map(row => row.map(stack => [...stack]));
  const newSupplies = {
    [PlayerColor.ORANGE]: { ...supplies[PlayerColor.ORANGE] },
    [PlayerColor.BLUE]: { ...supplies[PlayerColor.BLUE] },
  };

  // Apply move
  newSupplies[player][move.size]--;
  newBoard[move.row][move.col].push({
    id: `sim-${Date.now()}`,
    color: player,
    size: move.size
  });

  return { newBoard, newSupplies };
};

// Basic heuristic evaluation
const evaluateBoard = (board: BoardState, player: PlayerColor): number => {
  const opponent = player === PlayerColor.ORANGE ? PlayerColor.BLUE : PlayerColor.ORANGE;
  const winner = checkWinner(board);
  if (winner === player) return 1000;
  if (winner === opponent) return -1000;
  
  // Simple heuristic: count pieces in center vs corners, etc. (Can be improved)
  let score = 0;
  if (getTopPiece(board[1][1])?.color === player) score += 5;
  
  return score;
};

export const getAIMove = (
  board: BoardState,
  supplies: Record<PlayerColor, PlayerSupply>,
  difficulty: Difficulty
): Move | null => {
  const aiColor = PlayerColor.BLUE;
  const playerColor = PlayerColor.ORANGE;
  const possibleMoves = getAllValidMoves(board, aiColor, supplies[aiColor]);

  if (possibleMoves.length === 0) return null;

  // 1. Easy: Random
  if (difficulty === Difficulty.EASY) {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // 2. Medium: Win immediately or Block immediate loss, else Random
  if (difficulty === Difficulty.MEDIUM) {
    // Check for winning move
    for (const move of possibleMoves) {
      const { newBoard } = simulateMove(board, supplies, aiColor, move);
      if (checkWinner(newBoard) === aiColor) return move;
    }
    
    // Check for blocking opponent win
    // We simulate what the opponent would do. If they have a winning move, we must gobble that spot if possible.
    // To keep it simple for Medium: Check if opponent has a winning move on current board state, and if we can occupy that square.
    const oppMoves = getAllValidMoves(board, playerColor, supplies[playerColor]);
    for (const oppMove of oppMoves) {
       const { newBoard } = simulateMove(board, supplies, playerColor, oppMove);
       if (checkWinner(newBoard) === playerColor) {
         // Opponent can win at (oppMove.row, oppMove.col). Can we play there?
         const blockingMove = possibleMoves.find(m => m.row === oppMove.row && m.col === oppMove.col);
         // Also, simply playing there might not block if our piece is smaller (but isValidMove handles that). 
         // But wait, if they win by placing a piece, we block by placing there FIRST (which is what we are doing now).
         if (blockingMove) return blockingMove;
       }
    }

    // Heuristic fallback (place largest available in center if empty)
    const centerMove = possibleMoves.find(m => m.row === 1 && m.col === 1 && m.size === PieceSize.LARGE);
    if (centerMove) return centerMove;

    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // 3. Hard: Simple 1-ply Lookahead with Minimax-ish scoring
  // (Full Minimax is overkill for this prompt constraint without a worker, keeping it responsive)
  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of possibleMoves) {
    const { newBoard, newSupplies } = simulateMove(board, supplies, aiColor, move);
    
    // Did we win?
    if (checkWinner(newBoard) === aiColor) return move;

    // What is the opponent's best response?
    let maxOpponentScore = -Infinity;
    const oppMoves = getAllValidMoves(newBoard, playerColor, newSupplies[playerColor]);
    
    // If opponent has NO moves, it's a draw? Or we act as if good for us?
    if (oppMoves.length === 0) {
        maxOpponentScore = -100; 
    } else {
        for (const oppMove of oppMoves) {
            const { newBoard: finalBoard } = simulateMove(newBoard, newSupplies, playerColor, oppMove);
            const winner = checkWinner(finalBoard);
            let score = 0;
            if (winner === playerColor) score = 100; // Bad for AI
            else if (winner === aiColor) score = -100; // Good for AI (shouldn't happen here usually)
            else score = 0;
            
            if (score > maxOpponentScore) maxOpponentScore = score;
        }
    }

    // We want to MINIMIZE the opponent's best outcome (Minimax)
    // Our score for this move is roughly -(opponent's best score)
    const moveScore = -maxOpponentScore;

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMoves = [move];
    } else if (moveScore === bestScore) {
      bestMoves.push(move);
    }
  }
  
  // Pick random from best
  return bestMoves.length > 0 
    ? bestMoves[Math.floor(Math.random() * bestMoves.length)] 
    : possibleMoves[0];
};
