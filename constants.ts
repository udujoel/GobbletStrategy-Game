import { PieceSize, PlayerColor, PlayerSupply } from './types';

export const BOARD_SIZE = 3;

export const INITIAL_SUPPLY: PlayerSupply = {
  [PieceSize.SMALL]: 2,
  [PieceSize.MEDIUM]: 2,
  [PieceSize.LARGE]: 2,
};

export const COLORS = {
  [PlayerColor.ORANGE]: {
    base: 'bg-orange-500',
    gradient: 'from-orange-400 to-orange-600',
    border: 'border-orange-700',
    shadow: 'shadow-orange-800',
    text: 'text-orange-600',
    ring: 'ring-orange-400',
  },
  [PlayerColor.BLUE]: {
    base: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    border: 'border-blue-700',
    shadow: 'shadow-blue-800',
    text: 'text-blue-600',
    ring: 'ring-blue-400',
  },
};

export const SIZE_LABELS = {
  [PieceSize.SMALL]: 'S',
  [PieceSize.MEDIUM]: 'M',
  [PieceSize.LARGE]: 'L',
};

export const SIZE_CLASSES = {
  [PieceSize.SMALL]: 'w-8 h-8 md:w-10 md:h-10',
  [PieceSize.MEDIUM]: 'w-12 h-12 md:w-16 md:h-16',
  [PieceSize.LARGE]: 'w-16 h-16 md:w-24 md:h-24',
};
