import React from 'react';
import './FightModeSelector.css';

interface FightModeSelectorProps {
  onSelectMode: (mode: 'regular' | 'weak' | 'nonlethal') => void;
  isInCooldown: boolean;
  cooldownTimeRemaining: number;
}

const FightModeSelector: React.FC<FightModeSelectorProps> = ({
  onSelectMode,
  isInCooldown,
  cooldownTimeRemaining
}) => {
  return (
    <div className="fight-mode-selector">
      <h2>Select Fighting Mode</h2>
      <div className="mode-buttons">
        <button 
          className="mode-button regular"
          onClick={() => onSelectMode('regular')}
          disabled={isInCooldown}
        >
          <h3>Regular Fight</h3>
          <p>High Risk, High Reward</p>
          <div className="mode-details">
            <span>Win: 100 FOOD</span>
            <span>Lose: Fish Dies</span>
          </div>
        </button>

        <button 
          className="mode-button nonlethal"
          onClick={() => onSelectMode('nonlethal')}
          disabled={isInCooldown}
        >
          <h3>Non-Lethal Fight</h3>
          <p>Medium Risk, Medium Reward</p>
          <div className="mode-details">
            <span>Win: 50 FOOD</span>
            <span>Lose: No Death</span>
          </div>
        </button>

        <button 
          className="mode-button weak"
          onClick={() => onSelectMode('weak')}
          disabled={isInCooldown}
        >
          <h3>Weak Fight</h3>
          <p>Low Risk, Low Reward</p>
          <div className="mode-details">
            <span>Win: 25 FOOD</span>
            <span>Lose: Safe</span>
          </div>
        </button>
      </div>

      {isInCooldown && (
        <div className="cooldown-timer">
          <p>Cooldown: {cooldownTimeRemaining}s</p>
        </div>
      )}
    </div>
  );
};

export default FightModeSelector; 