import React, { useState, useEffect, useCallback } from 'react';
import { 
  BoardState, 
  PlayerColor, 
  GameState, 
  GameMode, 
  Difficulty, 
  PieceSize, 
  PlayerSupply as IPlayerSupply 
} from './types';
import { 
  createEmptyBoard, 
  checkWinner, 
  isValidMove, 
  getAIMove 
} from './services/gameLogic';
import { INITIAL_SUPPLY, COLORS } from './constants';
import Cell from './components/Cell';
import PlayerSupply from './components/PlayerSupply';

// --- Main Component ---

const App: React.FC = () => {
  // --- State ---
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [turn, setTurn] = useState<PlayerColor>(PlayerColor.ORANGE);
  const [supplies, setSupplies] = useState<Record<PlayerColor, IPlayerSupply>>({
    [PlayerColor.ORANGE]: { ...INITIAL_SUPPLY },
    [PlayerColor.BLUE]: { ...INITIAL_SUPPLY },
  });
  const [winner, setWinner] = useState<PlayerColor | 'DRAW' | null>(null);
  
  // Selection State
  const [selectedSize, setSelectedSize] = useState<PieceSize | null>(null);

  // Settings
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PVE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [showSettings, setShowSettings] = useState<boolean>(true);

  // --- Helpers ---

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setTurn(PlayerColor.ORANGE);
    setSupplies({
      [PlayerColor.ORANGE]: { ...INITIAL_SUPPLY },
      [PlayerColor.BLUE]: { ...INITIAL_SUPPLY },
    });
    setWinner(null);
    setSelectedSize(null);
  };

  const executeMove = useCallback((player: PlayerColor, size: PieceSize, row: number, col: number) => {
    const newBoard = board.map((r, rIdx) => 
      rIdx === row 
        ? r.map((cell, cIdx) => 
            cIdx === col 
              ? [...cell, { id: `${player}-${size}-${Date.now()}`, color: player, size }]
              : cell
          )
        : r
    );

    const newSupplies = {
      ...supplies,
      [player]: {
        ...supplies[player],
        [size]: supplies[player][size] - 1
      }
    };

    setBoard(newBoard);
    setSupplies(newSupplies);
    setSelectedSize(null); // Deselect

    const winResult = checkWinner(newBoard);
    if (winResult) {
      setWinner(winResult);
    } else {
      // Check for Draw (No moves left for next player) - Simplified: Just switch turn
      setTurn(prev => prev === PlayerColor.ORANGE ? PlayerColor.BLUE : PlayerColor.ORANGE);
    }
  }, [board, supplies]);

  // --- Interaction Handlers ---

  const handleSelectPiece = (size: PieceSize) => {
    if (selectedSize === size) {
      setSelectedSize(null); // Toggle off
    } else {
      setSelectedSize(size);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    // Only allow interaction if it's human turn and game isn't over
    if (winner || (gameMode === GameMode.PVE && turn === PlayerColor.BLUE)) return;
    if (selectedSize === null) return;

    if (isValidMove(board, turn, selectedSize, row, col, supplies[turn])) {
      executeMove(turn, selectedSize, row, col);
    }
  };

  // --- AI Effect ---

  useEffect(() => {
    if (gameMode === GameMode.PVE && turn === PlayerColor.BLUE && !winner) {
      // Small delay for realism
      const timer = setTimeout(() => {
        const move = getAIMove(board, supplies, difficulty);
        if (move) {
          executeMove(PlayerColor.BLUE, move.size, move.row, move.col);
        } else {
            // AI has no moves? Technically a forfeit or pass in some variants, 
            // but in strict Gobblet usually you lose if you can't move.
            // For now, let's just pass turn or declare Orange winner?
            // Simplest: Pass turn (rare edge case in this simplified logic)
            setTurn(PlayerColor.ORANGE);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, winner, board, supplies, difficulty, executeMove]);


  // --- Render ---

  return (
    <div className="min-h-screen bg-wood text-amber-900 flex flex-col items-center p-4">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 bg-white/60 p-4 rounded-xl shadow-sm backdrop-blur-md">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-amber-800 drop-shadow-sm">
          Gobblet<span className="text-orange-600">Strategy</span>
        </h1>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {showSettings ? 'Close Menu' : 'Menu'}
        </button>
      </header>

      {/* Settings Modal / Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-4 border-amber-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-amber-900">Game Setup</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-600 uppercase tracking-wide">Opponent</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setGameMode(GameMode.PVE)}
                    className={`py-3 rounded-xl font-bold transition-all ${gameMode === GameMode.PVE ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500'}`}
                  >
                    AI Bot
                  </button>
                  <button 
                    onClick={() => setGameMode(GameMode.PVP)}
                    className={`py-3 rounded-xl font-bold transition-all ${gameMode === GameMode.PVP ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500'}`}
                  >
                    2 Player
                  </button>
                </div>
              </div>

              {gameMode === GameMode.PVE && (
                <div>
                   <label className="block text-sm font-bold mb-2 text-gray-600 uppercase tracking-wide">Difficulty</label>
                   <div className="grid grid-cols-3 gap-2">
                     {Object.values(Difficulty).map(d => (
                       <button
                         key={d}
                         onClick={() => setDifficulty(d)}
                         className={`py-2 rounded-lg font-bold text-sm transition-all ${difficulty === d ? 'bg-amber-500 text-white ring-2 ring-offset-1 ring-amber-300' : 'bg-amber-100 text-amber-800'}`}
                       >
                         {d}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={() => { handleRestart(); setShowSettings(false); }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Start New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <main className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-5xl">
        
        {/* Player 1 Supply (Orange) */}
        <div className={`order-2 lg:order-1 w-full lg:w-auto ${turn === PlayerColor.ORANGE ? 'z-10' : 'z-0'}`}>
          <PlayerSupply 
            player={PlayerColor.ORANGE} 
            supply={supplies[PlayerColor.ORANGE]}
            isActive={turn === PlayerColor.ORANGE && !winner}
            onSelectPiece={handleSelectPiece}
            selectedSize={selectedSize}
            isHuman={true} // In PVE, Human is Orange
          />
        </div>

        {/* Board */}
        <div className="order-1 lg:order-2 relative group">
          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl animate-in fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform animate-in zoom-in-50 duration-300">
                <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  {winner === 'DRAW' ? 'Draw!' : `${winner === PlayerColor.ORANGE ? 'Orange' : 'Blue'} Wins!`}
                </h2>
                <button 
                  onClick={handleRestart}
                  className="mt-6 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          <div className="bg-amber-200/50 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_2px_10px_rgba(255,255,255,0.5)] border border-white/40">
            <div className="grid grid-cols-3 gap-3 md:gap-4 bg-amber-900/10 p-3 md:p-4 rounded-xl shadow-inner">
              {board.map((rowArr, rowIndex) => (
                rowArr.map((stack, colIndex) => {
                  const isValid = !winner && turn === PlayerColor.ORANGE && selectedSize !== null && isValidMove(board, turn, selectedSize, rowIndex, colIndex, supplies[turn]);
                  
                  return (
                    <Cell
                      key={`${rowIndex}-${colIndex}`}
                      row={rowIndex}
                      col={colIndex}
                      stack={stack}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      isValidTarget={isValid}
                      disabled={!!winner || (gameMode === GameMode.PVE && turn === PlayerColor.BLUE)}
                    />
                  );
                })
              ))}
            </div>
          </div>
        </div>

        {/* Player 2 Supply (Blue) */}
        <div className={`order-3 w-full lg:w-auto ${turn === PlayerColor.BLUE ? 'z-10' : 'z-0'}`}>
          <PlayerSupply 
            player={PlayerColor.BLUE} 
            supply={supplies[PlayerColor.BLUE]}
            isActive={turn === PlayerColor.BLUE && !winner}
            onSelectPiece={handleSelectPiece}
            selectedSize={selectedSize}
            isHuman={gameMode === GameMode.PVP} // Only human in PVP
          />
        </div>
      </main>

      <footer className="mt-12 text-center text-amber-900/50 text-sm font-semibold">
        <p>Strategic Tic-Tac-Toe • Built with React & Tailwind</p>
      </footer>
    </div>
  );
};

export default App;
