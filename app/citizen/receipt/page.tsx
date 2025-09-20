"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, ArrowLeft, CheckCircle, Calendar, CreditCard } from "lucide-react"

export default function ReceiptPage() {
  const receiptData = {
    receiptNumber: "RCP2024001234",
    customerId: "TAX001",
    name: "John Doe",
    wardNo: "W001",
    district: "Central District",
    city: "Mumbai",
    state: "Maharashtra",
    taxYear: "2024-25",
    taxAmount: 5000,
    paymentDate: "2024-02-15",
    paymentMethod: "Online - UPI",
    transactionId: "TXN20240215123456",
    status: "Paid",
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("Receipt download functionality would be implemented here")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/citizen/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Payment Receipt</h1>
              <p className="text-sm text-muted-foreground">Tax payment confirmation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Message */}
          <Card className="border-success bg-success/5 print:hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold text-lg">Payment Successful!</p>
                  <p className="text-sm">Your tax payment has been processed successfully.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="text-center border-b">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Municipality Tax Receipt</CardTitle>
                  <CardDescription>Official Payment Confirmation</CardDescription>
                </div>
              </div>
              <div className="flex justify-center">
                <Badge variant="default" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {receiptData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Receipt Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Receipt Number</p>
                    <p className="font-mono text-lg font-bold">{receiptData.receiptNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                    <p className="text-lg">{formatDate(receiptData.paymentDate)}</p>
                  </div>
                </div>

                <Separator />

                {/* Taxpayer Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Taxpayer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                      <p className="font-mono">{receiptData.customerId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{receiptData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ward No</p>
                      <p>{receiptData.wardNo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">District</p>
                      <p>{receiptData.district}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">City</p>
                      <p>{receiptData.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">State</p>
                      <p>{receiptData.state}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tax Year</p>
                      <p>{receiptData.taxYear}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <p>{receiptData.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                      <p className="font-mono">{receiptData.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                      <p className="text-xl font-bold text-success">{formatCurrency(receiptData.taxAmount)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>This is a computer-generated receipt and does not require a signature.</p>
                  <p className="mt-1">For any queries, please contact the Municipal Corporation Office.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 print:hidden">
            <Button onClick={handleDownload} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
