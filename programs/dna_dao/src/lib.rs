use anchor_lang::prelude::*;

declare_id!("4VoXoZ9jgTi4YY64FGroeomVcuwD28YZVvK2Ux6XtX5h");

#[program]
pub mod dna_dao {
    use super::*;

    /// Initializes a new DNA DAO instance with a custom name and sets the authority
    pub fn initialize_dao(ctx: Context<InitializeDao>, name: String) -> Result<()> {
        require!(name.len() <= 64, DaoError::NameTooLong);

        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.name = name;
        dao.bump = ctx.bumps.dao;
        dao.proposal_count = 0;
        Ok(())
    }

    /// Creates a structured proposal under the specified DAO
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
    ) -> Result<()> {
        require!(title.len() <= 100, DaoError::TitleTooLong);
        require!(description.len() <= 500, DaoError::DescriptionTooLong);

        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;

        proposal.dao = dao.key();
        proposal.creator = ctx.accounts.creator.key();
        proposal.title = title;
        proposal.description = description;
        proposal.votes_yes = 0;
        proposal.votes_no = 0;
        proposal.executed = false;
        proposal.bump = ctx.bumps.proposal;
        proposal.index = dao.proposal_count;

        dao.proposal_count = dao
            .proposal_count
            .checked_add(1)
            .ok_or(DaoError::Overflow)?;
        Ok(())
    }

    /// Casts a weighted vote (approving or rejecting) based on voter reputation/token balance
    pub fn vote(ctx: Context<Vote>, approve: bool, weight: u64) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, DaoError::AlreadyExecuted);
        require!(weight > 0, DaoError::ZeroWeight);

        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.proposal = proposal.key();
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.approve = approve;
        vote_record.weight = weight;
        vote_record.bump = ctx.bumps.vote_record;

        if approve {
            proposal.votes_yes = proposal
                .votes_yes
                .checked_add(weight)
                .ok_or(DaoError::Overflow)?;
        } else {
            proposal.votes_no = proposal
                .votes_no
                .checked_add(weight)
                .ok_or(DaoError::Overflow)?;
        }

        Ok(())
    }

    /// Marks a proposal as executed after validating the majority consensus and quorum requirements
    pub fn mark_executed(ctx: Context<MarkExecuted>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, DaoError::AlreadyExecuted);
        
        // Quorum: must have more YES votes than NO votes, and YES votes must be at least 1
        require!(proposal.votes_yes > proposal.votes_no, DaoError::Defeated);
        require!(proposal.votes_yes >= 1, DaoError::QuorumNotMet);

        proposal.executed = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeDao<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Dao::INIT_SPACE,
        seeds = [b"dao", name.as_bytes()],
        bump
    )]
    pub dao: Account<'info, Dao>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,
    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", dao.key().as_ref(), &dao.proposal_count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    pub dao: Account<'info, Dao>,
    #[account(mut, has_one = dao)]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkExecuted<'info> {
    #[account(has_one = authority)]
    pub dao: Account<'info, Dao>,
    #[account(mut, has_one = dao)]
    pub proposal: Account<'info, Proposal>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Dao {
    pub authority: Pubkey,
    #[max_len(64)]
    pub name: String,
    pub proposal_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub dao: Pubkey,
    pub creator: Pubkey,
    pub index: u64,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub votes_yes: u64,
    pub votes_no: u64,
    pub executed: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub approve: bool,
    pub weight: u64,
    pub bump: u8,
}

#[error_code]
pub enum DaoError {
    #[msg("DAO name is too long")]
    NameTooLong,
    #[msg("Proposal title is too long")]
    TitleTooLong,
    #[msg("Proposal description is too long")]
    DescriptionTooLong,
    #[msg("Math overflow")]
    Overflow,
    #[msg("Proposal already executed")]
    AlreadyExecuted,
    #[msg("Vote weight must be greater than zero")]
    ZeroWeight,
    #[msg("The proposal did not meet the required vote quorum")]
    QuorumNotMet,
    #[msg("The proposal was defeated by majority negative votes")]
    Defeated,
}
