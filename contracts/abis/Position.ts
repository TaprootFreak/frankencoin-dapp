export const PositionABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_hub",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_zchf",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_collateral",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_minCollateral",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_initialLimit",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_initPeriod",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_duration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_challengePeriod",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "_yearlyInterestPPM",
                "type": "uint32"
            },
            {
                "internalType": "uint256",
                "name": "_liqPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "_reservePPM",
                "type": "uint32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "ChallengeTooSmall",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Challenged",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Expired",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Hot",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientCollateral",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "LimitExceeded",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotHub",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "excess",
                "type": "uint256"
            }
        ],
        "name": "RepaidTooMuch",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TooLate",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "collateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "minted",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "limit",
                "type": "uint256"
            }
        ],
        "name": "MintingUpdate",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            }
        ],
        "name": "PositionDenied",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "original",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "zchf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "collateral",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "PositionOpened",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newMinted",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "newCollateral",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "newPrice",
                "type": "uint256"
            }
        ],
        "name": "adjust",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newPrice",
                "type": "uint256"
            }
        ],
        "name": "adjustPrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "calculateCurrentFee",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "challengePeriod",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "challengedAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "collateral",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cooldown",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "helpers",
                "type": "address[]"
            },
            {
                "internalType": "string",
                "name": "message",
                "type": "string"
            }
        ],
        "name": "deny",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "expiration",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "totalMint",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "afterFees",
                "type": "bool"
            }
        ],
        "name": "getUsableMint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "hub",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_coll",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_mint",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expirationTime",
                "type": "uint256"
            }
        ],
        "name": "initializeClone",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isClosed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "limit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minimumCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "target",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minted",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "size",
                "type": "uint256"
            }
        ],
        "name": "notifyChallengeStarted",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_bidder",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_bid",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_size",
                "type": "uint256"
            }
        ],
        "name": "notifyChallengeSucceeded",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "original",
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
        "name": "owner",
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
        "name": "price",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "mint_",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "exp",
                "type": "uint256"
            }
        ],
        "name": "reduceLimitForClone",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "name": "repay",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reserveContribution",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "start",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_collateralAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_bidAmountZCHF",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "challengeEnd",
                "type": "uint256"
            }
        ],
        "name": "tryAvertChallenge",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "target",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "target",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "yearlyInterestPPM",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "zchf",
        "outputs": [
            {
                "internalType": "contract IFrankencoin",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;