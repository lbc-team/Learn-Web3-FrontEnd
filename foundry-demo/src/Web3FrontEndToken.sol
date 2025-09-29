// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Web3FrontEndToken
 * @dev ERC20 Token with controlled minting - any address can mint up to 10,000 tokens
 * Total supply cap: 100,000,000 tokens
 * Using secure practices without external dependencies
 */
contract Web3FrontEndToken {
    string public constant name = "Web3FrontEndToken";
    string public constant symbol = "W3FET";
    uint8 public constant decimals = 18;
    
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    uint256 public constant MAX_MINT_PER_ADDRESS = 10_000 * 10**18; // 10,000 tokens per address
    
    uint256 public totalSupply;
    address public owner;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public mintedByAddress;
    
    // Reentrancy guard
    bool private _locked;
    
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensMinted(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    /**
     * @dev Allows any address to mint tokens up to MAX_MINT_PER_ADDRESS
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply + amount <= MAX_SUPPLY, "Would exceed max supply");
        require(
            mintedByAddress[msg.sender] + amount <= MAX_MINT_PER_ADDRESS,
            "Would exceed max mint per address"
        );
        
        mintedByAddress[msg.sender] += amount;
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        
        emit Transfer(address(0), msg.sender, amount);
        emit TokensMinted(msg.sender, amount);
    }
    
    /**
     * @dev Standard ERC20 transfer function
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Standard ERC20 approve function
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "ERC20: approve to the zero address");
        
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Standard ERC20 transferFrom function
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[from] >= amount, "ERC20: transfer amount exceeds balance");
        require(allowance[from][msg.sender] >= amount, "ERC20: insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Returns the remaining amount that an address can mint
     * @param account The address to check
     * @return The remaining mintable amount for the address
     */
    function remainingMintAmount(address account) external view returns (uint256) {
        return MAX_MINT_PER_ADDRESS - mintedByAddress[account];
    }
    
    /**
     * @dev Returns the remaining total supply that can be minted
     * @return The remaining mintable total supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply;
    }
    
    /**
     * @dev Emergency function to burn tokens (only owner)
     * @param amount Amount of tokens to burn from owner's balance
     */
    function burn(uint256 amount) external onlyOwner {
        require(balanceOf[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
    }
    
    /**
     * @dev Transfer ownership to a new account
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Renounce ownership, leaving the contract without an owner
     */
    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }
}