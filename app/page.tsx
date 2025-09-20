import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, FileText } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Municipality Tax Portal</h1>
                <p className="text-sm text-muted-foreground">Tax Management & Reminder System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to Municipality Tax Portal</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage municipal taxes efficiently with our comprehensive tax management and reminder system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
              <CardDescription>Manage districts, citizens, tax years, and generate reports</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin/login">
                <Button className="w-full">Access Admin Portal</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Citizen Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/50 rounded-full w-fit">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Citizen Portal</CardTitle>
              <CardDescription>View tax details, make payments, and download receipts</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/citizen/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Access Citizen Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Municipality Tax Management System.
               All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
