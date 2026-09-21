import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { PrismaClient, UserRole, ProductCategory, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();
const catalog = JSON.parse(readFileSync(new URL('./catalog.seed.json', import.meta.url), 'utf8')) as any[];
const pincodes = JSON.parse(readFileSync(new URL('./pincodes.seed.json', import.meta.url), 'utf8')) as any[];
const careArticles = JSON.parse(readFileSync(new URL('./care-articles.seed.json', import.meta.url), 'utf8')) as any[];

async function main() {
  for (const article of careArticles) {
    await prisma.careArticle.upsert({ where: { slug: article.slug }, update: { title: article.title, subtitle: article.subtitle, category: article.category, readTime: article.readTime, bannerImage: article.bannerImage, summary: article.summary, content: article.content, publishedAt: new Date(article.publishedAt), isPublished: true }, create: { id: article.id, slug: article.slug, title: article.title, subtitle: article.subtitle, category: article.category, readTime: article.readTime, bannerImage: article.bannerImage, summary: article.summary, content: article.content, publishedAt: new Date(article.publishedAt), isPublished: true } });
  }
  const email = process.env.BUSINESS_EMAIL || 'shabari28gsb2006@gmail.com';
  const whatsapp = process.env.BUSINESS_WHATSAPP || '919976894662';

  await prisma.contactSettings.upsert({
    where: { id: 'store' },
    update: { email, whatsapp },
    create: { id: 'store', businessName: 'Sweety Birds & Fishes', email, whatsapp },
  });

  for (const p of catalog) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name, slug: p.slug, category: p.category as ProductCategory, description: p.description,
        shortDescription: p.shortDescription, price: p.price, mrp: p.mrp, stock: p.stock,
        status: p.status as ProductStatus, isFeatured: p.isFeatured, variety: p.variety, color: p.color,
        gender: p.gender, size: p.size, age: p.age, temperature: p.temperature, ph: p.ph,
        foodPackSize: p.foodPackSize, foodIngredients: p.foodIngredients, feedingDirections: p.feedingDirections,
        sellerRating: p.sellerRating, sellerRatingCount: p.sellerRatingCount,
      },
      create: {
        id: p.id, name: p.name, slug: p.slug, category: p.category as ProductCategory, description: p.description,
        shortDescription: p.shortDescription, price: p.price, mrp: p.mrp, stock: p.stock,
        status: p.status as ProductStatus, isFeatured: p.isFeatured, variety: p.variety, color: p.color,
        gender: p.gender, size: p.size, age: p.age, temperature: p.temperature, ph: p.ph,
        foodPackSize: p.foodPackSize, foodIngredients: p.foodIngredients, feedingDirections: p.feedingDirections,
        sellerRating: p.sellerRating, sellerRatingCount: p.sellerRatingCount,
      },
    });
    if (p.thumbnail) {
      const existing = await prisma.productImage.findFirst({ where: { productId: p.id, isPrimary: true } });
      if (existing) await prisma.productImage.update({ where: { id: existing.id }, data: { url: p.thumbnail, altText: p.name, sortOrder: 0 } });
      else await prisma.productImage.create({ data: { productId: p.id, url: p.thumbnail, altText: p.name, isPrimary: true, sortOrder: 0 } });
    }
  }

  // Remove only the legacy prototype rows. Seller-created service areas remain untouched.
  await prisma.serviceablePincode.deleteMany({ where: { id: { startsWith: 'pin-' } } });

  for (const pin of pincodes) {
    await prisma.serviceablePincode.upsert({
      where: { pincode: pin.pincode },
      update: { area: pin.area, district: pin.district, state: pin.state, stationCode: pin.stationCode, courierName: pin.courierName, isActive: pin.isActive, estimatedDeliveryDays: pin.estimatedDeliveryDays, notes: pin.notes },
      create: { id: pin.id, pincode: pin.pincode, area: pin.area, district: pin.district, state: pin.state, stationCode: pin.stationCode, courierName: pin.courierName, isActive: pin.isActive, estimatedDeliveryDays: pin.estimatedDeliveryDays, notes: pin.notes },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { role: UserRole.ADMIN, passwordHash, isEmailVerified: true, emailVerifiedAt: new Date(), status: 'ACTIVE' },
      create: { name: 'Store Admin', email: adminEmail.toLowerCase(), passwordHash, role: UserRole.ADMIN, isEmailVerified: true, emailVerifiedAt: new Date() },
    });
    console.log(`Admin seeded: ${adminEmail}`);
  } else {
    console.log('Admin seed skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.');
  }

  console.log(`Seeded ${catalog.length} storefront products.`);
  console.log(`Seeded ${pincodes.length} verified Tamil Nadu Professional Couriers Pro EX PIN-code entries.`);
  console.log('Contact settings seeded.');
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
