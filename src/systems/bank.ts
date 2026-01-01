import type { GameState, BankLoanPackageId } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { Timeline } from './timeline'
import { Guest } from './guest'

// === BANK TYPES ===

export type LoanPackageDef = {
  id: BankLoanPackageId
  name: string
  emoji: string
  minAmount: number         // Minimum loan amount for this tier
  incomeMultiplier: number  // Loan = X days of income (if higher than min)
  interestRate: number      // Interest rate (0.10 = 10%)
  duration: number          // Days to repay
  unlockMilestone: string   // Milestone required to unlock
}

// === BANK CLASS ===

export class Bank {
  // Loan packages - unlock progressively, scale with income
  // Each tier has a minimum amount + income-based scaling
  // Milestones: 50 → 100 → 200 → 400 → 700 → 1000
  static readonly STARTER: LoanPackageDef = {
    id: 'starter',
    name: 'Starter Loan',
    emoji: '🪙',
    minAmount: 3000,
    incomeMultiplier: 10,
    interestRate: 0.05,
    duration: 20,
    unlockMilestone: 'guests_50',
  }

  static readonly SMALL: LoanPackageDef = {
    id: 'small',
    name: 'Small Loan',
    emoji: '💵',
    minAmount: 8000,
    incomeMultiplier: 15,
    interestRate: 0.08,
    duration: 25,
    unlockMilestone: 'guests_100',
  }

  static readonly MEDIUM: LoanPackageDef = {
    id: 'medium',
    name: 'Medium Loan',
    emoji: '💰',
    minAmount: 20000,
    incomeMultiplier: 25,
    interestRate: 0.12,
    duration: 35,
    unlockMilestone: 'guests_200',
  }

  static readonly LARGE: LoanPackageDef = {
    id: 'large',
    name: 'Large Loan',
    emoji: '💎',
    minAmount: 50000,
    incomeMultiplier: 35,
    interestRate: 0.15,
    duration: 45,
    unlockMilestone: 'guests_400',
  }

  static readonly MAJOR: LoanPackageDef = {
    id: 'major',
    name: 'Major Loan',
    emoji: '🏦',
    minAmount: 100000,
    incomeMultiplier: 50,
    interestRate: 0.18,
    duration: 55,
    unlockMilestone: 'guests_700',
  }

  static readonly MEGA: LoanPackageDef = {
    id: 'mega',
    name: 'Mega Loan',
    emoji: '👑',
    minAmount: 200000,
    incomeMultiplier: 75,
    interestRate: 0.22,
    duration: 70,
    unlockMilestone: 'guests_1000',
  }

  static readonly ALL: LoanPackageDef[] = [
    Bank.STARTER,
    Bank.SMALL,
    Bank.MEDIUM,
    Bank.LARGE,
    Bank.MAJOR,
    Bank.MEGA,
  ]

  static getById(id: BankLoanPackageId): LoanPackageDef | undefined {
    return this.ALL.find(p => p.id === id)
  }

  /**
   * Check if a specific loan package is unlocked
   */
  static isPackageUnlocked(pkg: LoanPackageDef, state: GameState): boolean {
    return Timeline.hasAchievedMilestone(pkg.unlockMilestone, state)
  }

  /**
   * Get all unlocked loan packages
   */
  static getUnlockedPackages(state: GameState): LoanPackageDef[] {
    return this.ALL.filter(pkg => this.isPackageUnlocked(pkg, state))
  }

  /**
   * Get estimated daily income for loan calculation
   */
  static getDailyIncome(state: GameState): number {
    const guests = GameTypes.getTotalGuests(state.guestBreakdown)
    const baseIncome = Guest.calculateIncomeWithEntertainment(
      guests,
      state.ticketPrice,
      state.stats.entertainment
    )
    return Math.max(baseIncome, 50) // Floor of $50/day for calculations
  }

  /**
   * Calculate loan amount based on current income
   * Uses per-tier minimum or income-based amount (whichever is higher)
   */
  static getLoanAmount(pkg: LoanPackageDef, state: GameState): number {
    const dailyIncome = this.getDailyIncome(state)
    const incomeBasedAmount = dailyIncome * pkg.incomeMultiplier
    return Math.max(pkg.minAmount, Math.floor(incomeBasedAmount))
  }

  /**
   * Calculate total repayment amount (principal + interest)
   */
  static getTotalRepayment(pkg: LoanPackageDef, state: GameState): number {
    const amount = this.getLoanAmount(pkg, state)
    return Math.floor(amount * (1 + pkg.interestRate))
  }

  /**
   * Calculate daily payment
   */
  static getDailyPayment(pkg: LoanPackageDef, state: GameState): number {
    return Math.ceil(this.getTotalRepayment(pkg, state) / pkg.duration)
  }

  /**
   * Check if bank is unlocked (guests_50 milestone achieved)
   */
  static isUnlocked(state: GameState): boolean {
    return Timeline.hasAchievedMilestone('guests_50', state)
  }

  /**
   * Check if player has an active loan
   */
  static hasActiveLoan(state: GameState): boolean {
    return state.bankLoan !== null
  }

  /**
   * Get remaining days on current loan
   */
  static getLoanDaysRemaining(state: GameState): number {
    if (!state.bankLoan) return 0
    return Math.ceil(state.bankLoan.remainingAmount / state.bankLoan.dailyPayment)
  }

  /**
   * Get cooldown remaining (days until can take new loan)
   */
  static getCooldownRemaining(state: GameState): number {
    if (state.lastLoanRepaidDay === 0) return 0
    const daysSinceRepaid = state.currentDay - state.lastLoanRepaidDay
    return Math.max(0, GameTypes.BANK_COOLDOWN_DAYS - daysSinceRepaid)
  }

  /**
   * Check if on cooldown
   */
  static isOnCooldown(state: GameState): boolean {
    return this.getCooldownRemaining(state) > 0
  }

  /**
   * Check if can take a specific loan
   */
  static canTakeLoan(pkg: LoanPackageDef, state: GameState): { canBuy: boolean; reason?: string } {
    if (!this.isPackageUnlocked(pkg, state)) {
      // Extract guest count from milestone (e.g., 'guests_100' -> '100')
      const guestCount = pkg.unlockMilestone.replace('guests_', '')
      return { canBuy: false, reason: `${guestCount} guests` }
    }
    if (this.hasActiveLoan(state)) {
      return { canBuy: false, reason: 'Repay first' }
    }
    if (this.isOnCooldown(state)) {
      const days = this.getCooldownRemaining(state)
      return { canBuy: false, reason: `${Math.ceil(days)}d cooldown` }
    }
    return { canBuy: true }
  }

  /**
   * Process daily loan repayment
   */
  static processDailyRepayment(state: GameState): { newState: Partial<GameState>; amountPaid: number } {
    if (!state.bankLoan) {
      return { newState: {}, amountPaid: 0 }
    }

    const payment = Math.min(state.bankLoan.dailyPayment, state.bankLoan.remainingAmount)
    const newRemaining = state.bankLoan.remainingAmount - payment

    if (newRemaining <= 0) {
      return {
        newState: {
          bankLoan: null,
          lastLoanRepaidDay: state.currentDay,
        },
        amountPaid: state.bankLoan.remainingAmount,
      }
    }

    return {
      newState: {
        bankLoan: {
          ...state.bankLoan,
          remainingAmount: newRemaining,
        },
      },
      amountPaid: payment,
    }
  }
}
