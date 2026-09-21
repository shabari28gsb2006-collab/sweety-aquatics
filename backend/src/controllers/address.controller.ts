import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/errorHandler.js';
import { normalizeIndianMobile } from '../services/auth.service.js';
import { ok } from '../utils/apiResponse.js';

const addressSchema = z.object({
  label: z.string().trim().min(1).max(30).default('Home'),
  fullName: z.string().trim().min(2).max(100),
  mobile: z.string().min(10).max(18),
  line1: z.string().trim().min(3).max(180),
  line2: z.string().trim().max(180).optional().nullable(),
  area: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  state: z.literal('Tamil Nadu').default('Tamil Nadu'),
  pincode: z.string().regex(/^\d{6}$/),
  isDefault: z.boolean().optional(),
});

async function list(userId: string) { return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }); }

export async function listAddressesController(req: Request,res: Response,next: NextFunction){try{return ok(res,await list((req as AuthenticatedRequest).auth.userId),'Addresses');}catch(e){next(e);}}
export async function createAddressController(req: Request,res: Response,next: NextFunction){
  try{
    const userId=(req as AuthenticatedRequest).auth.userId; const body=addressSchema.parse(req.body); const mobile=normalizeIndianMobile(body.mobile);
    const count=await prisma.address.count({where:{userId}}); const makeDefault=body.isDefault===true || count===0;
    const created=await prisma.$transaction(async(tx)=>{if(makeDefault) await tx.address.updateMany({where:{userId,isDefault:true},data:{isDefault:false}});return tx.address.create({data:{...body,mobile,userId,isDefault:makeDefault,line2:body.line2||null,area:body.area||null}});});
    return ok(res,created,'Address saved',201);
  }catch(e){next(e);}
}
export async function updateAddressController(req: Request,res: Response,next: NextFunction){
  try{
    const userId=(req as AuthenticatedRequest).auth.userId; const body=addressSchema.parse(req.body); const existing=await prisma.address.findFirst({where:{id:req.params.id,userId}}); if(!existing) throw new AppError(404,'Address not found');
    const mobile=normalizeIndianMobile(body.mobile);
    const updated=await prisma.$transaction(async(tx)=>{if(body.isDefault) await tx.address.updateMany({where:{userId,isDefault:true,id:{not:existing.id}},data:{isDefault:false}});return tx.address.update({where:{id:existing.id},data:{...body,mobile,line2:body.line2||null,area:body.area||null}});});
    return ok(res,updated,'Address updated');
  }catch(e){next(e);}
}
export async function deleteAddressController(req: Request,res: Response,next: NextFunction){
  try{
    const userId=(req as AuthenticatedRequest).auth.userId; const existing=await prisma.address.findFirst({where:{id:req.params.id,userId}}); if(!existing) throw new AppError(404,'Address not found');
    await prisma.$transaction(async(tx)=>{await tx.address.delete({where:{id:existing.id}});if(existing.isDefault){const nextAddress=await tx.address.findFirst({where:{userId},orderBy:{createdAt:'desc'}});if(nextAddress) await tx.address.update({where:{id:nextAddress.id},data:{isDefault:true}});}});
    return ok(res,{},'Address deleted');
  }catch(e){next(e);}
}
export async function defaultAddressController(req: Request,res: Response,next: NextFunction){
  try{
    const userId=(req as AuthenticatedRequest).auth.userId; const existing=await prisma.address.findFirst({where:{id:req.params.id,userId}}); if(!existing) throw new AppError(404,'Address not found');
    await prisma.$transaction([prisma.address.updateMany({where:{userId,isDefault:true},data:{isDefault:false}}),prisma.address.update({where:{id:existing.id},data:{isDefault:true}})]);
    return ok(res,await list(userId),'Default address updated');
  }catch(e){next(e);}
}
