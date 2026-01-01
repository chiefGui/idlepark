import type { GameState, BankLoanPackageId } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { Timeline } from './timeline'
import { Guest } from './guest'

// === BANK TYPES ===

export type LoanPackageDef = {
  id: BankLoanPackageId
  name: string
  emoji: string
  incomeMultiplier: number  // Loan = X days of income
  interestRate: number      // Interest rate (0.10 = 10%)
  duration: number          // Days to repay
  unlockMilestone: string   // Milestone required to unlock
}

// === BANK CLASS ===

export class Bank {
  // Minimum loan amount (floor for early game)
  static readonly MIN_LOAN_AMOUNT = 250

  // Loan packages - unlock progressively, scale with income
  static readonly STARTER: LoanPackageDef = {
    id: 'starter',
    name: 'Starter Loan',
    emoji: '🪙',
    incomeMultiplier: 3,
    interestRate: 0.05,
    duration: 15,
    unlockMilestone: 'guests_50',  // Bank unlock
  }

  static readonly SMALL: LoanPackageDef = {
    id: 'small',
    name: 'Small Loan',
    emoji: '💵',
    incomeMultiplier: 7,
    interestRate: 0.10,
    duration: 20,
    unlockMilestone: 'guests_75',
  }

  static readonly MEDIUM: LoanPackageDef = {
    id: 'medium',
    name: 'Medium Loan',
    emoji: '💰',
    incomeMultiplier: 15,
    interestRate: 0.15,
    duration: 30,
    unlockMilestone: 'guests_100',
  }

  static readonly LARGE: LoanPackageDef = {
    id: 'large',
    name: 'Large Loan',
    emoji: '💎',
    incomeMultiplier: 25,
    interestRate: 0.20,
    duration: 40,
    unlockMilestone: 'guests_150',
  }

  static readonly MAJOR: LoanPackageDef = {
    id: 'major',
    name: 'Major Loan',
    emoji: '🏦',
    incomeMultiplier: 40,
    interestRate: 0.25,
    duration: 50,
    unlockMilestone: 'guests_200',
  }

  static readonly MEGA: LoanPackageDef = {
    id: 'mega',
    name: 'Mega Loan',
    emoji: '👑',
    incomeMultiplier: 60,
    interestRate: 0.30,
    duration: 60,
    unlockMilestone: 'guests_300',
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
   */
  static getLoanAmount(pkg: LoanPackageDef, state: GameState): number {
    const dailyIncome = this.getDailyIncome(state)
    const amount = dailyIncome * pkg.incomeMultiplier
    return Math.max(this.MIN_LOAN_AMOUNT, Math.floor(amount))
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
