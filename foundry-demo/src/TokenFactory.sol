// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for deploying ERC20 tokens automatically
 * Used by LaunchPad to create tokens for projects
 */
contract TokenFactory {
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialSupply
    );

    struct TokenInfo {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 createdAt;
    }

    // Array of all created tokens
    TokenInfo[] public tokens;

    // Mapping from creator to their tokens
    mapping(address => address[]) public creatorTokens;

    /**
     * @dev Create a new ERC20 token
     * @param name Token name
     * @param symbol Token symbol
     * @param decimals Token decimals (usually 18)
     * @param initialSupply Initial supply (will be minted to msg.sender)
     * @return tokenAddress Address of the newly created token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    ) external returns (address tokenAddress) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");

        // Deploy new token contract
        Token newToken = new Token(name, symbol, decimals, initialSupply);
        tokenAddress = address(newToken);

        // Transfer all tokens to the caller (msg.sender)
        // Tokens are minted to this contract (TokenFactory) by Token constructor
        IERC20(tokenAddress).transfer(msg.sender, initialSupply);

        // Transfer ownership to creator
        newToken.transferOwnership(msg.sender);

        // Record token info
        tokens.push(TokenInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            initialSupply: initialSupply,
            createdAt: block.timestamp
        }));

        creatorTokens[msg.sender].push(tokenAddress);

        emit TokenCreated(tokenAddress, msg.sender, name, symbol, initialSupply);
    }

    /**
     * @dev Get total number of tokens created
     */
    function getTokenCount() external view returns (uint256) {
        return tokens.length;
    }

    /**
     * @dev Get tokens created by a specific address
     */
    function getCreatorTokens(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }

    /**
     * @dev Get token info by index
     */
    function getTokenInfo(uint256 index) external view returns (TokenInfo memory) {
        require(index < tokens.length, "Index out of bounds");
        return tokens[index];
    }
}
