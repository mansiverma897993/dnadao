export const PROGRAM_ID = "4VoXoZ9jgTi4YY64FGroeomVcuwD28YZVvK2Ux6XtX5h";

export const IDL = {
  version: "0.1.0",
  name: "dna_dao",
  instructions: [
    {
      name: "initializeDao",
      accounts: [
        { name: "dao", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [{ name: "name", type: "string" }]
    },
    {
      name: "createProposal",
      accounts: [
        { name: "dao", isMut: true, isSigner: false },
        { name: "proposal", isMut: true, isSigner: false },
        { name: "creator", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "title", type: "string" },
        { name: "description", type: "string" }
      ]
    },
    {
      name: "vote",
      accounts: [
        { name: "dao", isMut: false, isSigner: false },
        { name: "proposal", isMut: true, isSigner: false },
        { name: "voteRecord", isMut: true, isSigner: false },
        { name: "voter", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [{ name: "approve", type: "bool" }]
    }
  ],
  accounts: [
    {
      name: "dao",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "name", type: "string" },
          { name: "proposalCount", type: "u64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "proposal",
      type: {
        kind: "struct",
        fields: [
          { name: "dao", type: "publicKey" },
          { name: "creator", type: "publicKey" },
          { name: "index", type: "u64" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "votesYes", type: "u64" },
          { name: "votesNo", type: "u64" },
          { name: "executed", type: "bool" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ]
} as const;
