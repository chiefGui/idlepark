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
}

// === BANK CLASS ===

export class Bank {
  // Minimum loan amount (floor for early game)
  static readonly MIN_LOAN_AMOUNT = 500

  // Loan packages - amounts scale with daily income
  static readonly SMALL: LoanPackageDef = {
    id: 'small',
    name: 'Small Loan',
    emoji: '💵',
    incomeMultiplier: 5,    // 5 days of income
    interestRate: 0.10,
    duration: 20,
  }

  static readonly MEDIUM: LoanPackageDef = {
    id: 'medium',
    name: 'Medium Loan',
    emoji: '💰',
    incomeMultiplier: 15,   // 15 days of income
    interestRate: 0.15,
    duration: 30,
  }

  static readonly LARGE: LoanPackageDef = {
    id: 'large',
    name: 'Large Loan',
    emoji: '🏦',
    incomeMultiplier: 30,   // 30 days of income
    interestRate: 0.25,
    duration: 45,
  }

  static readonly ALL: LoanPackageDef[] = [
    Bank.SMALL,
    Bank.MEDIUM,
    Bank.LARGE,
  ]

  static getById(id: BankLoanPackageId): LoanPackageDef | undefined {
    return this.ALL.find(p => p.id === id)
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
  static canTakeLoan(_pkg: LoanPackageDef, state: GameState): { canBuy: boolean; reason?: string } {
    if (!this.isUnlocked(state)) {
      return { canBuy: false, reason: 'Reach 50 guests' }
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
