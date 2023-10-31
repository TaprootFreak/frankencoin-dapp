import Head from "next/head";
import AppPageHeader from "@components/AppPageHeader";
import { useRouter } from "next/router";
import { formatUnits, getAddress, zeroAddress, Hash } from "viem";
import SwapFieldInput from "@components/SwapFieldInput";
import { usePositionStats } from "@hooks";
import { useRef, useState } from "react";
import DisplayAmount from "@components/DisplayAmount";
import Button from "@components/Button";
import {
  erc20ABI,
  useAccount,
  useChainId,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ABIS, ADDRESS } from "@contracts";
import { formatBigInt, min, shortenAddress } from "@utils";
import { Id, toast } from "react-toastify";
import { TxToast } from "@components/TxToast";

export default function PositionBorrow({}) {
  const router = useRouter();
  const [amount, setAmount] = useState(0n);
  const [error, setError] = useState("");
  const [pendingTx, setPendingTx] = useState<Hash>(zeroAddress);
  const toastId = useRef<Id>(0);
  const { address: positionAddr } = router.query;

  const chainId = useChainId();
  const { address } = useAccount();
  const position = getAddress(String(positionAddr || zeroAddress));
  const positionStats = usePositionStats(position);

  const requiredColl =
    positionStats.liqPrice == 0n
      ? 0n
      : (BigInt(1e18) * amount) / positionStats.liqPrice;
  const borrowersReserveContribution =
    (positionStats.reserveContribution * amount) / 1_000_000n;
  const fees = (positionStats.mintingFee * amount) / 1_000_000n;
  const paidOutToWallet = amount - borrowersReserveContribution - fees;
  const availableAmount = positionStats.available;
  const userValue =
    (positionStats.collateralUserBal * positionStats.liqPrice) / BigInt(1e18);
  const borrowingLimit = min(availableAmount, userValue);

  const onChangeAmount = (value: string) => {
    const valueBigInt = BigInt(value);
    setAmount(valueBigInt);
    if (valueBigInt > borrowingLimit) {
      if (availableAmount > userValue) {
        setError(
          `Not enough ${positionStats.collateralSymbol} in your wallet.`
        );
      } else {
        setError("Not enough ZCHF available for this position.");
      }
    } else {
      setError("");
    }
  };

  const onChangeCollateral = (value: string) => {
    const valueBigInt = (BigInt(value) * positionStats.liqPrice) / BigInt(1e18);
    if (valueBigInt > borrowingLimit) {
      setError("Cannot borrow more than " + borrowingLimit + "." + valueBigInt);
    } else {
      setError("");
    }
    setAmount(valueBigInt);
  };

  const { isLoading: approveLoading, writeAsync: approveFranken } =
    useContractWrite({
      address: ADDRESS[chainId].frankenCoin,
      abi: erc20ABI,
      functionName: "approve",
      onSuccess(data) {
        toastId.current = toast.loading(
          <TxToast
            title="Approving ZCHF"
            rows={[
              {
                title: "Amount:",
                value: formatBigInt(amount) + " ZCHF",
              },
              {
                title: "Spender: ",
                value: shortenAddress(ADDRESS[chainId].mintingHub),
              },
              {
                title: "Transaction:",
                hash: data.hash,
              },
            ]}
          />
        );
        setPendingTx(data.hash);
      },
      onError(error) {
        const errorLines = error.message.split("\n");
        toast.warning(
          <TxToast
            title="Transaction Failed!"
            rows={errorLines.slice(0, errorLines.length - 3).map((line) => {
              return {
                title: "",
                value: line,
              };
            })}
          />
        );
      },
    });
  const { isLoading: cloneLoading, write: clonePosition } = useContractWrite({
    address: ADDRESS[chainId].mintingHub,
    abi: ABIS.MintingHubABI,
    functionName: "clone",
    onSuccess(data) {
      toastId.current = toast.loading(
        <TxToast
          title={`Borrowing ZCHF`}
          rows={[
            {
              title: `Amount: `,
              value: formatBigInt(amount) + " ZCHF",
            },
            {
              title: `Collateral: `,
              value:
                formatBigInt(requiredColl, positionStats.collateralDecimal) +
                " " +
                positionStats.collateralSymbol,
            },
            {
              title: "Transaction:",
              hash: data.hash,
            },
          ]}
        />
      );
      setPendingTx(data.hash);
    },
    onError(error) {
      const errorLines = error.message.split("\n");
      toast.warning(
        <TxToast
          title="Transaction Failed!"
          rows={errorLines.slice(0, errorLines.length - 3).map((line) => {
            return {
              title: "",
              value: line,
            };
          })}
        />
      );
    },
  });
  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: pendingTx,
    enabled: pendingTx != zeroAddress,
    onSuccess(data) {
      toast.update(toastId.current, {
        type: "success",
        render: (
          <TxToast
            title="Transaction Confirmed!"
            rows={[
              {
                title: "Transaction: ",
                hash: data.transactionHash,
              },
            ]}
          />
        ),
        autoClose: 5000,
        isLoading: false,
      });
      setPendingTx(zeroAddress);
    },
  });

  return (
    <>
      <Head>
        <title>Frankencoin - Borrow</title>
      </Head>
      <div>
        <AppPageHeader
          title="Borrow"
          backText="Back to position"
          backTo={`/position/${position}`}
        />
        <section className="mx-auto flex max-w-2xl flex-col gap-y-4 px-4 sm:px-8">
          <div className="bg-slate-950 rounded-xl p-4 flex flex-col gap-y-4">
            <div className="text-lg font-bold text-center mt-3">
              Borrow by Cloning an Existing Position
            </div>
            <div className="space-y-8">
              <SwapFieldInput
                label="Amount"
                balanceLabel="Limit:"
                symbol="ZCHF"
                error={error}
                max={availableAmount}
                value={amount.toString()}
                onChange={onChangeAmount}
              />
              <SwapFieldInput
                showOutput
                label="Required Collateral"
                balanceLabel="Your balance:"
                max={positionStats.collateralUserBal}
                onChange={onChangeCollateral}
                output={formatUnits(
                  requiredColl,
                  positionStats.collateralDecimal
                )}
                symbol={positionStats.collateralSymbol}
              />
              <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex">
                  <div className="flex-1">Paid to your wallet</div>
                  <DisplayAmount amount={paidOutToWallet} currency="ZCHF" />
                </div>
                <div className="flex">
                  <div className="flex-1">Locked in borrowers reserve</div>
                  <DisplayAmount
                    amount={borrowersReserveContribution}
                    currency="ZCHF"
                  />
                </div>
                <div className="flex">
                  <div className="flex-1">Fees</div>
                  <DisplayAmount amount={fees} currency="ZCHF" />
                </div>
                <hr className="border-slate-700 border-dashed" />
                <div className="flex font-bold">
                  <div className="flex-1">Total</div>
                  <DisplayAmount amount={amount} currency="ZCHF" />
                </div>
              </div>
            </div>
            <div className="mx-auto mt-8 w-72 max-w-full flex-col">
              {amount > positionStats.frankenAllowance ? (
                <Button
                  disabled={amount == 0n || !!error}
                  isLoading={approveLoading || isConfirming}
                  onClick={() =>
                    approveFranken({
                      args: [ADDRESS[chainId].mintingHub, amount],
                    })
                  }
                >
                  Approve
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={amount == 0n || !!error}
                  isLoading={cloneLoading || isConfirming}
                  error={
                    positionStats.owner == address
                      ? "You cannot clone your own position"
                      : ""
                  }
                  onClick={() =>
                    clonePosition({
                      args: [
                        position,
                        requiredColl,
                        amount,
                        positionStats.expiration,
                      ],
                    })
                  }
                >
                  Clone Position
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
