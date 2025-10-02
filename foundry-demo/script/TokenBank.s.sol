// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {TokenBank} from "../src/TokenBank.sol";

contract TokenBankScript is Script {
    TokenBank public bank;

    // Web3FrontEndToken address on Sepolia
    address constant TOKEN_ADDRESS = 0xa7d726B7F1085F943056C2fB91abE0204eC6d6DA;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        bank = new TokenBank(TOKEN_ADDRESS);

        console.log("TokenBank deployed to:", address(bank));
        console.log("Managing token at:", bank.token());
        console.log("Total deposits:", bank.totalDeposits());

        vm.stopBroadcast();
    }
}