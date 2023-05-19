exports.content = () => {
  return `
  // SPDX-License-Identifier: MIT

  pragma solidity >=0.8.0 <0.9.0;
  
  import "@openzeppelin/contracts/utils/Counters.sol";
  import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  
  contract ThetaCharity {
      address owner;
      address wThetaAddress = 0xAf537FB7E4c77C97403De94Ce141b7EdB9F7fCf0; //
      address public charity;
      using Counters for Counters.Counter;
      Counters.Counter public counter;
  
      modifier isOwner() {
          require(msg.sender == owner);
          _;
      }
  
      struct Donor {
          address donor;
          uint256 amount;
          address tokenAddress;
      }
  
      mapping(uint256 => Donor) public Donors;
  
      constructor(address _charity) {
          owner = msg.sender;
          charity = _charity;
      }
  
      function addDonor() public payable {
          require(msg.value > 0);
          Donors[counter.current()] = Donor(
              msg.sender,
              msg.value,
              0x0000000000000000000000000000000000000000
          );
          counter.increment();
      }
  
      function addDonorToken(uint256 amount) public payable {
          ERC20 ERC20Contract = ERC20(wThetaAddress);
          require(ERC20Contract.balanceOf(msg.sender) >= amount);
          require(ERC20Contract.allowance(msg.sender, address(this)) >= amount);
          ERC20Contract.transferFrom(msg.sender, address(this), amount);
          Donors[counter.current()] = Donor(msg.sender, amount, wThetaAddress);
          counter.increment();
      }
  
      function transferMoney() public isOwner {
          payable(charity).transfer(address(this).balance);
          ERC20 ERC20Contract = ERC20(wThetaAddress);
          ERC20Contract.transfer(charity, ERC20Contract.balanceOf(address(this)));
      }
  
      function getBalanceECR20(address check, address s_contract)
          private
          view
          returns (uint256)
      {
          ERC20 ERC20Contract = ERC20(s_contract);
          return ERC20Contract.balanceOf(check);
      }
  }
`;
};

exports.abi = () => {
  return [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_charity",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "Donors",
      "outputs": [
        {
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addDonor",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "addDonorToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "charity",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "counter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transferMoney",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
};
