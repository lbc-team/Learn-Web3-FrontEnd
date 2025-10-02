// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TokenBank
 * @dev A bank contract that allows users to deposit and withdraw ERC20 tokens
 * Supports the Web3FrontEndToken at 0xa7d726B7F1085F943056C2fB91abE0204eC6d6DA
 */
contract TokenBank {
    // Token address
    address public immutable token;

    // Mapping to track deposits: user address => deposited amount
    mapping(address => uint256) public deposits;

    // Total tokens deposited in the bank
    uint256 public totalDeposits;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    // Errors
    error InvalidAmount();
    error InsufficientBalance();
    error TransferFailed();

    /**
     * @dev Constructor to set the token address
     * @param _token Address of the ERC20 token to be managed
     */
    constructor(address _token) {
        require(_token != address(0), "TokenBank: token is zero address");
        token = _token;
    }

    /**
     * @dev Deposit tokens into the bank
     * @param amount Amount of tokens to deposit
     *
     * Requirements:
     * - amount must be greater than 0
     * - user must have approved this contract to spend tokens
     * - user must have sufficient token balance
     */
    function deposit(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        // Update state before external call (Checks-Effects-Interactions pattern)
        deposits[msg.sender] += amount;
        totalDeposits += amount;

        // Transfer tokens from user to this contract
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount)
        );

        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert TransferFailed();
        }

        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Withdraw tokens from the bank
     * @param amount Amount of tokens to withdraw
     *
     * Requirements:
     * - amount must be greater than 0
     * - user must have sufficient deposited balance
     */
    function withdraw(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (deposits[msg.sender] < amount) revert InsufficientBalance();

        // Update state before external call (Checks-Effects-Interactions pattern)
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;

        // Transfer tokens from contract to user
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amount)
        );

        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert TransferFailed();
        }

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Get the deposited balance of a user
     * @param user Address of the user to query
     * @return The amount of tokens deposited by the user
     */
    function balanceOf(address user) external view returns (uint256) {
        return deposits[user];
    }

    /**
     * @dev Get the total token balance held by this contract
     * @return The total amount of tokens in the bank
     */
    function getBankBalance() external view returns (uint256) {
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );

        if (success && data.length > 0) {
            return abi.decode(data, (uint256));
        }

        return 0;
    }
}