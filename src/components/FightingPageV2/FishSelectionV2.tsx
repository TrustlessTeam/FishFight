import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { useFishPool, PoolFish } from "../../context/fishPoolContext";
import { useFishFight } from "../../context/fishFightContext";
import { useWeb3React } from "@web3-react/core";
import { useContractWrapper } from "../../context/contractWrapperContext";
import { Fish, FishModifiers } from "../../utils/fish";
import FishDrawer from '../FishDrawer';
import FightResults from '../FightingPage/FightResults';
import { ContainerControls } from '../BaseStyles';
import { Constants } from '../../utils/constants';

enum SelectionStep {
  SelectFighter = 'SELECT_FIGHTER',
  SelectOpponent = 'SELECT_OPPONENT',
  ConfirmFight = 'CONFIRM_FIGHT',
  FightResults = 'FIGHT_RESULTS'
}

const FishSelectionV2: React.FC = () => {
  const { account, active } = useWeb3React();
  const { pendingTransaction } = useContractWrapper();
  const { loadingFish, loadingUserFish, loadMoreFish } = useFishPool();
  const { 
    selectedFish, 
    selectFish,
    balanceFish, 
    balanceFightFish, 
    balanceBreedFish,
    totalSupply,
    fightingWatersSupply,
    FishFight,
    startRegularFight,
    lastFightResult
  } = useFishFight();
  
  const [fishCollection, setFishCollection] = useState<Fish[]>([]);
  const [opponentCollection, setOpponentCollection] = useState<Fish[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<Fish | null>(null);
  const [currentStep, setCurrentStep] = useState<SelectionStep>(SelectionStep.SelectFighter);
  const [fightProbability, setFightProbability] = useState<number | null>(null);

  // Load user's fish when wallet is connected
  useEffect(() => {
    const getFishIds = async () => {
      const factory = FishFight?.fishFactory;
      if (!factory || !account) {
        console.log('Missing dependencies:', { factory, account });
        return;
      }

      try {
        const fishIds = await factory.methods
          .getTokensOfOwner(account)
          .call();
        
        const fishPromises: Promise<Fish>[] = fishIds.map(async (id: number) => {
          const [fishData, fishStats] = await Promise.all([
            factory.methods.getFish(id).call(),
            factory.methods.getFishStats(id).call()
          ]);
          
          return new Fish(
            {
              tokenId: id,
              birthTime: Number(fishData[0]),
              genes: fishData[1],
              fishType: Number(fishData[2]),
              rarity: Number(fishData[3]),
              strength: Number(fishData[4]),
              intelligence: Number(fishData[5]),
              agility: Number(fishData[6]),
              lifetimeWins: Number(fishData[7]),
              generation: Number(fishData[8]),
              parentA: Number(fishData[9]),
              parentB: Number(fishData[10]),
              breedKey: fishData[11],
              deathTime: Number(fishData[12]),
              revived: fishData[13],
              offspring: fishData[14] || []
            },
            fishStats,
            null, // imgSrc
            null  // ipfsLink
          );
        });

        const fishData = await Promise.all<Fish>(fishPromises);
        setFishCollection(fishData);
      } catch (error) {
        console.error('Failed to get owned fish:', error);
      }
    };

    getFishIds();
  }, [FishFight, account]);

  // Load opponent fish when selecting opponent
  useEffect(() => {
    const getOpponentFish = async () => {
      const fightingWaters = FishFight?.readFightingWaters;
      if (!fightingWaters) {
        console.log('Missing dependencies:', { fightingWaters });
        return;
      }

      try {
        const fightingPoolFish = await fightingWaters.methods
          .getFightingPoolFish()
          .call();
        
        const fishPromises: Promise<Fish>[] = fightingPoolFish.map(async (id: number) => {
          const [fishData, fishStats] = await Promise.all([
            fightingWaters.methods.getFish(id).call(),
            fightingWaters.methods.getFishStats(id).call()
          ]);
          
          return new Fish(
            {
              tokenId: id,
              birthTime: Number(fishData[0]),
              genes: fishData[1],
              fishType: Number(fishData[2]),
              rarity: Number(fishData[3]),
              strength: Number(fishData[4]),
              intelligence: Number(fishData[5]),
              agility: Number(fishData[6]),
              lifetimeWins: Number(fishData[7]),
              generation: Number(fishData[8]),
              parentA: Number(fishData[9]),
              parentB: Number(fishData[10]),
              breedKey: fishData[11],
              deathTime: Number(fishData[12]),
              revived: fishData[13],
              offspring: fishData[14] || []
            },
            fishStats,
            null, // imgSrc
            null  // ipfsLink
          );
        });

        const fishData = await Promise.all<Fish>(fishPromises);
        setOpponentCollection(fishData);
      } catch (error) {
        console.error('Failed to get opponent fish:', error);
      }
    };

    if (currentStep === SelectionStep.SelectOpponent) {
      getOpponentFish();
    }
  }, [currentStep, FishFight]);

  // Calculate fight probability when both fish are selected
  useEffect(() => {
    const calculateProbability = async () => {
      if (!selectedFish || !selectedOpponent || !FishFight) return;

      try {
        const probability = await FishFight.readFightComputation.methods
          .calculateWinProbability(selectedFish.tokenId, selectedOpponent.tokenId)
          .call();
        
        setFightProbability(Number(probability));
      } catch (error) {
        console.error('Failed to calculate probability:', error);
      }
    };

    if (currentStep === SelectionStep.ConfirmFight) {
      calculateProbability();
    }
  }, [selectedFish, selectedOpponent, currentStep, FishFight]);

  const handleFishSelect = async (fish: Fish) => {
    await selectFish(fish.tokenId);
    setCurrentStep(SelectionStep.SelectOpponent);
  };

  const handleOpponentSelect = (fish: Fish) => {
    setSelectedOpponent(fish);
    setCurrentStep(SelectionStep.ConfirmFight);
  };

  const handleFightConfirm = async () => {
    if (!selectedFish || !selectedOpponent) return;
    
    try {
      await startRegularFight(selectedFish.power);
      setCurrentStep(SelectionStep.FightResults);
    } catch (error) {
      console.error('Failed to start fight:', error);
    }
  };

  if (!active) {
    return (
      <SelectionContainer>
        <ConnectPrompt>
          Please connect your wallet to see your fighters
        </ConnectPrompt>
      </SelectionContainer>
    );
  }

  if (pendingTransaction) {
    return (
      <SelectionContainer>
        <PendingOverlay open={true} className="active">
          <div className="lds-ripple"><div></div><div></div></div>
          <LoadingText>Transaction Pending...</LoadingText>
        </PendingOverlay>
      </SelectionContainer>
    );
  }

  return (
    <SelectionContainer>
      <ContainerControls>
        <div className="selection-header">
          <StepButton 
            active={currentStep === SelectionStep.SelectFighter}
            onClick={() => setCurrentStep(SelectionStep.SelectFighter)}
          >
            MY $FISH
          </StepButton>
          <StepButton 
            active={currentStep === SelectionStep.SelectOpponent}
            disabled={!selectedFish}
            onClick={() => selectedFish && setCurrentStep(SelectionStep.SelectOpponent)}
          >
            OPPONENT $FISH
          </StepButton>
        </div>
      </ContainerControls>

      {currentStep === SelectionStep.SelectFighter && (
        <FishDrawer 
          fishCollection={fishCollection}
          onClick={handleFishSelect}
          selectedFish={selectedFish}
          fishPool={PoolFish.User}
          type="Fighting"
        />
      )}

      {currentStep === SelectionStep.SelectOpponent && (
        <FishDrawer 
          fishCollection={opponentCollection}
          onClick={handleOpponentSelect}
          selectedFish={selectedOpponent}
          fishPool={PoolFish.Fighting}
          type="Fighting"
        />
      )}

      {currentStep === SelectionStep.ConfirmFight && selectedFish && selectedOpponent && (
        <FightConfirmation>
          <div className="fight-stats">
            <h3>Fight Preview</h3>
            <div className="fish-comparison">
              <div className="fish-stats">
                <h4>Your Fighter</h4>
                <p>Power: {selectedFish.power}</p>
                <p>Strength: {selectedFish.strength}</p>
                <p>Intelligence: {selectedFish.intelligence}</p>
                <p>Agility: {selectedFish.agility}</p>
              </div>
              <div className="vs">VS</div>
              <div className="fish-stats">
                <h4>Opponent</h4>
                <p>Power: {selectedOpponent.power}</p>
                <p>Strength: {selectedOpponent.strength}</p>
                <p>Intelligence: {selectedOpponent.intelligence}</p>
                <p>Agility: {selectedOpponent.agility}</p>
              </div>
            </div>
            {fightProbability !== null && (
              <div className="win-probability">
                Win Probability: {fightProbability}%
              </div>
            )}
            <button onClick={handleFightConfirm}>Start Fight</button>
          </div>
        </FightConfirmation>
      )}

      {currentStep === SelectionStep.FightResults && (
        <FightResults />
      )}

      <ActionButtons>
        <button disabled={!selectedFish?.fishModifiers.canFeed()}>FEED</button>
        <button disabled={!selectedFish?.fishModifiers.canCollect()}>COLLECT</button>
        <button disabled={!selectedFish}>BUFF</button>
        <button disabled={!selectedFish}>DEPOSIT</button>
      </ActionButtons>
    </SelectionContainer>
  );
};

const SelectionContainer = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
`;

const StepButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.active ? '#4a90e2' : 'transparent'};
  color: ${props => props.active ? '#4a90e2' : 'white'};
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FightConfirmation = styled.div`
  padding: 2rem;
  
  .fight-stats {
    text-align: center;
    
    h3 {
      margin-bottom: 2rem;
    }
    
    .fish-comparison {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 2rem;
      
      .fish-stats {
        background: rgba(0, 0, 0, 0.2);
        padding: 1rem;
        border-radius: 8px;
        
        h4 {
          margin-bottom: 1rem;
        }
        
        p {
          margin: 0.5rem 0;
        }
      }
      
      .vs {
        font-size: 2rem;
        font-weight: bold;
      }
    }
    
    .win-probability {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    
    button {
      padding: 1rem 2rem;
      background: #4a90e2;
      border: none;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s;
      
      &:hover {
        background: #357abd;
      }
    }
  }
`;

const PendingOverlay = styled.div<{open: boolean}>`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease-in-out;

  &.active {
    pointer-events: auto;
    opacity: 1;
    height: 120px;
  }
`;

const LoadingText = styled.h1`
  color: white;
  margin: 0 auto;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;

  button {
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: rgba(255,255,255,0.2);
    }
  }
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 2rem;
  color: white;
  font-size: 1.2rem;
`;

export default FishSelectionV2; 