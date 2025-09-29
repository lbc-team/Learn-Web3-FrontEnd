// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Web3FrontEndToken} from "../src/Web3FrontEndToken.sol";

contract Web3FrontEndTokenScript is Script {
    Web3FrontEndToken public token;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        token = new Web3FrontEndToken();
        
        console.log("Web3FrontEndToken deployed to:", address(token));
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());
        console.log("Max supply:", token.MAX_SUPPLY());
        console.log("Max mint per address:", token.MAX_MINT_PER_ADDRESS());

        vm.stopBroadcast();
    }
}