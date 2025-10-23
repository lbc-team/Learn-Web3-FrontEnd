// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Token
 * @dev Simple ERC20 token for DeFi DApp teaching platform
 */
contract Token is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from specific address (requires allowance)
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
