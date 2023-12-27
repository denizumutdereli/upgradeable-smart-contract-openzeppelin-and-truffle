// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract DNZToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    struct FrozenInfo {
        uint256 amount;
        uint256 until;
    }

    mapping(address => FrozenInfo) private _frozenAccounts;

    event FrozenFunds(address indexed target, uint256 amount, uint256 duration);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    function initialize(uint256 initialSupply) public initializer {
        __ERC20_init("Deniz Token", "DNZ");
        __ERC20Burnable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __Ownable_init();
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return 4;
    }

    function _authorizeUpgrade(address newImplementation) internal view override {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        newImplementation;
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    function getVersion() public pure returns (string memory) {
        return "V1";
    }

    function claimOwnership(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit Mint(to, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override nonReentrant returns (bool) {
        FrozenInfo memory frozenInfo = _frozenAccounts[sender];
        if (frozenInfo.until > block.timestamp) {
            uint256 availableBalance = balanceOf(sender) - frozenInfo.amount;
            require(amount <= availableBalance, "Attempt to transfer more than available balance");
        }
        return super.transferFrom(sender, recipient, amount);
    }

    function freeze(address target, uint256 amount, uint256 duration) public onlyOwner {
        require(duration > 0, "Duration must be greater than 0");
        _frozenAccounts[target].amount = amount;
        _frozenAccounts[target].until = block.timestamp + duration;
        emit FrozenFunds(target, amount, duration);
    }

    function isFrozen(address target) public view returns (uint256 amount, uint256 remainingTime) {
        FrozenInfo memory frozenInfo = _frozenAccounts[target];
        if (frozenInfo.until > block.timestamp) {
            return (frozenInfo.amount, frozenInfo.until - block.timestamp);
        } else {
            return (0, 0);
        }
    }

    function increaseSupply(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
        emit Mint(msg.sender, amount);
    }

    function decreaseSupply(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    function transferAndBurn(address recipient, uint256 amount) public onlyOwner {
        require(recipient != address(0), "Cannot transfer to the zero address");
        require(amount <= balanceOf(address(this)), "Not enough tokens in contract balance");

        _transfer(address(this), recipient, amount);
        _burn(address(this), amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        FrozenInfo memory frozenInfo = _frozenAccounts[from];
        if (frozenInfo.until > block.timestamp) {
            uint256 availableBalance = balanceOf(from) - frozenInfo.amount;
            require(amount <= availableBalance, "Attempt to transfer more than available balance");
        } else if (frozenInfo.amount > 0) {
            // Reset frozen amount and timestamp if the freeze period has passed
            _frozenAccounts[from].amount = 0;
            _frozenAccounts[from].until = 0;
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}