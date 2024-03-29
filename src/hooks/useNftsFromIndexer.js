import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { CONTRACT_dNFT } from "../consts/contract";
import useRefetch from "./useRefetch";
import useIsOneNftLiquidatable from "./useIsOneNftLiquidatable";
import useLastSyncVersion from "./useLastSyncVersion";
import { useAccount } from "wagmi";
import { LIQUIDATABLE_OPTION, MY_DNFTS_OPTION } from "../consts/leaderboard";

function setFilters(option, owner, address, range) {
  let _range = range;

  let _owner = owner;
  if (option === MY_DNFTS_OPTION) {
    _owner = address;
  }

  let _deposit = "100000000000000000000000000000000"; // anything very large
  if (option === LIQUIDATABLE_OPTION) {
    _deposit = 0;
  }

  return { _owner, _range, _deposit };
}

/**
 * return the nfts from the indexer, sorted by xp in descending order
 */
export function useNftsFromIndexer(
  range,
  owner = "",
  option = "Leaderboard",
  sort
) {
  const [nfts, setNfts] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { isOneLiquidatable } = useIsOneNftLiquidatable(nfts);
  const { lastSyncVersion } = useLastSyncVersion();
  const { address } = useAccount();

  const { refetch, trigger } = useRefetch();

  useEffect(() => {
    let { _owner, _range, _deposit } = setFilters(
      option,
      owner,
      address,
      range
    );

    if (lastSyncVersion) {
      setIsLoading(true);
      supabase
        .from("nfts")
        .select("*")
        .eq("contractAddress", CONTRACT_dNFT)
        .eq("version_id", lastSyncVersion)
        .lt("deposit", _deposit)
        .or(`owner.match.${_owner},ensName.match.${_owner}`)
        .order(sort.name, { ascending: sort.asc[sort.name] })
        .range(_range.start, _range.end)
        .then((res) => {
          setNfts(res.data);
          setIsLoading(false);
        })
        .catch((_) => {
          setIsLoading(false);
        });
    }
  }, [range, lastSyncVersion, option, sort, trigger]);

  return { nfts, isOneLiquidatable, isLoading, refetch };
}

// return the number of nfts in the nfts table
export function useNftsCountFromIndexer(
  owner = "",
  option = "Leaderboard",
  dependencies
) {
  const [count, setCount] = useState();
  const { lastSyncVersion } = useLastSyncVersion();
  const { address } = useAccount();

  useEffect(() => {
    let { _owner, _deposit } = setFilters(option, owner, address);

    if (lastSyncVersion) {
      supabase
        .from("nfts")
        .select("*", { count: "exact", head: true })
        .lt("deposit", _deposit)
        .eq("contractAddress", CONTRACT_dNFT)
        .eq("version_id", lastSyncVersion)
        .or(`owner.match.${_owner},ensName.match.${_owner}`)
        .then((res) => {
          setCount(res.count);
        });
    }
  }, dependencies);

  return { count };
}
