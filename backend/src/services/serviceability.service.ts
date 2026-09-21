import { prisma } from '../config/prisma.js';

export async function checkPincode(pincode: string) {
  const result = await prisma.serviceablePincode.findUnique({ where: { pincode } });
  if (!result || !result.isActive) {
    return { serviceable: false, pincode, state: 'Tamil Nadu' };
  }

  const days = result.estimatedDeliveryDays ?? null;
  return {
    serviceable: true,
    pincode,
    area: result.area,
    city: result.city,
    district: result.district,
    state: result.state,
    courierName: result.courierName,
    stationCode: result.stationCode,
    estimatedDeliveryDays: days,
  };
}
