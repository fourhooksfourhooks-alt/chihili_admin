import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface BlockingModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
}

const BlockingModal: React.FC<BlockingModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Prevent right-click and text selection
  useEffect(() => {
    const preventInteraction = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const preventKeyActions = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.ctrlKey && e.shiftKey && e.key === 'C') || (e.ctrlKey && e.key === 'U') ||
          e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        return false;
      }
    };

    if (isOpen && modalRef.current) {
      // Add event listeners to the modal
      modalRef.current.addEventListener('contextmenu', preventInteraction);
      modalRef.current.addEventListener('selectstart', preventInteraction);
      document.addEventListener('keydown', preventKeyActions);
      
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      
      // Prevent tab navigation outside the modal
      const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
      
      // Trap focus inside the modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (focusableElements.length === 0) {
            e.preventDefault();
            return;
          }
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        if (modalRef.current) {
          modalRef.current.removeEventListener('contextmenu', preventInteraction);
          modalRef.current.removeEventListener('selectstart', preventInteraction);
        }
        document.removeEventListener('keydown', preventKeyActions);
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          gradient: 'from-red-500 to-red-600',
          Icon: AlertCircle,
          iconColor: 'text-white'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500 to-orange-500',
          Icon: AlertTriangle,
          iconColor: 'text-white'
        };
      default:
        return {
          gradient: 'from-primary1 to-primary',
          Icon: Info,
          iconColor: 'text-white'
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.Icon;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/10 backdrop-blur-sm overflow-hidden h-full w-full z-[9999] flex items-center justify-center p-4"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {/* Multiple overlay layers for protection */}
      <div className="fixed inset-0 bg-black/10 z-[10000]"></div>
      <div className="fixed inset-0 bg-black/10 z-[10001]"></div>
      
      <div 
        className={`bg-white rounded-2xl max-w-lg w-full shadow-2xl transform scale-100 z-[10002] relative`}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Protection overlay on the modal itself */}
        <div 
          className="absolute inset-0 z-[10003]"
          onContextMenu={(e) => e.preventDefault()}
          style={{ pointerEvents: 'auto' }}
        ></div>
        
        <div className="p-8 text-center relative z-[10004]">
          {/* Icon */}
          <div className={`mx-auto mb-6 w-20 h-20 bg-gradient-to-r ${styles.gradient} rounded-full flex items-center justify-center shadow-lg`}>
            <IconComponent className={`w-10 h-10 ${styles.iconColor}`} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ userSelect: 'none' }}>{title}</h2>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 text-lg leading-relaxed" style={{ userSelect: 'none' }}>{message}</p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center items-center space-x-2">
            <div className={`w-3 h-3 bg-gradient-to-r ${styles.gradient} rounded-full animate-bounce`}></div>
            <div className={`w-3 h-3 bg-gradient-to-r ${styles.gradient} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-3 h-3 bg-gradient-to-r ${styles.gradient} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4" style={{ userSelect: 'none' }}>Please wait...</p>
        </div>
      </div>
      
      {/* Additional protection layers */}
      <div 
        className="fixed inset-0 z-[9998]"
        style={{ 
          userSelect: 'none',
          pointerEvents: 'auto'
        }}
        onContextMenu={(e) => e.preventDefault()}
      ></div>
    </div>
  );
};

export default BlockingModal;