// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TokenBank} from "../src/TokenBank.sol";
import {Web3FrontEndToken} from "../src/Web3FrontEndToken.sol";

contract TokenBankTest is Test {
    TokenBank public bank;
    Web3FrontEndToken public token;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant MINT_AMOUNT = 1000 * 10**18;
    uint256 constant DEPOSIT_AMOUNT = 500 * 10**18;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        // Deploy token
        token = new Web3FrontEndToken();

        // Deploy bank with token address
        bank = new TokenBank(address(token));

        // Mint tokens for users
        vm.prank(user1);
        token.mint(MINT_AMOUNT);

        vm.prank(user2);
        token.mint(MINT_AMOUNT);
    }

    function test_Constructor() public {
        assertEq(bank.token(), address(token));
        assertEq(bank.totalDeposits(), 0);
    }

    function test_Deposit() public {
        // Approve bank to spend tokens
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);

        // Deposit tokens
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        // Check balances
        assertEq(bank.deposits(user1), DEPOSIT_AMOUNT);
        assertEq(bank.totalDeposits(), DEPOSIT_AMOUNT);
        assertEq(token.balanceOf(user1), MINT_AMOUNT - DEPOSIT_AMOUNT);
        assertEq(token.balanceOf(address(bank)), DEPOSIT_AMOUNT);
    }

    function test_DepositMultipleUsers() public {
        // User1 deposits
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        // User2 deposits
        vm.prank(user2);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user2);
        bank.deposit(DEPOSIT_AMOUNT);

        // Check balances
        assertEq(bank.deposits(user1), DEPOSIT_AMOUNT);
        assertEq(bank.deposits(user2), DEPOSIT_AMOUNT);
        assertEq(bank.totalDeposits(), DEPOSIT_AMOUNT * 2);
    }

    function test_DepositMultipleTimes() public {
        uint256 firstDeposit = 300 * 10**18;
        uint256 secondDeposit = 200 * 10**18;

        // First deposit
        vm.prank(user1);
        token.approve(address(bank), firstDeposit);
        vm.prank(user1);
        bank.deposit(firstDeposit);

        // Second deposit
        vm.prank(user1);
        token.approve(address(bank), secondDeposit);
        vm.prank(user1);
        bank.deposit(secondDeposit);

        assertEq(bank.deposits(user1), firstDeposit + secondDeposit);
        assertEq(bank.totalDeposits(), firstDeposit + secondDeposit);
    }

    function test_DepositFailsWithZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(TokenBank.InvalidAmount.selector);
        bank.deposit(0);
    }

    function test_DepositFailsWithoutApproval() public {
        vm.prank(user1);
        vm.expectRevert(TokenBank.TransferFailed.selector);
        bank.deposit(DEPOSIT_AMOUNT);
    }

    function test_Withdraw() public {
        // Setup: deposit first
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        uint256 withdrawAmount = 200 * 10**18;

        // Withdraw
        vm.prank(user1);
        bank.withdraw(withdrawAmount);

        // Check balances
        assertEq(bank.deposits(user1), DEPOSIT_AMOUNT - withdrawAmount);
        assertEq(bank.totalDeposits(), DEPOSIT_AMOUNT - withdrawAmount);
        assertEq(token.balanceOf(user1), MINT_AMOUNT - DEPOSIT_AMOUNT + withdrawAmount);
    }

    function test_WithdrawAll() public {
        // Setup: deposit first
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        // Withdraw all
        vm.prank(user1);
        bank.withdraw(DEPOSIT_AMOUNT);

        // Check balances
        assertEq(bank.deposits(user1), 0);
        assertEq(bank.totalDeposits(), 0);
        assertEq(token.balanceOf(user1), MINT_AMOUNT);
        assertEq(token.balanceOf(address(bank)), 0);
    }

    function test_WithdrawFailsWithZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(TokenBank.InvalidAmount.selector);
        bank.withdraw(0);
    }

    function test_WithdrawFailsWithInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert(TokenBank.InsufficientBalance.selector);
        bank.withdraw(DEPOSIT_AMOUNT);
    }

    function test_WithdrawFailsWhenExceedsDeposit() public {
        // Setup: deposit first
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        // Try to withdraw more than deposited
        vm.prank(user1);
        vm.expectRevert(TokenBank.InsufficientBalance.selector);
        bank.withdraw(DEPOSIT_AMOUNT + 1);
    }

    function test_BalanceOf() public {
        assertEq(bank.balanceOf(user1), 0);

        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        assertEq(bank.balanceOf(user1), DEPOSIT_AMOUNT);
    }

    function test_GetBankBalance() public {
        assertEq(bank.getBankBalance(), 0);

        // User1 deposits
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        assertEq(bank.getBankBalance(), DEPOSIT_AMOUNT);

        // User2 deposits
        vm.prank(user2);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user2);
        bank.deposit(DEPOSIT_AMOUNT);

        assertEq(bank.getBankBalance(), DEPOSIT_AMOUNT * 2);
    }

    function test_EventEmission() public {
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);

        // Test Deposit event
        vm.expectEmit(true, false, false, true);
        emit TokenBank.Deposit(user1, DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        // Test Withdraw event
        vm.expectEmit(true, false, false, true);
        emit TokenBank.Withdraw(user1, DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.withdraw(DEPOSIT_AMOUNT);
    }

    function test_DepositAndWithdrawWorkflow() public {
        uint256 initialBalance = token.balanceOf(user1);

        // 1. Approve and deposit
        vm.prank(user1);
        token.approve(address(bank), DEPOSIT_AMOUNT);
        vm.prank(user1);
        bank.deposit(DEPOSIT_AMOUNT);

        assertEq(token.balanceOf(user1), initialBalance - DEPOSIT_AMOUNT);
        assertEq(bank.deposits(user1), DEPOSIT_AMOUNT);

        // 2. Withdraw half
        uint256 withdrawAmount = DEPOSIT_AMOUNT / 2;
        vm.prank(user1);
        bank.withdraw(withdrawAmount);

        assertEq(token.balanceOf(user1), initialBalance - DEPOSIT_AMOUNT + withdrawAmount);
        assertEq(bank.deposits(user1), DEPOSIT_AMOUNT - withdrawAmount);

        // 3. Withdraw remaining
        vm.prank(user1);
        bank.withdraw(DEPOSIT_AMOUNT - withdrawAmount);

        assertEq(token.balanceOf(user1), initialBalance);
        assertEq(bank.deposits(user1), 0);
    }
}