// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/Swap.sol";
import "../src/StakePool.sol";
import "../src/Farm.sol";
import "../src/LaunchPad.sol";

/**
 * @title Deploy
 * @dev Deployment script for all DeFi DApp contracts
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Token contracts
        console.log("Deploying Token contracts...");

        Token rewardToken = new Token(
            "DeFi Reward Token",
            "DRT",
            18,
            1000000 * 10**18 // 1M initial supply
        );
        console.log("RewardToken deployed at:", address(rewardToken));

        Token tokenA = new Token(
            "Token A",
            "TKA",
            18,
            1000000 * 10**18
        );
        console.log("TokenA deployed at:", address(tokenA));

        Token tokenB = new Token(
            "Token B",
            "TKB",
            18,
            1000000 * 10**18
        );
        console.log("TokenB deployed at:", address(tokenB));

        Token paymentToken = new Token(
            "USD Coin",
            "USDC",
            6,
            1000000 * 10**6 // 1M USDC with 6 decimals
        );
        console.log("PaymentToken (USDC) deployed at:", address(paymentToken));

        // Deploy Swap
        console.log("\nDeploying Swap contract...");
        Swap swap = new Swap(address(tokenA), address(tokenB));
        console.log("Swap deployed at:", address(swap));

        // Deploy StakePool
        console.log("\nDeploying StakePool contract...");
        StakePool stakePool = new StakePool(
            address(tokenA), // Staking token
            address(rewardToken), // Reward token
            1 * 10**18 // 1 token per second reward rate
        );
        console.log("StakePool deployed at:", address(stakePool));

        // Deploy Farm
        console.log("\nDeploying Farm contract...");
        Farm farm = new Farm(
            address(rewardToken),
            1 * 10**18 // 1 token per second
        );
        console.log("Farm deployed at:", address(farm));

        // Deploy LaunchPad
        console.log("\nDeploying LaunchPad contract...");
        LaunchPad launchPad = new LaunchPad();
        console.log("LaunchPad deployed at:", address(launchPad));

        vm.stopBroadcast();

        // Print summary
        console.log("\n=== Deployment Summary ===");
        console.log("RewardToken:", address(rewardToken));
        console.log("TokenA:", address(tokenA));
        console.log("TokenB:", address(tokenB));
        console.log("PaymentToken:", address(paymentToken));
        console.log("Swap:", address(swap));
        console.log("StakePool:", address(stakePool));
        console.log("Farm:", address(farm));
        console.log("LaunchPad:", address(launchPad));
        console.log("\nCopy these addresses to your .env.local file:");
        console.log("NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=%s", address(rewardToken));
        console.log("NEXT_PUBLIC_TOKEN_A_ADDRESS=%s", address(tokenA));
        console.log("NEXT_PUBLIC_TOKEN_B_ADDRESS=%s", address(tokenB));
        console.log("NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=%s", address(paymentToken));
        console.log("NEXT_PUBLIC_SWAP_ADDRESS=%s", address(swap));
        console.log("NEXT_PUBLIC_STAKE_POOL_ADDRESS=%s", address(stakePool));
        console.log("NEXT_PUBLIC_FARM_ADDRESS=%s", address(farm));
        console.log("NEXT_PUBLIC_LAUNCHPAD_ADDRESS=%s", address(launchPad));
    }
}
