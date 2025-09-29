// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Web3FrontEndToken} from "../src/Web3FrontEndToken.sol";

contract Web3FrontEndTokenTest is Test {
    Web3FrontEndToken public token;
    address public owner;
    address public user1;
    address public user2;
    
    uint256 constant MAX_SUPPLY = 100_000_000 * 10**18;
    uint256 constant MAX_MINT_PER_ADDRESS = 10_000 * 10**18;
    
    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        token = new Web3FrontEndToken();
    }
    
    function test_InitialState() public {
        assertEq(token.name(), "Web3FrontEndToken");
        assertEq(token.symbol(), "W3FET");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), owner);
        assertEq(token.MAX_SUPPLY(), MAX_SUPPLY);
        assertEq(token.MAX_MINT_PER_ADDRESS(), MAX_MINT_PER_ADDRESS);
    }
    
    function test_Mint() public {
        uint256 mintAmount = 1000 * 10**18; // 1000 tokens
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.totalSupply(), mintAmount);
        assertEq(token.mintedByAddress(user1), mintAmount);
    }
    
    function test_MintMaxPerAddress() public {
        vm.prank(user1);
        token.mint(MAX_MINT_PER_ADDRESS);
        
        assertEq(token.balanceOf(user1), MAX_MINT_PER_ADDRESS);
        assertEq(token.mintedByAddress(user1), MAX_MINT_PER_ADDRESS);
        assertEq(token.remainingMintAmount(user1), 0);
    }
    
    function test_MintFailsWhenExceedingPerAddressLimit() public {
        vm.startPrank(user1);
        token.mint(MAX_MINT_PER_ADDRESS);
        
        vm.expectRevert("Would exceed max mint per address");
        token.mint(1);
        vm.stopPrank();
    }
    
    function test_MintFailsWhenExceedingMaxSupply() public {
        // Create many users to mint close to max supply
        uint256 numUsers = MAX_SUPPLY / MAX_MINT_PER_ADDRESS;
        
        for (uint256 i = 1; i <= numUsers; i++) {
            address user = address(uint160(i));
            vm.prank(user);
            token.mint(MAX_MINT_PER_ADDRESS);
        }
        
        // Try to mint more than remaining supply
        vm.prank(user1);
        vm.expectRevert("Would exceed max supply");
        token.mint(1);
    }
    
    function test_MintFailsWithZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert("Amount must be greater than 0");
        token.mint(0);
    }
    
    function test_MultipleUsers() public {
        uint256 mintAmount = 5000 * 10**18; // 5000 tokens each
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        vm.prank(user2);
        token.mint(mintAmount);
        
        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.balanceOf(user2), mintAmount);
        assertEq(token.totalSupply(), mintAmount * 2);
    }
    
    function test_RemainingMintAmount() public {
        uint256 mintAmount = 3000 * 10**18; // 3000 tokens
        
        assertEq(token.remainingMintAmount(user1), MAX_MINT_PER_ADDRESS);
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        assertEq(token.remainingMintAmount(user1), MAX_MINT_PER_ADDRESS - mintAmount);
    }
    
    function test_RemainingSupply() public {
        uint256 mintAmount = 1000 * 10**18; // 1000 tokens
        
        assertEq(token.remainingSupply(), MAX_SUPPLY);
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        assertEq(token.remainingSupply(), MAX_SUPPLY - mintAmount);
    }
    
    function test_BurnOnlyOwner() public {
        uint256 mintAmount = 1000 * 10**18; // 1000 tokens
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        // Transfer to owner
        vm.prank(user1);
        token.transfer(owner, mintAmount);
        
        // Owner can burn
        token.burn(mintAmount);
        assertEq(token.balanceOf(owner), 0);
        assertEq(token.totalSupply(), 0);
    }
    
    function test_BurnFailsForNonOwner() public {
        uint256 mintAmount = 1000 * 10**18; // 1000 tokens
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        vm.prank(user1);
        vm.expectRevert();
        token.burn(mintAmount);
    }
    
    function test_StandardERC20Functions() public {
        uint256 mintAmount = 1000 * 10**18; // 1000 tokens
        uint256 transferAmount = 500 * 10**18; // 500 tokens
        
        vm.prank(user1);
        token.mint(mintAmount);
        
        // Transfer
        vm.prank(user1);
        token.transfer(user2, transferAmount);
        
        assertEq(token.balanceOf(user1), mintAmount - transferAmount);
        assertEq(token.balanceOf(user2), transferAmount);
        
        // Approve and transferFrom
        vm.prank(user2);
        token.approve(user1, transferAmount);
        
        vm.prank(user1);
        token.transferFrom(user2, owner, transferAmount);
        
        assertEq(token.balanceOf(user2), 0);
        assertEq(token.balanceOf(owner), transferAmount);
    }
    
    function test_EventEmission() public {
        uint256 mintAmount = 1000 * 10**18; // 1000 tokens
        
        vm.expectEmit(true, true, false, true);
        emit Web3FrontEndToken.TokensMinted(user1, mintAmount);
        
        vm.prank(user1);
        token.mint(mintAmount);
    }
}