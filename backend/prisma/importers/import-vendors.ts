import { PartnerStatus, PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const defaultPassword = "Password123!";

function fakePasswordHash(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const vendors = [
  {
    email: "tokyo.vendor@alpii.local",
    fullName: "Tokyo Local Expert",
    businessName: "Tokyo Local Expert",
    legalName: "Tokyo Local Expert Co.",
    phone: "+81 90 1000 0001",
    country: "Japan",
    city: "Tokyo",
    address: "Shibuya, Tokyo, Japan",
    description:
      "Local Tokyo experience partner specializing in culture, food, shopping, and neighborhood discovery.",
  },
  {
    email: "paris.vendor@alpii.local",
    fullName: "Paris Memory Travel",
    businessName: "Paris Memory Travel",
    legalName: "Paris Memory Travel SARL",
    phone: "+33 6 1000 0002",
    country: "France",
    city: "Paris",
    address: "Central Paris, France",
    description:
      "Paris experience partner focused on romantic city walks, landmarks, local cafés, and cultural memories.",
  },
  {
    email: "zurich.vendor@alpii.local",
    fullName: "Zurich Scenic Guide",
    businessName: "Zurich Scenic Guide",
    legalName: "Zurich Scenic Guide GmbH",
    phone: "+41 79 100 0003",
    country: "Switzerland",
    city: "Zurich",
    address: "Zurich, Switzerland",
    description:
      "Zurich partner offering scenic city experiences, lake views, old town walks, and relaxed Swiss local guidance.",
  },
  {
    email: "bali.vendor@alpii.local",
    fullName: "Bali Culture Trip",
    businessName: "Bali Culture Trip",
    legalName: "PT Bali Culture Trip",
    phone: "+62 812 1000 0004",
    country: "Indonesia",
    city: "Bali",
    address: "Denpasar, Bali, Indonesia",
    description:
      "Bali partner specializing in cultural experiences, temples, nature routes, and local hospitality.",
  },
  {
    email: "dubai.vendor@alpii.local",
    fullName: "Dubai Premium Experience",
    businessName: "Dubai Premium Experience",
    legalName: "Dubai Premium Experience LLC",
    phone: "+971 50 100 0005",
    country: "United Arab Emirates",
    city: "Dubai",
    address: "Downtown Dubai, UAE",
    description:
      "Dubai partner focused on premium city experiences, skyline views, desert moments, and private trips.",
  },
  {
    email: "istanbul.vendor@alpii.local",
    fullName: "Istanbul Heritage Walks",
    businessName: "Istanbul Heritage Walks",
    legalName: "Istanbul Heritage Walks Ltd.",
    phone: "+90 532 100 0006",
    country: "Turkey",
    city: "Istanbul",
    address: "Fatih, Istanbul, Turkey",
    description:
      "Istanbul partner offering heritage walks, local markets, cultural landmarks, and food experiences.",
  },
  {
    email: "london.vendor@alpii.local",
    fullName: "London Local Moments",
    businessName: "London Local Moments",
    legalName: "London Local Moments Ltd.",
    phone: "+44 7700 100007",
    country: "United Kingdom",
    city: "London",
    address: "Central London, United Kingdom",
    description:
      "London partner focused on classic city highlights, local neighborhoods, hidden gems, and easy day experiences.",
  },
  {
    email: "rome.vendor@alpii.local",
    fullName: "Rome Timeless Tours",
    businessName: "Rome Timeless Tours",
    legalName: "Rome Timeless Tours SRL",
    phone: "+39 320 100 0008",
    country: "Italy",
    city: "Rome",
    address: "Rome, Italy",
    description:
      "Rome partner specializing in ancient landmarks, local streets, food moments, and timeless city memories.",
  },
];

async function main() {
  console.log("Importing 8 Alpii vendors...");

  const passwordHash = fakePasswordHash(defaultPassword);

  for (const vendor of vendors) {
    const user = await prisma.user.upsert({
      where: {
        email: vendor.email,
      },
      update: {
        fullName: vendor.fullName,
        passwordHash,
      } as any,
      create: {
        email: vendor.email,
        fullName: vendor.fullName,
        passwordHash,
        role: "PARTNER",
      } as any,
    });

    const partner = await prisma.partner.upsert({
      where: {
        userId: user.id,
      },
      update: {
        businessName: vendor.businessName,
        legalName: vendor.legalName,
        status: PartnerStatus.APPROVED,
        phone: vendor.phone,
        country: vendor.country,
        city: vendor.city,
        address: vendor.address,
        description: vendor.description,
      },
      create: {
        userId: user.id,
        businessName: vendor.businessName,
        legalName: vendor.legalName,
        status: PartnerStatus.APPROVED,
        phone: vendor.phone,
        country: vendor.country,
        city: vendor.city,
        address: vendor.address,
        description: vendor.description,
      },
    });

    console.log(`Vendor imported: ${partner.businessName} | ${vendor.email}`);
  }

  console.log("");
  console.log("Done. 8 vendors imported.");
  console.log("Vendor password label:", defaultPassword);
  console.log("Note: current hash uses sha256 fallback.");
}

main()
  .catch((error) => {
    console.error("Vendor import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
