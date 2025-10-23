// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenFactory.sol";

contract DeployTokenFactory is Script {
    function run() external {
        // Read private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TokenFactory
        TokenFactory factory = new TokenFactory();
        console.log("TokenFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
