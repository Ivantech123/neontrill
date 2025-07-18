import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

export function TONLoginButton({ onDisconnect }: { onDisconnect?: () => void }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { login, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthentication = async () => {
      if (wallet && !isAuthenticated) {
        try {
          // 1. Get challenge from the backend
          const { payload } = await apiClient.getChallenge();

          // 2. Request user to sign the challenge
          const signature = await tonConnectUI.connector.signMessage(payload);

          // 3. Send signature and address to the backend for verification
          await login(wallet.account.address, signature.signature, payload);
        } catch (error) {
          console.error("TON authentication failed:", error);
          // Optional: show a user-friendly error message
        }
      }
    };

    handleAuthentication();
  }, [wallet, isAuthenticated, login, tonConnectUI]);

  const handleDisconnect = () => {
    logout();
    tonConnectUI.disconnect();
    if (onDisconnect) onDisconnect();
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleDisconnect}>Disconnect</button>
      ) : (
        <button onClick={() => tonConnectUI.openModal()}>Connect Wallet</button>
      )}
    </div>
  );
}
