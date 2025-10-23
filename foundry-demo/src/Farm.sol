// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Farm
 * @dev Multi-pool farming contract with reward distribution
 */
contract Farm is Ownable {
    using SafeERC20 for IERC20;

    struct PoolInfo {
        IERC20 lpToken; // LP token for this pool
        uint256 allocPoint; // Allocation points assigned to this pool
        uint256 lastRewardTime; // Last time rewards were calculated
        uint256 accRewardPerShare; // Accumulated rewards per share (scaled by 1e12)
        uint256 totalStaked; // Total amount staked in this pool
    }

    struct UserInfo {
        uint256 amount; // Amount of LP tokens staked
        uint256 rewardDebt; // Reward debt for calculations
    }

    IERC20 public rewardToken;
    uint256 public rewardPerSecond;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    uint256 public totalAllocPoint;

    event Deposited(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvested(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address indexed lpToken, uint256 allocPoint);

    constructor(address _rewardToken, uint256 _rewardPerSecond) Ownable(msg.sender) {
        require(_rewardToken != address(0), "Invalid reward token");
        rewardToken = IERC20(_rewardToken);
        rewardPerSecond = _rewardPerSecond;
    }

    /**
     * @dev Get number of pools
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @dev Add a new pool (owner only)
     */
    function addPool(address _lpToken, uint256 _allocPoint) external onlyOwner {
        require(_lpToken != address(0), "Invalid LP token");

        uint256 lastRewardTime = block.timestamp;
        totalAllocPoint += _allocPoint;

        poolInfo.push(
            PoolInfo({
                lpToken: IERC20(_lpToken),
                allocPoint: _allocPoint,
                lastRewardTime: lastRewardTime,
                accRewardPerShare: 0,
                totalStaked: 0
            })
        );

        emit PoolAdded(poolInfo.length - 1, _lpToken, _allocPoint);
    }

    /**
     * @dev Update pool allocation points (owner only)
     */
    function setPool(uint256 _pid, uint256 _allocPoint) external onlyOwner {
        require(_pid < poolInfo.length, "Invalid pool ID");

        updatePool(_pid);

        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    /**
     * @dev Update reward variables for a pool
     */
    function updatePool(uint256 _pid) public {
        require(_pid < poolInfo.length, "Invalid pool ID");
        PoolInfo storage pool = poolInfo[_pid];

        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }

        if (pool.totalStaked == 0 || pool.allocPoint == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - pool.lastRewardTime;
        uint256 reward = (timeElapsed * rewardPerSecond * pool.allocPoint) / totalAllocPoint;

        pool.accRewardPerShare += (reward * 1e12) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }

    /**
     * @dev Deposit LP tokens to farm
     */
    function deposit(uint256 _pid, uint256 _amount) external {
        require(_pid < poolInfo.length, "Invalid pool ID");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);

        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / 1e12 - user.rewardDebt;
            if (pending > 0) {
                rewardToken.safeTransfer(msg.sender, pending);
                emit Harvested(msg.sender, _pid, pending);
            }
        }

        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(msg.sender, address(this), _amount);
            user.amount += _amount;
            pool.totalStaked += _amount;
        }

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;

        emit Deposited(msg.sender, _pid, _amount);
    }

    /**
     * @dev Withdraw LP tokens from farm
     */
    function withdraw(uint256 _pid, uint256 _amount) external {
        require(_pid < poolInfo.length, "Invalid pool ID");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "Insufficient balance");

        updatePool(_pid);

        uint256 pending = (user.amount * pool.accRewardPerShare) / 1e12 - user.rewardDebt;
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit Harvested(msg.sender, _pid, pending);
        }

        if (_amount > 0) {
            user.amount -= _amount;
            pool.totalStaked -= _amount;
            pool.lpToken.safeTransfer(msg.sender, _amount);
        }

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;

        emit Withdrawn(msg.sender, _pid, _amount);
    }

    /**
     * @dev Harvest pending rewards
     */
    function harvest(uint256 _pid) external {
        require(_pid < poolInfo.length, "Invalid pool ID");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);

        uint256 pending = (user.amount * pool.accRewardPerShare) / 1e12 - user.rewardDebt;
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit Harvested(msg.sender, _pid, pending);
        }

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e12;
    }

    /**
     * @dev Get pending rewards for a user
     */
    function pendingReward(uint256 _pid, address _user) external view returns (uint256) {
        require(_pid < poolInfo.length, "Invalid pool ID");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];

        uint256 accRewardPerShare = pool.accRewardPerShare;

        if (block.timestamp > pool.lastRewardTime && pool.totalStaked > 0 && pool.allocPoint > 0) {
            uint256 timeElapsed = block.timestamp - pool.lastRewardTime;
            uint256 reward = (timeElapsed * rewardPerSecond * pool.allocPoint) / totalAllocPoint;
            accRewardPerShare += (reward * 1e12) / pool.totalStaked;
        }

        return (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
    }

    /**
     * @dev Get user info for a pool
     */
    function getUserInfo(uint256 _pid, address _user)
        external
        view
        returns (
            uint256 amount,
            uint256 pending
        )
    {
        require(_pid < poolInfo.length, "Invalid pool ID");
        UserInfo storage user = userInfo[_pid][_user];
        PoolInfo storage pool = poolInfo[_pid];

        amount = user.amount;

        uint256 accRewardPerShare = pool.accRewardPerShare;
        if (block.timestamp > pool.lastRewardTime && pool.totalStaked > 0 && pool.allocPoint > 0) {
            uint256 timeElapsed = block.timestamp - pool.lastRewardTime;
            uint256 reward = (timeElapsed * rewardPerSecond * pool.allocPoint) / totalAllocPoint;
            accRewardPerShare += (reward * 1e12) / pool.totalStaked;
        }

        pending = (user.amount * accRewardPerShare) / 1e12 - user.rewardDebt;
    }
}
