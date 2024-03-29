import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { CONTRACT_dNFT } from "../consts/contract";
import { normalize, round } from "../utils/currency";
import dNFTABI from "../abi/dNFT.json";
import { useState } from "react";
import TextInput from "./TextInput";
import { parseEther } from "../utils/currency";
import PopupContent from "./PopupContent";
import useEthBalance from "../hooks/useEthBalance";
import Divider from "./PopupDivider";
import Table from "./PopupTable";
import Row from "./PopupTableRow";
import useOraclePrice from "../hooks/useOraclePrice";

export default function Liquidate({ nft, onClose, setTxHash }) {
  const [wETH, setWETH] = useState("");
  const { address } = useAccount();
  const { ethBalance } = useEthBalance();
  const { oraclePrice } = useOraclePrice();

  const { config } = usePrepareContractWrite({
    addressOrName: CONTRACT_dNFT,
    contractInterface: dNFTABI["abi"],
    functionName: "liquidate",
    args: [nft.tokenId, address],
    overrides: {
      value: parseEther(wETH),
    },
  });

  const { write } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      onClose();
      setTxHash(data?.hash);
    },
  });

  return (
    <PopupContent
      title="Claim dNFT"
      btnText="CLAIM"
      onClick={() => {
        onClose();
        write?.();
      }}
      isDisabled={!write}
      nft={nft}
    >
      <Divider />
      <div className="flex flex-col items-center gap-2">
        <div className="w-full px-4 pt-2">
          <Table>
            <Row
              label="dNFT Deposit"
              unit="DYAD"
              _old={round(normalize(nft.deposit), 2)}
              _new={round(
                normalize(nft.deposit) + wETH * normalize(oraclePrice, 8),
                2
              )}
            />
          </Table>
        </div>
        <Divider />
        <div className="flex flex-col gap-2 items-center">
          <div className="flex gap-4 justify-between items-between w-full">
            <TextInput
              value={wETH}
              onChange={(v) => {
                setWETH(v);
              }}
              placeholder={0}
              type="number"
            />
            <div className="items-end flex flex-col">
              <div className="flex items-center justify-center gap-1">
                <div>
                  <img
                    className="w-4"
                    src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png"
                    alt=""
                  />
                </div>
                <div>ETH</div>
              </div>
              <div className="text-[#737E76]">
                Balance:{round(ethBalance, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopupContent>
  );
}
