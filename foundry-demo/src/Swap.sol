// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Swap (AMM with LP Token)
 * @dev Constant product AMM (x * y = k) similar to Uniswap V2
 * Features:
 * - Automatic LP token minting/burning
 * - Proportional liquidity add/remove
 * - 0.3% trading fee
 * - Minimum liquidity lock (first 1000 LP tokens burned to address(0))
 */
contract Swap is ERC20 {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public constant FEE_NUMERATOR = 3; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant MINIMUM_LIQUIDITY = 1000; // Burned on first liquidity

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swapped(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) ERC20("Swap LP Token", "SLP") {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token address");
        require(_tokenA != _tokenB, "Tokens must be different");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    /**
     * @dev Add liquidity to the pool
     * @param amountA Amount of tokenA to add
     * @param amountB Amount of tokenB to add
     * @return liquidity Amount of LP tokens minted
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidity) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        // Transfer tokens from user
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // First liquidity provider
            // Use geometric mean: sqrt(amountA * amountB)
            liquidity = sqrt(amountA * amountB);
            require(liquidity > MINIMUM_LIQUIDITY, "Insufficient initial liquidity");

            // Permanently lock the first MINIMUM_LIQUIDITY tokens to this contract
            // (OpenZeppelin ERC20 v5+ doesn't allow minting to address(0))
            _mint(address(this), MINIMUM_LIQUIDITY);
            liquidity -= MINIMUM_LIQUIDITY;
        } else {
            // Subsequent liquidity: mint proportional to existing pool
            // liquidity = min(amountA * totalSupply / reserveA, amountB * totalSupply / reserveB)
            uint256 liquidityA = (amountA * _totalSupply) / reserveA;
            uint256 liquidityB = (amountB * _totalSupply) / reserveB;
            liquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        // Mint LP tokens to user
        _mint(msg.sender, liquidity);

        // Update reserves
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Remove liquidity from the pool
     * @param liquidity Amount of LP tokens to burn
     * @return amountA Amount of tokenA returned
     * @return amountB Amount of tokenB returned
     */
    function removeLiquidity(uint256 liquidity) external returns (uint256 amountA, uint256 amountB) {
        require(liquidity > 0, "Invalid liquidity amount");

        uint256 _totalSupply = totalSupply();

        // Calculate proportional amounts: amount = liquidity * reserve / totalSupply
        amountA = (liquidity * reserveA) / _totalSupply;
        amountB = (liquidity * reserveB) / _totalSupply;

        require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");

        // Burn LP tokens from user
        _burn(msg.sender, liquidity);

        // Update reserves
        reserveA -= amountA;
        reserveB -= amountB;

        // Transfer tokens to user
        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Swap tokenA for tokenB or vice versa
     * @param tokenIn Address of input token
     * @param amountIn Amount of input token
     * @return amountOut Amount of output token
     */
    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "Invalid token");

        bool isTokenA = tokenIn == address(tokenA);

        (IERC20 inputToken, IERC20 outputToken, uint256 reserveIn, uint256 reserveOut) = isTokenA
            ? (tokenA, tokenB, reserveA, reserveB)
            : (tokenB, tokenA, reserveB, reserveA);

        // Calculate output amount with fee: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);

        require(amountOut > 0, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");

        // Transfer tokens
        inputToken.safeTransferFrom(msg.sender, address(this), amountIn);
        outputToken.safeTransfer(msg.sender, amountOut);

        // Update reserves
        if (isTokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        emit Swapped(msg.sender, tokenIn, amountIn, amountOut);
    }

    /**
     * @dev Get output amount for a given input (for preview)
     */
    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "Invalid token");

        bool isTokenA = tokenIn == address(tokenA);
        uint256 reserveIn = isTokenA ? reserveA : reserveB;
        uint256 reserveOut = isTokenA ? reserveB : reserveA;

        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
    }

    /**
     * @dev Get current reserves
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    /**
     * @dev Calculate square root (Babylonian method)
     * @param y Input value
     * @return z Square root of y
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
