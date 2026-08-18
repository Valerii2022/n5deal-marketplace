import { loadEnvConfig } from "@next/env";
import connectDB from "@/lib/db";
import { User, Asset, Message } from "@/models";
import { UserRole, UserStatus, AssetType, AssetStatus } from "@/types";
import { hashPassword } from "@/lib/password";
import mongoose from "mongoose";

// Load Next.js environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// DEMO ONLY - DO NOT USE IN PRODUCTION
// All demo users will use this password: Demo123!
const DEMO_PASSWORD = "Demo123!";

async function seed() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Production safety guard
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database seed is disabled in production environment.");
    }

    // Connect to MongoDB
    await connectDB();
    console.log("✓ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Message.deleteMany({});
    console.log("✓ Cleared all collections\n");

    // Hash the demo password
    console.log("🔐 Hashing demo password...");
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    console.log("✓ Password hashed\n");

    // Create Manager
    console.log("👤 Creating users...");
    const manager = await User.create({
      name: "Sarah Mitchell",
      email: "sarah.mitchell@n5deal.com",
      passwordHash,
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      company: "N5Deal Platform",
      location: "New York, NY",
      bio: "Platform manager overseeing marketplace operations and ensuring quality transactions.",
    });

    // Create Buyers
    const buyers = await User.create([
      {
        name: "Michael Chen",
        email: "michael.chen@techventures.com",
        passwordHash: passwordHash,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        company: "Tech Ventures Capital",
        location: "San Francisco, CA",
        bio: "Seeking technology companies and SaaS businesses for acquisition.",
        industries: ["Technology", "SaaS", "E-commerce"],
        investmentRange: { min: 500000, max: 5000000 },
        acquisitionTypes: ["Strategic Acquisition", "Majority Stake"],
      },
      {
        name: "Jennifer Rodriguez",
        email: "j.rodriguez@horizonequity.com",
        passwordHash: passwordHash,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        company: "Horizon Equity Partners",
        location: "Chicago, IL",
        bio: "Private equity investor focused on manufacturing and industrial businesses.",
        industries: ["Manufacturing", "Industrial", "Distribution"],
        investmentRange: { min: 2000000, max: 15000000 },
        acquisitionTypes: ["Full Acquisition", "Management Buyout"],
      },
      {
        name: "David Thompson",
        email: "david.t@realestatecapital.com",
        passwordHash: passwordHash,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        company: "Real Estate Capital Group",
        location: "Miami, FL",
        bio: "Commercial real estate investor seeking income-producing properties.",
        industries: ["Real Estate", "Hospitality", "Retail"],
        investmentRange: { min: 1000000, max: 10000000 },
        acquisitionTypes: ["Asset Purchase", "Portfolio Acquisition"],
      },
      {
        name: "Amanda Foster",
        email: "amanda.foster@growthpartners.com",
        passwordHash: passwordHash,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        company: "Growth Partners LLC",
        location: "Austin, TX",
        bio: "Growth equity investor targeting healthcare and wellness businesses.",
        industries: ["Healthcare", "Wellness", "Medical Services"],
        investmentRange: { min: 750000, max: 8000000 },
        acquisitionTypes: ["Minority Stake", "Growth Capital"],
      },
      {
        name: "Robert Kim",
        email: "robert.kim@familyoffice.com",
        passwordHash: passwordHash,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        company: "Kim Family Office",
        location: "Seattle, WA",
        bio: "Family office seeking diversified investment opportunities across sectors.",
        industries: ["Technology", "Consumer Goods", "Services", "Real Estate"],
        investmentRange: { min: 1000000, max: 20000000 },
        acquisitionTypes: ["Strategic Acquisition", "Partnership", "Full Acquisition"],
      },
    ]);

    // Create Sellers
    const sellers = await User.create([
      {
        name: "James Patterson",
        email: "james.patterson@cloudtech.com",
        passwordHash: passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        company: "CloudTech Solutions",
        location: "Boston, MA",
        bio: "Founder of B2B SaaS company looking for strategic exit.",
        industries: ["Technology", "SaaS"],
      },
      {
        name: "Maria Gonzalez",
        email: "maria.gonzalez@precisionmfg.com",
        passwordHash: passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        company: "Precision Manufacturing Inc",
        location: "Detroit, MI",
        bio: "Owner of established manufacturing business seeking retirement exit.",
        industries: ["Manufacturing", "Industrial"],
      },
      {
        name: "Thomas Wright",
        email: "thomas.wright@commercialproperties.com",
        passwordHash: passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        company: "Wright Commercial Properties",
        location: "Dallas, TX",
        bio: "Commercial property owner divesting portfolio assets.",
        industries: ["Real Estate"],
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@wellnessclinics.com",
        passwordHash: passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        company: "Anderson Wellness Clinics",
        location: "Denver, CO",
        bio: "Healthcare entrepreneur selling successful clinic chain.",
        industries: ["Healthcare", "Wellness"],
      },
      {
        name: "Kevin O'Brien",
        email: "kevin.obrien@retailventures.com",
        passwordHash: passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        company: "O'Brien Retail Ventures",
        location: "Portland, OR",
        bio: "E-commerce business owner exploring acquisition opportunities.",
        industries: ["E-commerce", "Retail"],
      },
    ]);

    console.log(`✓ Created ${buyers.length} buyers`);
    console.log(`✓ Created ${sellers.length} sellers`);
    console.log(`✓ Created 1 manager\n`);

    // Create Assets
    console.log("🏢 Creating assets...");
    const assets = await Asset.create([
      {
        sellerId: sellers[0]._id,
        title: "B2B SaaS Platform - Customer Success Software",
        description:
          "Established B2B SaaS platform serving mid-market companies with customer success and retention tools. 500+ active customers, 95% retention rate, recurring revenue model.",
        assetType: AssetType.BUSINESS,
        industry: "Technology",
        location: "Boston, MA",
        askingPrice: 4500000,
        revenue: 2100000,
        ebitda: 850000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[1]._id,
        title: "Precision Metal Parts Manufacturing Facility",
        description:
          "ISO-certified manufacturing facility specializing in precision metal components for automotive and aerospace industries. Established customer base, modern equipment.",
        assetType: AssetType.BUSINESS,
        industry: "Manufacturing",
        location: "Detroit, MI",
        askingPrice: 8500000,
        revenue: 6200000,
        ebitda: 1400000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[2]._id,
        title: "Class A Office Building - Downtown Dallas",
        description:
          "Premium 45,000 sq ft office building in Dallas CBD. 92% occupied, strong tenant mix, recent renovations. Long-term leases with creditworthy tenants.",
        assetType: AssetType.REAL_ESTATE,
        industry: "Real Estate",
        location: "Dallas, TX",
        askingPrice: 12000000,
        revenue: 980000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[3]._id,
        title: "Wellness Clinic Chain - 5 Locations",
        description:
          "Profitable wellness clinic chain with 5 locations across Colorado. Integrated services including physical therapy, chiropractic, and wellness programs. Strong brand recognition.",
        assetType: AssetType.BUSINESS,
        industry: "Healthcare",
        location: "Denver, CO",
        askingPrice: 3200000,
        revenue: 2800000,
        ebitda: 720000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[4]._id,
        title: "E-commerce Brand - Outdoor Recreation Equipment",
        description:
          "Direct-to-consumer e-commerce brand selling premium outdoor recreation equipment. Strong social media presence, proprietary products, established supply chain.",
        assetType: AssetType.BUSINESS,
        industry: "E-commerce",
        location: "Portland, OR",
        askingPrice: 2800000,
        revenue: 3500000,
        ebitda: 650000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[0]._id,
        title: "Minority Stake - AI Analytics Startup",
        description:
          "25% equity stake in fast-growing AI analytics startup. Series A funded, strong product-market fit, enterprise customers in financial services sector.",
        assetType: AssetType.EQUITY,
        industry: "Technology",
        location: "San Francisco, CA",
        askingPrice: 1500000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[2]._id,
        title: "Industrial Warehouse Complex",
        description:
          "120,000 sq ft industrial warehouse complex near major transportation hub. Multiple tenants, flexible space configuration, excellent logistics access.",
        assetType: AssetType.REAL_ESTATE,
        industry: "Real Estate",
        location: "Houston, TX",
        askingPrice: 7500000,
        revenue: 620000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[1]._id,
        title: "Specialty Chemical Distribution Business",
        description:
          "Regional specialty chemical distributor serving industrial customers. Established relationships with major suppliers, owned fleet, warehouse facilities.",
        assetType: AssetType.BUSINESS,
        industry: "Distribution",
        location: "Cleveland, OH",
        askingPrice: 5200000,
        revenue: 8400000,
        ebitda: 980000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[3]._id,
        title: "Medical Equipment Leasing Portfolio",
        description:
          "Portfolio of medical equipment leases to healthcare facilities. Diversified equipment types, strong cash flow, professional management in place.",
        assetType: AssetType.OTHER,
        industry: "Healthcare",
        location: "Phoenix, AZ",
        askingPrice: 4100000,
        revenue: 890000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[4]._id,
        title: "Subscription Box Service - Gourmet Foods",
        description:
          "Monthly subscription box service delivering curated gourmet foods. 8,000+ active subscribers, high retention, scalable fulfillment operations.",
        assetType: AssetType.BUSINESS,
        industry: "Consumer Goods",
        location: "Nashville, TN",
        askingPrice: 1900000,
        revenue: 2200000,
        ebitda: 420000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[2]._id,
        title: "Mixed-Use Development Opportunity",
        description:
          "Prime mixed-use development site in growing urban area. Zoning approved for retail/residential, utilities in place, strong demographic trends.",
        assetType: AssetType.REAL_ESTATE,
        industry: "Real Estate",
        location: "Austin, TX",
        askingPrice: 6800000,
        status: AssetStatus.ACTIVE,
      },
      {
        sellerId: sellers[1]._id,
        title: "Automotive Parts Franchise - 3 Locations",
        description:
          "Established automotive parts franchise with 3 profitable locations. Strong brand, loyal customer base, experienced management team.",
        assetType: AssetType.BUSINESS,
        industry: "Retail",
        location: "Tampa, FL",
        askingPrice: 3600000,
        revenue: 4200000,
        ebitda: 680000,
        status: AssetStatus.ACTIVE,
      },
    ]);

    console.log(`✓ Created ${assets.length} assets\n`);

    // Create Messages
    console.log("💬 Creating messages...");
    const messages = await Message.create([
      {
        senderId: buyers[0]._id,
        recipientId: sellers[0]._id,
        assetId: assets[0]._id,
        subject: "Interest in B2B SaaS Platform Acquisition",
        body: "Hello James, I represent Tech Ventures Capital and we're very interested in your customer success platform. The metrics look strong. Would you be available for a call next week to discuss further details and valuation?",
        read: true,
      },
      {
        senderId: sellers[0]._id,
        recipientId: buyers[0]._id,
        assetId: assets[0]._id,
        subject: "Re: Interest in B2B SaaS Platform Acquisition",
        body: "Hi Michael, thank you for your interest. I'd be happy to schedule a call. I have availability Tuesday or Thursday afternoon. I can also prepare a detailed information package for your review.",
        read: true,
      },
      {
        senderId: buyers[1]._id,
        recipientId: sellers[1]._id,
        assetId: assets[1]._id,
        subject: "Due Diligence Request - Manufacturing Facility",
        body: "Maria, we've completed our initial review and would like to proceed with due diligence. Can you provide access to financial statements for the past 3 years, customer contracts, and equipment appraisals?",
        read: false,
      },
      {
        senderId: buyers[2]._id,
        recipientId: sellers[2]._id,
        assetId: assets[2]._id,
        subject: "Office Building Inquiry",
        body: "Thomas, I'm interested in the Class A office building in Dallas. Could you share the rent roll, operating expenses, and any planned capital improvements? Also, are there any lease expirations in the next 12 months?",
        read: true,
      },
      {
        senderId: buyers[3]._id,
        recipientId: sellers[3]._id,
        assetId: assets[3]._id,
        subject: "Wellness Clinic Chain - Partnership Opportunity",
        body: "Lisa, your clinic chain aligns perfectly with our investment thesis. Beyond acquisition, we'd also be interested in discussing a partnership structure that allows you to retain some ownership. Would this be of interest?",
        read: false,
      },
      {
        senderId: sellers[4]._id,
        recipientId: buyers[4]._id,
        assetId: assets[4]._id,
        subject: "E-commerce Brand - Additional Information",
        body: "Robert, thank you for your interest in our outdoor recreation brand. I've attached our marketing analytics, customer acquisition costs, and supplier agreements. Happy to answer any questions.",
        read: true,
      },
      {
        senderId: buyers[0]._id,
        recipientId: manager._id,
        subject: "Platform Question - Verification Process",
        body: "Sarah, I have a question about the seller verification process on N5Deal. How do you verify the financial information provided by sellers? What level of due diligence can buyers expect has been completed?",
        read: false,
      },
      {
        senderId: manager._id,
        recipientId: buyers[0]._id,
        subject: "Re: Platform Question - Verification Process",
        body: "Hi Michael, great question. We verify seller identity and business registration. However, buyers are responsible for their own financial due diligence. We recommend engaging professional advisors. I can provide a list of recommended M&A advisors if helpful.",
        read: false,
      },
    ]);

    console.log(`✓ Created ${messages.length} messages\n`);

    // Verification
    console.log("🔍 Verifying seed data...\n");

    const userCount = await User.countDocuments();
    const assetCount = await Asset.countDocuments();
    const messageCount = await Message.countDocuments();

    const buyerCount = await User.countDocuments({ role: UserRole.BUYER });
    const sellerCount = await User.countDocuments({ role: UserRole.SELLER });
    const managerCount = await User.countDocuments({ role: UserRole.MANAGER });

    // Verify asset references
    const assetsWithInvalidSeller = await Asset.countDocuments({
      sellerId: { $nin: sellers.map((s) => s._id) },
    });

    // Verify message references
    const allUserIds = [manager._id, ...buyers.map((b) => b._id), ...sellers.map((s) => s._id)];
    const messagesWithInvalidUsers = await Message.countDocuments({
      $or: [
        { senderId: { $nin: allUserIds } },
        { recipientId: { $nin: allUserIds } },
      ],
    });

    const messagesWithAsset = await Message.countDocuments({ assetId: { $exists: true, $ne: null } });
    const messagesWithInvalidAsset = await Message.countDocuments({
      assetId: { $exists: true, $ne: null, $nin: assets.map((a) => a._id) },
    });

    // Print summary
    console.log("📊 SEED SUMMARY");
    console.log("═".repeat(50));
    console.log(`Total Users:           ${userCount}`);
    console.log(`  - Buyers:            ${buyerCount}`);
    console.log(`  - Sellers:           ${sellerCount}`);
    console.log(`  - Managers:          ${managerCount}`);
    console.log(`Total Assets:          ${assetCount}`);
    console.log(`Total Messages:        ${messageCount}`);
    console.log(`  - With Asset Ref:    ${messagesWithAsset}`);
    console.log("═".repeat(50));

    // Validation checks
    console.log("\n✅ VALIDATION CHECKS");
    console.log("═".repeat(50));
    console.log(`Assets with invalid seller:        ${assetsWithInvalidSeller === 0 ? "✓ None" : `✗ ${assetsWithInvalidSeller}`}`);
    console.log(`Messages with invalid users:       ${messagesWithInvalidUsers === 0 ? "✓ None" : `✗ ${messagesWithInvalidUsers}`}`);
    console.log(`Messages with invalid asset ref:   ${messagesWithInvalidAsset === 0 ? "✓ None" : `✗ ${messagesWithInvalidAsset}`}`);
    console.log("═".repeat(50));

    if (assetsWithInvalidSeller > 0 || messagesWithInvalidUsers > 0 || messagesWithInvalidAsset > 0) {
      throw new Error("Validation failed: Invalid references detected");
    }

    console.log("\n✅ Seed completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run seed
seed();
