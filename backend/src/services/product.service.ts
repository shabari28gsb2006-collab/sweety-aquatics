import { ProductStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function listPublicProducts() {
  return prisma.product.findMany({
    where: {
      status: { in: [ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK, ProductStatus.COMING_SOON] },
    },
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      reviews: { where: { status: 'APPROVED', isVerifiedPurchase: true }, select: { rating: true } },
      comboParentItems: { include: { itemProduct: { select: { id: true, name: true, slug: true, status: true } } } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

const fullInclude = {
  images: { orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] },
  comboParentItems: { include: { itemProduct: { select: { id: true, name: true, slug: true, status: true } } } },
};

export function listSellerProducts() {
  return prisma.product.findMany({ include: fullInclude, orderBy: { updatedAt: 'desc' } });
}

export async function createSellerProduct(data: Prisma.ProductCreateInput, images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>) {
  return prisma.product.create({ data: { ...data, images: { create: images } }, include: fullInclude });
}

export async function updateSellerProduct(id: string, data: Prisma.ProductUpdateInput, images?: Array<{ url: string; isPrimary: boolean; sortOrder: number }>) {
  return prisma.$transaction(async tx => {
    if (images) await tx.productImage.deleteMany({ where: { productId: id } });
    return tx.product.update({ where: { id }, data: { ...data, ...(images ? { images: { create: images } } : {}) }, include: fullInclude });
  });
}

export async function getPublicProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: { in: [ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK, ProductStatus.COMING_SOON] },
    },
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      reviews: {
        where: { status: 'APPROVED', isVerifiedPurchase: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      comboParentItems: { include: { itemProduct: true } },
    },
  });
}
