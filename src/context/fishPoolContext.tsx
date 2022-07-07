/* eslint-disable react-hooks/exhaustive-deps */
import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from './fishFightContext';
import web3 from 'web3'
import FishFight from '../FishFightSDK';
import { useUnity } from './unityContext';
import Contracts from '../contracts/contracts.json';


import {
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';

interface FishPoolProviderContext {
	userFish: Fish[]
  oceanFish: Fish[]
	fightingFish: Fish[]
	fightingFishWeak: Fish[]
	fightingFishNonLethal: Fish[]
	breedingFish: Fish[]
	userFishIndex: number
	oceanFishIndex: number
	breedingFishIndex: number
	fightingFishIndex: number
  loadingFish: boolean
  loadingUserFish: boolean
  refreshFish: (tokenId: number, isFighting: boolean, isBreeding: boolean) => Promise<Fish | null>
  createUserFish: (tokenId: number) => Promise<Fish | null>;
  fetchOceanFish: (startIndex?: number, random?: boolean) => void
  fetchUserFish: (account: string, startIndex?: number) => void
  fetchFightingFish: () => void
  fetchBreedingFish: () => void
  refreshLoadedFish: () => void;
  loadMoreFish: (type: number) => void;
}

export enum PoolFish {
  Ocean,
  User,
  Fighting,
  FightingWeak,
  FightingNonLethal,
  Breeding,
  UserFighting,
  UserBreeding
}

export enum PoolTypes {
  Fighting,
  FightingWeak,
  FightingNonLethal,
  Breeding,
  Ocean
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const FishPoolContext = createContext<FishPoolProviderContext | undefined>(undefined);

// Defining context provider
export const FishPoolProvider = ({ children }: UnityProviderProps) => {

  const [userFishIndex, setUserFishIndex] = useState<number>(0);
  const [loadingFish, setLoadingFish] = useState(true);
  const [loadingUserFish, setLoadingUserFish] = useState(false);
  const [oceanFishIndex, setOceanFishIndex] = useState<number>(0);
  const [breedingFishIndex, setBreedingFishIndex] = useState<number>(0);
  const [fightingFishIndex, setFightingFishIndex] = useState<number>(0);
  const [fightingFishWeakIndex, setFightingFishWeakIndex] = useState<number>(0);
  const [fightingFishNonLethalIndex, setFightingFishNonLethalIndex] = useState<number>(0);
  const [oceanFish, setOceanFish] = useState<Fish[]>([]);
	const [userFish, setUserFish] = useState<Fish[]>([]);
	const [fightingFish, setFightingFish] = useState<Fish[]>([]);
	const [fightingFishWeak, setFightingFishWeak] = useState<Fish[]>([]);
	const [fightingFishNonLethal, setFightingFishNonLethal] = useState<Fish[]>([]);
  const [breedingFish, setBreedingFish] = useState<Fish[]>([]);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  const { account } = useWeb3React();
  const { FishFight, refetchStats } = useFishFight();
	const unityContext = useUnity();

  useEffect(() => {
    // Set websocket block listener
    FishFight.listenFishFactory.events.FishBurned()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        fishBurned(web3.utils.toNumber(data.returnValues.tokenId));
      }
    })

    FishFight.listenFishFactory.events.FishMinted()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
      }
    })

    FishFight.listenFightingWaters.events.Deposit()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenFightingWatersWeak.events.Deposit()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishWeakById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenFightingWatersNonLethal.events.Deposit()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishNonLethalById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenFightingWaters.events.Withdraw()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenFightingWatersWeak.events.Withdraw()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishWeakById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenFightingWatersNonLethal.events.Withdraw()
    .on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishNonLethalById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenBreedingWaters.events.Deposit()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        addBreedingFishById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenBreedingWaters.events.Withdraw()
    .on("data", function(data: any){
      if(data.returnValues.tokenId) {
        refetchStats();
        removeBreedingFishById(web3.utils.toNumber(data.returnValues.tokenId))
      }
    })

    FishFight.listenCycles.events.NewPhase()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.newPhase) {
        refetchStats();
      }
    })
  }, [])

  useEffect(() => {
    if(connectedAccount != null && account == null) {
      setConnectedAccount(null);
      setUserFish([])
    }
  }, [account])

  useEffect(() => {
    const loadTokenData = async () => {
      fetchOceanFish(1, false);
      fetchFightingFish();
      fetchFightingFishWeak();
      fetchFightingFishNonLethal();
      fetchBreedingFish();
    }
		loadTokenData();
  }, []);

  // Load connected user fish data from the blockchain
  useEffect(() => {
    const loadTokenData = async (account: string | null | undefined) => {
      if(account && !loadingFish) {
        fetchUserFish(account);
      }
    }
		if(unityContext.isFishPoolReady) loadTokenData(account);
  }, [account, unityContext.isFishPoolReady, loadingFish]);

  const loadMoreFish = (type: number) => {
    if(type === PoolFish.Ocean) {
      fetchOceanFish(oceanFishIndex, false);
    }
    if(type === PoolFish.User && account) {
      fetchUserFish(account, userFishIndex);
    }
    if(type === PoolFish.Fighting) {
      fetchFightingFish(fightingFishIndex);
    }
    if(type === PoolFish.FightingWeak) {
      fetchFightingFishWeak(fightingFishWeakIndex);
    }
    if(type === PoolFish.FightingNonLethal) {
      fetchFightingFishWeak(fightingFishNonLethalIndex);
    }
    if(type === PoolFish.Breeding) {
      fetchBreedingFish(breedingFishIndex);
    }
  }

  const fetchOceanFish = async (startIndex?: number, random?: boolean) => {
    try {
      setLoadingFish(true);
      let randomFish: string[];
      if(random) {
        randomFish = await FishFight.fishCalls.methods.getFish(1, true).call()

      } else {
        
        randomFish = await FishFight.fishCalls.methods.getFish(startIndex ? startIndex : 1, false).call()
      }
      console.log(randomFish)
      let oceanIds = [...new Set(randomFish)].filter((val) => {
        return val !== '0';
      });

      await Promise.all(oceanIds.map(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!oceanFish.some(fish => fish.tokenId === parsedTokenId)) {
          const fishData = await buildFish(FishFight, web3.utils.toNumber(parsedTokenId))
          if(fishData != null) {
            setOceanFish(prevData => [...prevData, fishData])
          }
        }
      }));

      setLoadingFish(false);
      const [lastItem] = oceanIds.slice(-1)
      setOceanFishIndex(web3.utils.toNumber(lastItem))

    } catch (error) {
      console.log(error)
    }
  }

  const fetchUserFish = async (account: string, startIndex?: number) => {
    try {
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingUserFish(true);
      
      const fishUserOwns = await FishFight.readFishFactory.methods.balanceOf(account).call();
      const numUserFish = web3.utils.toBN(fishUserOwns).toNumber();
      const userFishIds = [...Array(numUserFish).keys()].map(x => x++);
      await Promise.all(userFishIds.map(async index => {
        const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, index).call();
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
      }));
      setUserFishIndex(userFishIds.length)

      // User Fighting Pool Fish
      const stakedFightFishUserOwns = await FishFight.readFightingWaters.methods.balanceOf(account).call();
      const numUserFightingFish = web3.utils.toBN(stakedFightFishUserOwns).toNumber();
      const fightingFishIds = [...Array(numUserFightingFish).keys()].map(x => x++);
      await Promise.all(fightingFishIds.map(async index => {
        const tokenId = await FishFight.readFightingWaters.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
      }));

      // User Weak Fighting Pool Fish
      const stakedFightFishWeakUserOwns = await FishFight.readFightingWatersWeak.methods.balanceOf(account).call();
      const numUserFightingFishWeak = web3.utils.toBN(stakedFightFishWeakUserOwns).toNumber();
      const fightingFishIdsWeak = [...Array(numUserFightingFishWeak).keys()].map(x => x++);
      await Promise.all(fightingFishIdsWeak.map(async index => {
        const tokenId = await FishFight.readFightingWatersWeak.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
      }));

      // User Non Lethal Fighting Pool Fish
      const stakedFightFishNonLethalUserOwns = await FishFight.readFightingWatersNonLethal.methods.balanceOf(account).call();
      const numUserFightingFishNonLethal = web3.utils.toBN(stakedFightFishNonLethalUserOwns).toNumber();
      const fightingFishIdsNonLethal = [...Array(numUserFightingFishNonLethal).keys()].map(x => x++);
      await Promise.all(fightingFishIdsNonLethal.map(async index => {
        const tokenId = await FishFight.readFightingWatersNonLethal.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
          
      }));

      // load all user breeding and concat them
      const stakedBreedFishUserOwns = await FishFight.readBreedingWaters.methods.balanceOf(account).call();
      const numUserBreedingFish = web3.utils.toBN(stakedBreedFishUserOwns).toNumber();
      const breedingFishIds = [...Array(numUserBreedingFish).keys()].map(x => x++);
      await Promise.all(breedingFishIds.map(async index => {
        const tokenId = await FishFight.readBreedingWaters.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
      }));

      setLoadingUserFish(false);

    } catch (error) {
      console.log("Error loading Fish tokens owned by account: ")
      console.log(error)
    }
  }

  const fetchFightingFish = async (startIndex?: number) => {
    const fightingWatersAddress = FishFight.readFightingWaters.options.address
    try {
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let fightingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, fightingWatersAddress, FishFight.readFishFactory.options.address).call()
      fightingFishIds = [...new Set(fightingFishIds)].filter((val) => {
        return val !== '0';
      });

      await Promise.all(fightingFishIds.map(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!fightingFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addFightingFishById(parsedTokenId)
        }
      }));

      setFightingFishIndex(fightingFishIds.length)
      setLoadingFish(false);
    } catch (error) {
      console.log("Error Fighting Fish: ")
      console.log(error)
    }
  }

  const fetchFightingFishWeak = async (startIndex?: number) => {
    const fightingWatersAddressWeak = FishFight.readFightingWatersWeak.options.address
    try {
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let fightingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, fightingWatersAddressWeak, FishFight.readFishFactory.options.address).call()
      fightingFishIds = [...new Set(fightingFishIds)].filter((val) => {
        return val !== '0';
      });

      await Promise.all(fightingFishIds.map(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!fightingFishWeak.some(fish => fish.tokenId === parsedTokenId)) {
          await addFightingFishWeakById(parsedTokenId)
        }
      }));

      setFightingFishWeakIndex(fightingFishIds.length)
      setLoadingFish(false);
    } catch (error) {
      console.log("Error Fighting Fish: ")
      console.log(error)
    }
  }

  const fetchFightingFishNonLethal = async (startIndex?: number) => {
    const fightingWatersAddressNonLethal = FishFight.readFightingWatersNonLethal.options.address
    try {
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let fightingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, fightingWatersAddressNonLethal, FishFight.readFishFactory.options.address).call()
      fightingFishIds = [...new Set(fightingFishIds)].filter((val) => {
        return val !== '0';
      });

      await Promise.all(fightingFishIds.map(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!fightingFishNonLethal.some(fish => fish.tokenId === parsedTokenId)) {
          await addFightingFishNonLethalById(parsedTokenId)
        }
      }));

      setFightingFishNonLethalIndex(fightingFishIds.length)
      setLoadingFish(false);
    } catch (error) {
      console.log("Error Fighting Fish NonLethal: ")
      console.log(error)
    }
  }

  const fetchBreedingFish = async (startIndex?: number) => {
    const breedingWatersAddress = FishFight.readBreedingWaters.options.address
    try {
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let breedingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, breedingWatersAddress, FishFight.readFishFactory.options.address).call()
      breedingFishIds = [...new Set(breedingFishIds)].filter((val) => {
        return val !== '0';
      });

      await Promise.all(breedingFishIds.map(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!breedingFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addBreedingFishById(parsedTokenId)
        }
      }));

      setBreedingFishIndex(breedingFishIds.length)
      setLoadingFish(false);
    } catch (error) {
      console.log("Error Breeding Fish: ")
      console.log(error)
    }
  }

  const createUserFish = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, web3.utils.toNumber(tokenId))
    if(fishData != null) {
      setUserFish(prevTokens => [...prevTokens, fishData])
      return fishData;
    }
    return null;
  };

  // Remove Burned Fish from all Fish arrays
  const fishBurned = (tokenId: number) => {
    setUserFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setFightingFishWeak(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setOceanFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const addUserFishById = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = true;
      setUserFish(prevTokens => [...prevTokens, fishData])
      if(fightingFish.some(fish => fish.tokenId === tokenId)) {
        setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
      } else if(breedingFish.some(fish => fish.tokenId === tokenId)) {
        setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
      }
    }
  };

  const addFightingFishById = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setFightingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addFightingFishWeakById = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setFightingFishWeak(prevTokens => [...prevTokens, fishData])
    }
  };

  const addFightingFishNonLethalById = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setFightingFishNonLethal(prevTokens => [...prevTokens, fishData])
    }
  };

  const addBreedingFishById = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setBreedingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const removeFightingFishById = (tokenId: number) => {
    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeFightingFishWeakById = (tokenId: number) => {
    setFightingFishWeak(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeFightingFishNonLethalById = (tokenId: number) => {
    setFightingFishNonLethal(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeBreedingFishById = (tokenId: number) => {
    setBreedingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const refreshFish = async (tokenId: number, isFighting?: boolean, isBreeding?: boolean) =>  {
    const fishData = await buildFish(FishFight, tokenId);

    if(fishData == null) { // fish dies or no longer exists
      fishBurned(tokenId);
      return null;
    };

    if(userFish.some(fish => fish.tokenId === tokenId)) {
      fishData.isUser = true;
      setUserFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFish.some(fish => fish.tokenId === tokenId)) {
      setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFishWeak.some(fish => fish.tokenId === tokenId)) {
      setFightingFishWeak(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFishNonLethal.some(fish => fish.tokenId === tokenId)) {
      setFightingFishNonLethal(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(breedingFish.some(fish => fish.tokenId === tokenId)) {
      setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(oceanFish.some(fish => fish.tokenId === tokenId)) {
      setOceanFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    return fishData;
  }


	const refreshLoadedFish = async () => {
    let allFish = userFish.concat(fightingFish).concat(breedingFish).concat(oceanFish);
    allFish = [...new Set(allFish)];
    setLoadingFish(true);
		await Promise.all(allFish.map(async (fish) => {
      await refreshFish(fish.tokenId)
    }));
    setLoadingFish(false);
	};

	const value: FishPoolProviderContext = {
		userFish: userFish,
    oceanFish: oceanFish,
    fightingFish: fightingFish,
    fightingFishWeak: fightingFishWeak,
    fightingFishNonLethal: fightingFishNonLethal,
    breedingFish: breedingFish,
    userFishIndex: userFishIndex,
    oceanFishIndex: oceanFishIndex,
    breedingFishIndex: breedingFishIndex,
    fightingFishIndex: fightingFishIndex,
    loadingFish: loadingFish,
    loadingUserFish: loadingUserFish,
    refreshFish: refreshFish,
    createUserFish: createUserFish,
    fetchOceanFish: fetchOceanFish,
    fetchUserFish: fetchUserFish,
    fetchFightingFish: fetchFightingFish,
    fetchBreedingFish: fetchBreedingFish,
    refreshLoadedFish: refreshLoadedFish,
    loadMoreFish: loadMoreFish,
	};

	return <FishPoolContext.Provider value={value}>{children}</FishPoolContext.Provider>;
};

// useFishFight
export const useFishPool = () => {
	const context = useContext(FishPoolContext);

	if (!context) {
		// eslint-disable-next-line no-throw-literal
		throw 'useFishFight must be used within a FishFightProvider';
	}
	return context;
};


// Utility Functions

const buildFish = async (fishFightInstance: FishFight, tokenId: number, isParent?: boolean) => {
  const contractCallContext: ContractCallContext[] = [
    {
      reference: 'fishFactory',
      contractAddress: Contracts.contracts.FishFactory.address,
      abi: Contracts.contracts.FishFactory.abi,
      calls: [{ reference: 'fishData', methodName: 'getFishInfo', methodParameters: [tokenId] },
      { reference: 'fishTokenUri', methodName: 'tokenURI', methodParameters: [tokenId] }
      ]
    },
    {
      reference: 'fishStats',
      contractAddress: fishFightInstance.readFishStats.options.address,
      abi: Contracts.contracts.FishStats.abi,
      calls: [{ reference: 'fishStats', methodName: 'getFishModifiers', methodParameters: [tokenId] },
      { reference: 'fishFights', methodName: 'getFishFights', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWaters',
      contractAddress: fishFightInstance.readFightingWaters.options.address,
      abi: Contracts.contracts.FightingWaters.abi,
      calls: [{ reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWatersWeak',
      contractAddress: fishFightInstance.readFightingWatersWeak.options.address,
      abi: Contracts.contracts.FightingWatersWeak.abi,
      calls: [{ reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWatersNonLethal',
      contractAddress: fishFightInstance.readFightingWatersNonLethal.options.address,
      abi: Contracts.contracts.FightingWatersNonLethal.abi,
      calls: [{ reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'breedingWaters',
      contractAddress: fishFightInstance.readBreedingWaters.options.address,
      abi: Contracts.contracts.BreedingWaters.abi,
      calls: [{ reference: 'fishStakedBreedData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    }
  ];

  const results: ContractCallResults = await fishFightInstance.multicall.call(contractCallContext);
  const fishFactoryGetFishInfo = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues : null;
  const fishFactoryTokenUri = results.results.fishFactory.callsReturnContext[1].success ? results.results.fishFactory.callsReturnContext[1].returnValues[0] : null;
  let imgSrc = null;
  if(fishFactoryTokenUri) {
    imgSrc = `${fishFactoryTokenUri}.png`
  }
  const fishStatsGetFishModifiers = results.results.fishStats.callsReturnContext[0].success ? results.results.fishStats.callsReturnContext[0].returnValues : null;
  // const fishStatsGetFights = results.results.fishStats.callsReturnContext[1].success ? results.results.fishStats.callsReturnContext[1].returnValues : null;
  const fightingWatersGetPoolInfo = results.results.fightingWaters.callsReturnContext[0].success ? results.results.fightingWaters.callsReturnContext[0].returnValues : null;
  const fightingWatersWeakGetPoolInfo = results.results.fightingWatersWeak.callsReturnContext[0].success ? results.results.fightingWatersWeak.callsReturnContext[0].returnValues : null;
  const fightingWatersNonLethalGetPoolInfo = results.results.fightingWatersNonLethal.callsReturnContext[0].success ? results.results.fightingWatersNonLethal.callsReturnContext[0].returnValues : null;
  const breedingWatersGetPoolInfo = results.results.breedingWaters.callsReturnContext[0].success ? results.results.breedingWaters.callsReturnContext[0].returnValues : null;

  if(fishFactoryGetFishInfo == null) return null;
  let fishInfo = {
    tokenId: fishFactoryGetFishInfo[0].hex,
    birthTime: fishFactoryGetFishInfo[1].hex,
    parentA: fishFactoryGetFishInfo[2].hex,
    parentB: fishFactoryGetFishInfo[3].hex,
    deathTime: fishFactoryGetFishInfo[4].hex,
    revived: fishFactoryGetFishInfo[5],
    generation: fishFactoryGetFishInfo[6],
    lifetimeWins: fishFactoryGetFishInfo[7],
    strength: fishFactoryGetFishInfo[8],
    intelligence: fishFactoryGetFishInfo[9],
    agility: fishFactoryGetFishInfo[10],
    fishType: fishFactoryGetFishInfo[11],
    rarity: fishFactoryGetFishInfo[12],
    genes: fishFactoryGetFishInfo[13],
    breedKey: fishFactoryGetFishInfo[14],
    offspring: fishFactoryGetFishInfo[15],
    ipfsLink: fishFactoryTokenUri
  }

  if(fishStatsGetFishModifiers == null) return null;

  const fish = new Fish(fishInfo, fishStatsGetFishModifiers, imgSrc, fishFactoryTokenUri)

  if(fightingWatersGetPoolInfo != null) {
    fish.stakedFighting = {
      earnedFishFood: web3.utils.fromWei(fightingWatersGetPoolInfo[0].hex),
      lockedExpire: web3.utils.toNumber(fightingWatersGetPoolInfo[2].hex),
      poolType: 0
    }
  }
  if(fightingWatersWeakGetPoolInfo != null) {
    fish.stakedFighting = {
      earnedFishFood: web3.utils.fromWei(fightingWatersWeakGetPoolInfo[0].hex),
      lockedExpire: web3.utils.toNumber(fightingWatersWeakGetPoolInfo[2].hex),
      poolType: 1
    }
  }
  if(fightingWatersNonLethalGetPoolInfo != null) {
    fish.stakedFighting = {
      earnedFishFood: web3.utils.fromWei(fightingWatersNonLethalGetPoolInfo[0].hex),
      lockedExpire: web3.utils.toNumber(fightingWatersNonLethalGetPoolInfo[2].hex),
      poolType: 2
    }
  }
  if(breedingWatersGetPoolInfo != null) {
    fish.stakedBreeding = {
      earnedFishFood: web3.utils.fromWei(breedingWatersGetPoolInfo[0].hex),
    }
  }
  // if(fishStatsGetFights != null) {

  //   const deathFightData = await Promise.all(fishStatsGetFights.map(async fight => {
  //     console.log(fight)
  //     const fightId = web3.utils.toNumber(fight[1].hex);
  //     console.log(fightId)
  //     const result = await fishFightInstance.readFightComputation.methods.getFightInfo(fightId).call();
  //     const fightHistory = {
  //       address: fight[0],
  //       fightId: fightId,
  //       result: result
  //     }
  //     return fightHistory
  //   }))
  //   fish.fightingHistory = deathFightData;
  // }

  if(fish.parentA > 0 && !isParent) {
    fish.parentAFish = await buildFish(fishFightInstance, fish.parentA, true);
    fish.parentBFish = await buildFish(fishFightInstance, fish.parentB, true);
  }

  return fish;
}
