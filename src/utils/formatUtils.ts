import { BudgetLevel } from '../types';

/**
 * 截斷文字，超過 maxLength 時加省略號
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
}

/**
 * 由平均消費金額衍生預算等級
 * - avgCost <= 200 → '$'
 * - avgCost <= 600 → '$$'
 * - avgCost > 600 → '$$$'
 * - avgCost === null → null
 */
export function deriveBudgetLevel(avgCost: number | null): BudgetLevel | null {
  if (avgCost === null) {
    return null;
  }
  if (avgCost <= 200) {
    return '$';
  }
  if (avgCost <= 600) {
    return '$$';
  }
  return '$$$';
}

/**
 * 格式化金額為貨幣字串 (e.g., '$350')
 */
export function formatCurrency(amount: number): string {
  return '$' + amount;
}
