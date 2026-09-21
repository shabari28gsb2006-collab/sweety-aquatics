import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const pincodes = JSON.parse(
  readFileSync(new URL('./pincodes.seed.json', import.meta.url), 'utf8'),
) as Array<{
  id: string;
  pincode: string;
  area: string | null;
  district: string;
  state: string;
  stationCode: string;
  courierName: string;
  isActive: boolean;
  estimatedDeliveryDays: number | null;
  notes: string | null;
}>;

async function main() {
  if (pincodes.length !== 205 || new Set(pincodes.map(row => row.pincode)).size !== 205) {
    throw new Error('Courier seed must contain exactly 205 unique PIN codes');
  }

  await prisma.$transaction(async tx => {
    // These IDs belonged to the original prototype data only.
    await tx.serviceablePincode.deleteMany({ where: { id: { startsWith: 'pin-' } } });

    // Insert verified rows that are missing. Existing rows are intentionally
    // preserved so a seller's active/inactive choice is never reset on deploy.
    await tx.serviceablePincode.createMany({ data: pincodes, skipDuplicates: true });
  });

  const imported = await prisma.serviceablePincode.count({
    where: {
      pincode: { in: pincodes.map(row => row.pincode) },
      courierName: 'The Professional Couriers - Pro EX',
    },
  });
  if (imported !== 205) throw new Error(`Courier import incomplete: expected 205, found ${imported}`);
  console.log('Verified courier service areas ready: 205/205 PIN codes.');
}

main()
  .catch(error => { console.error(error); process.exit(1); })
  .finally(async () => prisma.$disconnect());
