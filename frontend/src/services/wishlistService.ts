import { Product } from '../types';
import { authService } from './authService';
const API_BASE_URL=(import.meta.env.VITE_API_BASE_URL||'http://localhost:4000/api').replace(/\/$/,'');
type WishlistListener=(productIds:string[])=>void; type Envelope<T>={success:boolean;message?:string;data?:T};
async function request<T>(path:string,init:RequestInit={}):Promise<T>{const r=await fetch(`${API_BASE_URL}${path}`,{...init,credentials:'include',headers:{'Content-Type':'application/json',...(init.headers||{})}});const p=await r.json().catch(()=>({})) as Envelope<T>;if(!r.ok||!p.success)throw new Error(p.message||'Wishlist request failed');return p.data as T;}
class WishlistService{
 private wishlistIds:string[]=[];private listeners=new Set<WishlistListener>();
 constructor(){authService.subscribe(u=>{if(u?.isEmailVerified)void this.sync();else{this.wishlistIds=[];this.notify();}})}
 private notify(){const list=[...this.wishlistIds];this.listeners.forEach(l=>l(list));}
 async sync(){try{const rows=await request<Array<{productId:string}>>('/wishlist');this.wishlistIds=rows.map(r=>r.productId);this.notify();}catch{this.wishlistIds=[];this.notify();}}
 subscribe(l:WishlistListener){this.listeners.add(l);l([...this.wishlistIds]);return()=>this.listeners.delete(l)}
 isInWishlist(id:string){return this.wishlistIds.includes(id)} isWishlisted(id:string){return this.isInWishlist(id)} getWishlistIds(){return[...this.wishlistIds]}
 async toggle(product:Product):Promise<{success:boolean;inWishlist:boolean;requiresAuth?:boolean;message?:string}>{
  if(!authService.isAuthenticatedAndVerified())return{success:false,inWishlist:false,requiresAuth:true,message:'Please sign in and verify your email to save Wishlist items.'};
  const exists=this.wishlistIds.includes(product.id);
  try{const rows=await request<Array<{productId:string}>>(`/wishlist/${product.id}`,{method:exists?'DELETE':'POST',body:exists?undefined:'{}'});this.wishlistIds=rows.map(r=>r.productId);this.notify();return{success:true,inWishlist:!exists,message:exists?'Removed from wishlist.':'Saved to wishlist!'};}catch(e){return{success:false,inWishlist:exists,message:e instanceof Error?e.message:'Unable to update wishlist'};}
 }
}
export const wishlistService=new WishlistService();
