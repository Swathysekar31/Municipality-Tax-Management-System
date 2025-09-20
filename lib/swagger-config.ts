import type { OpenAPIV3 } from "openapi-types"

export const swaggerConfig: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Municipality Tax Management System API",
    version: "3.0.0",
    description: "Enhanced API for managing municipal tax collection, payments, penalties, and SMS notifications",
    contact: {
      name: "Municipality Tax System",
      email: "admin@municipality.gov",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://tax-system.municipality.gov",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      // Common schemas
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
          },
        },
        required: ["error"],
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            description: "Success message",
          },
        },
        required: ["success"],
      },

      // Citizen schemas
      Citizen: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique citizen ID",
          },
          customerId: {
            type: "string",
            description: "Customer ID for citizen",
            example: "TAX001",
          },
          name: {
            type: "string",
            description: "Full name of citizen",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          phone: {
            type: "string",
            example: "+91-9876543210",
          },
          address: {
            type: "string",
            example: "123 Main Street",
          },
          wardNo: {
            type: "string",
            example: "W001",
          },
          districtId: {
            type: "integer",
            description: "District ID",
          },
        },
        required: ["id", "customerId", "name", "email", "phone"],
      },

      // Tax Record schemas
      TaxRecord: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique tax record ID",
          },
          citizenId: {
            type: "integer",
            description: "Citizen ID",
          },
          taxYear: {
            type: "integer",
            example: 2024,
          },
          amount: {
            type: "number",
            format: "float",
            example: 5000.0,
          },
          dueDate: {
            type: "string",
            format: "date",
            example: "2024-03-31",
          },
          status: {
            type: "string",
            enum: ["PENDING", "PAID", "OVERDUE"],
            example: "PENDING",
          },
          paidDate: {
            type: "string",
            format: "date",
            nullable: true,
          },
        },
        required: ["id", "citizenId", "taxYear", "amount", "dueDate", "status"],
      },

      // Payment schemas
      Payment: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique payment ID",
          },
          citizenId: {
            type: "integer",
            description: "Citizen ID",
          },
          taxRecordId: {
            type: "integer",
            description: "Tax record ID",
          },
          amount: {
            type: "number",
            format: "float",
            example: 5000.0,
          },
          method: {
            type: "string",
            enum: ["ONLINE", "OFFLINE"],
            example: "ONLINE",
          },
          status: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "FAILED", "EXPIRED"],
            example: "COMPLETED",
          },
          receiptNumber: {
            type: "string",
            example: "RCP1234567890ABC",
          },
          paymentDate: {
            type: "string",
            format: "date-time",
          },
          gatewayPaymentId: {
            type: "string",
            nullable: true,
          },
          gatewayTransactionId: {
            type: "string",
            nullable: true,
          },
        },
        required: ["id", "citizenId", "taxRecordId", "amount", "method", "status", "receiptNumber", "paymentDate"],
      },

      // Penalty schemas
      Penalty: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique penalty ID",
          },
          citizenId: {
            type: "integer",
            description: "Citizen ID",
          },
          taxRecordId: {
            type: "integer",
            description: "Tax record ID",
          },
          amount: {
            type: "number",
            format: "float",
            example: 100.0,
          },
          reason: {
            type: "string",
            example: "Overdue tax payment - Fixed Penalty",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "PAID", "WAIVED"],
            example: "ACTIVE",
          },
          appliedDate: {
            type: "string",
            format: "date-time",
          },
          daysOverdue: {
            type: "integer",
            example: 15,
          },
          calculationMethod: {
            type: "string",
            example: "Fixed penalty: ₹100",
          },
        },
        required: ["id", "citizenId", "taxRecordId", "amount", "reason", "status", "appliedDate"],
      },

      // SMS schemas
      SMSRequest: {
        type: "object",
        properties: {
          citizenIds: {
            type: "array",
            items: {
              type: "integer",
            },
            description: "Array of citizen IDs to send SMS to",
            example: [1, 2, 3],
          },
          message: {
            type: "string",
            description: "SMS message content",
            example: "Dear citizen, your tax payment is due. Please pay to avoid penalties.",
          },
          type: {
            type: "string",
            enum: ["REMINDER", "OVERDUE", "PENALTY"],
            example: "REMINDER",
          },
        },
        required: ["citizenIds", "message", "type"],
      },

      SMSResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "SMS sent to 3 citizens, 0 failed",
          },
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                citizenId: {
                  type: "integer",
                },
                success: {
                  type: "boolean",
                },
                messageId: {
                  type: "string",
                  nullable: true,
                },
                error: {
                  type: "string",
                  nullable: true,
                },
              },
            },
          },
          summary: {
            type: "object",
            properties: {
              total: {
                type: "integer",
              },
              successful: {
                type: "integer",
              },
              failed: {
                type: "integer",
              },
            },
          },
        },
        required: ["success", "message", "results", "summary"],
      },

      // Analytics schemas
      AdminAnalytics: {
        type: "object",
        properties: {
          overview: {
            type: "object",
            properties: {
              totalCitizens: {
                type: "integer",
                example: 1247,
              },
              totalDistricts: {
                type: "integer",
                example: 12,
              },
              taxCollected: {
                type: "number",
                format: "float",
                example: 845230.0,
              },
              pendingTax: {
                type: "number",
                format: "float",
                example: 234567.0,
              },
              totalPenaltyAmount: {
                type: "number",
                format: "float",
                example: 15600.0,
              },
              collectionRate: {
                type: "integer",
                example: 78,
              },
            },
          },
          charts: {
            type: "object",
            properties: {
              monthlyCollections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: {
                      type: "string",
                      example: "Jan",
                    },
                    amount: {
                      type: "number",
                      format: "float",
                    },
                    count: {
                      type: "integer",
                    },
                  },
                },
              },
              districtAnalytics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: "Central District",
                    },
                    citizens: {
                      type: "integer",
                    },
                    collectionRate: {
                      type: "integer",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    // SMS API endpoints
    "/api/sms/send": {
      post: {
        tags: ["SMS"],
        summary: "Send SMS to specific citizens",
        description: "Send SMS messages to a list of citizens",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SMSRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "SMS sent successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SMSResponse",
                },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/sms/bulk-reminder": {
      post: {
        tags: ["SMS"],
        summary: "Send bulk reminder SMS",
        description: "Send bulk SMS reminders based on reminder type",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reminderType: {
                    type: "string",
                    enum: ["upcoming", "overdue", "penalty"],
                    description: "Type of reminder to send",
                  },
                  customMessage: {
                    type: "string",
                    description: "Custom message (optional)",
                  },
                },
                required: ["reminderType"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Bulk SMS sent successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SMSResponse",
                },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    // Payment API endpoints
    "/api/payment/online": {
      post: {
        tags: ["Payment"],
        summary: "Create online payment session",
        description: "Create a payment session for online tax payment",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  taxRecordId: {
                    type: "integer",
                    description: "Tax record ID to pay for",
                  },
                  paymentMethod: {
                    type: "string",
                    enum: ["online"],
                    default: "online",
                  },
                },
                required: ["taxRecordId"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Payment session created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                    },
                    payment: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                        },
                        amount: {
                          type: "number",
                          format: "float",
                        },
                        sessionId: {
                          type: "string",
                        },
                        paymentUrl: {
                          type: "string",
                          format: "uri",
                        },
                        expiresAt: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/payment/verify": {
      post: {
        tags: ["Payment"],
        summary: "Verify payment status",
        description: "Verify and update payment status from gateway",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  paymentId: {
                    type: "integer",
                    description: "Payment ID (optional if sessionId provided)",
                  },
                  sessionId: {
                    type: "string",
                    description: "Gateway session ID (optional if paymentId provided)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Payment verification completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                    payment: {
                      $ref: "#/components/schemas/Payment",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Penalty API endpoints
    "/api/penalty/auto-calculate": {
      post: {
        tags: ["Penalty"],
        summary: "Auto-calculate and apply penalties",
        description: "Automatically calculate and apply penalties for overdue taxes",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  dryRun: {
                    type: "boolean",
                    default: false,
                    description: "If true, only calculate without applying penalties",
                  },
                  citizenIds: {
                    type: "array",
                    items: {
                      type: "integer",
                    },
                    description: "Specific citizen IDs to process (optional)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Penalty calculation completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                    },
                    summary: {
                      type: "object",
                      properties: {
                        totalRecordsProcessed: {
                          type: "integer",
                        },
                        penaltiesApplied: {
                          type: "integer",
                        },
                        totalPenaltyAmount: {
                          type: "number",
                          format: "float",
                        },
                        dryRun: {
                          type: "boolean",
                        },
                      },
                    },
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          citizenId: {
                            type: "integer",
                          },
                          citizenName: {
                            type: "string",
                          },
                          status: {
                            type: "string",
                            enum: ["calculated", "applied", "skipped", "error"],
                          },
                          penaltyAmount: {
                            type: "number",
                            format: "float",
                          },
                          reason: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/penalty/rules": {
      get: {
        tags: ["Penalty"],
        summary: "Get penalty rules",
        description: "Retrieve current penalty calculation rules",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Penalty rules retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    rules: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                          },
                          name: {
                            type: "string",
                          },
                          type: {
                            type: "string",
                            enum: ["FIXED", "PERCENTAGE"],
                          },
                          value: {
                            type: "number",
                            format: "float",
                          },
                          gracePeriodDays: {
                            type: "integer",
                          },
                          maxPenalty: {
                            type: "number",
                            format: "float",
                            nullable: true,
                          },
                          description: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Penalty"],
        summary: "Update penalty rules",
        description: "Update penalty calculation rules",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rules: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        name: {
                          type: "string",
                        },
                        type: {
                          type: "string",
                          enum: ["FIXED", "PERCENTAGE"],
                        },
                        value: {
                          type: "number",
                          format: "float",
                        },
                        gracePeriodDays: {
                          type: "integer",
                        },
                        maxPenalty: {
                          type: "number",
                          format: "float",
                          nullable: true,
                        },
                        description: {
                          type: "string",
                        },
                      },
                      required: ["id", "name", "type", "value", "gracePeriodDays", "description"],
                    },
                  },
                },
                required: ["rules"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Penalty rules updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
        },
      },
    },

    "/api/penalty/simulate": {
      post: {
        tags: ["Penalty"],
        summary: "Simulate penalty calculation",
        description: "Simulate penalty calculation for testing purposes",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  taxAmount: {
                    type: "number",
                    format: "float",
                    description: "Tax amount",
                    example: 5000.0,
                  },
                  dueDate: {
                    type: "string",
                    format: "date",
                    description: "Tax due date",
                    example: "2024-01-31",
                  },
                  currentDate: {
                    type: "string",
                    format: "date",
                    description: "Current date (optional, defaults to today)",
                    example: "2024-02-15",
                  },
                },
                required: ["taxAmount", "dueDate"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Penalty simulation completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                    },
                    penalty: {
                      type: "object",
                      nullable: true,
                      properties: {
                        amount: {
                          type: "number",
                          format: "float",
                        },
                        daysOverdue: {
                          type: "integer",
                        },
                        appliedRule: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                            },
                            type: {
                              type: "string",
                            },
                          },
                        },
                        calculation: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Analytics API endpoints
    "/api/analytics/admin": {
      get: {
        tags: ["Analytics"],
        summary: "Get admin analytics",
        description: "Retrieve comprehensive analytics for admin dashboard",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "year",
            in: "query",
            description: "Year for analytics (defaults to current year)",
            schema: {
              type: "string",
              example: "2024",
            },
          },
        ],
        responses: {
          "200": {
            description: "Analytics data retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/AdminAnalytics",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/analytics/citizen/{citizenId}": {
      get: {
        tags: ["Analytics"],
        summary: "Get citizen analytics",
        description: "Retrieve analytics for a specific citizen",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "citizenId",
            in: "path",
            required: true,
            description: "Citizen ID",
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Citizen analytics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      properties: {
                        citizen: {
                          $ref: "#/components/schemas/Citizen",
                        },
                        overview: {
                          type: "object",
                          properties: {
                            totalTaxPaid: {
                              type: "number",
                              format: "float",
                            },
                            totalPendingTax: {
                              type: "number",
                              format: "float",
                            },
                            totalPenalties: {
                              type: "number",
                              format: "float",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "SMS",
      description: "SMS notification and reminder operations",
    },
    {
      name: "Payment",
      description: "Online payment processing operations",
    },
    {
      name: "Penalty",
      description: "Penalty calculation and management operations",
    },
    {
      name: "Analytics",
      description: "Analytics and reporting operations",
    },
  ],
}
