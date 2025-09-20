"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Building, ArrowLeft, CheckCircle, MapPin, Phone, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const paymentMethod = searchParams.get("method") || "online"

  const taxAmount = 5000
  const customerId = "TAX001"

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleOnlinePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Payment Successful",
        description: "Your tax payment has been processed successfully",
      })
      router.push("/citizen/receipt")
    }, 3000)
  }

  const offlineLocations = [
    {
      name: "Municipal Corporation Office",
      address: "123 Main Street, Central District, Mumbai - 400001",
      phone: "+91 22 1234 5678",
      hours: "9:00 AM - 5:00 PM (Mon-Fri)",
    },
    {
      name: "District Collection Center - North",
      address: "456 North Avenue, North District, Mumbai - 400002",
      phone: "+91 22 2345 6789",
      hours: "10:00 AM - 4:00 PM (Mon-Sat)",
    },
    {
      name: "District Collection Center - South",
      address: "789 South Road, South District, Mumbai - 400003",
      phone: "+91 22 3456 7890",
      hours: "9:30 AM - 4:30 PM (Mon-Fri)",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/citizen/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Payment Options</h1>
              <p className="text-sm text-muted-foreground">Complete your tax payment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Review your tax payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer ID</span>
                  <span className="font-mono">{customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Year</span>
                  <span>2024-25</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold">{formatCurrency(taxAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {paymentMethod === "online" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Online Payment
                </CardTitle>
                <CardDescription>Secure online payment gateway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Accepted Payment Methods:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                    <li>• Net Banking (All major banks)</li>
                    <li>• Credit/Debit Cards (Visa, MasterCard, RuPay)</li>
                    <li>• Digital Wallets</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">SSL Encrypted & Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Instant Payment Confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Digital Receipt Available</span>
                  </div>
                </div>

                <Button onClick={handleOnlinePayment} disabled={isProcessing} className="w-full" size="lg">
                  {isProcessing ? "Processing Payment..." : `Pay ${formatCurrency(taxAmount)}`}
                </Button>

                {isProcessing && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Please wait while we process your payment...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Offline Payment Centers
                </CardTitle>
                <CardDescription>Visit any of these authorized payment centers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="font-medium text-warning mb-2">Important Instructions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Carry a valid ID proof and this Customer ID: <strong>{customerId}</strong>
                    </li>
                    <li>• Payment can be made in cash or by demand draft</li>
                    <li>• Collect your receipt immediately after payment</li>
                    <li>• Keep the receipt safe for future reference</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {offlineLocations.map((location, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">{location.name}</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{location.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{location.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{location.hours}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
