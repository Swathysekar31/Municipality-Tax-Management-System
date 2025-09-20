"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, FileText, Code, Zap } from "lucide-react"

interface APIEndpoint {
  method: string
  path: string
  description: string
  tags: string[]
  requiresAuth: boolean
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: "POST",
    path: "/api/sms/send",
    description: "Send SMS to specific citizens",
    tags: ["SMS"],
    requiresAuth: true,
  },
  {
    method: "POST",
    path: "/api/sms/bulk-reminder",
    description: "Send bulk reminder SMS based on type",
    tags: ["SMS"],
    requiresAuth: true,
  },
  {
    method: "POST",
    path: "/api/payment/online",
    description: "Create online payment session",
    tags: ["Payment"],
    requiresAuth: true,
  },
  {
    method: "POST",
    path: "/api/payment/verify",
    description: "Verify payment status from gateway",
    tags: ["Payment"],
    requiresAuth: false,
  },
  {
    method: "POST",
    path: "/api/penalty/auto-calculate",
    description: "Auto-calculate and apply penalties",
    tags: ["Penalty"],
    requiresAuth: true,
  },
  {
    method: "GET",
    path: "/api/penalty/rules",
    description: "Get penalty calculation rules",
    tags: ["Penalty"],
    requiresAuth: true,
  },
  {
    method: "PUT",
    path: "/api/penalty/rules",
    description: "Update penalty calculation rules",
    tags: ["Penalty"],
    requiresAuth: true,
  },
  {
    method: "POST",
    path: "/api/penalty/simulate",
    description: "Simulate penalty calculation",
    tags: ["Penalty"],
    requiresAuth: true,
  },
  {
    method: "GET",
    path: "/api/analytics/admin",
    description: "Get comprehensive admin analytics",
    tags: ["Analytics"],
    requiresAuth: true,
  },
  {
    method: "GET",
    path: "/api/analytics/citizen/{citizenId}",
    description: "Get citizen-specific analytics",
    tags: ["Analytics"],
    requiresAuth: true,
  },
]

const exampleRequests = {
  sms: {
    title: "Send SMS Reminder",
    method: "POST",
    endpoint: "/api/sms/send",
    body: {
      citizenIds: [1, 2, 3],
      message: "Dear citizen, your tax payment is due. Please pay to avoid penalties.",
      type: "REMINDER",
    },
  },
  payment: {
    title: "Create Payment Session",
    method: "POST",
    endpoint: "/api/payment/online",
    body: {
      taxRecordId: 123,
      paymentMethod: "online",
    },
  },
  penalty: {
    title: "Auto-Calculate Penalties",
    method: "POST",
    endpoint: "/api/penalty/auto-calculate",
    body: {
      dryRun: true,
      citizenIds: [1, 2, 3],
    },
  },
}

export default function APIDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "PUT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
            <p className="text-muted-foreground">Enhanced Municipality Tax Management System API</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <a href="/api/docs" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                OpenAPI Spec
              </a>
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Download Postman Collection
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiEndpoints.length}</div>
              <p className="text-xs text-muted-foreground">REST API endpoints</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Version</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">v3.0</div>
              <p className="text-xs text-muted-foreground">Enhanced with SMS & Payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">JWT</div>
              <p className="text-xs text-muted-foreground">Bearer token required</p>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation Tabs */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>Complete list of available API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                        <div>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{endpoint.path}</code>
                          <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {endpoint.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        {endpoint.requiresAuth && <Badge variant="secondary">Auth Required</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="grid gap-6">
              {Object.entries(exampleRequests).map(([key, example]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={getMethodColor(example.method)}>{example.method}</Badge>
                      {example.title}
                    </CardTitle>
                    <CardDescription>
                      <code className="text-sm">{example.endpoint}</code>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Request Body:</h4>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{JSON.stringify(example.body, null, 2)}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(JSON.stringify(example.body, null, 2), key)}
                          >
                            <Copy className="h-4 w-4" />
                            {copiedCode === key ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">cURL Example:</h4>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>
                              {`curl -X ${example.method} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '${JSON.stringify(example.body)}' \\
  http://localhost:3000${example.endpoint}`}
                            </code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard(
                                `curl -X ${example.method} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n  -d '${JSON.stringify(example.body)}' \\\n  http://localhost:3000${example.endpoint}`,
                                `curl-${key}`,
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                            {copiedCode === `curl-${key}` ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>How to authenticate with the API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">JWT Bearer Token</h3>
                  <p className="text-muted-foreground mb-4">
                    Most endpoints require authentication using JWT Bearer tokens. Include the token in the
                    Authorization header.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">Authorization: Bearer YOUR_JWT_TOKEN</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Admin vs Citizen Access</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Admin Only</Badge>
                      <span className="text-sm">SMS, Penalty Management, Analytics endpoints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Citizen</Badge>
                      <span className="text-sm">Payment, Personal Analytics endpoints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Public</Badge>
                      <span className="text-sm">Payment verification, Webhook endpoints</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Error Responses</h3>
                  <div className="space-y-3">
                    <div>
                      <Badge variant="outline">401 Unauthorized</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Missing or invalid JWT token</p>
                    </div>
                    <div>
                      <Badge variant="outline">403 Forbidden</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Insufficient permissions</p>
                    </div>
                    <div>
                      <Badge variant="outline">400 Bad Request</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Invalid request parameters</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
