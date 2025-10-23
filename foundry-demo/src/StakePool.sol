// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakePool
 * @dev Simple staking pool with reward distribution
 */
contract StakePool is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;
    IERC20 public rewardToken;

    uint256 public rewardRate; // Reward tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 public totalStaked;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Update reward variables
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked;
    }

    /**
     * @dev Calculate earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return
            (stakedBalance[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 +
            rewards[account];
    }

    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Withdraw staked tokens
     */
    function withdraw(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");

        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Claim pending rewards
     */
    function claimReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    /**
     * @dev Update reward rate (owner only)
     */
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    /**
     * @dev Get staking info for a user
     */
    function getUserInfo(address user)
        external
        view
        returns (
            uint256 staked,
            uint256 pendingReward
        )
    {
        staked = stakedBalance[user];
        pendingReward = earned(user);
    }
}
