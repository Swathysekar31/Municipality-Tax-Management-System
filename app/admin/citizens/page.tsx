"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Eye } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"

interface Citizen {
  id: string
  customerId: string
  name: string
  wardNo: string
  district: string
  city: string
  state: string
  createdAt: string
  taxStatus: "Paid" | "Pending" | "Overdue"
}

const districts = ["Central District", "North District", "South District", "East District", "West District"]

export default function CitizensPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([
    {
      id: "1",
      customerId: "TAX001",
      name: "John Doe",
      wardNo: "W001",
      district: "Central District",
      city: "Mumbai",
      state: "Maharashtra",
      createdAt: "2024-01-20",
      taxStatus: "Paid",
    },
    {
      id: "2",
      customerId: "TAX002",
      name: "Jane Smith",
      wardNo: "W002",
      district: "North District",
      city: "Mumbai",
      state: "Maharashtra",
      createdAt: "2024-01-21",
      taxStatus: "Pending",
    },
    {
      id: "3",
      customerId: "TAX003",
      name: "Bob Johnson",
      wardNo: "W003",
      district: "South District",
      city: "Mumbai",
      state: "Maharashtra",
      createdAt: "2024-01-22",
      taxStatus: "Overdue",
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    wardNo: "",
    district: "",
    city: "",
    state: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedCustomerId, setGeneratedCustomerId] = useState("")
  const { toast } = useToast()

  const generateCustomerId = () => {
    const nextId = citizens.length + 1
    return `TAX${nextId.toString().padStart(3, "0")}`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddCitizen = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.wardNo || !formData.district || !formData.city || !formData.state) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const customerId = generateCustomerId()
      const newCitizen: Citizen = {
        id: (citizens.length + 1).toString(),
        customerId,
        name: formData.name,
        wardNo: formData.wardNo,
        district: formData.district,
        city: formData.city,
        state: formData.state,
        createdAt: new Date().toISOString().split("T")[0],
        taxStatus: "Pending",
      }

      setCitizens([...citizens, newCitizen])
      setGeneratedCustomerId(customerId)
      setFormData({ name: "", wardNo: "", district: "", city: "", state: "" })
      setIsLoading(false)
      setShowSuccess(true)

      toast({
        title: "Citizen added successfully",
        description: `Customer ID ${customerId} has been generated`,
      })
    }, 1000)
  }

  const resetForm = () => {
    setShowSuccess(false)
    setGeneratedCustomerId("")
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citizen Management</h1>
          <p className="text-muted-foreground">Add and manage citizens in your municipality</p>
        </div>

        {/* Add Citizen Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Citizen
            </CardTitle>
            <CardDescription>Register a new citizen for tax management</CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccess ? (
              <div className="text-center py-8">
                <div className="mb-4 p-4 bg-success/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-success mb-2">Citizen Added Successfully!</h3>
                  <p className="text-muted-foreground mb-4">Customer ID has been generated:</p>
                  <div className="text-2xl font-bold text-foreground mb-4">{generatedCustomerId}</div>
                  <p className="text-sm text-muted-foreground">
                    Please provide this Customer ID to the citizen for future reference.
                  </p>
                </div>
                <Button onClick={resetForm}>Add Another Citizen</Button>
              </div>
            ) : (
              <form onSubmit={handleAddCitizen} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wardNo">Ward No *</Label>
                    <Input
                      id="wardNo"
                      placeholder="Enter ward number"
                      value={formData.wardNo}
                      onChange={(e) => handleInputChange("wardNo", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select value={formData.district} onValueChange={(value) => handleInputChange("district", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Adding Citizen..." : "Add Citizen & Generate Customer ID"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Citizens Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registered Citizens
            </CardTitle>
            <CardDescription>Manage your municipality citizens</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Ward No</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Tax Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((citizen) => (
                  <TableRow key={citizen.id}>
                    <TableCell className="font-mono font-medium">{citizen.customerId}</TableCell>
                    <TableCell>{citizen.name}</TableCell>
                    <TableCell>{citizen.wardNo}</TableCell>
                    <TableCell>{citizen.district}</TableCell>
                    <TableCell>{citizen.city}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(citizen.taxStatus)}>{citizen.taxStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
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
