'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

type InvoicePreviewProps = {
    data: {
        slipId: string;
        orderDate: string;
        material: string;
        crusherName: string;
        crusherAddress: string;
        crusherGst: string;
        consigneeName: string;
        consigneeCategory: string;
        consigneeMobile: string;
        consigneeGst: string;
        destinationLocation: string;
        vehicleNo: string;
        vehicleOwnerName: string;
        driverName: string;
        driverMobile: string;
        unladenWeight: number;
        loadingWeight: number;
        materialWeightMT: number;
        materialWeightCMT: number;
        materialAmount: number;
        gstAmount: number;
        validityDateTime: string;
    };
    onBack: () => void;
};

const InvoicePreview = ({ data, onBack }: InvoicePreviewProps) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        if (!invoiceRef.current) return;
        setIsLoading(true);

        try {
            // Save invoice data to API
            const response = await fetch(`/api/invoice/${data.slipId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to save invoice data');
            }

            // Generate PDF
            const canvas = await html2canvas(invoiceRef.current);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`Invoice-${data.slipId}.pdf`);
        } catch (error) {
            console.error('Error generating invoice:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount = data.materialAmount + data.gstAmount;
    const invoiceUrl = typeof window !== 'undefined' ?
        `${window.location.origin}/invoice/${data.slipId}` : '';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between">
                <Button onClick={onBack} variant="outline">Back to Form</Button>
                <Button onClick={handleDownload} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Download Invoice'}
                </Button>
            </div>

            <Card className="p-8 bg-white" ref={invoiceRef}>
                <div className="border-b-2 border-black pb-4 mb-6 relative">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-center">INVOICE</h1>
                            <h2 className="text-xl font-semibold text-center mt-2">Form 'Q'</h2>
                            <h3 className="text-lg font-semibold text-center mt-1">Crusher Weighment Slip</h3>
                        </div>
                        <a 
                            href="https://minesandgeology.punjab.gov.i/stone/index.php?orders&task=detils&Cid=9&i" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-700 absolute right-0"
                        >
                            minesandgeology.punjab.gov.in
                        </a>
                    </div>
                    <div className="flex justify-between mt-4">
                        <div>
                            <p><span className="font-semibold">No/Slip ID:</span> {data.slipId}</p>
                            <p><span className="font-semibold">Order Date:</span> {data.orderDate}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Material:</span> {data.material}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Crusher/Screening Details</h2>
                        <p>{data.crusherName}</p>
                        <p>{data.crusherAddress}</p>
                        <p><span className="font-semibold">GST No:</span> {data.crusherGst}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Consignee Details</h2>
                        <p>{data.consigneeName}</p>
                        <p><span className="font-semibold">Category:</span> {data.consigneeCategory}</p>
                        <p><span className="font-semibold">Mobile:</span> {data.consigneeMobile}</p>
                        {data.consigneeGst && <p><span className="font-semibold">GST No:</span> {data.consigneeGst}</p>}
                        <p><span className="font-semibold">Destination:</span> {data.destinationLocation}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Vehicle Details</h2>
                        <p><span className="font-semibold">Vehicle No:</span> {data.vehicleNo}</p>
                        <p><span className="font-semibold">Owner Name:</span> {data.vehicleOwnerName}</p>
                        <p><span className="font-semibold">Driver Name:</span> {data.driverName}</p>
                        <p><span className="font-semibold">Driver Mobile:</span> {data.driverMobile}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Weight Details</h2>
                        <p><span className="font-semibold">Unladen Weight:</span> {data.unladenWeight} MT</p>
                        <p><span className="font-semibold">Loading Weight:</span> {data.loadingWeight} MT</p>
                        <p><span className="font-semibold">Material Weight:</span> {data.materialWeightMT}(MT) {data.materialWeightCMT}(CMT)</p>
                    </div>
                </div>

                <div className="border-t-2 border-black pt-4">
                    <div className="flex justify-between mb-2">
                        <p className="font-semibold">Material Amount:</p>
                        <p>₹{data.materialAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mb-4">
                        <p className="font-semibold">GST Amount:</p>
                        <p>₹{data.gstAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total Amount:</p>
                        <p>₹{totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <p><span className="font-semibold">Validity:</span> {data.validityDateTime}</p>
                    <div className="mt-4">
                        <QRCodeSVG value={invoiceUrl} size={128} />
                    </div>
                    <p className="text-sm text-gray-500">Scan to view digital invoice</p>
                </div>
            </Card>
        </div>
    );
};

export default InvoicePreview; 