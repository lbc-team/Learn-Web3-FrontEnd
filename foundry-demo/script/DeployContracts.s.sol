// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Swap.sol";
import "../src/StakePool.sol";
import "../src/Farm.sol";
import "../src/LaunchPad.sol";

/**
 * @title DeployContracts
 * @dev 使用已部署的 Token 合约部署业务合约
 */
contract DeployContracts is Script {
    // 新部署的 Token 地址 (使用正确的 checksum)
    address constant REWARD_TOKEN = 0xb09c7d0757Ed382E2E0F03477671307Dcf7cC30E;
    address constant TOKEN_A = 0x8a88b830915AEA048Ebf8340ACa47E21b8E342B4;
    address constant TOKEN_B = 0x2b79645f2Be73db5C001397BA261489DD5D25294;
    address constant PAYMENT_TOKEN = 0x2d6BF73e7C3c48Ce8459468604fd52303A543dcD;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Swap
        console.log("Deploying Swap contract...");
        Swap swap = new Swap(TOKEN_A, TOKEN_B);
        console.log("Swap deployed at:", address(swap));

        // Deploy StakePool
        console.log("\nDeploying StakePool contract...");
        StakePool stakePool = new StakePool(
            TOKEN_A, // Staking token
            REWARD_TOKEN, // Reward token
            1 * 10**18 // 1 token per second reward rate
        );
        console.log("StakePool deployed at:", address(stakePool));

        // Deploy Farm
        console.log("\nDeploying Farm contract...");
        Farm farm = new Farm(
            REWARD_TOKEN,
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
        console.log("RewardToken (DRT):", REWARD_TOKEN);
        console.log("TokenA (TKA):", TOKEN_A);
        console.log("TokenB (TKB):", TOKEN_B);
        console.log("PaymentToken (USDC):", PAYMENT_TOKEN);
        console.log("Swap:", address(swap));
        console.log("StakePool:", address(stakePool));
        console.log("Farm:", address(farm));
        console.log("LaunchPad:", address(launchPad));

        console.log("\nCopy these addresses to .env.local:");
        console.log("NEXT_PUBLIC_SWAP_ADDRESS=%s", address(swap));
        console.log("NEXT_PUBLIC_STAKE_POOL_ADDRESS=%s", address(stakePool));
        console.log("NEXT_PUBLIC_FARM_ADDRESS=%s", address(farm));
        console.log("NEXT_PUBLIC_LAUNCHPAD_ADDRESS=%s", address(launchPad));
    }
}
