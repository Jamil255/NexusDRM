import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="glass-card w-full max-w-lg rounded-xl border border-dark-800/80 overflow-hidden shadow-2xl relative z-10 animate-pulse-subtle animate-duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-dark-900/60 border-b border-dark-800/60 flex justify-between items-center">
          <h3 className="text-lg font-bold font-sans text-dark-50">{title}</h3>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-100 p-1.5 hover:bg-dark-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto text-dark-200">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-dark-900/40 border-t border-dark-800/60 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
