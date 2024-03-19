import { getAddress, isAddress, zeroAddress } from "viem";
import { erc20ABI, mainnet, useAccount, useContractReads } from "wagmi";
import { decodeBigIntCall } from "../utils/format";
import { ADDRESS } from "../contracts/address";

export const useTokenData = (addr: string) => {
  if (!isAddress(addr)) addr = zeroAddress;
  const tokenAddress = getAddress(addr);
  const { address } = useAccount();

  const account = address || zeroAddress;
  const mintingHub = ADDRESS[mainnet.id].mintingHub;
  const { data } = useContractReads({
    contracts: [
      {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "name",
      },
      {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "symbol",
      },
      {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "decimals",
      },
      {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account],
      },
      {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "allowance",
        args: [account, mintingHub],
      },
    ],
    watch: true,
  });

  const name = data && !data[0].error ? String(data[0].result) : "NaN";
  const symbol = data && !data[1].error ? String(data[1].result) : "NaN";
  const decimals = data ? decodeBigIntCall(data[2]) : BigInt(0);
  const balance = data ? decodeBigIntCall(data[3]) : BigInt(0);
  const allowance = data ? decodeBigIntCall(data[4]) : BigInt(0);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    balance,
    allowance,
  };
};
