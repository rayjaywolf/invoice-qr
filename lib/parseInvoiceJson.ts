import * as z from "zod";
import { InvoiceData } from "@/lib/types";

export const invoiceSchema = z.object({
    slipId: z.string().min(1, { message: "Slip ID is required" }),
    orderDate: z.string().min(1, { message: "Order date is required" }),
    material: z.string().min(1, { message: "Material is required" }),
    crusherName: z.string().min(1, { message: "Crusher name is required" }),
    crusherAddress: z.string().min(1, { message: "Crusher address is required" }),
    crusherGst: z.string().min(1, { message: "Crusher GST number is required" }),
    consigneeName: z.string().min(1, { message: "Consignee name is required" }),
    consigneeCategory: z
        .string()
        .min(1, { message: "Consignee category is required" }),
    consigneeMobile: z
        .string()
        .min(10, { message: "Valid mobile number is required" }),
    consigneeGst: z.string().optional(),
    destinationLocation: z
        .string()
        .min(1, { message: "Destination is required" }),
    vehicleNo: z.string().min(1, { message: "Vehicle number is required" }),
    vehicleOwnerName: z
        .string()
        .min(1, { message: "Vehicle owner name is required" }),
    driverName: z.string().min(1, { message: "Driver name is required" }),
    driverMobile: z
        .string()
        .min(10, { message: "Valid driver mobile is required" }),
    unladenWeight: z.coerce.number(),
    loadingWeight: z.coerce.number(),
    materialWeightMT: z.coerce
        .number()
        .min(0, { message: "Material weight in MT is required" }),
    materialWeightCFT: z.coerce
        .number()
        .min(0, { message: "Material weight in CFT is required" }),
    materialAmount: z.coerce
        .number()
        .min(1, { message: "Material amount is required" }),
    gstAmount: z.coerce.number(),
    validityDateTime: z
        .string()
        .min(1, { message: "Validity date/time is required" }),
});

export function parseInvoicesFromJson(input: string): InvoiceData[] {
    const parsed = JSON.parse(input);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    if (items.length === 0) {
        throw new Error("JSON array must contain at least one invoice.");
    }

    return items.map((item, index) => {
        const result = invoiceSchema.safeParse(item);
        if (!result.success) {
            const message = result.error.issues[0]?.message ?? "Invalid invoice data";
            throw new Error(`Invoice #${index + 1}: ${message}`);
        }
        return {
            ...result.data,
            consigneeGst: result.data.consigneeGst || "",
        };
    });
}
