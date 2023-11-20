import Head from "next/head";
import AppPageHeader from "@components/AppPageHeader";
import DisplayAmount from "@components/DisplayAmount";
import { useAccount, useChainId, useContractWrite, useNetwork } from "wagmi";
import { waitForTransaction } from "wagmi/actions";
import { useFaucetStats } from "@hooks";
import Button from "@components/Button";
import { ABIS, ADDRESS } from "@contracts";
import { useState } from "react";
import { Address, parseUnits, zeroAddress } from "viem";
import { toast } from "react-toastify";
import { TxToast, renderErrorToast } from "@components/TxToast";
import Table from "@components/Table";
import TableHeader from "@components/Table/TableHead";
import TableBody from "@components/Table/TableBody";
import TableRow from "@components/Table/TableRow";
import TokenLogo from "@components/TokenLogo";

interface RowProps {
  addr: Address;
  symbol: string;
  balance: bigint;
  decimal: bigint;
}

export function FaucetRow({ symbol, balance, decimal, addr }: RowProps) {
  const { address } = useAccount();
  const account = address || zeroAddress;
  const [isConfirming, setIsConfirming] = useState(false);

  const mintWrite = useContractWrite({
    address: addr,
    abi: ABIS.MockVolABI,
    functionName: "mint",
  });

  const handleFaucet = async () => {
    const tx = await mintWrite.writeAsync({
      args: [account, parseUnits("1000", Number(decimal))],
    });

    const toastContent = [
      {
        title: "Amount:",
        value: "1000 " + symbol,
      },
      {
        title: "Transaction:",
        hash: tx.hash,
      },
    ];

    await toast.promise(
      waitForTransaction({ hash: tx.hash, confirmations: 1 }),
      {
        pending: {
          render: <TxToast title={`Fauceting ${symbol}`} rows={toastContent} />,
        },
        success: {
          render: (
            <TxToast
              title={`Successfully Fauceted ${symbol}`}
              rows={toastContent}
            />
          ),
        },
        error: {
          render(error: any) {
            return renderErrorToast(error);
          },
        },
      }
    );
  };

  return (
    <TableRow
      actionCol={
        <Button
          variant="primary"
          isLoading={mintWrite.isLoading || isConfirming}
          onClick={() => handleFaucet()}
        >
          +1000 {symbol}
        </Button>
      }
    >
      <div>
        <div className="text-gray-400 md:hidden">Token</div>
        <div className="flex items-center">
          <TokenLogo currency={symbol} size={10} />
          <span className="ml-2 font-bold">{symbol}</span>
        </div>
      </div>
      <div>
        <div className="text-gray-400 md:hidden">Decimals</div>
        {decimal.toString()}
      </div>
      <div>
        <div className="text-gray-400 md:hidden">My Balance</div>
        <DisplayAmount
          amount={balance}
          digits={decimal}
          currency={symbol}
          hideLogo
        />
      </div>
    </TableRow>
  );
}

export default function Faucet() {
  const chains = useNetwork();
  const chainId = useChainId();
  const faucetStats = useFaucetStats();

  if (!chains.chain?.testnet) return <></>;

  return (
    <>
      <Head>
        <title>Frankencoin - Faucet</title>
      </Head>
      <div>
        <AppPageHeader title="Faucets" />
        <Table>
          <TableHeader
            headers={["Token", "Decimals", "My Balance"]}
            actionCol
          />
          <TableBody>
            <FaucetRow
              addr={ADDRESS[chainId].xchf}
              symbol={faucetStats.xchfSymbol}
              decimal={faucetStats.xchfDecimals}
              balance={faucetStats.xchfUserBal}
            />
            <FaucetRow
              addr={ADDRESS[chainId].mockVol || zeroAddress}
              symbol={faucetStats.volSymbol}
              decimal={faucetStats.volDecimals}
              balance={faucetStats.volUserBal}
            />
          </TableBody>
        </Table>
      </div>
    </>
  );
}
