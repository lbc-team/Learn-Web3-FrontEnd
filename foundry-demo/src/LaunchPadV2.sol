// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenFactory.sol";

/**
 * @title LaunchPad V2
 * @dev Token sale platform supporting multiple projects
 */
contract LaunchPadV2 is Ownable {
    using SafeERC20 for IERC20;

    TokenFactory public immutable tokenFactory;

    struct SaleInfo {
        address creator;           // Project creator
        IERC20 saleToken;         // Token being sold
        IERC20 paymentToken;      // Token used for payment (e.g., USDC)
        uint256 price;            // Price per token (in payment token, scaled by 1e18)
        uint256 totalAmount;      // Total tokens for sale
        uint256 soldAmount;       // Tokens already sold
        uint256 startTime;        // Sale start time
        uint256 endTime;          // Sale end time
        uint256 minPurchase;      // Minimum purchase amount
        uint256 maxPurchase;      // Maximum purchase amount per user
        bool finalized;           // Whether sale is finalized
        bool active;              // Whether sale is active
    }

    // Array of all sales
    SaleInfo[] public sales;

    // saleId => user => amount purchased
    mapping(uint256 => mapping(address => uint256)) public purchased;

    // saleId => user => amount claimed
    mapping(uint256 => mapping(address => uint256)) public claimed;

    // Platform fee (in basis points, e.g., 100 = 1%)
    uint256 public platformFee = 200; // 2%
    address public feeReceiver;

    event SaleCreated(
        uint256 indexed saleId,
        address indexed creator,
        address indexed saleToken,
        address paymentToken,
        uint256 totalAmount,
        uint256 price
    );
    event TokenCreatedAndSaleStarted(
        uint256 indexed saleId,
        address indexed tokenAddress,
        string name,
        string symbol
    );
    event TokensPurchased(uint256 indexed saleId, address indexed buyer, uint256 amount, uint256 cost);
    event TokensClaimed(uint256 indexed saleId, address indexed buyer, uint256 amount);
    event SaleFinalized(uint256 indexed saleId, uint256 totalSold, uint256 totalRaised);
    event SaleCancelled(uint256 indexed saleId);

    constructor(address _tokenFactory) Ownable(msg.sender) {
        require(_tokenFactory != address(0), "Invalid factory address");
        tokenFactory = TokenFactory(_tokenFactory);
        feeReceiver = msg.sender;
    }

    /**
     * @dev Create sale with existing token
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
    ) external returns (uint256 saleId) {
        require(_saleToken != address(0), "Invalid sale token");
        require(_paymentToken != address(0), "Invalid payment token");
        require(_price > 0, "Invalid price");
        require(_totalAmount > 0, "Invalid total amount");
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime >= block.timestamp, "Start time must be in future");
        require(_minPurchase <= _maxPurchase, "Invalid purchase limits");

        saleId = sales.length;

        sales.push(SaleInfo({
            creator: msg.sender,
            saleToken: IERC20(_saleToken),
            paymentToken: IERC20(_paymentToken),
            price: _price,
            totalAmount: _totalAmount,
            soldAmount: 0,
            startTime: _startTime,
            endTime: _endTime,
            minPurchase: _minPurchase,
            maxPurchase: _maxPurchase,
            finalized: false,
            active: true
        }));

        // Transfer sale tokens to contract
        IERC20(_saleToken).safeTransferFrom(msg.sender, address(this), _totalAmount);

        emit SaleCreated(saleId, msg.sender, _saleToken, _paymentToken, _totalAmount, _price);
    }

    /**
     * @dev Create new token and start sale (automatic deployment)
     */
    function createTokenAndSale(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _paymentToken,
        uint256 _price,
        uint256 _saleAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) external returns (uint256 saleId, address tokenAddress) {
        require(_saleAmount <= _initialSupply, "Sale amount exceeds supply");
        require(_paymentToken != address(0), "Invalid payment token");
        require(_price > 0, "Invalid price");
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime >= block.timestamp, "Start time must be in future");
        require(_minPurchase <= _maxPurchase, "Invalid purchase limits");

        // Create token via factory
        tokenAddress = tokenFactory.createToken(_name, _symbol, _decimals, _initialSupply);

        saleId = sales.length;

        sales.push(SaleInfo({
            creator: msg.sender,
            saleToken: IERC20(tokenAddress),
            paymentToken: IERC20(_paymentToken),
            price: _price,
            totalAmount: _saleAmount,
            soldAmount: 0,
            startTime: _startTime,
            endTime: _endTime,
            minPurchase: _minPurchase,
            maxPurchase: _maxPurchase,
            finalized: false,
            active: true
        }));

        // TokenFactory transfers all tokens to this contract (LaunchPadV2)
        // Transfer remaining tokens (not for sale) back to creator
        uint256 remaining = _initialSupply - _saleAmount;
        if (remaining > 0) {
            IERC20(tokenAddress).safeTransfer(msg.sender, remaining);
        }

        // Sale tokens stay in this contract

        emit TokenCreatedAndSaleStarted(saleId, tokenAddress, "", "");
        emit SaleCreated(saleId, msg.sender, tokenAddress, _paymentToken, _saleAmount, _price);
    }

    /**
     * @dev Buy tokens during sale
     */
    function buy(uint256 _saleId, uint256 _amount) external {
        require(_saleId < sales.length, "Invalid sale ID");
        SaleInfo storage sale = sales[_saleId];

        require(sale.active, "Sale not active");
        require(block.timestamp >= sale.startTime, "Sale not started");
        require(block.timestamp <= sale.endTime, "Sale ended");
        require(!sale.finalized, "Sale finalized");
        require(_amount >= sale.minPurchase, "Below minimum purchase");
        require(purchased[_saleId][msg.sender] + _amount <= sale.maxPurchase, "Exceeds maximum purchase");
        require(sale.soldAmount + _amount <= sale.totalAmount, "Insufficient tokens available");

        uint256 cost = (_amount * sale.price) / 1e18;

        // Transfer payment tokens from buyer
        sale.paymentToken.safeTransferFrom(msg.sender, address(this), cost);

        // Update purchase records
        purchased[_saleId][msg.sender] += _amount;
        sale.soldAmount += _amount;

        emit TokensPurchased(_saleId, msg.sender, _amount, cost);
    }

    /**
     * @dev Claim purchased tokens after sale ends
     */
    function claim(uint256 _saleId) external {
        require(_saleId < sales.length, "Invalid sale ID");
        SaleInfo storage sale = sales[_saleId];

        require(block.timestamp > sale.endTime || sale.finalized, "Sale not ended");

        uint256 claimable = purchased[_saleId][msg.sender] - claimed[_saleId][msg.sender];
        require(claimable > 0, "Nothing to claim");

        claimed[_saleId][msg.sender] += claimable;

        // Transfer sale tokens to buyer
        sale.saleToken.safeTransfer(msg.sender, claimable);

        emit TokensClaimed(_saleId, msg.sender, claimable);
    }

    /**
     * @dev Finalize sale and withdraw funds (creator only)
     */
    function finalize(uint256 _saleId) external {
        require(_saleId < sales.length, "Invalid sale ID");
        SaleInfo storage sale = sales[_saleId];

        require(msg.sender == sale.creator, "Only creator can finalize");
        require(sale.active, "Sale not active");
        require(!sale.finalized, "Already finalized");
        require(block.timestamp > sale.endTime || sale.soldAmount == sale.totalAmount, "Sale not ended");

        sale.finalized = true;

        // Calculate total raised and platform fee
        uint256 totalRaised = (sale.soldAmount * sale.price) / 1e18;
        uint256 fee = (totalRaised * platformFee) / 10000;
        uint256 creatorAmount = totalRaised - fee;

        // Transfer payment tokens
        if (fee > 0) {
            sale.paymentToken.safeTransfer(feeReceiver, fee);
        }
        if (creatorAmount > 0) {
            sale.paymentToken.safeTransfer(sale.creator, creatorAmount);
        }

        // Return unsold tokens to creator
        uint256 unsold = sale.totalAmount - sale.soldAmount;
        if (unsold > 0) {
            sale.saleToken.safeTransfer(sale.creator, unsold);
        }

        emit SaleFinalized(_saleId, sale.soldAmount, totalRaised);
    }

    /**
     * @dev Cancel sale (creator only, before it starts)
     */
    function cancelSale(uint256 _saleId) external {
        require(_saleId < sales.length, "Invalid sale ID");
        SaleInfo storage sale = sales[_saleId];

        require(msg.sender == sale.creator, "Only creator can cancel");
        require(sale.active, "Sale not active");
        require(block.timestamp < sale.startTime, "Sale already started");
        require(sale.soldAmount == 0, "Tokens already sold");

        sale.active = false;

        // Return all tokens to creator
        sale.saleToken.safeTransfer(sale.creator, sale.totalAmount);

        emit SaleCancelled(_saleId);
    }

    /**
     * @dev Get user purchase info
     */
    function getUserInfo(uint256 _saleId, address _user)
        external
        view
        returns (
            uint256 purchasedAmount,
            uint256 claimedAmount,
            uint256 claimableAmount
        )
    {
        purchasedAmount = purchased[_saleId][_user];
        claimedAmount = claimed[_saleId][_user];
        claimableAmount = purchasedAmount - claimedAmount;
    }

    /**
     * @dev Get sale info
     */
    function getSaleInfo(uint256 _saleId)
        external
        view
        returns (
            address creator,
            address saleToken,
            address paymentToken,
            uint256 price,
            uint256 totalAmount,
            uint256 soldAmount,
            uint256 startTime,
            uint256 endTime,
            uint256 minPurchase,
            uint256 maxPurchase,
            bool finalized,
            bool active
        )
    {
        require(_saleId < sales.length, "Invalid sale ID");
        SaleInfo storage sale = sales[_saleId];
        return (
            sale.creator,
            address(sale.saleToken),
            address(sale.paymentToken),
            sale.price,
            sale.totalAmount,
            sale.soldAmount,
            sale.startTime,
            sale.endTime,
            sale.minPurchase,
            sale.maxPurchase,
            sale.finalized,
            sale.active
        );
    }

    /**
     * @dev Get total number of sales
     */
    function getSaleCount() external view returns (uint256) {
        return sales.length;
    }

    /**
     * @dev Update platform fee (owner only)
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high (max 10%)");
        platformFee = _fee;
    }

    /**
     * @dev Update fee receiver (owner only)
     */
    function setFeeReceiver(address _receiver) external onlyOwner {
        require(_receiver != address(0), "Invalid address");
        feeReceiver = _receiver;
    }
}
