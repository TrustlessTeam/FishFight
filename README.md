# FishFight.one : A NFT/Blockchain game

## Video Demo
[Video Demo](https://youtu.be/Ymq9lgS3dsM)

## Testnet Link
[FishFight.ONE](https://fishfight.one/)
TESTNET Only

Harmony Hackathon submission: Harmony - Bridging TradFi to DeFi
## Cross-Chain with Trustless Bridge -
c. DeFi/NFT/DAO. Metamask, Web3.js, randomness opcode, FlyClient bridges vs rollups, BLS aggregated signatures

### **Project Proposal**
FishFight.one is a casual but entertaining exploration of Blockchain Technologies, NFT Collectables and Play-2-Earn Mechanics, using the globally recognized framework of fishing to appear to a broad but mature audience.

### **Overview**
This project is meant to be an easy on ramp for users to seamlessly start playing blockchain games. Compared to the market leader Axie Infinity, we aim to create an experience where users can start playing without high introductory costs and transaction fees. Players can still partake in a play-to-earn model that is popular in blockchain gaming but we’ve built the system to be more affordable than ever. The game is built upon the standard ERC721 NFT tokens and Harmony $ONE coin to power the in-game economy. Our initial prototype will allow users to start playing and earning with as little as 25 $ONE.

### **Crypto Game Resources**
https://www.cryptoblades.io/CryptoBlades_Whitepaper.pdf
https://whitepaper.axieinfinity.com/

### **Game Setting:**
FishFight takes place on a cold and icy moon around saturn. The players are meant to see what’s happening in this world from a swimming/flying drone that navigates the game area. Not much is known about this location by the players but over time, more and more details will be revealed.


## **High Level Objectives**
1. Unity setup in React template
2. Smart Contract base (ERC721)
3. Interact with contracts in Unity
### Front-end components
1. Multi-Wallet Connection
2. Simple Navigation Hub
3. Public/Owned Fish Selection Drawer
4. Standard Disclaimer
5. Home/Idle Screen
6. Fishing Screen
7. Ocean View
8. Fight View
9. Fish View
### Back-end Components
1. Backend Server Rendering
2. Unity Based PNG/MP4 NFT rendering
3. Server Post-Mint NFT IPFS hosting
4. Server Post-Mint NFT metadata updating
### Ecosystem Development
#### ERC721 Fish Tokens
1. Trading
2. Reselling
3. Updatable uri by contract
#### Fishing Minting Contract
1. Percentage Chance based minting
2. Lock % of fishing costs in Fishing Contract as Locked Fishing Costs
#### FishFighting Contract
1. Using Fish metadata to handle fight logic
2. Burn defeated fish
3. Lock defeated fish
4. Burn but mint DEAD version of your NFT
5. Update fish metadata post fight
#### Breeding Contract (unavialable on testnet)
1. Only allow breeding after winning 1 Fish Fight
2. Use metadata in the parent fish, to blend colors/stats
3. Create a revenue share between breeding fish, and public fish wishing to breed
#### $FISH exchange
1. Using the Locked Fishing costs, create an exchange rate for selling any FishFight $Fish based on how many fights it has won.
2. We’re avoiding the need for an ERC20 token at this time, because we can directly pay out of the contract we use to mint fish.

## Tokens and interactions

### Game Modes
There are a few ways to interact with the $Fish token NFT.
These interactions are meant to be easy to understand and straightforward for both crypto-natives and crypto-hesitant people. 

#### Fishing  
Fishing is meant to be as simple as it sounds.
During our initial launch to the Harmony Protocol Testnet there will be a 100% purchase option but this option may not remain in the full Mainnet launch.
#### Steps:
1. Select “Go Fishing”
2. Select Bait Fee
3. Confirm Transaction on Metamask/MathWallet/OneWallet
4. Wait for Fish to arrive on screen




#### Fighting 
Fighting is meant to be as simple as it sounds.
During our initial launch to the Harmony Protocol Testnet there will be a simple visual to illustrate how combat will be visualized. These visuals will be updated as we continue development towards Mainnet launch. Currently the fish fighting does not destroy the losing fish but the plan is to have several fishing modes, which will be more or less risk averse.
#### Steps:
1. Select “Fight Fish”
2. Select one of your “Owned Fish” to fight with
3. Select “Public Fish”
4. Select one of the “Public Fish” to fight with
5. Select “Fight Fish”
6. Confirm Transaction on Metamask/MathWallet/OneWallet
7. Wait for Fish Fight Results

#### Ocean View
The Ocean View Game mode is one of the non-gameplay modes in the game. Ocean view is intended to be a place to see either your fish or all public fish. It’s a kind of screensaver.

#### Steps: 
1. Select “See Fish”
2. Toggle Public or Private fish 
3. Enjoy Ocean View


#### Fish View
The Fish View Game mode is another one of the non-gameplay modes in the game. Fish view is intended to be a place to see either your fish or all public fish. It’s a kind of screensaver.

#### Steps: 
1. Select “See Fish”  or “Fight Fish”
2. Select one of the Fish on the bottom tray 
3. View Fish specific metadata detail

### ERC721 - $Fish Token (NFT)
Our $Fish token is a unique NFT that is “caught” by players (minted), they then gain ownership. The minting of a fish uses Harmony’s built in VRF function to determine randomness for the fish being caught. 


The mint function will take in a few parameters to also determine the fish minted: 

#### Mint Parameters
##### Fishing location
1. Certain fish can only be caught at certain locations
##### Current Locations:
1. Genesis Landing
##### Future Locations:
1. Betta Spot
2. Deep Ocean
#### Cost of Fishing
1. Any fish available at a fishing location can be caught at any cost.
#### Options:
1. Small Bait (extra-low chance)
2. Medium Bait (low chance)
3. Large Bait (medium chance)
4. Perfect Bait (100% chance)
#### Prerequisites
1. 25 $ONE is all you need to get started with FishFight.one
#### Equipment:
currently the game supplies everything needed to play but the option in the future to have items which the users could unlock to increase their fishing/breeding skills is an exciting viable option
1. Standard rod
2. Heavy rod
3. Single Use Net
4. Block-Time Lures

### Fish Attributes
#### Fight Specific Attributes - These attributes are used to decide the outcome of fights
1. Strength
2. Intelligence
3. Agility

#### Visual Attributes - These are generated on mint and correspond to all $FISH attributes.
1. Which textures to use for which parts of a $FISH
2. Which colors are used for each parts of a $FISH 
3. Which unique visuals traits are used for special parts of a $FISH
#### Breeding Specific Attributes
1. Win Count
2. Challenger Count
3. Challenged Count
4. Breed Count
#### Additional Attributes
1. Fish Name
2. Fish Caught Date
3. Fish Type
4. Token ID


### Technical Details
#### Project repos:

1. https://github.com/TrustlessTeam/FishFight
2. https://github.com/TrustlessTeam/FishFight-Unity
3. https://github.com/TrustlessTeam/FishFight-Server



#### Tech stack:
1. React
2. Unity
3. Solidity
4. Harmony Protocol
5. hardat/truffle

### Team/Contributors
#### Edd Norris (github - @twobitEDD twitter - @EddNorris ) - Developer
#### Isaac Schwab (github - @isaacSchwab twitter - @DevSchwab )  - Developer

### Milestones
#### Hackathon Delivery:
1. Live on Harmony Protocol Testnet 
2. Fishing Minting
3. Ocean view of public fish
4. Basic Fighting visuals and contracts
5. Server side live NFT Minting.
6. All basic ERC721 Functionality

#### Q4 Delivery:
1. Live on Harmony Protocol Mainnet 
2. Breeding Policy
3. Upgrades to Fighting visuals and contracts.
4. Selling $FISH NFTs to the FishingPool Market

### Work in progress.
#### Known Issues:
1. Once loaded connect account before clicking the Catch fish button.
2. Routes do not reload on page refresh.
3. The backend server that renders static metadata has been hit or miss, so fish images along the bottom may not load until the meta data is successfully rendered.
