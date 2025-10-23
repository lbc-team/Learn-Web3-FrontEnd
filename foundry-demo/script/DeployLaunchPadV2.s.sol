// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/LaunchPadV2.sol";

contract DeployLaunchPadV2 is Script {
    function run() external {
        // Read private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address tokenFactory = 0x27345a45c0cbd8e780650ae59DF8f18eb5aB376D;

        vm.startBroadcast(deployerPrivateKey);

        // Deploy LaunchPadV2
        LaunchPadV2 launchpad = new LaunchPadV2(tokenFactory);
        console.log("LaunchPadV2 deployed at:", address(launchpad));
        console.log("TokenFactory address:", tokenFactory);

        vm.stopBroadcast();
    }
}
