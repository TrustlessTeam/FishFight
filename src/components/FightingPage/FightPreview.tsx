import React from 'react';
import { useFishFight } from '../../context/fishFightContext';
import { Constants } from '../../utils/constants';

interface FightPreviewProps {
  selectedFishId?: number;
  powerLevel: number;
}

const FightPreview: React.FC<FightPreviewProps> = ({
  selectedFishId,
  powerLevel
}) => {
  const {
    balanceFightFish,
    selectedFish,
    opponentStats
  } = useFishFight();

  if (!selectedFishId || !balanceFightFish) {
    return (
      <div className="fight-preview empty">
        <p>Select a fish to see fight preview</p>
      </div>
    );
  }

  // Calculate fight odds based on fish stats and power level
  const calculateOdds = () => {
    if (!selectedFish || !opponentStats) return 0;

    const basePower = selectedFish.power;
    const powerBoost = powerLevel * Constants._fightModifierValue;
    const totalPower = basePower + powerBoost;

    // Use average of opponent's power range for calculation
    const avgOpponentPower = (opponentStats.minPower + opponentStats.maxPower) / 2;
    
    return (totalPower / (totalPower + avgOpponentPower)) * 100;
  };

  return (
    <div className="fight-preview">
      <div className="selected-fish">
        <h3>Selected Fighter</h3>
        <div className="fish-stats">
          <p>Fish #{selectedFishId}</p>
          {selectedFish && (
            <>
              <p>Base Power: {selectedFish.power}</p>
              <p>Power Boost: +{powerLevel * Constants._fightModifierValue}</p>
              <p>Total Power: {selectedFish.power + (powerLevel * Constants._fightModifierValue)}</p>
            </>
          )}
        </div>
      </div>

      <div className="opponent-preview">
        <h3>Opponent Range</h3>
        {opponentStats && (
          <div className="opponent-stats">
            <p>Power Range: {opponentStats.minPower} - {opponentStats.maxPower}</p>
          </div>
        )}
      </div>

      <div className="fight-odds">
        <h3>Victory Chance</h3>
        <div className="odds-display">
          <div 
            className="odds-bar"
            style={{ width: `${calculateOdds()}%` }}
          />
          <span>{calculateOdds().toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default FightPreview; 