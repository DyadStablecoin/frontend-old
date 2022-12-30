import { useWaitForTransaction } from "wagmi";
import { dNFT_PRICE, RANDOM_IMAGES } from "../consts/consts";
import { addressSummary } from "../utils/address";
import { formatUSD, round } from "../utils/currency";
import { depositRatio } from "../utils/stats";
import LoadingInplace from "./LoadingInplace";
import { useState } from "react";
import useNft from "../hooks/useNft";
import useRankFromIndexer from "../hooks/useRankFromIndexer";
import useNftStatus, { STATUS } from "../hooks/useNftStatus";
import LeaderboardRowMore from "./LeaderboardRowMore";
import { COLORS } from "../consts/colors";

export default function LeaderboardTableRow({
  id,
  ownerAddress,
  refetch,
  ensName,
  version,
}) {
  const [txHash, setTxHash] = useState();
  const { nft } = useNft(id);
  const { rank } = useRankFromIndexer(id, version);
  const { status } = useNftStatus(nft);

  const { isLoading: isLoadingTx } = useWaitForTransaction({
    hash: txHash,
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <>
      {nft && (
        <tr
          className="leaderboard-row"
          style={{
            border: `1px solid ${
              status === STATUS.LIQUIDATABLE ? COLORS.Red : "#3A403C"
            }`,
          }}
        >
          <td>
            <LoadingInplace isLoading={isLoadingTx} style="w-[40px]" />
            <img
              className="w-10 h-10"
              src={RANDOM_IMAGES[rank % RANDOM_IMAGES.length]}
              alt=""
            />
          </td>
          <td>#{rank}</td>
          <td>{nft.xp}</td>
          <td>{formatUSD(dNFT_PRICE)}</td>
          <td className="hidden md:table-cell">
            {round(nft.deposit / 10 ** 18, 2)}
          </td>
          <td className="hidden md:table-cell">
            {round(nft.withdrawn / 10 ** 18, 2)}
          </td>
          <td className="hidden md:table-cell">
            {depositRatio(parseFloat(nft.withdrawn), parseFloat(nft.deposit))}%
          </td>
          <td>{ensName || addressSummary(ownerAddress)}</td>
          <td>
            <LeaderboardRowMore nft={nft} setTxHash={setTxHash} />
          </td>
        </tr>
      )}
    </>
  );
}
