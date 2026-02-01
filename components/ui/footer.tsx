export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-secondary/20 py-8">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-primary">GOVERSHOP</h2>
                    <p className="text-sm text-muted-foreground">Platform Top Up Game Terpercaya</p>
                </div>
                <div className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Govershop. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
