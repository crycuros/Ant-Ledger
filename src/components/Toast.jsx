import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <LiquidToast 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  )
}

const LiquidToast = ({ toast, onClose }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div 
      className="liquid-toast"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        '--toast-color': toast.type === 'success' ? '#10b981' : 
                         toast.type === 'error' ? '#ef4444' : '#f59e0b'
      }}
    >
      <style>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 16px;
          pointer-events: none;
        }

        .liquid-toast {
          pointer-events: all;
          position: relative;
          padding: 20px 28px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 16px;
          color: white;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          overflow: hidden;
          transform: scale(0.9);
          opacity: 0;
          animation: toastEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 
                      0 0 30px var(--toast-color),
                      inset 0 1px 0 rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.1);
          min-width: 280px;
          backdrop-filter: blur(10px);
        }

        @keyframes toastEnter {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .liquid-toast::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--toast-color), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .liquid-toast .liquid-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          border-radius: 16px;
        }

        .liquid-toast .bubble {
          position: absolute;
          background: var(--toast-color);
          border-radius: 50%;
          opacity: 0.15;
          animation: float 3s ease-in-out infinite;
        }

        .liquid-toast .bubble:nth-child(1) { width: 60px; height: 60px; top: 20%; left: -10%; animation-delay: 0s; }
        .liquid-toast .bubble:nth-child(2) { width: 40px; height: 40px; top: 60%; right: -5%; animation-delay: 0.5s; }
        .liquid-toast .bubble:nth-child(3) { width: 30px; height: 30px; bottom: 10%; left: 30%; animation-delay: 1s; }
        .liquid-toast .bubble:nth-child(4) { width: 20px; height: 20px; top: 30%; right: 20%; animation-delay: 1.5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }

        .liquid-toast .toast-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .liquid-toast .toast-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px var(--toast-color); }
          50% { transform: scale(1.1); box-shadow: 0 0 25px var(--toast-color); }
        }

        .liquid-toast .toast-text {
          flex: 1;
          line-height: 1.4;
        }

        .liquid-toast .toast-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          transition: color 0.2s;
        }

        .liquid-toast .toast-close:hover {
          color: white;
        }

        .liquid-toast:hover {
          transform: scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.4), 
                      0 0 50px var(--toast-color),
                      inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .liquid-toast:active {
          transform: scale(0.98);
        }

        .liquid-toast.exiting {
          animation: toastExit 0.4s ease-in forwards;
        }

        @keyframes toastExit {
          to {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="liquid-bg">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>
      
      <div className="toast-content">
        <div className="toast-icon" style={{ 
            background: toast.type === 'success' ? '#10b981' : 
                       toast.type === 'error' ? '#ef4444' : '#f59e0b',
            color: 'white'
          }}>
          {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
        </div>
        <span className="toast-text">{toast.message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  )
}

export default ToastProvider