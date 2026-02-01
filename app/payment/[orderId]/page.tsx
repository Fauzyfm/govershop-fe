import StatusView from "@/components/payment/status-view";

interface PaymentPageProps {
    params: Promise<{
        orderId: string;
    }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
    const resolvedParams = await params;
    return (
        <div className="container mx-auto px-4 py-8">
            <StatusView orderId={resolvedParams.orderId} />
        </div>
    );
}
