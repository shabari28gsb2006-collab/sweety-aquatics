const API=(import.meta.env.VITE_API_BASE_URL||'http://localhost:4000/api').replace(/\/$/,'');
type Envelope<T>={success:boolean;message?:string;data:T};
async function request<T>(path:string,init:RequestInit={},retry=true):Promise<T>{const res=await fetch(`${API}${path}`,{...init,credentials:'include',headers:{'Content-Type':'application/json',...(init.headers||{})}});const body=await res.json().catch(()=>({})) as Envelope<T>;if(res.status===401&&retry){await request('/auth/refresh',{method:'POST',body:'{}'},false);return request<T>(path,init,false)}if(!res.ok||!body.success)throw new Error(body.message||`Payment request failed (${res.status})`);return body.data;}
export type CheckoutPreview={items:any[];subtotal:number;shippingCharge:number;discount:number;total:number;currency:string;courierName?:string;estimatedDeliveryDays?:number;ready:boolean};
export type BackendOrder={id:string;orderNumber:string;userId:string;status:string;paymentStatus:string;subtotal:string|number;shippingCharge:string|number;discount:string|number;total:string|number;createdAt:string;items:any[];payment?:{utrNumber?:string|null};shipment?:any};
export type UpiIntent={id:string;orderNumber:string;total:string|number;upiUri:string;upiId:string;upiPayeeName:string;expiresAt:string};
export const paymentService={
 previewCheckout:(input:any)=>request<CheckoutPreview>('/checkout/readiness',{method:'POST',body:JSON.stringify(input)}),
 createIntent:(input:any)=>request<UpiIntent>('/payments/upi/intent',{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(input)}),
 submit:(input:{attemptId:string;utrNumber:string;proofImageData?:string})=>request<BackendOrder>('/payments/upi/submit',{method:'POST',body:JSON.stringify(input)}),
 cancel:(attemptId:string)=>request('/payments/upi/cancel',{method:'POST',body:JSON.stringify({attemptId})}),
 status:(id:string)=>request(`/payments/upi/${encodeURIComponent(id)}`)
};
