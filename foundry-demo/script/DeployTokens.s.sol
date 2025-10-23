// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RewardToken.sol";
import "../src/TokenA.sol";
import "../src/TokenB.sol";
import "../src/PaymentToken.sol";

contract DeployTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy all 4 tokens
        RewardToken rewardToken = new RewardToken();
        TokenA tokenA = new TokenA();
        TokenB tokenB = new TokenB();
        PaymentToken paymentToken = new PaymentToken();

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("=== Token Deployment Complete ===");
        console.log("RewardToken (DRT) deployed to:", address(rewardToken));
        console.log("TokenA (TKA) deployed to:", address(tokenA));
        console.log("TokenB (TKB) deployed to:", address(tokenB));
        console.log("PaymentToken (USDC) deployed to:", address(paymentToken));
    }
}
