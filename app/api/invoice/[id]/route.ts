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

        const invoice = await prisma.invoice.upsert({
            where: {
                slipId: params.id
            },
            update: {
                ...data,
                unladenWeight: parseFloat(data.unladenWeight),
                loadingWeight: parseFloat(data.loadingWeight),
                materialAmount: parseFloat(data.materialAmount),
                gstAmount: parseFloat(data.gstAmount),
            },
            create: {
                ...data,
                slipId: params.id,
                unladenWeight: parseFloat(data.unladenWeight),
                loadingWeight: parseFloat(data.loadingWeight),
                materialAmount: parseFloat(data.materialAmount),
                gstAmount: parseFloat(data.gstAmount),
            }
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error saving invoice:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 