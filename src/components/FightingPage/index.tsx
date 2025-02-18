import React, { useState } from 'react';
import { useFishFight } from '../../context/fishFightContext';
import { Constants } from '../../utils/constants';
import FightControls from './FightControls';
import BattleStats from './BattleStats';
import FightResults from './FightResults';
import FightPreview from './FightPreview';
import FishSelector from './FishSelector';
import FightDisplay from './FightDisplay';
import { Fight } from '../../utils/fight';
import './FightingPage.css';
import './FightDisplay.css';
import FightModeSelector from './FightModeSelector';

const FightingPage: React.FC = () => {
  const {
    isInCooldown,
    cooldownTimeRemaining,
    currentPower,
    balanceFood,
    balanceFightFish,
    startRegularFight,
    startNonLethalFight,
    startWeakFight,
    lastFightResult,
    selectedFish,
    opponentStats,
  } = useFishFight();

  const [fightState, setFightState] = useState<'selecting' | 'fighting' | 'results'>('selecting');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundStats, setRoundStats] = useState<number[]>([]);

  console.log('Selected Fish:', selectedFish);
  console.log('Opponent Stats:', opponentStats);
  console.log('FightingPage Rendering');

  const handleFight = async (type: 'regular' | 'weak' | 'nonlethal', powerLevel: number) => {
    setFightState('fighting');
    setCurrentRound(1);
    
    try {
      const result = await (async () => {
        switch(type) {
          case 'regular':
            return startRegularFight(powerLevel);
          case 'weak':
            return startWeakFight(powerLevel);
          case 'nonlethal':
            return startNonLethalFight(powerLevel);
        }
      })();

      for (let round = 1; round <= 3; round++) {
        const roundStat = Math.floor(Math.random() * 100);
        setRoundStats(prev => [...prev, roundStat]);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentRound(round + 1);
      }

      setFightState('results');
    } catch (error) {
      console.error('Fight failed:', error);
      setFightState('selecting');
    }
  };

  const handleModeSelect = (mode: 'regular' | 'weak' | 'nonlethal') => {
    setFightState('selecting');
  };

  React.useEffect(() => {
    console.log('FightingPage Mounted');
    return () => console.log('FightingPage Unmounted');
  }, []);

  return (
    <div className="fighting-container">
      {/* Top Navigation Bar */}
      <div className="fight-nav">
        <div className="fight-modes">
          <button className="mode-button active">FREE FOR ALL</button>
          <button className="mode-button">STATS UNDER 50</button>
          <button className="mode-button">NON-LETHAL</button>
        </div>
        <div className="fight-info">
          <span>$FISHFOOD per Win: 100 {'->'} 0.00300 then 200</span>
          <span>DEPOSIT REWARD $FISHFOOD per Hour: ~41.4</span>
        </div>
      </div>

      {/* Main Fight Display */}
      <div className="fight-arena">
        {selectedFish ? (
          <div className="vs-display">
            {/* Left Fish Stats */}
            <div className="fish-stats left">
              <div className="fish-header">
                <span className="wins">{selectedFish.lifetimeWins}</span>
                <span className="generation">GENERATION {selectedFish.generation}</span>
              </div>
              <div className="fish-id">$FISH ID: {selectedFish.tokenId}</div>
              <div className="stats-bars">
                <div className="stat-bar">
                  <label>STRENGTH</label>
                  <div className="bar-container">
                    <div className="bar" style={{width: `${(selectedFish.strength/100)*100}%`}}></div>
                    <span>{selectedFish.strength}</span>
                  </div>
                </div>
                <div className="stat-bar">
                  <label>INTELLIGENCE</label>
                  <div className="bar-container">
                    <div className="bar" style={{width: `${(selectedFish.intelligence/100)*100}%`}}></div>
                    <span>{selectedFish.intelligence}</span>
                  </div>
                </div>
                <div className="stat-bar">
                  <label>AGILITY</label>
                  <div className="bar-container">
                    <div className="bar" style={{width: `${(selectedFish.agility/100)*100}%`}}></div>
                    <span>{selectedFish.agility}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VS Section */}
            <div className="vs-section">
              <span className="vs-text">VS</span>
              <div className="power-display">
                <div className="power left">{selectedFish.power}</div>
                <div className="power right">?</div>
              </div>
            </div>

            {/* Right Side (Opponent) */}
            <div className="fish-stats right">
              <div className="opponent-text">SELECT OPPONENT</div>
              <div className="opponent-subtitle">SELECT A $FISH OPPONENT</div>
            </div>
          </div>
        ) : (
          <div className="select-prompt">Select a fish to start fighting</div>
        )}
      </div>

      {/* Bottom Fish Selection */}
      <div className="fish-selection">
        <div className="tabs">
          <button className="tab active">MY $FISH</button>
          <button className="tab">OPPONENT $FISH</button>
        </div>
        <div className="fish-grid">
          {/* Your existing FishSelector component */}
          <FishSelector />
        </div>
      </div>
    </div>
  );
};

export default FightingPage; 