import React from 'react';
import { useFishFight } from '../../context/fishFightContext';

const FightResults: React.FC = () => {
  const { lastFightResult } = useFishFight();

  if (!lastFightResult) return null;

  return (
    <div className="fight-results">
      <h3>Fight Results</h3>
      <div className={`result-status ${lastFightResult.won ? 'victory' : 'defeat'}`}>
        {lastFightResult.won ? 'Victory!' : 'Defeat'}
      </div>
      {lastFightResult.won && (
        <div className="rewards">
          <p>Earned: {lastFightResult.fishFoodEarned} FISHFOOD</p>
        </div>
      )}
      <div className="fight-details">
        <p>Power Used: {lastFightResult.powerUsed}</p>
      </div>
    </div>
  );
};

export default FightResults; 