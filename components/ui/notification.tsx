import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
    message: string | null;
    type: "success" | "error" | "info" | null;
    onClose: () => void;
    duration?: number;
}

export default function Notification({ message, type, onClose, duration = 3000 }: NotificationProps) {
    useEffect(() => {
        if (message && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message || !type) return null;

    // Premium styling with glassmorphism to match admin dashboard theme
    const styles = {
        success: "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
        error: "bg-red-950/80 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
        info: "bg-blue-950/80 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <AlertCircle className="w-5 h-5 text-blue-500" />
    };

    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-5 duration-300 max-w-sm ${styles[type]}`}>
            <div className="mt-0.5 shrink-0">
                {icons[type]}
            </div>
            <div className="flex-1 mr-2">
                <p className="text-sm font-medium leading-tight">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="p-1 -mr-1 -mt-1 hover:bg-white/10 rounded-full transition-colors text-current opacity-70 hover:opacity-100"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
