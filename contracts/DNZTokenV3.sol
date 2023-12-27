// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract CryptomTokenV3 is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    mapping(address => bool) private _frozenAccounts;

    event FrozenFunds(address indexed target, bool frozen);

    function initialize() public initializer {
        __ERC20_init("Deniz Token", "DNZ");
        __ERC20Burnable_init();
        __Pausable_init();
        __Ownable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal view override {
    require(owner() == msg.sender, "Ownable: caller is not the owner");
    newImplementation;
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    function getVersion() public pure returns (string memory) {
        return "V3";
    }

    function claimOwnership(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(!_frozenAccounts[sender], "Sender account is frozen");
        require(!_frozenAccounts[recipient], "Recipient account is frozen");
        return super.transferFrom(sender, recipient, amount);
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        return super.approve(spender, amount);
    }

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        return super.allowance(owner, spender);
    }

    function freeze(address target, bool _freeze) public onlyOwner {
        _frozenAccounts[target] = _freeze;
        emit FrozenFunds(target, _freeze);
    }

    function isFrozen(address target) public view returns (bool) {
        return _frozenAccounts[target];
    }

    function increaseSupply(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }

    function decreaseSupply(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
