import { ToastMessage } from '../types';

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastService {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = [...this.toasts];
    this.listeners.forEach((listener) => listener(copy));
  }

  show(type: ToastMessage['type'], title: string, message?: string) {
    const duplicate = this.toasts.some(
      (toast) => toast.type === type && toast.title === title && toast.message === message,
    );
    if (duplicate) return;

    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { id, type, title, message };
    this.toasts.push(newToast);
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, 4500);
  }

  success(title: string, message?: string) {
    this.show('success', title, message);
  }

  error(title: string, message?: string) {
    this.show('error', title, message);
  }

  info(title: string, message?: string) {
    this.show('info', title, message);
  }

  warning(title: string, message?: string) {
    this.show('warning', title, message);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toastService = new ToastService();
