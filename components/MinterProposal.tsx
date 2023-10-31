import {
  formatBigInt,
  formatDate,
  formatDuration,
  isDateExpired,
  shortenAddress,
} from "@utils";
import AppBox from "./AppBox";
import Link from "next/link";
import { Address, Hash, zeroAddress } from "viem";
import { useContractUrl } from "@hooks";
import Button from "./Button";
import { useChainId, useContractWrite, useWaitForTransaction } from "wagmi";
import { ADDRESS, ABIS } from "@contracts";
import { Id, toast } from "react-toastify";
import { TxToast } from "./TxToast";
import { useRef, useState } from "react";

interface Props {
  minter: Minter;
  helpers: Address[];
}

interface Minter {
  id: string;
  minter: Address;
  applicationPeriod: bigint;
  applicationFee: bigint;
  applyMessage: string;
  applyDate: bigint;
  suggestor: string;
  denyMessage: string;
  denyDate: string;
  vetor: string;
}

export default function MinterProposal({ minter, helpers }: Props) {
  const [pendingTx, setPendingTx] = useState<Hash>(zeroAddress);
  const toastId = useRef<Id>(0);

  const minterUrl = useContractUrl(minter.minter);
  const isVotingFinished = isDateExpired(
    BigInt(minter.applyDate) + BigInt(minter.applicationPeriod)
  );
  const status = !minter.vetor
    ? isVotingFinished
      ? "Passed"
      : "Active"
    : "Vetoed";

  const chainId = useChainId();
  const { isLoading, write: veto } = useContractWrite({
    address: ADDRESS[chainId].frankenCoin,
    abi: ABIS.FrankencoinABI,
    functionName: "denyMinter",
    args: [minter.minter, helpers, "Bad"],
    onSuccess(data) {
      toastId.current = toast.loading(
        <TxToast
          title="Vetoing Proposal"
          rows={[
            {
              title: "Reason:",
              value: "Bad",
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
    <AppBox className="grid grid-cols-6 hover:bg-slate-700 duration-300">
      <div className="col-span-6 sm:col-span-5 pr-4">
        <div className="flex">
          <div>Date:</div>
          <div className="ml-auto">{formatDate(minter.applyDate)}</div>
        </div>
        <div className="flex">
          <div>Minter:</div>
          <Link
            href={minterUrl}
            target="_blank"
            rel="noreferrer"
            className="underline ml-auto"
          >
            {shortenAddress(minter.minter)}
          </Link>
        </div>
        <div className="flex">
          <div>Comment:</div>
          <div className="ml-auto font-bold">{minter.applyMessage}</div>
        </div>
        <div className="flex">
          <div>Fee:</div>
          <div className="ml-auto">
            {formatBigInt(minter.applicationFee, 18)} ZCHF
          </div>
        </div>
        <div className="flex">
          <div>Voting Period:</div>
          <div className="ml-auto">
            {formatDuration(minter.applicationPeriod)}
          </div>
        </div>
      </div>
      <div className="col-span-6 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-dashed pt-4 sm:pl-4 mt-4 sm:mt-0 flex flex-col">
        <div
          className={`rounded-xl text-white text-center ${
            status == "Passed"
              ? "bg-green-800"
              : status == "Active"
              ? "bg-green-600"
              : "bg-gray-700"
          }`}
        >
          {status}
        </div>
        {status == "Vetoed" && (
          <Button
            onClick={() => veto()}
            className="mt-auto"
            isLoading={isLoading || isConfirming}
          >
            Veto
          </Button>
        )}
      </div>
    </AppBox>
  );
}
