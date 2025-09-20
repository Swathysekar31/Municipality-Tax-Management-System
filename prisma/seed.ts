import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../lib/auth"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const hashedPassword = await hashPassword("admin123")
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
    },
  })

  // Create districts
  const districts = await Promise.all([
    prisma.district.upsert({
      where: { district_name: "Central District" },
      update: {},
      create: { district_name: "Central District" },
    }),
    prisma.district.upsert({
      where: { district_name: "North District" },
      update: {},
      create: { district_name: "North District" },
    }),
    prisma.district.upsert({
      where: { district_name: "South District" },
      update: {},
      create: { district_name: "South District" },
    }),
  ])

  // Create sample citizens
  const citizens = await Promise.all([
    prisma.citizen.upsert({
      where: { customer_id: "CID001001" },
      update: {},
      create: {
        customer_id: "CID001001",
        name: "John Doe",
        ward_no: "Ward-1",
        district_id: districts[0].district_id,
        city: "Mumbai",
        state: "Maharashtra",
        contact_no: "9876543210",
      },
    }),
    prisma.citizen.upsert({
      where: { customer_id: "CID001002" },
      update: {},
      create: {
        customer_id: "CID001002",
        name: "Jane Smith",
        ward_no: "Ward-2",
        district_id: districts[1].district_id,
        city: "Mumbai",
        state: "Maharashtra",
        contact_no: "9876543211",
      },
    }),
  ])

  // Create sample tax records
  const currentYear = new Date().getFullYear()
  const taxRecords = await Promise.all([
    prisma.taxRecord.create({
      data: {
        citizen_id: citizens[0].citizen_id,
        tax_year: currentYear.toString(),
        amount: 5000,
        due_date: new Date(`${currentYear}-12-31`),
        status: "unpaid",
      },
    }),
    prisma.taxRecord.create({
      data: {
        citizen_id: citizens[1].citizen_id,
        tax_year: currentYear.toString(),
        amount: 7500,
        due_date: new Date(`${currentYear}-12-31`),
        status: "paid",
      },
    }),
  ])

  // Create sample payment for paid tax
  await prisma.payment.create({
    data: {
      tax_id: taxRecords[1].tax_id,
      citizen_id: citizens[1].citizen_id,
      payment_mode: "online",
      receipt_no: "RCP12345678",
      amount: 7500,
      status: "completed",
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log(`👤 Admin created: username=admin, password=admin123`)
  console.log(`🏘️  Districts created: ${districts.length}`)
  console.log(`👥 Citizens created: ${citizens.length}`)
  console.log(`💰 Tax records created: ${taxRecords.length}`)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
