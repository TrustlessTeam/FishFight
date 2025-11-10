// Contract addresses and ABIs for FishFight on Harmony
import contractsMain from '../contracts/contracts-main.json';
import contractsDefault from '../contracts/contracts.json';
import contractsTestnet from '../contracts/contracts-testnet.json';

// Use contracts.json as the primary source (has the updated contract addresses)
// contracts-main.json is the old deployment
// Priority: contracts.json > contracts-main.json (if mainnet) > contracts-testnet.json
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';

// Always prefer contracts.json if it has the contract, otherwise fall back
// This ensures we use the updated contract addresses (0xae6e9d43F9Cff1c294674165d24Cf83E45530f79)
const contracts = contractsDefault;

// Get contract from JSON files (uses existing setup)
function getContractFromJson(name: string) {
  // Try both structures: contracts.contracts[name] or contracts[name]
  const contractData = (contracts as any).contracts?.[name] || (contracts as any)[name];
  return contractData;
}

// Fishing Contract - use the one from contracts JSON files
const fishingWatersContract = getContractFromJson('FishingWaters');

// Log which contract is being used for debugging
if (typeof window !== 'undefined') {
  console.log('🎣 FishingWaters Contract:', {
    address: fishingWatersContract?.address || 'NOT FOUND',
    source: fishingWatersContract ? 'contracts.json' : 'fallback',
    hasABI: !!fishingWatersContract?.abi,
    abiLength: fishingWatersContract?.abi?.length || 0,
    usingFullABI: fishingWatersContract?.abi ? 'YES (from contracts.json)' : 'NO (using fallback)',
  });
  
  if (fishingWatersContract?.abi) {
    const functions = fishingWatersContract.abi.filter((f: any) => f.type === 'function').map((f: any) => f.name);
    console.log('📋 FishingWaters ABI Functions:', functions);
  }
}

export const FISHING_WATERS_ADDRESS = (fishingWatersContract?.address || '0x792113675A62b96Edfa43ab71FFE771D2c309E80') as `0x${string}`;

// Use ABI from contracts JSON files if available, otherwise use minimal ABI
export const FISHING_WATERS_ABI = (fishingWatersContract?.abi || [
  {
    inputs: [],
    name: 'goFishing',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: '_fishingPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: '_fishingPriceInPhase',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: '_fishingPriceFishFood',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'fishIndex', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'diceRoll', type: 'uint256' },
    ],
    name: 'FishingResult',
    type: 'event',
  },
]);

// Fish Factory Contract
const fishFactoryContract = getContractFromJson('FishFactory');
export const FISH_FACTORY_ADDRESS = (fishFactoryContract?.address || '0x542F534F89dB9ed6172Ef0EB5b4b5281A3633963') as `0x${string}`;

export const FISH_FACTORY_ABI = (fishFactoryContract?.abi || [
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: '_fishStatsCore',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'birthTime', type: 'uint256' },
      { internalType: 'uint32', name: 'generation', type: 'uint32' },
      { internalType: 'uint8', name: 'fishType', type: 'uint8' },
      { internalType: 'uint8', name: 'rarity', type: 'uint8' },
      { internalType: 'bytes', name: 'genes', type: 'bytes' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
    ],
    name: 'FishMinted',
    type: 'event',
  },
]);

// FishFood ERC20 Token
export const FISH_FOOD_ADDRESS = '0x81E9E682d2d7F016Ff7c3D17567Ee7511f29f653' as const;

export const FISH_FOOD_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
// Export contract data (adjust based on your actual contract structure)
export const CONTRACTS = contracts;

// Helper to get contract by name
export function getContract(name: string) {
  // The contracts JSON structure from your original app
  // You may need to adjust this based on the actual structure
  return getContractFromJson(name) || (contracts as any)[name];
}

// Cycles Contract (Season/Phase Management)
const cyclesContract = getContractFromJson('Cycles');
export const CYCLES_ADDRESS = (cyclesContract?.address || '0x941CdE05f282Dd55060ef876E91b885425cf0924') as `0x${string}`;

// Log Cycles contract info for debugging
if (typeof window !== 'undefined') {
  console.log('🔄 Cycles Contract:', {
    address: cyclesContract?.address || 'NOT FOUND',
    source: cyclesContract ? 'contracts.json' : 'fallback',
    hasABI: !!cyclesContract?.abi,
    abiLength: cyclesContract?.abi?.length || 0,
    usingFullABI: cyclesContract?.abi ? 'YES (from contracts.json)' : 'NO (using fallback)',
  });
  
  if (cyclesContract?.abi) {
    const functions = cyclesContract.abi.filter((f: any) => f.type === 'function').map((f: any) => f.name);
    console.log('📋 Cycles ABI Functions:', functions.slice(0, 30)); // Show first 30
  }
}

export const CYCLES_ABI = (cyclesContract?.abi || [
  {
    inputs: [],
    name: 'getCycle',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPhase',
    outputs: [
      { internalType: 'uint8', name: 'value', type: 'uint8' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'uint256', name: 'expires', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCycleCatches',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCycleFights',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCycleBreeds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isFishingPhase',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isFightingPhase',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isBreedingPhase',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPausedPhase',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: '_currentPhase',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: '_phaseEndTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: '_maxSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'checkLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerPhaseOverride',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, { internalType: 'address', name: 'account', type: 'address' }],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
]);

export default CONTRACTS;

