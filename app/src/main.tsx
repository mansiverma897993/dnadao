import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";
import { App } from "./App";
import { AppWalletProvider } from "./wallet";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./styles.css";

(globalThis as typeof globalThis & { Buffer?: typeof Buffer }).Buffer = Buffer;
(globalThis as typeof globalThis & { global?: typeof globalThis }).global = globalThis;
(globalThis as typeof globalThis & { process?: { env: Record<string, string> } }).process ??= {
  env: {}
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWalletProvider>
      <App />
    </AppWalletProvider>
  </React.StrictMode>
);
