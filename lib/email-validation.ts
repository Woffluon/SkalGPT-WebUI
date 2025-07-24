import isDisposable from 'is-disposable-email';

export function isDisposableEmail(email: string): boolean {
  return isDisposable(email);
} 