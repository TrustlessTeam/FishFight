import React, { useState } from 'react';
import { useFishFight } from '../../context/fishFightContext';
import { Constants } from '../../utils/constants';

interface FightControlsProps {
  isInCooldown: boolean;
  cooldownTimeRemaining: number;
  onRegularFight: (powerLevel: number) => Promise<void>;
  onNonLethalFight: (powerLevel: number) => Promise<void>;
  onWeakFight: (powerLevel: number) => Promise<void>;
}

type PoolType = 'regular' | 'weak' | 'nonlethal';

const FightControls: React.FC<FightControlsProps> = ({
  isInCooldown,
  cooldownTimeRemaining,
  onRegularFight,
  onNonLethalFight,
  onWeakFight
}) => {
  const [selectedPool, setSelectedPool] = useState<PoolType>('regular');
  const [powerLevel, setPowerLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    balanceFood,
    balanceFightFish
  } = useFishFight();

  const getPoolInfo = (poolType: PoolType) => {
    switch(poolType) {
      case 'regular':
        return {
          reward: Constants._fishFoodPerWin,
          cooldown: Constants._lockTime,
          name: 'Regular Pool'
        };
      case 'weak':
        return {
          reward: Constants._fishFoodPerWinWeak,
          cooldown: Constants._lockTimeWeak,
          name: 'Weak Pool'
        };
      case 'nonlethal':
        return {
          reward: Constants._fishFoodPerWinNonLethal,
          cooldown: Constants._cooldownTimeNonLethal,
          name: 'Non-Lethal Pool'
        };
    }
  };

  const handleFight = async () => {
    try {
      setIsLoading(true);
      
      switch(selectedPool) {
        case 'regular':
          await onRegularFight(powerLevel);
          break;
        case 'weak':
          await onWeakFight(powerLevel);
          break;
        case 'nonlethal':
          await onNonLethalFight(powerLevel);
          break;
      }
    } catch (error) {
      console.error('Fight failed:', error);
      // Could add toast/notification here
    } finally {
      setIsLoading(false);
    }
  };

  const poolInfo = getPoolInfo(selectedPool);

  return (
    <div className="fight-controls">
      <div className="pool-selection">
        <h3>Select Fighting Pool</h3>
        <div className="pool-buttons">
          {(['regular', 'weak', 'nonlethal'] as PoolType[]).map(pool => (
            <button
              key={pool}
              className={`pool-button ${selectedPool === pool ? 'active' : ''}`}
              onClick={() => setSelectedPool(pool)}
              disabled={isInCooldown || isLoading}
            >
              {getPoolInfo(pool).name}
            </button>
          ))}
        </div>
      </div>

      <div className="pool-info">
        <p>Win Reward: {poolInfo.reward} FISHFOOD</p>
        <p>Cooldown: {poolInfo.cooldown / 60} minutes</p>
      </div>

      <div className="power-controls">
        <h3>Power Boost</h3>
        <div className="power-slider">
          <label>Power Level: {powerLevel}</label>
          <input 
            type="range"
            min="0"
            max={Constants._maxPower}
            value={powerLevel}
            onChange={(e) => setPowerLevel(Number(e.target.value))}
            disabled={isInCooldown || isLoading}
          />
        </div>
        <p>Cost: {powerLevel * Constants._fightPowerFee} FISHFOOD</p>
      </div>

      <button 
        className="fight-button"
        onClick={handleFight}
        disabled={
          isInCooldown || 
          isLoading || 
          !balanceFightFish || 
          Number(balanceFightFish) === 0
        }
      >
        {isInCooldown 
          ? `Cooldown: ${cooldownTimeRemaining}s`
          : isLoading 
            ? 'Fighting...'
            : `Start ${poolInfo.name} Fight`}
      </button>
    </div>
  );
};

export default FightControls; 