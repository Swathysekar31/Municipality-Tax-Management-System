"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, CreditCard, FileText, LogOut, Calendar, MapPin, DollarSign, AlertTriangle } from "lucide-react"

interface CitizenData {
  customerId: string
  name: string
  wardNo: string
  district: string
  city: string
  state: string
  taxAmount: number
  dueDate: string
  status: "Paid" | "Pending" | "Overdue"
  paidDate?: string
  receiptNumber?: string
  paymentMethod?: string
}

// Mock data - in real app, this would come from API based on logged-in user
const citizenData: CitizenData = {
  customerId: "TAX001",
  name: "John Doe",
  wardNo: "W001",
  district: "Central District",
  city: "Mumbai",
  state: "Maharashtra",
  taxAmount: 5000,
  dueDate: "2024-03-31",
  status: "Pending",
}

export default function CitizenDashboardPage() {
  const [currentData] = useState<CitizenData>(citizenData)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Pending":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <DollarSign className="h-4 w-4" />
      case "Pending":
        return <Calendar className="h-4 w-4" />
      case "Overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const isOverdue = new Date(currentData.dueDate) < new Date() && currentData.status !== "Paid"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Citizen Portal</h1>
                <p className="text-sm text-muted-foreground">Tax Information Dashboard</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, {currentData.name}</h2>
            <p className="text-muted-foreground">Customer ID: {currentData.customerId}</p>
          </div>

          {/* Tax Status Alert */}
          {isOverdue && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Payment Overdue</p>
                    <p className="text-sm">
                      Your tax payment was due on {formatDate(currentData.dueDate)}. Please make payment immediately to
                      avoid penalties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your registered details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-foreground">{currentData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                    <p className="font-mono text-foreground">{currentData.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ward No</p>
                    <p className="text-foreground">{currentData.wardNo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">District</p>
                    <p className="text-foreground">{currentData.district}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="text-foreground">{currentData.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">State</p>
                    <p className="text-foreground">{currentData.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Information
                </CardTitle>
                <CardDescription>Current tax year details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Tax Amount</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(currentData.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                    <span className="text-foreground">{formatDate(currentData.dueDate)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <Badge variant={getStatusColor(currentData.status)} className="gap-1">
                      {getStatusIcon(currentData.status)}
                      {currentData.status}
                    </Badge>
                  </div>
                  {currentData.paidDate && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Paid Date</span>
                        <span className="text-foreground">{formatDate(currentData.paidDate)}</span>
                      </div>
                    </>
                  )}
                  {currentData.receiptNumber && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Receipt No</span>
                        <span className="font-mono text-foreground">{currentData.receiptNumber}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Options
              </CardTitle>
              <CardDescription>
                {currentData.status === "Paid"
                  ? "Your tax payment has been completed"
                  : "Choose your preferred payment method"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentData.status === "Paid" ? (
                <div className="text-center py-8">
                  <div className="mb-4 p-4 bg-success/10 rounded-lg">
                    <DollarSign className="h-12 w-12 text-success mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-success mb-2">Payment Completed</h3>
                    <p className="text-muted-foreground mb-4">
                      Your tax payment of {formatCurrency(currentData.taxAmount)} has been successfully processed.
                    </p>
                    {currentData.receiptNumber && (
                      <Link href="/citizen/receipt">
                        <Button variant="outline" className="gap-2 bg-transparent">
                          <FileText className="h-4 w-4" />
                          View Receipt
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Online Payment</CardTitle>
                      <CardDescription>Pay securely using UPI, Net Banking, or Cards</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Link href="/citizen/payment?method=online">
                        <Button className="w-full">Pay Online</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-3 bg-accent/50 rounded-full w-fit">
                        <FileText className="h-8 w-8 text-accent-foreground" />
                      </div>
                      <CardTitle className="text-lg">Offline Payment</CardTitle>
                      <CardDescription>Visit municipal office or authorized centers</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Link href="/citizen/payment?method=offline">
                        <Button variant="outline" className="w-full bg-transparent">
                          Offline Options
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
