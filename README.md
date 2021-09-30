FishFight.one : A NFT/Blockchain game

Harmony Hackathon submission: Harmony - Bridging TradFi to DeFi
### Cross-Chain with Trustless Bridge -
c. DeFi/NFT/DAO. Metamask, Web3.js, randomness opcode, FlyClient bridges vs rollups, BLS aggregated signatures
Project Proposal
FishFight.one is a casual but entertaining exploration of Blockchain Technologies, NFT Collectables and Play-2-Earn Mechanics, using the globally recognized framework of fishing to appear to a broad but mature audience.

Overview
This project is meant to be an easy on ramp for users to seamlessly start playing blockchain games. Compared to the market leader Axie Infinity, we aim to create an experience where users can start playing without high introductory costs and transaction fees. Players can still partake in a play-to-earn model that is popular in blockchain gaming but we’ve built the system to be more affordable than ever. The game is built upon the standard ERC721 NFT tokens and Harmony $ONE coin to power the in-game economy. Our initial prototype will allow users to start playing and earning with as little as 25 $ONE.
Crypto Game Resources
https://www.cryptoblades.io/CryptoBlades_Whitepaper.pdf
https://whitepaper.axieinfinity.com/

Game Setting:
FishFight takes place on a cold and icy moon around saturn. The players are meant to see what’s happening in this world from a swimming/flying drone that navigates the game area. Not much is known about this location by the players but over time, more and more details will be revealed.


High Level Objectives
Unity setup in React template
Smart Contract base (ERC721)
Interact with contracts in Unity
Front-end components
Multi-Wallet Connection
Simple Navigation Hub
Public/Owned Fish Selection Drawer
Standard Disclaimer
Home/Idle Screen
Fishing Screen
Ocean View
Fight View
Fish View
Back-end Components
Backend Server Rendering
Unity Based PNG/MP4 NFT rendering
Server Post-Mint NFT IPFS hosting
Server Post-Mint NFT metadata updating
Ecosystem Development
ERC721 Fish Tokens
Trading
Reselling
Updatable uri by contract
Fishing Minting Contract
Percentage Chance based minting
Lock % of fishing costs in Fishing Contract as Locked Fishing Costs
FishFighting Contract
Using Fish metadata to handle fight logic
Burn defeated fish
Lock defeated fish
Burn but mint DEAD version of your NFT
Update fish metadata post fight
Breeding Contract
Only allow breeding after winning 1 Fish Fight
Use metadata in the parent fish, to blend colors/stats
Create a revenue share between breeding fish, and public fish wishing to breed
$FISH exchange
Using the Locked Fishing costs, create an exchange rate for selling any FishFight $Fish based on how many fights it has won.
We’re avoiding the need for an ERC20 token at this time, because we can directly pay out of the contract we use to mint fish.
Tokens and interactions
Game Modes
There are a few ways to interact with the $Fish token NFT.
These interactions are meant to be easy to understand and straightforward for both crypto-natives and crypto-hesitant people. 

Fishing  
Fishing is meant to be as simple as it sounds.
During our initial launch to the Harmony Protocol Testnet there will be a 100% purchase option but this option may not remain in the full Mainnet launch.
Steps:
Select “Go Fishing”
Select Bait Fee
Confirm Transaction on Metamask/MathWallet/OneWallet
Wait for Fish to arrive on screen




Fighting 
Fighting is meant to be as simple as it sounds.
During our initial launch to the Harmony Protocol Testnet there will be a simple visual to illustrate how combat will be visualized. These visuals will be updated as we continue development towards Mainnet launch. Currently the fish fighting does not destroy the losing fish but the plan is to have several fishing modes, which will be more or less risk averse.
Steps:
Select “Fight Fish”
Select one of your “Owned Fish” to fight with
Select “Public Fish”
Select one of the “Public Fish” to fight with
Select “Fight Fish”
Confirm Transaction on Metamask/MathWallet/OneWallet
Wait for Fish Fight Results

Ocean View
The Ocean View Game mode is one of the non-gameplay modes in the game. Ocean view is intended to be a place to see either your fish or all public fish. It’s a kind of screensaver.

Steps: 
    Select “See Fish”
    Toggle Public or Private fish 
    Enjoy Ocean View


Fish View
The Fish View Game mode is another one of the non-gameplay modes in the game. Fish view is intended to be a place to see either your fish or all public fish. It’s a kind of screensaver.

Steps: 
Select “See Fish”  or “Fight Fish”
Select one of the Fish on the bottom tray 
View Fish specific metadata detail

ERC721 - $Fish Token (NFT)
Our $Fish token is a unique NFT that is “caught” by players (minted), they then gain ownership. The minting of a fish uses Harmony’s built in VRF function to determine randomness for the fish being caught. 


The mint function will take in a few parameters to also determine the fish minted: 

Mint Parameters
Fishing location
Certain fish can only be caught at certain locations
Current Locations:
Genesis Landing
Future Locations:
Betta Spot
Deep Ocean
Cost of Fishing
Any fish available at a fishing location can be caught at any cost.
Options:
Small Bait (extra-low chance)
Medium Bait (low chance)
Large Bait (medium chance)
Perfect Bait (100% chance)
Prerequisites
25 $ONE is all you need to get started with FishFight.one
Equipment: currently the game supplies everything needed to play but the option in the future to have items which the users could unlock to increase their fishing/breeding skills is an exciting viable option
Standard rod, Heavy rod, Single Use Net, Block-Time Lures, etc...

Fish Attributes
Fight Specific Attributes - These attributes are used to decide the outcome of fights
Strength
Intelligence
Agility
Visual Attributes - These are generated on mint and correspond to all $FISH attributes.
Which textures to use for which parts of a $FISH
Which colors are used for each parts of a $FISH 
Which unique visuals traits are used for special parts of a $FISH
Breeding Specific Attributes
Win Count
Challenger Count
Challenged Count
Breed Count
Additional Attributes
Fish Name
Fish Caught Date
Fish Type
Token ID


Technical Details
Project repos:

https://github.com/TrustlessTeam/FishFight
https://github.com/TrustlessTeam/FishFight-Unity
https://github.com/TrustlessTeam/FishFight-Server



Tech stack: React, Unity, Solidity, Harmony Protocol, hardat or truffle
Team/Contributors
Edd Norris - Developer
Isaac Schwab - Developer

Milestones
Hackathon Delivery:
Live on Harmony Protocol Testnet 
Fishing Minting
Ocean view of public fish
Basic Fighting visuals and contracts
Server side live NFT Minting.
All basic ERC721 Functionality

Q4 Delivery:
Live on Harmony Protocol Mainnet 
Breeding Policy
Upgrades to Fighting visuals and contracts.
Selling $FISH NFTs to the FishingPool Market
