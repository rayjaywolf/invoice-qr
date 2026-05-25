import jsPDF from "jspdf";
import QRCode from "qrcode";
import { InvoiceData } from "@/lib/types";

const MARGIN = 15;
const LINE_HEIGHT = 6;
const COL_GAP = 8;

type PdfContext = {
    pdf: jsPDF;
    pageWidth: number;
    contentWidth: number;
    leftCol: number;
    rightCol: number;
    colWidth: number;
    y: number;
};

function createContext(): PdfContext {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - MARGIN * 2;
    const colWidth = (contentWidth - COL_GAP) / 2;

    return {
        pdf,
        pageWidth,
        contentWidth,
        leftCol: MARGIN,
        rightCol: MARGIN + colWidth + COL_GAP,
        colWidth,
        y: MARGIN,
    };
}

function setStyle(ctx: PdfContext, size: number, style: "normal" | "bold" = "normal") {
    ctx.pdf.setFontSize(size);
    ctx.pdf.setFont("helvetica", style);
}

function advance(ctx: PdfContext, lines = 1) {
    ctx.y += LINE_HEIGHT * lines;
}

function drawLine(ctx: PdfContext) {
    ctx.pdf.setLineWidth(0.4);
    ctx.pdf.line(MARGIN, ctx.y, ctx.pageWidth - MARGIN, ctx.y);
    advance(ctx);
}

function drawCentered(ctx: PdfContext, text: string, size: number, style: "normal" | "bold" = "normal") {
    setStyle(ctx, size, style);
    ctx.pdf.text(text, ctx.pageWidth / 2, ctx.y, { align: "center" });
    advance(ctx);
}

function drawWrapped(ctx: PdfContext, text: string, x: number, maxWidth: number) {
    const lines = ctx.pdf.splitTextToSize(text, maxWidth);
    ctx.pdf.text(lines, x, ctx.y);
    advance(ctx, lines.length);
}

function drawLabelValue(
    ctx: PdfContext,
    x: number,
    label: string,
    value: string,
    maxWidth: number
) {
    setStyle(ctx, 10, "bold");
    const labelText = `${label} `;
    const labelWidth = ctx.pdf.getTextWidth(labelText);
    ctx.pdf.text(labelText, x, ctx.y);

    setStyle(ctx, 10, "normal");
    const valueLines = ctx.pdf.splitTextToSize(value, maxWidth - labelWidth);
    if (valueLines.length === 1) {
        ctx.pdf.text(valueLines[0], x + labelWidth, ctx.y);
        advance(ctx);
        return;
    }

    ctx.pdf.text(valueLines[0], x + labelWidth, ctx.y);
    advance(ctx);
    for (let i = 1; i < valueLines.length; i++) {
        ctx.pdf.text(valueLines[i], x, ctx.y);
        advance(ctx);
    }
}

function drawSectionTitle(ctx: PdfContext, x: number, title: string) {
    setStyle(ctx, 11, "bold");
    ctx.pdf.text(title, x, ctx.y);
    advance(ctx, 1.2);
}

function drawSectionBlock(
    ctx: PdfContext,
    x: number,
    title: string,
    lines: Array<{ label?: string; value: string }>
) {
    const startY = ctx.y;
    drawSectionTitle(ctx, x, title);

    for (const line of lines) {
        if (line.label) {
            drawLabelValue(ctx, x, line.label, line.value, ctx.colWidth);
        } else {
            setStyle(ctx, 10, "normal");
            drawWrapped(ctx, line.value, x, ctx.colWidth);
        }
    }

    return ctx.y - startY;
}

function drawAmountRow(
    ctx: PdfContext,
    label: string,
    amount: number,
    bold = false
) {
    setStyle(ctx, bold ? 12 : 10, bold ? "bold" : "normal");
    const value = `Rs. ${amount.toFixed(2)}`;
    ctx.pdf.text(label, MARGIN, ctx.y);
    ctx.pdf.text(value, ctx.pageWidth - MARGIN, ctx.y, { align: "right" });
    advance(ctx, bold ? 1.3 : 1);
}

export async function generateInvoicePdf(data: InvoiceData, invoiceUrl: string) {
    const ctx = createContext();
    const totalAmount = data.materialAmount + data.gstAmount;

    drawCentered(ctx, "INVOICE", 18, "bold");
    drawCentered(ctx, "Form 'Q'", 14, "bold");
    drawCentered(ctx, "Crusher Weighment Slip", 12, "bold");

    setStyle(ctx, 8, "normal");
    ctx.pdf.text("minesandgeology.punjab.gov.in", ctx.pageWidth - MARGIN, ctx.y, {
        align: "right",
    });
    advance(ctx, 1.5);

    drawLine(ctx);
    advance(ctx, 0.5);

    drawLabelValue(ctx, ctx.leftCol, "No/Slip ID:", data.slipId, ctx.contentWidth / 2);
    drawLabelValue(ctx, ctx.leftCol, "Order Date:", data.orderDate, ctx.contentWidth / 2);
    advance(ctx);

    const leftStartY = ctx.y;
    const leftHeight = drawSectionBlock(ctx, ctx.leftCol, "Crusher/Screening Details", [
        { value: data.crusherName },
        { value: data.crusherAddress },
        { label: "GST No:", value: data.crusherGst },
    ]);

    ctx.y = leftStartY;
    let rightLines: Array<{ label?: string; value: string }> = [
        { value: data.consigneeName },
        { label: "Category:", value: data.consigneeCategory },
        { label: "Mobile:", value: data.consigneeMobile },
    ];
    if (data.consigneeGst) {
        rightLines.push({ label: "GST No:", value: data.consigneeGst });
    }
    rightLines.push({ label: "Destination:", value: data.destinationLocation });
    const rightHeight = drawSectionBlock(ctx, ctx.rightCol, "Consignee Details", rightLines);

    ctx.y = leftStartY + Math.max(leftHeight, rightHeight) + 4;
    drawLabelValue(ctx, ctx.leftCol, "Material:", data.material, ctx.contentWidth);
    advance(ctx);

    const vehicleStartY = ctx.y;
    const vehicleHeight = drawSectionBlock(ctx, ctx.leftCol, "Vehicle Details", [
        { label: "Vehicle No:", value: data.vehicleNo },
        { label: "Owner Name:", value: data.vehicleOwnerName },
        { label: "Driver Name:", value: data.driverName },
        { label: "Driver Mobile:", value: data.driverMobile },
    ]);

    ctx.y = vehicleStartY;
    const weightHeight = drawSectionBlock(ctx, ctx.rightCol, "Weight Details", [
        { label: "Unladen Weight:", value: `${data.unladenWeight} MT` },
        { label: "Loading Weight:", value: `${data.loadingWeight} MT` },
        {
            label: "Material Weight:",
            value: `${data.materialWeightMT}(MT) ${data.materialWeightCFT}(CFT)`,
        },
    ]);

    ctx.y = vehicleStartY + Math.max(vehicleHeight, weightHeight) + 6;
    drawLine(ctx);
    advance(ctx, 0.5);

    drawAmountRow(ctx, "Material Amount:", data.materialAmount);
    drawAmountRow(ctx, "GST Amount:", data.gstAmount);
    drawAmountRow(ctx, "Total Amount:", totalAmount, true);

    advance(ctx);
    drawLabelValue(ctx, ctx.leftCol, "Validity:", data.validityDateTime, ctx.contentWidth);
    advance(ctx, 1.5);

    const qrDataUrl = await QRCode.toDataURL(invoiceUrl, { width: 256, margin: 1 });
    const qrSize = 32;
    const qrX = ctx.pageWidth / 2 - qrSize / 2;
    ctx.pdf.addImage(qrDataUrl, "PNG", qrX, ctx.y, qrSize, qrSize);
    advance(ctx, qrSize / LINE_HEIGHT + 0.5);

    setStyle(ctx, 9, "normal");
    drawCentered(ctx, "Scan to view digital invoice", 9);

    ctx.pdf.save(`Invoice-${data.slipId}.pdf`);
}
