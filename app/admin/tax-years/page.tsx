"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Settings } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"

interface TaxYear {
  id: string
  year: string
  startDate: string
  endDate: string
  taxAmount: number
  status: "Active" | "Completed" | "Upcoming"
  citizensCount: number
  collectedAmount: number
}

export default function TaxYearsPage() {
  const [taxYears, setTaxYears] = useState<TaxYear[]>([
    {
      id: "1",
      year: "2024",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      taxAmount: 5000,
      status: "Active",
      citizensCount: 1247,
      collectedAmount: 845230,
    },
    {
      id: "2",
      year: "2023",
      startDate: "2023-04-01",
      endDate: "2024-03-31",
      taxAmount: 4500,
      status: "Completed",
      citizensCount: 1156,
      collectedAmount: 5202000,
    },
    {
      id: "3",
      year: "2025",
      startDate: "2025-04-01",
      endDate: "2026-03-31",
      taxAmount: 5500,
      status: "Upcoming",
      citizensCount: 0,
      collectedAmount: 0,
    },
  ])

  const [formData, setFormData] = useState({
    year: "",
    taxAmount: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSetupTaxYear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.year || !formData.taxAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const year = Number.parseInt(formData.year)
    if (year < 2024 || year > 2030) {
      toast({
        title: "Invalid year",
        description: "Please enter a valid year between 2024 and 2030",
        variant: "destructive",
      })
      return
    }

    // Check if year already exists
    if (taxYears.some((ty) => ty.year === formData.year)) {
      toast({
        title: "Year already exists",
        description: "This tax year has already been configured",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newTaxYear: TaxYear = {
        id: (taxYears.length + 1).toString(),
        year: formData.year,
        startDate: `${formData.year}-04-01`,
        endDate: `${Number.parseInt(formData.year) + 1}-03-31`,
        taxAmount: Number.parseInt(formData.taxAmount),
        status: Number.parseInt(formData.year) === new Date().getFullYear() ? "Active" : "Upcoming",
        citizensCount: 0,
        collectedAmount: 0,
      }

      setTaxYears([...taxYears, newTaxYear].sort((a, b) => Number.parseInt(b.year) - Number.parseInt(a.year)))
      setFormData({ year: "", taxAmount: "" })
      setIsLoading(false)

      toast({
        title: "Tax year setup successful",
        description: `Tax year ${formData.year} has been configured`,
      })
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Completed":
        return "secondary"
      case "Upcoming":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Year Setup</h1>
          <p className="text-muted-foreground">Configure tax years and amounts for your municipality</p>
        </div>

        {/* Setup Tax Year Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Setup New Tax Year
            </CardTitle>
            <CardDescription>Configure a new tax year with tax amount</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetupTaxYear} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Tax Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="Enter year (e.g., 2024)"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    min="2024"
                    max="2030"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount (₹) *</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    placeholder="Enter tax amount"
                    value={formData.taxAmount}
                    onChange={(e) => handleInputChange("taxAmount", e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Setting up..." : "Setup Tax Year"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tax Years Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configured Tax Years
            </CardTitle>
            <CardDescription>Manage your municipality tax years</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Year</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Tax Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Citizens</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxYears.map((taxYear) => (
                  <TableRow key={taxYear.id}>
                    <TableCell className="font-medium">{taxYear.year}</TableCell>
                    <TableCell className="text-sm">
                      {taxYear.startDate} to {taxYear.endDate}
                    </TableCell>
                    <TableCell>{formatCurrency(taxYear.taxAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(taxYear.status)}>{taxYear.status}</Badge>
                    </TableCell>
                    <TableCell>{taxYear.citizensCount}</TableCell>
                    <TableCell>{formatCurrency(taxYear.collectedAmount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
