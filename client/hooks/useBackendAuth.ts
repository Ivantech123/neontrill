import { useEffect, useRef } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { apiClient, TONWalletAuth } from "@/lib/api";

const payloadTTLMS = 1000 * 60 * 20; // 20 minutes

export function useBackendAuth() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const interval = useRef<ReturnType<typeof setInterval> | undefined>();

  useEffect(() => {
    const refreshPayload = async () => {
      tonConnectUI.setConnectRequestParameters({ state: "loading" });
      try {
        const { payload } = await apiClient.getChallenge();
        tonConnectUI.setConnectRequestParameters({
          state: "ready",
          value: { tonProof: payload },
        });
      } catch (error) {
        tonConnectUI.setConnectRequestParameters(null);
        console.error("Failed to get challenge", error);
      }
    };

    if (wallet) {
      clearInterval(interval.current);
      if (
        wallet.connectItems?.tonProof &&
        !("error" in wallet.connectItems.tonProof)
      ) {
        const authData: TONWalletAuth = {
          address: wallet.account.address,
          publicKey: wallet.account.publicKey,
          walletStateInit: wallet.account.walletStateInit,
          proof: {
            ...wallet.connectItems.tonProof.proof,
            timestamp: wallet.connectItems.tonProof.proof.timestamp,
          },
        };
        apiClient
          .verifyWallet(authData)
          .catch((e) => console.error("Verification failed", e));
      } else {
        // Handle error or disconnection
        apiClient.clearToken();
      }
    } else {
      refreshPayload();
      interval.current = setInterval(refreshPayload, payloadTTLMS);
    }

    return () => clearInterval(interval.current);
  }, [wallet, tonConnectUI]);
}
