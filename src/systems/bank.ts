import type { GameState, BankLoanPackageId } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { Timeline } from './timeline'

// === BANK TYPES ===

export type LoanPackageDef = {
  id: BankLoanPackageId
  name: string
  emoji: string
  amount: number        // Loan amount
  interestRate: number  // Interest rate (0.10 = 10%)
  duration: number      // Days to repay
}

// === BANK CLASS ===

export class Bank {
  // Loan packages
  static readonly SMALL: LoanPackageDef = {
    id: 'small',
    name: 'Small Loan',
    emoji: '💵',
    amount: 1000,
    interestRate: 0.10,
    duration: 20,
  }

  static readonly MEDIUM: LoanPackageDef = {
    id: 'medium',
    name: 'Medium Loan',
    emoji: '💰',
    amount: 5000,
    interestRate: 0.15,
    duration: 30,
  }

  static readonly LARGE: LoanPackageDef = {
    id: 'large',
    name: 'Large Loan',
    emoji: '🏦',
    amount: 15000,
    interestRate: 0.25,
    duration: 40,
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
   * Calculate total repayment amount (principal + interest)
   */
  static getTotalRepayment(pkg: LoanPackageDef): number {
    return pkg.amount * (1 + pkg.interestRate)
  }

  /**
   * Calculate daily payment
   */
  static getDailyPayment(pkg: LoanPackageDef): number {
    return this.getTotalRepayment(pkg) / pkg.duration
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
    const daysElapsed = state.currentDay - state.bankLoan.startDay
    const totalDays = Math.ceil(state.bankLoan.remainingAmount / state.bankLoan.dailyPayment)
    return Math.max(0, totalDays - daysElapsed)
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
      return { canBuy: false, reason: 'Reach 50 guests to unlock' }
    }
    if (this.hasActiveLoan(state)) {
      return { canBuy: false, reason: 'Repay current loan first' }
    }
    if (this.isOnCooldown(state)) {
      const days = this.getCooldownRemaining(state)
      return { canBuy: false, reason: `${Math.ceil(days)} day cooldown` }
    }
    return { canBuy: true }
  }

  /**
   * Process daily loan repayment
   * Returns the amount deducted from money
   */
  static processDailyRepayment(state: GameState): { newState: Partial<GameState>; amountPaid: number } {
    if (!state.bankLoan) {
      return { newState: {}, amountPaid: 0 }
    }

    const payment = Math.min(state.bankLoan.dailyPayment, state.bankLoan.remainingAmount)
    const newRemaining = state.bankLoan.remainingAmount - payment

    if (newRemaining <= 0) {
      // Loan fully repaid
      return {
        newState: {
          bankLoan: null,
          lastLoanRepaidDay: state.currentDay,
        },
        amountPaid: state.bankLoan.remainingAmount,
      }
    }

    // Continue paying
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
