import { useEffect, useState } from "react";

// Define the Frame SDK context type
export type FrameContext = {
  fid?: number;
  url?: string;
  messageHash?: string;
  timestamp?: number;
  network?: number;
  buttonIndex?: number;
  inputText?: string;
  castId?: {
    fid: number;
    hash: string;
  };
};

// Define the Frame SDK type
export type FrameSDK = {
  context: Promise<FrameContext>;
  actions: {
    ready: () => void;
    close: () => void;
    openUrl: (url: string) => void;
  };
};

// Hook to access the Frame SDK
export function useFrameSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext | null>(null);
  const [sdk, setSDK] = useState<FrameSDK | null>(null);

  useEffect(() => {
    // Check if we're in a Farcaster client environment
    const isFarcasterClient = typeof window !== "undefined" && "frameContext" in window;
    
    if (isFarcasterClient) {
      // @ts-expect-error - Access the global frameContext
      const frameSDK = window.frameContext as FrameSDK;
      setSDK(frameSDK);
      
      const initializeSDK = async () => {
        try {
          const ctx = await frameSDK.context;
          setContext(ctx);
          frameSDK.actions.ready();
          setIsSDKLoaded(true);
        } catch (error) {
          console.error("Error initializing Frame SDK:", error);
        }
      };
      
      initializeSDK();
    } else {
      // Mock SDK for development outside Farcaster client
      const mockSDK: FrameSDK = {
        context: Promise.resolve({
          fid: 1,
          url: "https://example.com/frame",
          timestamp: Date.now(),
          network: 1,
        }),
        actions: {
          ready: () => console.log("Frame ready"),
          close: () => console.log("Frame closed"),
          openUrl: (url) => console.log("Opening URL:", url),
        },
      };
      
      setSDK(mockSDK);
      
      const initMockSDK = async () => {
        const ctx = await mockSDK.context;
        setContext(ctx);
        setIsSDKLoaded(true);
      };
      
      initMockSDK();
    }
  }, []);

  return { isSDKLoaded, sdk, context };
}
