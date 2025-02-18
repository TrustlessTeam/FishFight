import React from 'react';
import { useFishFight } from '../../context/fishFightContext';

const FishSelector: React.FC = () => {
  const { 
    balanceFightFish, 
    selectFish,
    FishFight,
    account,
    selectedFish
  } = useFishFight();

  console.log('Fish Selector - Selected Fish:', selectedFish);  // Debug log

  const [ownedFishIds, setOwnedFishIds] = React.useState<number[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const getFishIds = async () => {
      if (!FishFight.fishFactory || !account) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fishIds = await FishFight.fishFactory.methods
          .getTokensOfOwner(account)
          .call();
        
        setOwnedFishIds(fishIds.map(Number));
      } catch (error) {
        console.error('Failed to get owned fish:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getFishIds();
  }, [FishFight, account]);

  if (!account) {
    return <div>Please connect your wallet to see your fighters</div>;
  }

  if (isLoading) {
    return <div>Loading your fighters...</div>;
  }

  if (ownedFishIds.length === 0) {
    return <div>No fighting fish found. Visit the fishing waters to catch some!</div>;
  }

  return (
    <div className="fish-selector">
      <h3>Select Your Fighter</h3>
      <div className="fish-grid">
        {ownedFishIds.map(fishId => (
          <button
            key={fishId}
            className={`fish-select-button ${selectedFish?.tokenId === fishId ? 'selected' : ''}`}
            onClick={() => selectFish(fishId)}
          >
            Fish #{fishId}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FishSelector; 