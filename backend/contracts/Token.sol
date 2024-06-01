// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimal = 18;
    uint256 public totalSupply; // 1000000x10^18

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approve(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimal);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(
        address _to,
        uint256 _amount
    ) public returns (bool success) {
        require(balanceOf[msg.sender] >= _amount);
        _transfer(msg.sender, _to, _amount);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _amount) internal {
        require(address(_to) != address(0));
        balanceOf[_from] = balanceOf[_from] - _amount;
        balanceOf[_to] = balanceOf[_to] + _amount;
        emit Transfer(_from, _to, _amount);
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approve(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool success) {
        require(_amount <= balanceOf[_from]);
        require(_amount <= allowance[_from][msg.sender]);

        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _amount;

        _transfer(_from, _to, _amount);
        return true;
    }
}
