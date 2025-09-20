"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, AlertTriangle, BarChart3, DollarSign, MessageSquare } from "lucide-react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalCitizens: number
    totalDistricts: number
    totalTaxRecords: number
    totalPayments: number
    totalPenalties: number
    taxCollected: number
    pendingTax: number
    totalPenaltyAmount: number
    collectionRate: number
  }
  charts: {
    monthlyCollections: Array<{ month: string; amount: number; count: number }>
    districtAnalytics: Array<{
      name: string
      citizens: number
      totalTax: number
      collectedTax: number
      pendingTax: number
      penalties: number
      collectionRate: number
    }>
    paymentMethods: Array<{ method: string; amount: number; count: number }>
  }
  recentActivities: {
    payments: Array<{
      id: number
      citizenName: string
      customerId: string
      amount: number
      method: string
      date: string
      receiptNumber: string
    }>
    penalties: Array<{
      id: number
      citizenName: string
      customerId: string
      amount: number
      reason: string
      date: string
      daysOverdue: number
    }>
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/admin")
      const result = await response.json()
      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive tax management analytics</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Citizens</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalCitizens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registered taxpayers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(analytics.overview.taxCollected)}</div>
              <p className="text-xs text-muted-foreground">{analytics.overview.collectionRate}% collection rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tax</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(analytics.overview.pendingTax)}</div>
              <p className="text-xs text-muted-foreground">{analytics.overview.totalTaxRecords} records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penalties</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(analytics.overview.totalPenaltyAmount)}
              </div>
              <p className="text-xs text-muted-foreground">{analytics.overview.totalPenalties} active penalties</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="districts">Districts</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Collections Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Collections</CardTitle>
                  <CardDescription>Tax collection trends over the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.charts.monthlyCollections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                      <Bar dataKey="amount" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.charts.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {analytics.charts.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Analytics</CardTitle>
                <CardDescription>Detailed collection performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.charts.monthlyCollections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                    <Line type="monotone" dataKey="amount" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="districts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>District Performance</CardTitle>
                <CardDescription>Tax collection performance by district</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.charts.districtAnalytics.map((district, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{district.name}</h4>
                        <p className="text-sm text-muted-foreground">{district.citizens} citizens</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(district.collectedTax)}</p>
                          <p className="text-xs text-muted-foreground">Collected</p>
                        </div>
                        <Badge
                          variant={
                            district.collectionRate > 80
                              ? "default"
                              : district.collectionRate > 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {district.collectionRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest successful payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivities.payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{payment.citizenName}</p>
                          <p className="text-sm text-muted-foreground">{payment.customerId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">{payment.method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Penalties */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Penalties</CardTitle>
                  <CardDescription>Latest penalty applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivities.penalties.slice(0, 5).map((penalty) => (
                      <div key={penalty.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{penalty.citizenName}</p>
                          <p className="text-sm text-muted-foreground">{penalty.daysOverdue} days overdue</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-destructive">{formatCurrency(penalty.amount)}</p>
                          <p className="text-xs text-muted-foreground">Penalty</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Send SMS Reminders</CardTitle>
                  <CardDescription>Bulk SMS to overdue taxpayers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/sms">
                <Button className="w-full">Send Reminders</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Auto-Apply Penalties</CardTitle>
                  <CardDescription>Calculate and apply overdue penalties</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/penalties/auto">
                <Button variant="outline" className="w-full bg-transparent">
                  Apply Penalties
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Advanced Reports</CardTitle>
                  <CardDescription>Detailed analytics and exports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full bg-transparent">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
