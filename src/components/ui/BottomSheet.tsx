import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:flex sm:items-center sm:justify-center animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl w-full max-h-[90vh] flex flex-col",
        "animate-in slide-in-from-bottom duration-300",
        "sm:relative sm:max-w-md sm:rounded-2xl sm:slide-in-from-bottom-0 sm:zoom-in-95"
      )}>
        {/* Pull indicator */}
        <div className="w-full flex justify-center py-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        <div className="p-6 overflow-y-auto w-full">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
