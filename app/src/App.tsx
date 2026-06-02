import { useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { Buffer } from "buffer";
import { IDL, PROGRAM_ID } from "./idl";

type ProposalAccount = {
  publicKey: web3.PublicKey;
  account: {
    title: string;
    description: string;
    votesYes: { toString: () => string; toNumber: () => number };
    votesNo: { toString: () => string; toNumber: () => number };
    index: { toNumber: () => number };
  };
};

const DAO_NAME = "DNA DAO";

export function App() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposals, setProposals] = useState<ProposalAccount[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Connect wallet to begin.");

  const [programInitError, setProgramInitError] = useState<string | null>(null);

  const daoPda = useMemo(() => {
    return web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), Buffer.from(DAO_NAME)],
      new web3.PublicKey(PROGRAM_ID)
    )[0];
  }, []);

  async function getProgram() {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    try {
      const anchor = await import("@coral-xyz/anchor");
      const provider = new anchor.AnchorProvider(
        connection,
        wallet as unknown as anchor.AnchorProvider["wallet"],
        { commitment: "confirmed" }
      );
      setProgramInitError(null);
      return new anchor.Program(IDL as never, PROGRAM_ID, provider);
    } catch (error) {
      setProgramInitError((error as Error).message);
      return null;
    }
  }

  async function initializeDao() {
    const program = await getProgram();
    if (!program || !wallet.publicKey) return;
    setBusy(true);
    try {
      await program.methods
        .initializeDao(DAO_NAME)
        .accounts({
          dao: daoPda,
          authority: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        })
        .rpc();
      setStatus("DAO initialized successfully.");
      await refreshProposals();
    } catch (e) {
      setStatus(`Initialize failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function createProposal() {
    const program = await getProgram();
    if (!program || !wallet.publicKey) return;
    setBusy(true);
    try {
      const daoAccount = await program.account.dao.fetch(daoPda);
      const index = daoAccount.proposalCount;
      const [proposalPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("proposal"), daoPda.toBuffer(), index.toArrayLike(Buffer, "le", 8)],
        new web3.PublicKey(PROGRAM_ID)
      );

      await program.methods
        .createProposal(title, description)
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          creator: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        })
        .rpc();

      setTitle("");
      setDescription("");
      setStatus("Proposal created.");
      await refreshProposals();
    } catch (e) {
      setStatus(`Create proposal failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function castVote(proposal: ProposalAccount, approve: boolean) {
    const program = await getProgram();
    if (!program || !wallet.publicKey) return;
    setBusy(true);
    try {
      const [voteRecordPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposal.publicKey.toBuffer(), wallet.publicKey.toBuffer()],
        new web3.PublicKey(PROGRAM_ID)
      );

      await program.methods
        .vote(approve)
        .accounts({
          dao: daoPda,
          proposal: proposal.publicKey,
          voteRecord: voteRecordPda,
          voter: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        })
        .rpc();

      setStatus(approve ? "Voted YES." : "Voted NO.");
      await refreshProposals();
    } catch (e) {
      setStatus(`Vote failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function refreshProposals() {
    const program = await getProgram();
    if (!program) return;
    const all = (await program.account.proposal.all([
      {
        memcmp: { offset: 8, bytes: daoPda.toBase58() }
      }
    ])) as unknown as ProposalAccount[];
    all.sort((a, b) => a.account.index.toNumber() - b.account.index.toNumber());
    setProposals(all);
  }

  return (
    <main className="shell">
      <div className="glow" />
      <section className="hero card">
        <h1>DNA DAO</h1>
        <p>Green & white governance app on Solana.</p>
        <WalletMultiButton />
      </section>
      {programInitError ? (
        <section className="card">
          <p className="status">Program init warning: {programInitError}</p>
        </section>
      ) : null}

      <section className="card actions">
        <button disabled={busy || !wallet.connected} onClick={initializeDao}>
          Initialize DAO
        </button>
        <button disabled={busy} onClick={refreshProposals}>
          Refresh Proposals
        </button>
      </section>

      <section className="card form">
        <h2>Create Proposal</h2>
        <input
          placeholder="Proposal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Proposal description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button disabled={busy || !title || !description} onClick={createProposal}>
          Submit Proposal
        </button>
      </section>

      <section className="card">
        <h2>Live Proposals</h2>
        <div className="proposals">
          {proposals.length === 0 ? (
            <p className="muted">No proposals yet.</p>
          ) : (
            proposals.map((p) => (
              <article className="proposal" key={p.publicKey.toBase58()}>
                <h3>{p.account.title}</h3>
                <p>{p.account.description}</p>
                <div className="votes">
                  <span>YES: {p.account.votesYes.toString()}</span>
                  <span>NO: {p.account.votesNo.toString()}</span>
                </div>
                <div className="actions">
                  <button disabled={busy} onClick={() => castVote(p, true)}>
                    Vote YES
                  </button>
                  <button disabled={busy} onClick={() => castVote(p, false)}>
                    Vote NO
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        <p className="status">{status}</p>
      </section>
    </main>
  );
}
