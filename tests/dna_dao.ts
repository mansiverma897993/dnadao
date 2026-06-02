import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";

describe("dna_dao", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DnaDao as Program;
  const daoName = "DNA DAO";

  const [daoPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dao"), Buffer.from(daoName)],
    program.programId
  );

  it("initializes dao and creates proposal", async () => {
    await program.methods
      .initializeDao(daoName)
      .accounts({
        dao: daoPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    const daoAccount = await program.account.dao.fetch(daoPda);
    assert.equal(daoAccount.name, daoName);

    const proposalIndex = new anchor.BN(0);
    const [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        daoPda.toBuffer(),
        proposalIndex.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    await program.methods
      .createProposal("Genesis Proposal", "Start DNA DAO operations")
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        creator: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.equal(proposalAccount.title, "Genesis Proposal");
    assert.equal(proposalAccount.votesYes.toNumber(), 0);
  });
});
