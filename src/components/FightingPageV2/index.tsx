import React, { useState } from 'react';
import { useFishFight } from '../../context/fishFightContext';
import { useWeb3React } from "@web3-react/core";
import { connectorsByName } from '../../utils/connectors';
import FishSelector from '../FightingPage/FishSelector';
import './FightingPageV2.css';
import FishSelectionV2 from './FishSelectionV2';
import NavBar from './NavBar';

const FightingPageV2: React.FC = () => {
  const { activate, active, account } = useWeb3React();
  const {
    isInCooldown,
    cooldownTimeRemaining,
    selectedFish,
    opponentStats,
  } = useFishFight();

  const connectWallet = async () => {
    try {
      await activate(connectorsByName.Injected);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  console.log('FightingPageV2 Rendering', { selectedFish, opponentStats });

  return (
    <div className="fighting-container-v2">
      <NavBar />
      
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
        {!active && (
          <button className="connect-wallet" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {active && (
          <div className="wallet-info">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        )}
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
        <FishSelectionV2 />
      </div>
    </div>
  );
};

export default FightingPageV2; 