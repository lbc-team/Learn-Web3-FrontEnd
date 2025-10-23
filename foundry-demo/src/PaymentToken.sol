// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentToken (USDC)
 * @dev ERC20 Token - 任何地址可以自行 mint，每个地址最多 mint 100,000 枚
 * @notice 教学用途：方便学员自行获取测试代币用于 LaunchPad 支付
 */
contract PaymentToken {
    string public constant name = "USD Coin";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 18;

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 10 亿总供应
    uint256 public constant MAX_MINT_PER_ADDRESS = 100_000 * 10**18; // 每地址最多 10 万枚

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public mintedByAddress;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensMinted(address indexed to, uint256 amount);

    /**
     * @dev 允许任何地址为自己 mint 代币
     * @param amount mint 数量（18 decimals）
     */
    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply + amount <= MAX_SUPPLY, "Would exceed max supply");
        require(
            mintedByAddress[msg.sender] + amount <= MAX_MINT_PER_ADDRESS,
            "Would exceed max mint per address (100,000 USDC)"
        );

        mintedByAddress[msg.sender] += amount;
        totalSupply += amount;
        balanceOf[msg.sender] += amount;

        emit Transfer(address(0), msg.sender, amount);
        emit TokensMinted(msg.sender, amount);
    }

    /**
     * @dev 标准 ERC20 transfer
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[msg.sender] >= amount, "ERC20: insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev 标准 ERC20 approve
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "ERC20: approve to the zero address");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev 标准 ERC20 transferFrom
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[from] >= amount, "ERC20: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "ERC20: insufficient allowance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev 查询地址剩余可 mint 数量
     */
    function remainingMintAmount(address account) external view returns (uint256) {
        return MAX_MINT_PER_ADDRESS - mintedByAddress[account];
    }

    /**
     * @dev 查询剩余总供应
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply;
    }

    /**
     * @dev 销毁代币
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "ERC20: burn amount exceeds balance");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
    }
}
