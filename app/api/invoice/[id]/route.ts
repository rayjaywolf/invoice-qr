import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: {
                slipId: params.id
            }
        });

        if (!invoice) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();

        // Validate required fields
        const requiredFields = [
            'slipId', 'orderDate', 'material', 'crusherName', 'crusherAddress',
            'crusherGst', 'consigneeName', 'consigneeCategory', 'consigneeMobile',
            'destinationLocation', 'vehicleNo', 'vehicleOwnerName', 'driverName',
            'driverMobile', 'unladenWeight', 'loadingWeight', 'materialWeightMT',
            'materialWeightCFT', 'materialAmount', 'gstAmount', 'validityDateTime'
        ];

        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null) {
                return new NextResponse(`Missing required field: ${field}`, { status: 400 });
            }
        }

        // Ensure numeric fields are properly parsed
        const numericFields = [
            'unladenWeight', 'loadingWeight', 'materialWeightMT',
            'materialWeightCFT', 'materialAmount', 'gstAmount'
        ];

        const parsedData = {
            ...data,
            ...Object.fromEntries(
                numericFields.map(field => [field, parseFloat(data[field])])
            )
        };

        const invoice = await prisma.invoice.upsert({
            where: {
                slipId: params.id
            },
            update: parsedData,
            create: {
                ...parsedData,
                slipId: params.id,
            }
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error saving invoice:', error);
        if (error instanceof Error) {
            return new NextResponse(`Error saving invoice: ${error.message}`, { status: 500 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 