export enum PlayerColor {
  ORANGE = 'ORANGE',
  BLUE = 'BLUE',
}

export enum PieceSize {
  SMALL = 0,
  MEDIUM = 1,
  LARGE = 2,
}

export interface Piece {
  id: string;
  color: PlayerColor;
  size: PieceSize;
}

// A cell is a stack of pieces. The last one is visible.
export type CellStack = Piece[];

// 3x3 Grid
export type BoardState = CellStack[][];

// The available pieces off-board for a player
export type PlayerSupply = Record<PieceSize, number>;

export interface GameState {
  board: BoardState;
  turn: PlayerColor;
  winner: PlayerColor | 'DRAW' | null;
  supplies: Record<PlayerColor, PlayerSupply>;
  selectedPiece: { size: PieceSize; fromSupply: boolean } | null;
  history: string[]; // Log of moves for debugging/display
}

export enum GameMode {
  PVP = 'PVP',
  PVE = 'PVE',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}
