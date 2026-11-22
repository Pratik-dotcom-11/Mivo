import React from 'react';
import { Modal, Button } from '@/components/common';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  noteTitle,
  isDeleting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">Delete Voice Note</span>
        </div>
      }
      description="This action cannot be undone."
      size="sm"
    >
      <div className="py-2 space-y-4">
        <p className="text-xs sm:text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
          Are you sure you want to delete{' '}
          <strong className="text-charcoal-900 dark:text-white font-bold break-words">
            "{noteTitle || 'Untitled Note'}"
          </strong>
          ? The transcription and audio recording will be permanently deleted from your Supabase vault.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-charcoal-100 dark:border-dark-border">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="font-bold"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};
