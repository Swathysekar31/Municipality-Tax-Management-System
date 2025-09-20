"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"

interface District {
  id: string
  name: string
  createdAt: string
  citizenCount: number
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([
    { id: "1", name: "Central District", createdAt: "2024-01-15", citizenCount: 245 },
    { id: "2", name: "North District", createdAt: "2024-01-16", citizenCount: 189 },
    { id: "3", name: "South District", createdAt: "2024-01-17", citizenCount: 312 },
    { id: "4", name: "East District", createdAt: "2024-01-18", citizenCount: 156 },
    { id: "5", name: "West District", createdAt: "2024-01-19", citizenCount: 201 },
  ])
  const [newDistrictName, setNewDistrictName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDistrictName.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newDistrict: District = {
        id: (districts.length + 1).toString(),
        name: newDistrictName.trim(),
        createdAt: new Date().toISOString().split("T")[0],
        citizenCount: 0,
      }

      setDistricts([...districts, newDistrict])
      setNewDistrictName("")
      setIsLoading(false)

      toast({
        title: "District added successfully",
        description: `${newDistrict.name} has been added to the system`,
      })
    }, 1000)
  }

  const handleDeleteDistrict = (id: string) => {
    const district = districts.find((d) => d.id === id)
    if (district && district.citizenCount > 0) {
      toast({
        title: "Cannot delete district",
        description: "District has registered citizens. Please reassign them first.",
        variant: "destructive",
      })
      return
    }

    setDistricts(districts.filter((d) => d.id !== id))
    toast({
      title: "District deleted",
      description: "District has been removed from the system",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">District Management</h1>
          <p className="text-muted-foreground">Add and manage districts in your municipality</p>
        </div>

        {/* Add District Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New District
            </CardTitle>
            <CardDescription>Create a new district for tax management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDistrict} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="districtName" className="sr-only">
                  District Name
                </Label>
                <Input
                  id="districtName"
                  placeholder="Enter district name"
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add District"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Districts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Existing Districts
            </CardTitle>
            <CardDescription>Manage your municipality districts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Citizens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district.id}>
                    <TableCell className="font-medium">{district.name}</TableCell>
                    <TableCell>{district.createdAt}</TableCell>
                    <TableCell>{district.citizenCount}</TableCell>
                    <TableCell>
                      <Badge variant={district.citizenCount > 0 ? "default" : "secondary"}>
                        {district.citizenCount > 0 ? "Active" : "Empty"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDistrict(district.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
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
