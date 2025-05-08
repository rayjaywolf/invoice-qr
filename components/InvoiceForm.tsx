'use client'

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InvoiceData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvoicePreview from "./InvoicePreview";

const generateSlipId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit number
    return `STC-${randomNum}`;
};

const formSchema = z.object({
    slipId: z.string().min(1, { message: "Slip ID is required" }),
    orderDate: z.string().min(1, { message: "Order date is required" }),
    material: z.string().min(1, { message: "Material is required" }),
    crusherName: z.string().min(1, { message: "Crusher name is required" }),
    crusherAddress: z.string().min(1, { message: "Crusher address is required" }),
    crusherGst: z.string().min(1, { message: "Crusher GST number is required" }),
    consigneeName: z.string().min(1, { message: "Consignee name is required" }),
    consigneeCategory: z.string().min(1, { message: "Consignee category is required" }),
    consigneeMobile: z.string().min(10, { message: "Valid mobile number is required" }),
    consigneeGst: z.string().optional(),
    destinationLocation: z.string().min(1, { message: "Destination is required" }),
    vehicleNo: z.string().min(1, { message: "Vehicle number is required" }),
    vehicleOwnerName: z.string().min(1, { message: "Vehicle owner name is required" }),
    driverName: z.string().min(1, { message: "Driver name is required" }),
    driverMobile: z.string().min(10, { message: "Valid driver mobile is required" }),
    unladenWeight: z.coerce.number(),
    loadingWeight: z.coerce.number(),
    materialWeightMT: z.coerce.number().min(0, { message: "Material weight in MT is required" }),
    materialWeightCFT: z.coerce.number().min(0, { message: "Material weight in CFT is required" }),
    materialAmount: z.coerce.number().min(1, { message: "Material amount is required" }),
    gstAmount: z.coerce.number(),
    validityDateTime: z.string().min(1, { message: "Validity date/time is required" }),
});

export default function InvoiceForm() {
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<InvoiceData | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            slipId: "",
            orderDate: "",
            material: "",
            crusherName: "",
            crusherAddress: "",
            crusherGst: "",
            consigneeName: "",
            consigneeCategory: "",
            consigneeMobile: "",
            consigneeGst: "",
            destinationLocation: "",
            vehicleNo: "",
            vehicleOwnerName: "",
            driverName: "",
            driverMobile: "",
            unladenWeight: 0,
            loadingWeight: 0,
            materialWeightMT: 0,
            materialWeightCFT: 0,
            materialAmount: 0,
            gstAmount: 0,
            validityDateTime: "",
        },
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const invoiceData: InvoiceData = {
            ...values,
            consigneeGst: values.consigneeGst || "", // Ensure consigneeGst is always a string
        };
        setPreviewData(invoiceData);
        setShowPreview(true);
    };

    const fillTestData = () => {
        form.setValue("slipId", "STC-435826");
        form.setValue("orderDate", "15-11-2024 07:14AM");
        form.setValue("material", "STONE");
        form.setValue("crusherName", "GUPTA & COMPANY STONE CRUSHER");
        form.setValue("crusherAddress", "MUBARIKPUR, DERABASSI");
        form.setValue("crusherGst", "03AASFG9090N1ZN");
        form.setValue("consigneeName", "DEEPAK CHAUHAN");
        form.setValue("consigneeCategory", "Stocklist");
        form.setValue("consigneeMobile", "9888606315");
        form.setValue("consigneeGst", "02AOMPC1829D1ZJ");
        form.setValue("destinationLocation", "CHHOTA SHIMLA HP");
        form.setValue("vehicleNo", "HR-68B-2045");
        form.setValue("vehicleOwnerName", "PARDEEP");
        form.setValue("driverName", "SINGU");
        form.setValue("driverMobile", "7814508731");
        form.setValue("unladenWeight", 0);
        form.setValue("loadingWeight", 0);
        form.setValue("materialWeightMT", 40);
        form.setValue("materialWeightCFT", 1000);
        form.setValue("materialAmount", 17000);
        form.setValue("gstAmount", 850);
        form.setValue("validityDateTime", "15-11-2024 07:15PM");
    };

    // Watch materialWeightMT for automatic calculations
    const materialWeightMT = form.watch("materialWeightMT");
    useEffect(() => {
        // Calculate CFT: 250 CFT for every 10 MT
        const calculatedCFT = (materialWeightMT / 10) * 250;
        form.setValue("materialWeightCFT", Math.round(calculatedCFT));

        // Calculate material amount: 1 MT = ₹425
        const calculatedAmount = materialWeightMT * 425;
        form.setValue("materialAmount", calculatedAmount);

        // Calculate GST: 5% of material amount
        const calculatedGST = calculatedAmount * 0.05;
        form.setValue("gstAmount", Math.round(calculatedGST));
    }, [materialWeightMT, form]);

    return (
        <div className="container mx-auto py-10">
            {!showPreview ? (
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Invoice Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="slipId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No/Slip ID</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="STC-435826" {...field} />
                                                    </FormControl>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline"
                                                        onClick={() => form.setValue("slipId", generateSlipId())}
                                                    >
                                                        Generate
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="orderDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Order Date</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="15-11-2024 07:14AM" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="material"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Material</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="STONE" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="crusherName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name of Crusher/Screening plant</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="GUPTA & COMPANY STONE CRUSHER" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="crusherAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Crusher/Screening Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="MUBARIKPUR, DERABASSI" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="crusherGst"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST no. of Crusher/Screening plant</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="03AASFG9090N1ZN" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="consigneeName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name of the Consignee</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="DEEPAK CHAUHAN" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="consigneeCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category of Consignee</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Stocklist" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="consigneeMobile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mobile Number of consignee</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="9888606315" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="consigneeGst"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST No. of the consignee (if applicable)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="02AOMPC1829D1ZJ" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="destinationLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Destination Location of the Material</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="CHHOTA SHIMLA HP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="vehicleNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vehicle no</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HR-68B-2045" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="vehicleOwnerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vehicle owner name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="PARDEEP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="driverName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Driver Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SINGU" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="driverMobile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Driver Mobile number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="7814508731" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="unladenWeight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unladen weight of vehicle as per RC(MT)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="loadingWeight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight of Loading Truck on weighbridge(MT)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="materialWeightMT"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight of material (MT)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="40" 
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            // Calculate CFT: 250 CFT for every 10 MT
                                                            const mt = parseFloat(e.target.value) || 0;
                                                            const cft = (mt / 10) * 250;
                                                            form.setValue("materialWeightCFT", Math.round(cft));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="materialWeightCFT"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight of material (CFT)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="1000" 
                                                        {...field}
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="materialAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount of material</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="17000" 
                                                        {...field}
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gstAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST on material (5%)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="850" 
                                                        {...field}
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="validityDateTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Validity of weighment Slip(Date/Time)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="15-11-2024 07:15PM" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="button" variant="outline" onClick={fillTestData} className="flex-1">Fill Test Data</Button>
                                    <Button type="submit" className="flex-1">Generate Invoice</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full max-w-4xl mx-auto">
                    <InvoicePreview data={previewData!} onBack={() => setShowPreview(false)} />
                </div>
            )}
        </div>
    );
} 