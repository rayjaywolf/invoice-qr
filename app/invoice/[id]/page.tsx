'use client'

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { InvoiceData } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
    const params = useParams();
    const id = params.id as string;
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/invoice/${id}`)
            .then(res => res.json())
            .then(data => {
                setInvoice(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!invoice) {
        return <div className="flex justify-center items-center min-h-screen">Invoice not found</div>;
    }

    const totalAmount = invoice.materialAmount + invoice.gstAmount;

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="p-8 bg-white max-w-4xl mx-auto">
                <div className="border-b-2 border-black pb-4 mb-6">
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
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            minesandgeology.punjab.gov.in
                        </a>
                    </div>
                    <div className="flex justify-between mt-4">
                        <div>
                            <p><span className="font-semibold">No/Slip ID:</span> {invoice.slipId}</p>
                            <p><span className="font-semibold">Order Date:</span> {invoice.orderDate}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Material:</span> {invoice.material}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Crusher/Screening Details</h2>
                        <p>{invoice.crusherName}</p>
                        <p>{invoice.crusherAddress}</p>
                        <p><span className="font-semibold">GST No:</span> {invoice.crusherGst}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Consignee Details</h2>
                        <p>{invoice.consigneeName}</p>
                        <p><span className="font-semibold">Category:</span> {invoice.consigneeCategory}</p>
                        <p><span className="font-semibold">Mobile:</span> {invoice.consigneeMobile}</p>
                        {invoice.consigneeGst && <p><span className="font-semibold">GST No:</span> {invoice.consigneeGst}</p>}
                        <p><span className="font-semibold">Destination:</span> {invoice.destinationLocation}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Vehicle Details</h2>
                        <p><span className="font-semibold">Vehicle No:</span> {invoice.vehicleNo}</p>
                        <p><span className="font-semibold">Owner Name:</span> {invoice.vehicleOwnerName}</p>
                        <p><span className="font-semibold">Driver Name:</span> {invoice.driverName}</p>
                        <p><span className="font-semibold">Driver Mobile:</span> {invoice.driverMobile}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Weight Details</h2>
                        <p><span className="font-semibold">Unladen Weight:</span> {invoice.unladenWeight} MT</p>
                        <p><span className="font-semibold">Loading Weight:</span> {invoice.loadingWeight} MT</p>
                        <p><span className="font-semibold">Material Weight:</span> {invoice.materialWeightMT}(MT) {invoice.materialWeightCMT}(CMT)</p>
                    </div>
                </div>

                <div className="border-t-2 border-black pt-4">
                    <div className="flex justify-between mb-2">
                        <p className="font-semibold">Material Amount:</p>
                        <p>₹{invoice.materialAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mb-4">
                        <p className="font-semibold">GST Amount:</p>
                        <p>₹{invoice.gstAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total Amount:</p>
                        <p>₹{totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p><span className="font-semibold">Validity:</span> {invoice.validityDateTime}</p>
                </div>
            </Card>
        </div>
    );
} 