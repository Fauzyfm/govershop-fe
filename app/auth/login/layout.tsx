import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`min-h-screen bg-(--background) flex items-center justify-center p-4 relative overflow-hidden ${inter.className}`}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-(--primary)/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-(--accent)/20 rounded-full blur-[100px] animate-pulse delay-700" />
                <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-(--secondary)/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
