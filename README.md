# DNA DAO (Solana + Anchor + React)

A complete DAO starter on Solana with:
- On-chain governance program (Anchor/Rust)
- Proposal creation and voting
- Wallet connection (Phantom/Solflare)
- Green/white shiny UI theme

## Tech Stack

- **Blockchain**: Solana
- **Smart Contract**: Anchor (Rust)
- **Frontend**: React + TypeScript + Vite
- **Wallets**: Solana Wallet Adapter

## Project Structure

- `programs/dna_dao`: Anchor program
- `tests`: Anchor tests
- `app`: React dApp frontend

## Prerequisites

- Node.js 18+
- Rust + Cargo
- Solana CLI
- Anchor CLI

## Run Locally

1. Install dependencies:
   - Root:
     - `npm install`
   - Frontend:
     - `npm --prefix app install`

2. Build and test program:
   - `anchor build`
   - `anchor test`

3. Run frontend:
   - `npm run app:dev`

4. In wallet (Phantom/Solflare), switch to **Devnet**.

## How to Use

1. Connect wallet.
2. Click **Initialize DAO**.
3. Create a proposal with title/description.
4. Vote YES/NO on proposals.

## Important Notes

- Current `PROGRAM_ID` is a placeholder for development.
- After deployment, update:
  - `Anchor.toml` program address
  - `programs/dna_dao/src/lib.rs` `declare_id!`
  - `app/src/idl.ts` `PROGRAM_ID`

## Logo/Theming

UI is implemented with a green/white glossy DAO theme.  
When you provide your exact logo file, place it in `app/src/assets/` and reference it from `app/src/App.tsx` for exact brand matching.
