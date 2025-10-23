// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LaunchPad
 * @dev Token sale platform for new token launches
 */
contract LaunchPad is Ownable {
    using SafeERC20 for IERC20;

    struct SaleInfo {
        IERC20 saleToken; // Token being sold
        IERC20 paymentToken; // Token used for payment (e.g., USDC)
        uint256 price; // Price per token (in payment token, scaled by 1e18)
        uint256 totalAmount; // Total tokens for sale
        uint256 soldAmount; // Tokens already sold
        uint256 startTime; // Sale start time
        uint256 endTime; // Sale end time
        uint256 minPurchase; // Minimum purchase amount
        uint256 maxPurchase; // Maximum purchase amount per user
        bool finalized; // Whether sale is finalized
    }

    SaleInfo public saleInfo;
    mapping(address => uint256) public purchased; // Amount purchased by each user
    mapping(address => uint256) public claimed; // Amount claimed by each user

    event SaleCreated(address indexed saleToken, address indexed paymentToken, uint256 totalAmount);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event SaleFinalized(uint256 totalSold, uint256 totalRaised);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new token sale (owner only)
     */
    function createSale(
        address _saleToken,
        address _paymentToken,
        uint256 _price,
        uint256 _totalAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) external onlyOwner {
        require(_saleToken != address(0), "Invalid sale token");
        require(_paymentToken != address(0), "Invalid payment token");
        require(_price > 0, "Invalid price");
        require(_totalAmount > 0, "Invalid total amount");
        require(_startTime < _endTime, "Invalid time range");
        require(_minPurchase <= _maxPurchase, "Invalid purchase limits");
        require(!_saleExists(), "Sale already exists");

        saleInfo = SaleInfo({
            saleToken: IERC20(_saleToken),
            paymentToken: IERC20(_paymentToken),
            price: _price,
            totalAmount: _totalAmount,
            soldAmount: 0,
            startTime: _startTime,
            endTime: _endTime,
            minPurchase: _minPurchase,
            maxPurchase: _maxPurchase,
            finalized: false
        });

        // Transfer sale tokens to contract
        IERC20(_saleToken).safeTransferFrom(msg.sender, address(this), _totalAmount);

        emit SaleCreated(_saleToken, _paymentToken, _totalAmount);
    }

    /**
     * @dev Buy tokens during sale
     */
    function buy(uint256 amount) external {
        SaleInfo storage sale = saleInfo;

        require(_saleExists(), "No active sale");
        require(block.timestamp >= sale.startTime, "Sale not started");
        require(block.timestamp <= sale.endTime, "Sale ended");
        require(!sale.finalized, "Sale finalized");
        require(amount >= sale.minPurchase, "Below minimum purchase");
        require(purchased[msg.sender] + amount <= sale.maxPurchase, "Exceeds maximum purchase");
        require(sale.soldAmount + amount <= sale.totalAmount, "Insufficient tokens available");

        uint256 cost = (amount * sale.price) / 1e18;

        // Transfer payment tokens from buyer
        sale.paymentToken.safeTransferFrom(msg.sender, address(this), cost);

        // Update purchase records
        purchased[msg.sender] += amount;
        sale.soldAmount += amount;

        emit TokensPurchased(msg.sender, amount, cost);
    }

    /**
     * @dev Claim purchased tokens after sale ends
     */
    function claim() external {
        SaleInfo storage sale = saleInfo;

        require(_saleExists(), "No sale");
        require(block.timestamp > sale.endTime || sale.finalized, "Sale not ended");

        uint256 claimable = purchased[msg.sender] - claimed[msg.sender];
        require(claimable > 0, "Nothing to claim");

        claimed[msg.sender] += claimable;

        // Transfer sale tokens to buyer
        sale.saleToken.safeTransfer(msg.sender, claimable);

        emit TokensClaimed(msg.sender, claimable);
    }

    /**
     * @dev Finalize sale and withdraw funds (owner only)
     */
    function finalize() external onlyOwner {
        SaleInfo storage sale = saleInfo;

        require(_saleExists(), "No sale");
        require(!sale.finalized, "Already finalized");
        require(block.timestamp > sale.endTime || sale.soldAmount == sale.totalAmount, "Sale not ended");

        sale.finalized = true;

        // Calculate total raised
        uint256 totalRaised = (sale.soldAmount * sale.price) / 1e18;

        // Transfer payment tokens to owner
        if (totalRaised > 0) {
            sale.paymentToken.safeTransfer(owner(), totalRaised);
        }

        // Return unsold tokens to owner
        uint256 unsold = sale.totalAmount - sale.soldAmount;
        if (unsold > 0) {
            sale.saleToken.safeTransfer(owner(), unsold);
        }

        emit SaleFinalized(sale.soldAmount, totalRaised);
    }

    /**
     * @dev Get user purchase info
     */
    function getUserInfo(address user)
        external
        view
        returns (
            uint256 purchasedAmount,
            uint256 claimedAmount,
            uint256 claimableAmount
        )
    {
        purchasedAmount = purchased[user];
        claimedAmount = claimed[user];
        claimableAmount = purchasedAmount - claimedAmount;
    }

    /**
     * @dev Get current sale info
     */
    function getSaleInfo()
        external
        view
        returns (
            address saleToken,
            address paymentToken,
            uint256 price,
            uint256 totalAmount,
            uint256 soldAmount,
            uint256 startTime,
            uint256 endTime,
            uint256 minPurchase,
            uint256 maxPurchase,
            bool finalized
        )
    {
        SaleInfo storage sale = saleInfo;
        return (
            address(sale.saleToken),
            address(sale.paymentToken),
            sale.price,
            sale.totalAmount,
            sale.soldAmount,
            sale.startTime,
            sale.endTime,
            sale.minPurchase,
            sale.maxPurchase,
            sale.finalized
        );
    }

    /**
     * @dev Check if sale exists
     */
    function _saleExists() private view returns (bool) {
        return address(saleInfo.saleToken) != address(0);
    }
}
