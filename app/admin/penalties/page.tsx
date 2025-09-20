"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, MessageSquare, ArrowRight, Search, DollarSign, Users, Clock } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"

interface OverdueCitizen {
  id: string
  customerId: string
  name: string
  wardNo: string
  district: string
  taxAmount: number
  dueDate: string
  daysPastDue: number
  currentPenalty: number
  totalDue: number
  phone: string
  lastReminderSent?: string
}

const overdueCitizens: OverdueCitizen[] = [
  {
    id: "1",
    customerId: "TAX002",
    name: "Jane Smith",
    wardNo: "W002",
    district: "North District",
    taxAmount: 5000,
    dueDate: "2024-03-31",
    daysPastDue: 45,
    currentPenalty: 500,
    totalDue: 5500,
    phone: "+91 98765 43210",
    lastReminderSent: "2024-04-10",
  },
  {
    id: "2",
    customerId: "TAX003",
    name: "Bob Johnson",
    wardNo: "W003",
    district: "South District",
    taxAmount: 5000,
    dueDate: "2024-03-31",
    daysPastDue: 60,
    currentPenalty: 750,
    totalDue: 5750,
    phone: "+91 98765 43211",
  },
  {
    id: "3",
    customerId: "TAX006",
    name: "Diana Davis",
    wardNo: "W006",
    district: "Central District",
    taxAmount: 5000,
    dueDate: "2024-03-31",
    daysPastDue: 30,
    currentPenalty: 300,
    totalDue: 5300,
    phone: "+91 98765 43212",
    lastReminderSent: "2024-04-05",
  },
  {
    id: "4",
    customerId: "TAX007",
    name: "Edward Wilson",
    wardNo: "W007",
    district: "East District",
    taxAmount: 5000,
    dueDate: "2024-03-31",
    daysPastDue: 75,
    currentPenalty: 1000,
    totalDue: 6000,
    phone: "+91 98765 43213",
  },
]

export default function PenaltiesPage() {
  const [citizens, setCitizens] = useState<OverdueCitizen[]>(overdueCitizens)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCitizens, setSelectedCitizens] = useState<string[]>([])
  const [penaltyDialogOpen, setPenaltyDialogOpen] = useState(false)
  const [smsDialogOpen, setSmsDialogOpen] = useState(false)
  const [carryForwardDialogOpen, setCarryForwardDialogOpen] = useState(false)
  const [penaltyAmount, setPenaltyAmount] = useState("")
  const [penaltyReason, setPenaltyReason] = useState("")
  const [smsMessage, setSmsMessage] = useState(
    "Your tax payment is overdue. Please pay immediately to avoid additional penalties. Customer ID: {customerId}",
  )
  const [carryForwardYear, setCarryForwardYear] = useState("")
  const { toast } = useToast()

  const filteredCitizens = citizens.filter(
    (citizen) =>
      citizen.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.wardNo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleSelectCitizen = (citizenId: string) => {
    setSelectedCitizens((prev) =>
      prev.includes(citizenId) ? prev.filter((id) => id !== citizenId) : [...prev, citizenId],
    )
  }

  const handleSelectAll = () => {
    if (selectedCitizens.length === filteredCitizens.length) {
      setSelectedCitizens([])
    } else {
      setSelectedCitizens(filteredCitizens.map((c) => c.id))
    }
  }

  const handleAddPenalty = () => {
    if (!penaltyAmount || !penaltyReason) {
      toast({
        title: "Missing information",
        description: "Please enter penalty amount and reason",
        variant: "destructive",
      })
      return
    }

    const penalty = Number.parseFloat(penaltyAmount)
    if (penalty <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid penalty amount",
        variant: "destructive",
      })
      return
    }

    // Update selected citizens with new penalty
    setCitizens((prev) =>
      prev.map((citizen) => {
        if (selectedCitizens.includes(citizen.id)) {
          return {
            ...citizen,
            currentPenalty: citizen.currentPenalty + penalty,
            totalDue: citizen.totalDue + penalty,
          }
        }
        return citizen
      }),
    )

    setPenaltyDialogOpen(false)
    setPenaltyAmount("")
    setPenaltyReason("")
    setSelectedCitizens([])

    toast({
      title: "Penalty added successfully",
      description: `Penalty of ${formatCurrency(penalty)} added to ${selectedCitizens.length} citizen(s)`,
    })
  }

  const handleSendSMS = () => {
    if (!smsMessage.trim()) {
      toast({
        title: "Missing message",
        description: "Please enter SMS message",
        variant: "destructive",
      })
      return
    }

    // Update selected citizens with reminder sent date
    setCitizens((prev) =>
      prev.map((citizen) => {
        if (selectedCitizens.includes(citizen.id)) {
          return {
            ...citizen,
            lastReminderSent: new Date().toISOString().split("T")[0],
          }
        }
        return citizen
      }),
    )

    setSmsDialogOpen(false)
    setSelectedCitizens([])

    toast({
      title: "SMS reminders sent",
      description: `Reminders sent to ${selectedCitizens.length} citizen(s)`,
    })
  }

  const handleCarryForward = () => {
    if (!carryForwardYear) {
      toast({
        title: "Missing information",
        description: "Please select the year to carry forward to",
        variant: "destructive",
      })
      return
    }

    setCarryForwardDialogOpen(false)
    setCarryForwardYear("")
    setSelectedCitizens([])

    toast({
      title: "Dues carried forward",
      description: `${selectedCitizens.length} overdue account(s) carried forward to ${carryForwardYear}`,
    })
  }

  const getPenaltyColor = (daysPastDue: number) => {
    if (daysPastDue >= 60) return "destructive"
    if (daysPastDue >= 30) return "secondary"
    return "outline"
  }

  // Calculate statistics
  const totalOverdue = citizens.length
  const totalPenalties = citizens.reduce((sum, c) => sum + c.currentPenalty, 0)
  const totalDueAmount = citizens.reduce((sum, c) => sum + c.totalDue, 0)
  const avgDaysPastDue = Math.round(citizens.reduce((sum, c) => sum + c.daysPastDue, 0) / citizens.length)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Penalty & Reminder Management</h1>
          <p className="text-muted-foreground">Manage overdue accounts and send reminders</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{totalOverdue}</div>
              <p className="text-xs text-muted-foreground">Citizens with overdue payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penalties</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPenalties)}</div>
              <p className="text-xs text-muted-foreground">Accumulated penalties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDueAmount)}</div>
              <p className="text-xs text-muted-foreground">Including penalties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Days Overdue</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDaysPastDue}</div>
              <p className="text-xs text-muted-foreground">Days past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Citizens Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Citizens
            </CardTitle>
            <CardDescription>Manage citizens with overdue tax payments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Actions */}
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
              <div className="flex gap-2">
                <Dialog open={penaltyDialogOpen} onOpenChange={setPenaltyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={selectedCitizens.length === 0} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Penalty
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Penalty</DialogTitle>
                      <DialogDescription>
                        Add penalty to {selectedCitizens.length} selected citizen(s)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="penaltyAmount">Penalty Amount (₹)</Label>
                        <Input
                          id="penaltyAmount"
                          type="number"
                          placeholder="Enter penalty amount"
                          value={penaltyAmount}
                          onChange={(e) => setPenaltyAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="penaltyReason">Reason</Label>
                        <Textarea
                          id="penaltyReason"
                          placeholder="Enter reason for penalty"
                          value={penaltyReason}
                          onChange={(e) => setPenaltyReason(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddPenalty} className="w-full">
                        Add Penalty
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={carryForwardDialogOpen} onOpenChange={setCarryForwardDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={selectedCitizens.length === 0} className="gap-2 bg-transparent">
                      <ArrowRight className="h-4 w-4" />
                      Carry Forward
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Carry Forward Dues</DialogTitle>
                      <DialogDescription>
                        Carry forward dues for {selectedCitizens.length} selected citizen(s) to next tax year
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="carryForwardYear">Target Tax Year</Label>
                        <Select value={carryForwardYear} onValueChange={setCarryForwardYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year to carry forward to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025-26">2025-26</SelectItem>
                            <SelectItem value="2026-27">2026-27</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCarryForward} className="w-full">
                        Carry Forward
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={selectedCitizens.length === 0} className="gap-2 bg-transparent">
                      <MessageSquare className="h-4 w-4" />
                      Send SMS
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send SMS Reminder</DialogTitle>
                      <DialogDescription>
                        Send SMS reminder to {selectedCitizens.length} selected citizen(s)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="smsMessage">Message</Label>
                        <Textarea
                          id="smsMessage"
                          placeholder="Enter SMS message"
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use {"{customerId}"} to include the customer ID in the message
                        </p>
                      </div>
                      <Button onClick={handleSendSMS} className="w-full">
                        Send SMS Reminders
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedCitizens.length === filteredCitizens.length && filteredCitizens.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Ward No</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Penalty</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Last Reminder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCitizens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No overdue citizens found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCitizens.map((citizen) => (
                      <TableRow key={citizen.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCitizens.includes(citizen.id)}
                            onChange={() => handleSelectCitizen(citizen.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium">{citizen.customerId}</TableCell>
                        <TableCell>{citizen.name}</TableCell>
                        <TableCell>{citizen.wardNo}</TableCell>
                        <TableCell>{citizen.district}</TableCell>
                        <TableCell>
                          <Badge variant={getPenaltyColor(citizen.daysPastDue)}>{citizen.daysPastDue} days</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(citizen.taxAmount)}</TableCell>
                        <TableCell className="text-warning font-medium">
                          {formatCurrency(citizen.currentPenalty)}
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(citizen.totalDue)}</TableCell>
                        <TableCell>
                          {citizen.lastReminderSent ? (
                            <span className="text-sm">{formatDate(citizen.lastReminderSent)}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Never</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Selection Summary */}
            {selectedCitizens.length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>{selectedCitizens.length}</strong> citizen(s) selected
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
