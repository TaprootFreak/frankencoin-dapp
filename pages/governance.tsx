import Head from "next/head";
import AppPageHeader from "@components/AppPageHeader";
import {
  useContractUrl,
  useDelegationQuery,
  useGovStats,
  useMinterQuery,
} from "@hooks";
import {
  useAccount,
  useChainId,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { ABIS, ADDRESS } from "@contracts";
import { useRef, useState } from "react";
import { Hash, isAddress, zeroAddress } from "viem";
import Button from "@components/Button";
import { TxToast } from "@components/TxToast";
import { Id, toast } from "react-toastify";
import AppBox from "@components/AppBox";
import DisplayLabel from "@components/DisplayLabel";
import Link from "next/link";
import {
  formatBigInt,
  formatDate,
  formatDuration,
  shortenAddress,
} from "@utils";
import DisplayAmount from "@components/DisplayAmount";
import MinterProposal from "@components/MinterProposal";

export default function Governance() {
  const [inputField, setInputField] = useState("");
  const [delegator, setDelegator] = useState(zeroAddress);
  const [error, setError] = useState("");
  const toastId = useRef<Id>(0);
  const [pendingTx, setPendingTx] = useState<Hash>(zeroAddress);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const chainId = useChainId();
  const equityUrl = useContractUrl(ADDRESS[chainId].equity);
  const account = address || zeroAddress;

  const { minters } = useMinterQuery();
  const delegationData = useDelegationQuery(account);
  const delegationStats = useGovStats(delegationData.pureDelegatedFrom);

  const userRawVotesPercent =
    delegationStats.totalVotes === 0n
      ? 0n
      : (delegationStats.userVotes * 10000n) / delegationStats.totalVotes;
  const userTotalVotesPercent =
    delegationStats.totalVotes === 0n
      ? 0n
      : (delegationStats.userTotalVotes * 10000n) / delegationStats.totalVotes;

  const onChangeDelegatee = (e: any) => {
    setInputField(e.target.value);

    if (isAddress(e.target.value)) {
      setError("");
      setDelegator(e.target.value);
    } else {
      setError("Please input address in valid EOA address format.");
    }
  };

  const { isLoading, writeAsync: delegate } = useContractWrite({
    address: ADDRESS[chainId].equity,
    abi: ABIS.EquityABI,
    functionName: "delegateVoteTo",
    args: [delegator],
    onSuccess(data) {
      toastId.current = toast.loading(
        <TxToast
          title={`Delegating Votes`}
          rows={[
            {
              title: "Delegate To:",
              value: delegator,
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
    <>
      <Head>
        <title>Frankencoin - Governance</title>
      </Head>
      <div>
        <AppPageHeader title="Governance" link={equityUrl} />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 container mx-auto">
          <div className="bg-slate-950 rounded-xl p-4 flex flex-col">
            <div className="text-lg font-bold text-center">Delegation</div>
            <div className="mt-5">
              <div className="px-1 flex-1">Delegate votes to</div>
              <div className="flex gap-2 items-center rounded-lg bg-slate-800 p-2">
                <div
                  className={`flex-1 gap-1 rounded-lg text-white p-1 bg-slate-600 border-2 ${
                    error
                      ? "border-red-300"
                      : "border-neutral-100 border-slate-600"
                  }`}
                >
                  <input
                    className="w-full flex-1 rounded-lg bg-transparent px-2 py-1 text-lg"
                    placeholder="Delegatee's Address"
                    value={inputField}
                    onChange={onChangeDelegatee}
                  />
                </div>
                <div className="w-20">
                  <Button
                    isLoading={isLoading || isConfirming}
                    disabled={delegator == zeroAddress || !!error}
                    onClick={() => delegate()}
                  >
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-2 px-1 text-red-500">{error}</div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <AppBox>
                <DisplayLabel label="Delegated To" />
                {delegationData.delegatedTo == zeroAddress ? (
                  "---"
                ) : (
                  <Link
                    href={
                      chain?.blockExplorers?.default.url +
                      "/address/" +
                      delegationData.delegatedTo
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {shortenAddress(delegationData.delegatedTo)}
                  </Link>
                )}
              </AppBox>
              <AppBox>
                <DisplayLabel label="Your Raw Votes" />
                {(Number(userRawVotesPercent) / 100).toFixed(2)} %
              </AppBox>
              <AppBox>
                <DisplayLabel label="Total Votes" />
                <DisplayAmount
                  amount={delegationStats.totalVotes}
                  digits={24}
                />
              </AppBox>
              <AppBox>
                <DisplayLabel label="Your Total Votes" />
                {(Number(userTotalVotesPercent) / 100).toFixed(2)} %
              </AppBox>
            </div>
            <div className="mt-4 text-lg font-bold text-center">
              Delegating to You
            </div>
            <div className="bg-slate-900 rounded-xl p-4 grid grid-cols-1 gap-2">
              {delegationStats.delegatedFrom.map((from) => {
                const votePercent =
                  delegationStats.totalVotes === 0n
                    ? 0n
                    : (from.votes * 10000n) / delegationStats.totalVotes;
                return (
                  <Link
                    href={
                      chain?.blockExplorers?.default.url +
                      "/address/" +
                      from.owner
                    }
                    target="_blank"
                    className="p-4 bg-slate-800 rounded-xl flex hover:bg-slate-700 duration-300"
                    key={from.owner}
                  >
                    <div className="underline">
                      {shortenAddress(from.owner)}
                    </div>
                    <span className="ml-auto">
                      {(Number(votePercent) / 100).toFixed(2)} %
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-950 rounded-xl p-4">
            <div className="mt-4 text-lg font-bold text-center">Proposals</div>
            <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-2">
              {minters.map((minter: any) => (
                <MinterProposal
                  key={minter.id}
                  minter={minter}
                  helpers={delegationStats.delegatedFrom.map((e) => e.owner)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
