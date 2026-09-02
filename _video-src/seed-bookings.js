// Seed Booking rows for the demo account from demo-reservations.csv so the
// occupancy calendar has stays to show in the product video.
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();
const S = "/tmp/claude-0/-home-user/3041f7cf-1bb2-5b31-ad43-70cd566ff700/scratchpad";
(async () => {
  const user = await prisma.user.findUnique({ where: { email: "video@tryblackcat.com" } });
  const props = await prisma.property.findMany({ where: { userId: user.id } });
  const byName = new Map(props.map((p) => [p.name.toLowerCase(), p]));
  const lines = fs.readFileSync(`${S}/demo-reservations.csv`, "utf8").replace(/\r/g, "").split("\n").filter(Boolean);
  const header = lines[0].split(",");
  const idx = (n) => header.indexOf(n);
  let created = 0;
  for (const line of lines.slice(1)) {
    const c = line.split(",");
    const prop = byName.get((c[idx("Listing")] || "").toLowerCase());
    const code = c[idx("Confirmation code")];
    const start = c[idx("Start date")], end = c[idx("End date")];
    if (!prop || !code || !start || !end) continue;
    await prisma.booking.upsert({
      where: { userId_propertyId_source_sourceUid: { userId: user.id, propertyId: prop.id, source: "airbnb", sourceUid: `csv-${code}` } },
      update: {},
      create: { userId: user.id, propertyId: prop.id, source: "airbnb", sourceUid: `csv-${code}`, status: "confirmed", checkinAt: new Date(start), checkoutAt: new Date(end), guestName: c[idx("Guest")] || null },
    });
    created++;
  }
  console.log("bookings upserted:", created);
  await prisma.$disconnect();
})();
