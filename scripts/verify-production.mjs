import { readFile } from 'node:fs/promises';

const pins = JSON.parse(await readFile(new URL('../backend/prisma/pincodes.seed.json', import.meta.url), 'utf8'));
const values = pins.map(row => row.pincode);
const fail = message => { throw new Error(message); };

if (pins.length !== 205) fail(`Expected 205 verified PIN codes, found ${pins.length}`);
if (new Set(values).size !== 205) fail('Duplicate PIN codes found');
if (pins.some(row => !/^\d{6}$/.test(row.pincode) || !/^[A-Z]{3}$/.test(row.stationCode))) fail('Invalid PIN or station code');
if (pins.some(row => row.state !== 'Tamil Nadu' || row.courierName !== 'The Professional Couriers - Pro EX')) fail('Unexpected courier dataset value');

const schema = await readFile(new URL('../backend/prisma/schema.prisma', import.meta.url), 'utf8');
if (/RAZORPAY/i.test(schema)) fail('Razorpay must not appear in the current Prisma schema');
console.log('Production verification passed: 205 unique Professional Couriers Pro EX PIN codes.');
