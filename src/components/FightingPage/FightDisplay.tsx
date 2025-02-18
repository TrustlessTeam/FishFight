import React, { useState } from 'react';
import { Fish } from '../../utils/fish';
import { Fight } from '../../utils/fight';

// Define the OpponentStats type
interface OpponentStats {
  minPower: number;
  maxPower: number;
}

interface FightDisplayProps {
  selectedFish?: Fish;
  opponentFish?: Fish;
  currentRound?: number;
  roundStats?: number[];
  fightResult?: Fight;
  isLoading?: boolean;
  onRoundComplete?: (roundNumber: number, roundStat: number) => void;
  opponentStats?: OpponentStats;  // Now properly typed
}

const FightDisplay: React.FC<FightDisplayProps> = ({
  selectedFish,
  opponentFish,
  currentRound,
  roundStats,
  fightResult,
  isLoading,
  onRoundComplete,
  opponentStats
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'attack' | 'hit' | 'victory' | 'defeat'>('idle');

  const playRoundAnimation = async (roundNumber: number, roundStat: number) => {
    setIsAnimating(true);
    setCurrentAnimation('attack');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentAnimation('hit');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentAnimation('idle');
    setIsAnimating(false);
    onRoundComplete?.(roundNumber, roundStat);
  };

  return (
    <div className={`fight-display ${isAnimating ? 'animating' : ''}`}>
      <div className="fighters">
        <div className="fighter fighter-1">
          {selectedFish && <FishStatsDisplay fish={selectedFish} />}
        </div>

        <div className="vs-display">
          {isLoading ? (
            <span>Fighting...</span>
          ) : (
            <>
              <span>VS</span>
              {currentRound && <p>Round {currentRound}</p>}
            </>
          )}
        </div>

        <div className="fighter fighter-2">
          {opponentFish ? (
            <FishStatsDisplay fish={opponentFish} />
          ) : (
            <div className="opponent-range">
              <h3>Opponent Pool</h3>
              <p>Power Range: {opponentStats?.minPower} - {opponentStats?.maxPower}</p>
            </div>
          )}
        </div>
      </div>

      {roundStats && roundStats.length > 0 && (
        <div className="round-stats">
          {roundStats.map((stat, index) => (
            <div key={index} className="round-result">
              <h4>Round {index + 1}</h4>
              <p>Power: {stat}</p>
            </div>
          ))}
        </div>
      )}

      {fightResult && (
        <div className={`fight-result ${fightResult.winner ? 'victory' : 'defeat'}`}>
          <h3>{fightResult.winner ? 'Victory!' : 'Defeat'}</h3>
          {/* Add other fight result details */}
        </div>
      )}

      <div className={`animation-container ${currentAnimation}`}>
        {/* Add animation elements */}
      </div>
    </div>
  );
};

// Update FishStatsDisplay to show more relevant stats from the Fish type
const FishStatsDisplay: React.FC<{ fish: Fish }> = ({ fish }) => {
  return (
    <div className="fish-stats-detailed">
      <h3>Fish #{fish.tokenId}</h3>
      <div className="stats-grid">
        <div className="stat">
          <label>Power</label>
          <span className="stat-value">{fish.power}</span>
        </div>
        <div className="stat">
          <label>Strength</label>
          <span className="stat-value">{fish.strength}</span>
        </div>
        <div className="stat">
          <label>Intelligence</label>
          <span className="stat-value">{fish.intelligence}</span>
        </div>
        <div className="stat">
          <label>Agility</label>
          <span className="stat-value">{fish.agility}</span>
        </div>
        <div className="stat">
          <label>Wins</label>
          <span className="stat-value">{fish.lifetimeWins}</span>
        </div>
        <div className="stat">
          <label>Generation</label>
          <span className="stat-value">{fish.generation}</span>
        </div>
      </div>
    </div>
  );
};

const calculateWinChance = (fish: Fish, opponentStats: OpponentStats) => {
  const avgOpponentPower = (opponentStats.minPower + opponentStats.maxPower) / 2;
  return (fish.power / (fish.power + avgOpponentPower)) * 100;
};

export default FightDisplay; 