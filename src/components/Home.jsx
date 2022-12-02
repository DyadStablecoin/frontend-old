import { GOERLI } from "../consts/networks";
import useBlockchain from "../hooks/useBlockchain";
import Claim from "./Claim";
import NFTs from "./NFTs";

export default function Home({ protocolData, nfts, reload, setReload }) {
  const { isConnected, chain } = useBlockchain();

  return (
    <>
      {isConnected ? (
        <div>
          {chain.id === GOERLI ? (
            <div>
              <Claim
                protocolData={protocolData}
                reload={reload}
                setReload={setReload}
              />
              <div className="mt-[1rem] flex justify-center items-center w-full">
                <NFTs
                  reload={reload}
                  setReload={setReload}
                  nfts={nfts}
                  protocolData={protocolData}
                />
              </div>
            </div>
          ) : (
            <div className="mt-10 flex justify-center">
              Please connect to the Goerli Test Network!
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 flex justify-center">Connect your wallet!</div>
      )}
    </>
  );
}
