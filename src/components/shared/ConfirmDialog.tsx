import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading
}: ConfirmDialogProps) {
  
  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="sm">
      <div className="text-gray-600">
        {message}
      </div>
    </Modal>
  );
}
