import { useToastStore } from '@/components/common/Toast';

/**
 * Utility functions for showing toast notifications
 * Extracts simplified error messages from various error types
 */

function extractErrorMessage(error: unknown): string {
  if (!error) return 'An error occurred';

  // Handle objects with code property (e.g., MetaMask errors)
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (code === 4001 || code === '4001') {
      return 'Transaction cancelled';
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Simplify common error messages
    if (message.includes('User rejected') || message.includes('User denied') || message.includes('denied transaction') || message.includes('Tx Signature: User denied')) {
      return 'Transaction cancelled';
    }
    if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
      return 'Insufficient balance';
    }
    if (message.includes('execution reverted')) {
      // Extract the revert reason if available
      const revertMatch = message.match(/execution reverted:?\s*(.+)/i);
      if (revertMatch && revertMatch[1]) {
        return revertMatch[1].trim();
      }
      return 'Transaction failed';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'Network error. Please try again';
    }
    if (message.includes('timeout')) {
      return 'Request timeout. Please try again';
    }

    // Return simplified message (first sentence or first 100 chars)
    const firstSentence = message.split('.')[0];
    return firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error.length > 150 ? error.substring(0, 150) + '...' : error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return extractErrorMessage((error as { message: unknown }).message);
  }

  return 'An unexpected error occurred';
}

/**
 * Show a success toast
 */
export function toastSuccess(message: string) {
  const { addToast } = useToastStore.getState();
  addToast(message, 'success');
}

/**
 * Show an error toast with simplified message
 */
export function toastError(error: unknown) {
  const { addToast } = useToastStore.getState();
  const message = extractErrorMessage(error);
  addToast(message, 'error');
}

/**
 * Show an info toast
 */
export function toastInfo(message: string) {
  const { addToast } = useToastStore.getState();
  addToast(message, 'info');
}

/**
 * Show a warning toast
 */
export function toastWarning(message: string) {
  const { addToast } = useToastStore.getState();
  addToast(message, 'warning');
}

