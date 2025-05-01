import InvoiceForm from "@/components/InvoiceForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Invoice Generator</h1>
        <InvoiceForm />
      </div>
    </main>
  );
}
