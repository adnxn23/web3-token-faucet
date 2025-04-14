// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev A simple ERC20 token for testing purposes that can be minted by the owner
 */
contract TestToken is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @dev Constructor that gives the msg.sender all of existing tokens.
     * @param name Name of the token
     * @param symbol Symbol of the token
     * @param tokenDecimals Decimals for the token
     * @param initialSupply Initial supply of tokens
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 tokenDecimals,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = tokenDecimals;

        // Mint initial supply to the contract creator
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply * (10 ** decimals()));
        }
    }

    /**
     * @dev Override decimals function to allow custom decimal places
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens (only owner can call this)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in raw units)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from an address (only owner can call this)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (in raw units)
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}
