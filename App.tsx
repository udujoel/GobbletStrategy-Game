import React, { useState, useEffect, useCallback } from 'react';
import { 
  BoardState, 
  PlayerColor, 
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
import { INITIAL_SUPPLY } from './constants';
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

  // Settings & UI
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PVE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [showRules, setShowRules] = useState<boolean>(true);

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
            // Simplest: Pass turn (rare edge case in this simplified logic)
            setTurn(PlayerColor.ORANGE);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, winner, board, supplies, difficulty, executeMove]);


  // --- Render ---

  return (
    <div className="min-h-screen bg-wood text-amber-900 flex flex-col items-center relative overflow-x-hidden">
      
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center px-6 pt-6 pb-4 z-20">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-amber-900 drop-shadow-sm select-none">
          Gobblet<span className="text-orange-600">Strategy</span>
        </h1>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="bg-white/80 hover:bg-white text-amber-900 font-bold py-2 px-6 rounded-full shadow-lg transition-all hover:scale-105 border-2 border-amber-100 flex items-center gap-2"
        >
          <span className="hidden md:inline">Settings</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border-4 border-amber-100 relative animate-in zoom-in-95 duration-200">
            <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
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

      {/* Main Game Layout */}
      <main className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 w-full max-w-6xl px-4 my-auto">
        
        {/* Orange Player (Human or P1) */}
        <div className={`
            order-2 lg:order-1 w-full lg:w-auto
            ${turn === PlayerColor.ORANGE ? 'z-10' : 'z-0'}
            transition-all duration-500
        `}>
          <PlayerSupply 
            player={PlayerColor.ORANGE} 
            supply={supplies[PlayerColor.ORANGE]}
            isActive={turn === PlayerColor.ORANGE && !winner}
            onSelectPiece={handleSelectPiece}
            selectedSize={selectedSize}
            isHuman={true}
          />
        </div>

        {/* Board */}
        <div className="order-1 lg:order-2 relative group">
          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl animate-in fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform animate-in zoom-in-50 duration-300 border-4 border-amber-300">
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

          <div className="bg-amber-200/50 p-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15),inset_0_2px_10px_rgba(255,255,255,0.5)] border border-white/40 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-3 md:gap-4 bg-amber-900/10 p-3 md:p-4 rounded-2xl shadow-inner">
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

        {/* Blue Player (AI or P2) */}
        <div className={`
            order-3 lg:order-3 w-full lg:w-auto
            ${turn === PlayerColor.BLUE ? 'z-10' : 'z-0'}
            transition-all duration-500
        `}>
          <PlayerSupply 
            player={PlayerColor.BLUE} 
            supply={supplies[PlayerColor.BLUE]}
            isActive={turn === PlayerColor.BLUE && !winner}
            onSelectPiece={handleSelectPiece}
            selectedSize={selectedSize}
            isHuman={gameMode === GameMode.PVP} 
          />
        </div>
      </main>

      {/* Floating Info / Rules Icon */}
      <div className="fixed bottom-6 right-6 z-40">
        {!showRules && (
            <button 
            onClick={() => setShowRules(true)}
            className="bg-white text-amber-800 p-4 rounded-full shadow-xl hover:scale-110 transition-transform border-2 border-amber-200"
            title="Game Rules"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </button>
        )}
      </div>

      {/* Rules Information Panel */}
      {showRules && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
             <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-amber-100 relative">
                <button 
                    onClick={() => setShowRules(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h3 className="font-bold text-lg text-amber-800 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625v-8.25m0 0a6.01 6.01 0 01-1.5-.189m1.5.189a6.01 6.01 0 00-1.5-.189m-3.75 2.625v-8.25m0 0a6.01 6.01 0 00-1.5-.189m1.5.189a6.01 6.01 0 011.5-.189m-6 2.625c0 1.554.446 2.99 1.216 4.195" />
                    </svg>
                    How to Play
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-outside pl-4">
                    <li><strong>Goal:</strong> Get 3 of your color in a row (horizontal, vertical, or diagonal).</li>
                    <li><strong>Sizes:</strong> You have Small, Medium, and Large pieces.</li>
                    <li><strong>Gobbling:</strong> You can place a larger piece <em>over</em> a smaller piece (yours or opponent's) to take control of that spot!</li>
                    <li><strong>Win:</strong> Only the visible pieces count towards winning.</li>
                </ul>
                <p className="mt-4 text-xs text-amber-900/50 font-semibold text-center uppercase tracking-widest">
                    Strategy is Key!
                </p>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;