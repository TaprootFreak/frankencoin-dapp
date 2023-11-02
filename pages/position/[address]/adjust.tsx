import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { Hash, formatUnits, getAddress, zeroAddress } from "viem";
import { usePositionStats } from "@hooks";
import Head from "next/head";
import AppPageHeader from "@components/AppPageHeader";
import SwapFieldInput from "@components/SwapFieldInput";
import DisplayAmount from "@components/DisplayAmount";
import { abs, shortenAddress } from "@utils";
import Button from "@components/Button";
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ABIS } from "@contracts";
import { Id, toast } from "react-toastify";
import { TxToast } from "@components/TxToast";

export default function PositionAdjust({}) {
  
  const router = useRouter();
  const toastId = useRef<Id>(0);
  const { address: positionAddr } = router.query;
  const { address } = useAccount();
  const position = getAddress(String(positionAddr || zeroAddress));
  const positionStats = usePositionStats(position);

  const [amountError, setAmountError] = useState("");
  const [collError, setCollError] = useState("");
  const [amount, setAmount] = useState(positionStats.minted);
  const [collateralAmount, setCollateralAmount] = useState(positionStats.collateralBal);
  const [liqPrice, setLiqPrice] = useState(positionStats.liqPrice);
  const [pendingTx, setPendingTx] = useState<Hash>(zeroAddress);

  const repayPosition =
    positionStats.minted > positionStats.frankenBalance
      ? positionStats.minted - positionStats.frankenBalance
      : 0n;
  const additionalAmount = amount - positionStats.minted;
  const isNegativeDiff = additionalAmount < 0;
  const borrowReserveContribution =
    (positionStats.reserveContribution * additionalAmount) / 1_000_000n;
  const fees = (additionalAmount * positionStats.mintingFee) / 1_000_000n;

  const paidOutAmount = () => {
    const reserveAndFees = borrowReserveContribution + fees;

    if (isNegativeDiff) {
      return abs(additionalAmount - fees) - reserveAndFees;
    } else {
      return additionalAmount - reserveAndFees;
    }
  };

  const collateralNote =
    collateralAmount < positionStats.collateralBal
      ? `${formatUnits(
          abs(collateralAmount - positionStats.collateralBal),
          positionStats.collateralDecimal
        )} ${positionStats.collateralSymbol} sent back to your wallet`
      : collateralAmount > positionStats.collateralBal
      ? `${formatUnits(
          abs(collateralAmount - positionStats.collateralBal),
          positionStats.collateralDecimal
        )} ${positionStats.collateralSymbol} taken from your wallet`
      : "";

  const onChangeAmount = (value: string) => {
    const valueBigInt = BigInt(value);
    setAmount(valueBigInt);
    if (valueBigInt > positionStats.limit) {
      setAmountError(
        `This position is limited to ${formatUnits(
          positionStats.limit,
          18
        )} ZCHF`
      );
    } else if (
      isNegativeDiff &&
      paidOutAmount() > positionStats.frankenBalance
    ) {
      setAmountError("Insufficient ZCHF amount in wallet");
    } else {
      setAmountError("");
    }
  };

  const onChangeCollAmount = (value: string) => {
    const valueBigInt = BigInt(value);
    setCollateralAmount(valueBigInt);
    if (
      valueBigInt > positionStats.collateralBal &&
      valueBigInt - positionStats.collateralBal >
        positionStats.collateralUserBal
    ) {
      setCollError(
        `Insufficient ${positionStats.collateralSymbol} in your wallet.`
      );
    } else {
      setCollError("");
    }
  };

  const onChangeLiqAmount = (value: string) => {
    const valueBigInt = BigInt(value);
    setLiqPrice(valueBigInt);
    // setError(valueBigInt > fromBalance)
  };

  const { isLoading: approveLoading, write: approveCollateral } =
    useContractWrite({
      address: positionStats.collateral,
      abi: erc20ABI,
      functionName: "approve",
      onSuccess(data) {
        toastId.current = toast.loading(
          <TxToast
            title="Approving ZCHF"
            rows={[
              {
                title: "Amount:",
                value: formatUnits(
                  collateralAmount,
                  positionStats.collateralDecimal
                ),
              },
              {
                title: "Spender: ",
                value: shortenAddress(position),
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

  const { isLoading: adjustLoading, write: adjustPos } = useContractWrite({
    address: position,
    abi: ABIS.PositionABI,
    functionName: "adjust",
    onSuccess(data) {
      toastId.current = toast.loading(
        <TxToast
          title="Adjusting Position"
          rows={[
            {
              title: "Amount:",
              value: formatUnits(amount, 18),
            },
            {
              title: "Collateral Amount:",
              value: formatUnits(
                collateralAmount,
                positionStats.collateralDecimal
              ),
            },
            {
              title: "Liquidation Price:",
              value: formatUnits(liqPrice, 18),
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
      setPendingTx(zeroAddress);
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

  return (
    <>
      <Head>
        <title>Frankencoin - Adjust Position</title>
      </Head>
      <div>
        <AppPageHeader
          title="Adjust Position"
          backText="Back to position"
          backTo={`/position/${positionAddr}`}
        />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 rounded-xl p-4 flex flex-col gap-y-4">
            <div className="text-lg font-bold text-center">Variables</div>
            <SwapFieldInput
              label="Amount"
              symbol="ZCHF"
              balanceLabel="Min:"
              max={repayPosition}
              value={amount.toString()}
              onChange={onChangeAmount}
              error={amountError}
              // TODO: Children
            />
            <SwapFieldInput
              label="Collateral"
              balanceLabel="Max:"
              symbol={positionStats.collateralSymbol}
              max={
                positionStats.collateralUserBal + positionStats.collateralBal
              }
              value={collateralAmount.toString()}
              onChange={onChangeCollAmount}
              digit={positionStats.collateralDecimal}
              note={collateralNote}
              error={collError}
              // TODO: Children
            />
            <SwapFieldInput
              label="Liquidation Price"
              balanceLabel="Current Value"
              symbol={"ZCHF"}
              max={positionStats.liqPrice}
              value={liqPrice.toString()}
              digit={36 - positionStats.collateralDecimal}
              onChange={onChangeLiqAmount}
              // TODO: Children
            />
            <div className="mx-auto mt-8 w-72 max-w-full flex-col">
              {collateralAmount - positionStats.collateralBal >
              positionStats.collateralPosAllowance ? (
                <Button
                  isLoading={approveLoading || isConfirming}
                  onClick={() =>
                    approveCollateral({ args: [position, collateralAmount - positionStats.collateralBal] })
                  }
                >
                  Approve Collateral
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={amount == 0n || !!amountError || !!collError}
                  error={
                    positionStats.owner != address
                      ? "You can only adjust your own position"
                      : ""
                  }
                  isLoading={adjustLoading}
                  onClick={() =>
                    adjustPos({
                      args: [amount, collateralAmount, liqPrice],
                    })
                  }
                >
                  Adjust Position
                </Button>
              )}
            </div>
          </div>
          <div className="bg-slate-950 rounded-xl p-4 flex flex-col gap-y-4">
            <div className="text-lg font-bold text-center">Outcome</div>
            <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex">
                <div className="flex-1">Current minted amount</div>
                <DisplayAmount
                  amount={positionStats.minted}
                  currency={"ZCHF"}
                />
              </div>
              <div className="flex">
                <div className="flex-1">
                  {isNegativeDiff ? "Amount you return" : "Amount you receive"}
                </div>
                <DisplayAmount amount={paidOutAmount()} currency={"ZCHF"} />
              </div>
              <div className="flex">
                <div className="flex-1">
                  {isNegativeDiff
                    ? "Returned from reserve"
                    : "Added to reserve"}
                </div>
                <DisplayAmount
                  amount={borrowReserveContribution}
                  currency={"ZCHF"}
                />
              </div>
              <div className="flex">
                <div className="flex-1">Deducted fee / interest</div>
                <DisplayAmount amount={fees} currency={"ZCHF"} />
              </div>
              <hr className="border-slate-700 border-dashed" />
              <div className="flex font-bold">
                <div className="flex-1">Future minted amount</div>
                <DisplayAmount amount={amount} currency={"ZCHF"} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
