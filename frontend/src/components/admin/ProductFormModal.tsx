import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductStatus } from '../../types';
import { productService } from '../../services/productService';
import { toastService } from '../../services/toastService';
import { ImageUploader } from './ImageUploader';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('guppies');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [price, setPrice] = useState<number>(300);
  const [mrp, setMrp] = useState<number>(350);
  const [stock, setStock] = useState<number>(10);
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [offerEndsAt, setOfferEndsAt] = useState<string>('');
  const [sellerRating, setSellerRating] = useState<string>('');
  const [sellerRatingCount, setSellerRatingCount] = useState<string>('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');

  // Guppy details
  const [guppyVariety, setGuppyVariety] = useState('Red Dragon');
  const [guppyColour, setGuppyColour] = useState('Crimson Red');
  const [guppyGender, setGuppyGender] = useState<'Male' | 'Female' | 'Pair'>('Pair');
  const [guppySize, setGuppySize] = useState('Adult (3.5 cm)');
  const [guppyAge, setGuppyAge] = useState('3.5 Months');
  const [waterTemp, setWaterTemp] = useState('24°C - 28°C');
  const [waterPh, setWaterPh] = useState('7.0 - 8.2');
  const [breedingDiff, setBreedingDiff] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  // Food details
  const [feedType, setFeedType] = useState('Micro Pellets');
  const [netWeight, setNetWeight] = useState('100g');
  const [proteinContent, setProteinContent] = useState('48% Crude Protein');
  const [ingredients, setIngredients] = useState('Antarctic Krill, Spirulina, Fish Meal, Astaxanthin, Vitamin C & E');
  const [feedingInstructions, setFeedingInstructions] = useState('Feed twice daily in pinch quantities consumed in 2 minutes.');

  // Combo details
  const [comboBadge, setComboBadge] = useState('Save ₹100');
  const [savingsAmount, setSavingsAmount] = useState(100);
  const [includedItems, setIncludedItems] = useState<{ name: string; quantity: string; thumbnail: string }[]>([
    { name: 'Pair of Guppies', quantity: '1 Pair', thumbnail: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Micro Pellet Food (50g)', quantity: '1 Canister', thumbnail: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80' },
  ]);

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku || '');
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setStatus(productToEdit.status);
      setPrice(productToEdit.regularPrice ?? productToEdit.price);
      setMrp(productToEdit.mrp || productToEdit.price);
      setStock(productToEdit.stock);
      setOfferPrice(productToEdit.offerPrice == null ? '' : String(productToEdit.offerPrice));
      setOfferEndsAt(productToEdit.offerEndsAt ? new Date(new Date(productToEdit.offerEndsAt).getTime() - new Date(productToEdit.offerEndsAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
      setSellerRating(productToEdit.sellerRating == null ? '' : String(productToEdit.sellerRating));
      setSellerRatingCount(productToEdit.sellerRatingCount ? String(productToEdit.sellerRatingCount) : '');
      setShortDesc(productToEdit.shortDescription);
      setLongDesc(productToEdit.description);
      setIsFeatured(productToEdit.isFeatured || false);
      setImages(productToEdit.images || []);
      setThumbnail(productToEdit.thumbnail || '');

      if (productToEdit.guppyDetails) {
        setGuppyVariety(productToEdit.guppyDetails.variety);
        setGuppyColour(productToEdit.guppyDetails.colour);
        setGuppyGender(productToEdit.guppyDetails.gender);
        setGuppySize(productToEdit.guppyDetails.size);
        setGuppyAge(productToEdit.guppyDetails.age);
        setWaterTemp(productToEdit.guppyDetails.suggestedTemperature);
        setWaterPh(productToEdit.guppyDetails.suggestedPh);
        setBreedingDiff(productToEdit.guppyDetails.breedingDifficulty);
      }

      if (productToEdit.fishFoodDetails) {
        setFeedType(productToEdit.fishFoodDetails.feedType);
        setNetWeight(productToEdit.fishFoodDetails.netWeight);
        setProteinContent(productToEdit.fishFoodDetails.proteinContent);
        setIngredients(productToEdit.fishFoodDetails.keyIngredients.join(', '));
        setFeedingInstructions(productToEdit.fishFoodDetails.feedingGuide);
      }

      if (productToEdit.comboDetails) {
        setComboBadge(productToEdit.comboDetails.badgeText || '');
        setSavingsAmount(productToEdit.comboDetails.savingsAmount || 50);
        setIncludedItems(productToEdit.comboDetails.includedItems || []);
      }
    } else {
      // Defaults for new product
      setSku(`SBF-${Date.now().toString().slice(-4)}`);
      setName('');
      setCategory('guppies');
      setStatus('ACTIVE');
      setPrice(350);
      setMrp(420);
      setStock(12);
      setOfferPrice('');
      setOfferEndsAt('');
      setSellerRating('');
      setSellerRatingCount('');
      setShortDesc('');
      setLongDesc('');
      setIsFeatured(false);
      setImages(['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80']);
      setThumbnail('https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toastService.warning('Required Field', 'Please enter a product title.');
      return;
    }

    if (images.length === 0) {
      toastService.warning('Image Required', 'Please provide at least one product photo.');
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload: any = {
      name,
      slug: productToEdit?.slug || `${slug}-${Date.now().toString().slice(-4)}`,
      category,
      status,
      price: Number(price),
      regularPrice: Number(price),
      mrp: Number(mrp),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      offerEndsAt: offerEndsAt ? new Date(offerEndsAt).toISOString() : undefined,
      sellerRating: sellerRating ? Number(sellerRating) : undefined,
      sellerRatingCount: sellerRatingCount ? Number(sellerRatingCount) : 0,
      stock: Number(stock),
      shortDescription: shortDesc,
      description: longDesc || shortDesc,
      thumbnail: thumbnail || images[0],
      images,
      isFeatured,
      rating: productToEdit ? productToEdit.rating : 5.0,
      reviewCount: productToEdit ? productToEdit.reviewCount : 0,
    };

    if (category === 'guppies') {
      payload.guppyDetails = {
        variety: guppyVariety,
        colour: guppyColour,
        gender: guppyGender,
        size: guppySize,
        age: guppyAge,
        suggestedTemperature: waterTemp || '24°C - 28°C',
        suggestedPh: waterPh || '6.8 - 7.8',
        breedingDifficulty: breedingDiff,
      };
    } else if (category === 'fish-food') {
      payload.fishFoodDetails = {
        feedType,
        netWeight,
        suitableFor: 'Fry, Juvenile & Adult Guppies',
        proteinContent,
        keyIngredients: Array.isArray(ingredients) ? ingredients : [ingredients],
        crudeFat: '6% min',
        feedingGuide: feedingInstructions || 'Feed twice daily in small pinches.',
      };
    } else if (category === 'combo-packs') {
      payload.comboDetails = {
        badgeText: comboBadge,
        originalPrice: Number(mrp) || Number(price) + Number(savingsAmount || 0),
        savingsAmount: Number(savingsAmount) || 0,
        includedItems: includedItems || [],
      };
    }

    if (productToEdit) {
      await productService.updateProduct(productToEdit.id, payload);
      toastService.success('Product Updated', `${name} updated in catalog.`);
    } else {
      await productService.createProduct(payload as any);
      toastService.success('Product Created', `${name} added to catalog.`);
    }

    onSave();
    onClose();
  };

  const handleAddComboItem = () => {
    setIncludedItems((prev) => [
      ...prev,
      { name: 'Additional Item', quantity: '1 Unit', thumbnail: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80' },
    ]);
  };

  const handleRemoveComboItem = (index: number) => {
    setIncludedItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Premium, uncluttered header */}
        <div className="bg-gradient-to-r from-[#021E31] via-[#063B58] to-[#07577D] p-5 sm:p-7 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[.22em] text-cyan-300">Catalog management · Product studio</p>
            <h3 className="mt-1 text-xl sm:text-2xl font-extrabold font-['Manrope',sans-serif]">
              {productToEdit ? 'Edit Product' : 'Add New Aquatic Product'}
            </h3>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-sky-100/90">
              Create a polished, informative listing. Add clear product details, pricing, stock and images for your storefront.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] sm:text-xs font-semibold text-cyan-50">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Guppies</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Fish food</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Combo & wholesale</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close product form" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-7 overflow-y-auto bg-[#F7FBFE] p-4 text-sm sm:p-7">
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
            <h4 className="text-sm font-extrabold text-[#032B42] sm:text-base">Product information</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Fields marked required should be completed before saving. Use accurate pricing, stock and product descriptions.</p>
          </div>
          {/* Top Row: SKU, Category, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5] font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
              >
                <option value="guppies">Guppies</option>
                <option value="fish-food">Fish Food &amp; Nutrition</option>
                <option value="combo-packs">Combo Pack</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
              >
                <option value="ACTIVE">ACTIVE (Available)</option>
                <option value="COMING_SOON">COMING SOON (Not Orderable)</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* Optional commercial settings */}
          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center gap-2"><span className="rounded-lg bg-amber-100 p-2 text-amber-700">✦</span><div><h4 className="font-extrabold text-[#032B42]">Scheduled Product Offer</h4><p className="mt-0.5 text-xs leading-relaxed text-slate-500">Set both fields to show a live customer countdown. Clear both to disable.</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-bold text-slate-700">Offer Price (₹)</label><input type="number" min="0.01" step="0.01" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="e.g. 299" className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm focus:border-amber-500 focus:outline-none" /></div>
                <div><label className="mb-1.5 block text-xs font-bold text-slate-700">Offer Ends At</label><input type="datetime-local" value={offerEndsAt} onChange={(e) => setOfferEndsAt(e.target.value)} className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm focus:border-amber-500 focus:outline-none" /></div>
              </div>
              {(offerPrice || offerEndsAt) && <button type="button" onClick={() => { setOfferPrice(''); setOfferEndsAt(''); }} className="mt-3 text-xs font-bold text-rose-600 hover:underline">Clear scheduled offer</button>}
            </section>
            <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm sm:p-5">
              <div className="mb-3"><h4 className="font-extrabold text-[#032B42]">Seller Display Rating <span className="font-medium text-slate-400">(optional)</span></h4><p className="mt-1 text-xs leading-relaxed text-slate-500">Verified customer review scores and counts always take priority.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-bold text-slate-700">Stars (0–5)</label><input type="number" min="0" max="5" step="0.1" value={sellerRating} onChange={e=>setSellerRating(e.target.value)} placeholder="e.g. 4.5" className="w-full rounded-xl border border-sky-200 bg-white p-3 text-sm"/></div>
                <div><label className="mb-1.5 block text-xs font-bold text-slate-700">Display count</label><input type="number" min="0" max="1000000" step="1" value={sellerRatingCount} onChange={e=>setSellerRatingCount(e.target.value)} placeholder="e.g. 120" className="w-full rounded-xl border border-sky-200 bg-white p-3 text-sm"/></div>
              </div>
            </section>
          </div>

          {/* Product Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Red Dragon Dumbo Ear Guppy (Pair)"
              className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
            />
          </div>

          {/* Price, MRP, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
              <input
                type="number"
                min={0}
                value={mrp}
                onChange={(e) => setMrp(Number(e.target.value))}
                className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Short Description</label>
            <input
              type="text"
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief summary for catalog cards"
              className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
              placeholder="Full details on lineage, feeding habit, and tank conditions"
              className="w-full p-3 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-[#0875B5]"
            />
          </div>

          {/* Image Uploader Component */}
          <ImageUploader
            images={images}
            onChange={setImages}
            thumbnail={thumbnail}
            onThumbnailChange={setThumbnail}
          />

          {/* CATEGORY SPECIFIC FIELDS */}
          {/* Guppies */}
          {category === 'guppies' && (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-3">
              <h4 className="font-bold text-[#032B42] uppercase tracking-wider">
                Guppy Biological Attributes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Variety / Strain</label>
                  <input
                    type="text"
                    value={guppyVariety}
                    onChange={(e) => setGuppyVariety(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Colour</label>
                  <input
                    type="text"
                    value={guppyColour}
                    onChange={(e) => setGuppyColour(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender / Pack</label>
                  <select
                    value={guppyGender}
                    onChange={(e) => setGuppyGender(e.target.value as any)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  >
                    <option value="Pair">Breeding Pair</option>
                    <option value="Male">Show Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Water Temp</label>
                  <input
                    type="text"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Water pH</label>
                  <input
                    type="text"
                    value={waterPh}
                    onChange={(e) => setWaterPh(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Breeding Difficulty</label>
                  <select
                    value={breedingDiff}
                    onChange={(e) => setBreedingDiff(e.target.value as any)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Fish Food */}
          {category === 'fish-food' && (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-3">
              <h4 className="font-bold text-[#032B42] uppercase tracking-wider">
                Fish Food Nutritional Attributes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Feed Type</label>
                  <input
                    type="text"
                    value={feedType}
                    onChange={(e) => setFeedType(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Net Weight</label>
                  <input
                    type="text"
                    value={netWeight}
                    onChange={(e) => setNetWeight(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Protein Content</label>
                  <input
                    type="text"
                    value={proteinContent}
                    onChange={(e) => setProteinContent(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Ingredients</label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Combo Pack */}
          {category === 'combo-packs' && (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#032B42] uppercase tracking-wider">
                  Combo Pack Contents &amp; Savings
                </h4>
                <button
                  type="button"
                  onClick={handleAddComboItem}
                  className="text-[11px] font-bold text-[#0875B5] bg-white px-2 py-1 rounded-lg border border-sky-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={comboBadge}
                    onChange={(e) => setComboBadge(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Savings Amount (₹)</label>
                  <input
                    type="number"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-sky-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {includedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-sky-100">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const next = [...includedItems];
                        next[idx].name = e.target.value;
                        setIncludedItems(next);
                      }}
                      className="flex-1 p-1.5 border border-slate-200 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...includedItems];
                        next[idx].quantity = e.target.value;
                        setIncludedItems(next);
                      }}
                      className="w-24 p-1.5 border border-slate-200 rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveComboItem(idx)}
                      className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {category === 'wholesale' && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-3">
              <h4 className="font-bold text-[#032B42] uppercase tracking-wider">Wholesale Listing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use the normal name, price, stock, description and image fields above. Clearly mention the bulk quantity or pack size in the product name and description. Wholesale is a normal store category, not an enquiry form.
              </p>
            </div>
          )}

          {/* Featured Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#0875B5]"
              />
              <span>Feature on Storefront Homepage</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-sky-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-12 px-7 py-3 rounded-xl bg-gradient-to-r from-[#0875B5] to-[#0B91C8] hover:brightness-105 text-white font-extrabold shadow-md flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
