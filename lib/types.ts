export type InvoiceData = {
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
    materialWeightCFT: number;
    materialAmount: number;
    gstAmount: number;
    validityDateTime: string;
} 