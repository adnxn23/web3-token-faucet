// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Faucet Contract
 * @dev A testnet token faucet that distributes ERC20 tokens with rate limiting
 */
contract Faucet is Ownable, ReentrancyGuard {
    // Token to be distributed
    IERC20 public token;

    // Amount of tokens per distribution
    uint256 public distributionAmount;

    // Cooldown period in seconds (default: 24 hours)
    uint256 public cooldownPeriod = 24 hours;

    // Mapping to track the last claim timestamp for each address
    mapping(address => uint256) public lastClaimTime;

    // Faucet status (active/paused)
    bool public isPaused;

    // Events
    event TokensDispensed(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    event DistributionAmountChanged(uint256 oldAmount, uint256 newAmount);
    event CooldownPeriodChanged(uint256 oldPeriod, uint256 newPeriod);
    event FaucetStatusChanged(bool isPaused);

    /**
     * @dev Constructor sets the token address and initial distribution amount
     * @param _tokenAddress Address of the ERC20 token to distribute
     * @param _distributionAmount Amount of tokens per distribution
     */
    constructor(
        address _tokenAddress,
        uint256 _distributionAmount
    ) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(
            _distributionAmount > 0,
            "Distribution amount must be positive"
        );

        token = IERC20(_tokenAddress);
        distributionAmount = _distributionAmount;
        isPaused = false;
    }

    /**
     * @dev Modifier to check if the faucet is active
     */
    modifier whenNotPaused() {
        require(!isPaused, "Faucet is paused");
        _;
    }

    /**
     * @dev Request tokens from the faucet
     * @notice Users can only claim once per cooldown period
     */
    function requestTokens() external nonReentrant whenNotPaused {
        address recipient = msg.sender;

        // Check cooldown period
        require(
            block.timestamp >= lastClaimTime[recipient] + cooldownPeriod ||
                lastClaimTime[recipient] == 0,
            "Cooldown period not yet elapsed"
        );

        // Check faucet balance
        require(
            token.balanceOf(address(this)) >= distributionAmount,
            "Faucet has insufficient funds"
        );

        // Update last claim time
        lastClaimTime[recipient] = block.timestamp;

        // Transfer tokens
        require(
            token.transfer(recipient, distributionAmount),
            "Token transfer failed"
        );

        // Emit event
        emit TokensDispensed(recipient, distributionAmount, block.timestamp);
    }

    /**
     * @dev Get the timestamp when a user can claim tokens again
     * @param _user Address of the user
     * @return timestamp when the user can claim tokens again
     */
    function getNextClaimTime(address _user) external view returns (uint256) {
        if (lastClaimTime[_user] == 0) {
            return block.timestamp; // User has never claimed, can claim now
        }

        uint256 nextClaimTime = lastClaimTime[_user] + cooldownPeriod;
        if (nextClaimTime <= block.timestamp) {
            return block.timestamp; // User can claim now
        } else {
            return nextClaimTime; // User must wait until this timestamp
        }
    }

    /**
     * @dev Check if a user can claim tokens right now
     * @param _user Address of the user
     * @return true if the user can claim tokens now
     */
    function canClaimTokens(address _user) external view returns (bool) {
        if (isPaused) return false;

        if (lastClaimTime[_user] == 0) {
            return true; // User has never claimed
        }

        return block.timestamp >= lastClaimTime[_user] + cooldownPeriod;
    }

    // ==================== OWNER FUNCTIONS ====================

    /**
     * @dev Change the distribution amount
     * @param _newAmount New amount of tokens per distribution
     */
    function setDistributionAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Distribution amount must be positive");

        uint256 oldAmount = distributionAmount;
        distributionAmount = _newAmount;

        emit DistributionAmountChanged(oldAmount, _newAmount);
    }

    /**
     * @dev Change the cooldown period
     * @param _newPeriod New cooldown period in seconds
     */
    function setCooldownPeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod > 0, "Cooldown period must be positive");

        uint256 oldPeriod = cooldownPeriod;
        cooldownPeriod = _newPeriod;

        emit CooldownPeriodChanged(oldPeriod, _newPeriod);
    }

    /**
     * @dev Toggle faucet status (active/paused)
     */
    function togglePause() external onlyOwner {
        isPaused = !isPaused;
        emit FaucetStatusChanged(isPaused);
    }

    /**
     * @dev Withdraw tokens from the faucet (emergency function)
     * @param _amount Amount of tokens to withdraw
     */
    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        require(
            token.balanceOf(address(this)) >= _amount,
            "Insufficient balance"
        );

        require(token.transfer(owner(), _amount), "Transfer failed");
    }

    /**
     * @dev Manually reset cooldown for an address (admin function)
     * @param _user Address to reset cooldown for
     */
    function resetCooldown(address _user) external onlyOwner {
        lastClaimTime[_user] = 0;
    }
}
