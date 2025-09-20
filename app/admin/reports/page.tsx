"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Download, Eye, DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

interface TaxRecord {
  id: string
  customerId: string
  name: string
  wardNo: string
  district: string
  taxStatus: "Paid" | "Not Paid" | "Overdue"
  amountDue: number
  dueDate: string
  paidDate?: string
  paymentMethod?: string
}

const taxRecords: TaxRecord[] = [
  {
    id: "1",
    customerId: "TAX001",
    name: "John Doe",
    wardNo: "W001",
    district: "Central District",
    taxStatus: "Paid",
    amountDue: 5000,
    dueDate: "2024-03-31",
    paidDate: "2024-02-15",
    paymentMethod: "Online",
  },
  {
    id: "2",
    customerId: "TAX002",
    name: "Jane Smith",
    wardNo: "W002",
    district: "North District",
    taxStatus: "Not Paid",
    amountDue: 5000,
    dueDate: "2024-03-31",
  },
  {
    id: "3",
    customerId: "TAX003",
    name: "Bob Johnson",
    wardNo: "W003",
    district: "South District",
    taxStatus: "Overdue",
    amountDue: 5000,
    dueDate: "2024-03-31",
  },
  {
    id: "4",
    customerId: "TAX004",
    name: "Alice Brown",
    wardNo: "W004",
    district: "East District",
    taxStatus: "Paid",
    amountDue: 5000,
    dueDate: "2024-03-31",
    paidDate: "2024-01-20",
    paymentMethod: "Offline",
  },
  {
    id: "5",
    customerId: "TAX005",
    name: "Charlie Wilson",
    wardNo: "W005",
    district: "West District",
    taxStatus: "Not Paid",
    amountDue: 5000,
    dueDate: "2024-03-31",
  },
  {
    id: "6",
    customerId: "TAX006",
    name: "Diana Davis",
    wardNo: "W006",
    district: "Central District",
    taxStatus: "Overdue",
    amountDue: 5000,
    dueDate: "2024-03-31",
  },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [districtFilter, setDistrictFilter] = useState("all")

  const filteredRecords = taxRecords.filter((record) => {
    const matchesSearch =
      record.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.wardNo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.taxStatus === statusFilter
    const matchesDistrict = districtFilter === "all" || record.district === districtFilter

    return matchesSearch && matchesStatus && matchesDistrict
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Not Paid":
        return "secondary"
      case "Overdue":
        return "destructive"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  // Calculate statistics
  const totalRecords = taxRecords.length
  const paidRecords = taxRecords.filter((r) => r.taxStatus === "Paid").length
  const overdueRecords = taxRecords.filter((r) => r.taxStatus === "Overdue").length
  const totalCollected = taxRecords.filter((r) => r.taxStatus === "Paid").reduce((sum, r) => sum + r.amountDue, 0)
  const totalPending = taxRecords.filter((r) => r.taxStatus !== "Paid").reduce((sum, r) => sum + r.amountDue, 0)

  const districts = Array.from(new Set(taxRecords.map((r) => r.district)))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Reports</h1>
          <p className="text-muted-foreground">View and manage tax collection reports</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Citizens</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords}</div>
              <p className="text-xs text-muted-foreground">Registered taxpayers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxes Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCollected)}</div>
              <p className="text-xs text-muted-foreground">{paidRecords} payments received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((paidRecords / totalRecords) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Payment completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{overdueRecords}</div>
              <p className="text-xs text-muted-foreground">{formatCurrency(totalPending)} pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Collection Report
            </CardTitle>
            <CardDescription>Filter and search tax records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Customer ID, Name, or Ward No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Not Paid">Not Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Results Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Ward No</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Tax Status</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No records found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono font-medium">{record.customerId}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.wardNo}</TableCell>
                        <TableCell>{record.district}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(record.taxStatus)}>{record.taxStatus}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(record.amountDue)}</TableCell>
                        <TableCell>{formatDate(record.dueDate)}</TableCell>
                        <TableCell>
                          {record.paidDate ? (
                            <div className="text-sm">
                              <div>Paid: {formatDate(record.paidDate)}</div>
                              <div className="text-muted-foreground">{record.paymentMethod}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Results Summary */}
            {filteredRecords.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredRecords.length} of {totalRecords} records
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
