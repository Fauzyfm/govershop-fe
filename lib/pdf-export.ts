import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProductForExport {
    buyer_sku_code: string;
    product_name: string;
    display_name?: string;
    category: string;
    brand: string;
    selling_price: number;
    discount_price?: number;
    is_available: boolean;
}

interface ExportOptions {
    storeName?: string;
    contactInfo?: string;
}

/**
 * Export products to a professional PDF catalog for customers
 * Only includes customer-relevant information (excludes internal data like buy price, markup, profit)
 */
export function exportProductsToPDF(
    products: ProductForExport[],
    options: ExportOptions = {}
): void {
    const { storeName = 'KATALOG PRODUK', contactInfo } = options;
    
    // Create PDF in landscape for better table visibility
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(37, 99, 235); // Primary blue
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Store Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(storeName, 14, 18);

    // Subtitle with date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    doc.text(`Katalog Produk • Diperbarui: ${currentDate}`, 14, 28);

    // Product count badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 55, 10, 45, 15, 3, 3, 'F');
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${products.length} Produk`, pageWidth - 50, 19);

    // Table data
    const tableData = products.map((product) => {
        const displayName = product.display_name || product.product_name;
        const price = product.discount_price && product.discount_price > 0
            ? `Rp ${product.discount_price.toLocaleString('id-ID')}`
            : `Rp ${(product.selling_price || 0).toLocaleString('id-ID')}`;
        const hasDiscount = product.discount_price && product.discount_price > 0;
        const status = product.is_available ? 'Tersedia' : 'Tidak Tersedia';

        return [
            product.buyer_sku_code,
            displayName,
            product.category,
            product.brand,
            hasDiscount ? `${price} (Promo!)` : price,
            status,
        ];
    });

    // Generate table
    autoTable(doc, {
        startY: 42,
        head: [['SKU', 'Nama Produk', 'Kategori', 'Brand', 'Harga', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 4,
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [51, 51, 51],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [100, 100, 100] }, // SKU
            1: { cellWidth: 'auto' }, // Nama Produk - flexible width
            2: { cellWidth: 'auto' }, // Kategori
            3: { cellWidth: 'auto' }, // Brand
            4: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }, // Harga
            5: { halign: 'center' }, // Status
        },
        tableWidth: 'auto',
        didParseCell: (data) => {
            // Style for Status column
            if (data.section === 'body' && data.column.index === 5) {
                const cellText = data.cell.text[0];
                if (cellText === 'Tersedia') {
                    data.cell.styles.textColor = [16, 185, 129]; // Green
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [239, 68, 68]; // Red
                    data.cell.styles.fontStyle = 'bold';
                }
            }
            // Style for promo price
            if (data.section === 'body' && data.column.index === 4) {
                const cellText = data.cell.text[0];
                if (cellText.includes('Promo!')) {
                    data.cell.styles.textColor = [234, 179, 8]; // Yellow/Gold
                }
            }
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
            // Footer on each page
            doc.setFillColor(248, 250, 252);
            doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
            
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            
            // Page number
            const pageNum = doc.getCurrentPageInfo().pageNumber;
            const totalPages = doc.getNumberOfPages();
            doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - 35, pageHeight - 6);
            
            // Contact info if provided
            if (contactInfo) {
                doc.text(contactInfo, 14, pageHeight - 6);
            } else {
                doc.text('Harga dapat berubah sewaktu-waktu tanpa pemberitahuan.', 14, pageHeight - 6);
            }
        },
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Katalog_Produk_${timestamp}.pdf`;

    // Download PDF
    doc.save(filename);
}
