import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { InvoiceData } from "@/lib/types";

export async function saveInvoice(data: InvoiceData) {
    const response = await fetch(`/api/invoice/${data.slipId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save invoice ${data.slipId}: ${errorData}`);
    }
}

export async function downloadInvoicePdf(data: InvoiceData, origin: string) {
    const invoiceUrl = `${origin}/invoice/${data.slipId}`;
    await generateInvoicePdf(data, invoiceUrl);
}

export async function downloadInvoices(
    invoices: InvoiceData[],
    origin: string,
    onProgress?: (current: number, total: number) => void
) {
    for (let i = 0; i < invoices.length; i++) {
        onProgress?.(i + 1, invoices.length);
        await saveInvoice(invoices[i]);
        await downloadInvoicePdf(invoices[i], origin);
        if (i < invoices.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
}
