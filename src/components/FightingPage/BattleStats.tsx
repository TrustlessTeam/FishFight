import React from 'react';

interface BattleStatsProps {
  currentPower: number;
  fishFoodBalance: string | undefined;
  fightingFishBalance: string | undefined;
}

const BattleStats: React.FC<BattleStatsProps> = ({
  currentPower,
  fishFoodBalance,
  fightingFishBalance
}) => {
  return (
    <div className="battle-stats">
      <div className="stat-item">
        <label>Current Power:</label>
        <span>{currentPower}</span>
      </div>
      
      <div className="stat-item">
        <label>FISHFOOD Balance:</label>
        <span>{fishFoodBalance || '0'}</span>
      </div>
      
      <div className="stat-item">
        <label>Fighting Fish:</label>
        <span>{fightingFishBalance || '0'}</span>
      </div>
    </div>
  );
};

export default BattleStats; 