import React, { useEffect, useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { productService } from '../../services/productService';
import { toastService } from '../../services/toastService';
import { customerFeatureService } from '../../services/customerFeatureService';
import { Plus, Edit2, Trash2, Search, AlertTriangle, Check, Copy, CheckSquare } from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  onRefresh: () => void;
  onEditProduct: (product: Product) => void;
  onAddProduct: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onRefresh,
  onEditProduct,
  onAddProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [, setAlertVersion] = useState(0);
  useEffect(() => { void customerFeatureService.loadAdminAlertCounts().then(() => setAlertVersion(value => value + 1)).catch(() => undefined); }, []);

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (p.name?.toLowerCase() || '').includes(q) ||
        (p.sku?.toLowerCase() || '').includes(q) ||
        (p.id?.toLowerCase() || '').includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      await productService.deleteProduct(id);
      toastService.info('Product Removed', `${name} has been deleted.`);
      onRefresh();
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const duplicateProduct = async (product: Product) => {
    const copy = await productService.duplicateProduct(product.id);
    if (copy) {
      toastService.success('Product Duplicated', `${copy.name} was created as a draft.`);
      onRefresh();
    }
  };

  const applyBulkStatus = async (status: any) => {
    if (!selectedIds.length) return;
    const count = await productService.bulkUpdateStatus(selectedIds, status);
    toastService.success('Bulk Update Complete', `${count} products updated to ${String(status).replaceAll('_', ' ')}.`);
    setSelectedIds([]);
    onRefresh();
  };

  const adjustBulkPrice = async (percent: number) => {
    if (!selectedIds.length) return;
    const count = await productService.bulkAdjustPrice(selectedIds, percent);
    toastService.success('Prices Updated', `${count} products changed by ${percent > 0 ? '+' : ''}${percent}%.`);
    onRefresh();
  };

  const adjustBulkStock = async (delta: number) => {
    if (!selectedIds.length) return;
    const count = await productService.bulkAdjustStock(selectedIds, delta);
    toastService.success('Stock Updated', `${count} products adjusted by ${delta > 0 ? '+' : ''}${delta}.`);
    onRefresh();
  };

  const handleStartStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setTempStockValue(product.stock);
  };

  const handleSaveStock = async (productId: string) => {
    await productService.updateStock(productId, tempStockValue);
    setEditingStockId(null);
    toastService.success('Stock Updated', 'Inventory count updated.');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#032B42] font-['Manrope',sans-serif]">
            Aquatic Products Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Manage guppies, fish food, combo packs and wholesale catalog items.
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="premium-action-btn bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Aquatic Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F8FDFF] border border-sky-100 rounded-xl focus:outline-none focus:border-[#0875B5]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'guppies', label: 'Guppies' },
            { id: 'fish-food', label: 'Fish Food' },
            { id: 'combo-packs', label: 'Combos' },
            { id: 'wholesale', label: 'Wholesale' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#0875B5] text-white'
                  : 'bg-sky-50 text-slate-600 hover:bg-sky-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-[#032B42] text-white rounded-2xl px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold"><CheckSquare className="w-4 h-4 text-[#50D4EE]" /> {selectedIds.length} products selected</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => adjustBulkPrice(5)} className="premium-action-btn px-3 py-2 rounded-xl bg-violet-500/20 text-violet-100 text-xs font-bold">Price +5%</button>
            <button onClick={() => adjustBulkPrice(-5)} className="premium-action-btn px-3 py-2 rounded-xl bg-violet-500/20 text-violet-100 text-xs font-bold">Price -5%</button>
            <button onClick={() => adjustBulkStock(1)} className="premium-action-btn px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold">Stock +1</button>
            <button onClick={() => adjustBulkStock(-1)} className="premium-action-btn px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold">Stock -1</button>
            <button onClick={() => applyBulkStatus('ACTIVE')} className="premium-action-btn px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 text-xs font-bold">Set Active</button>
            <button onClick={() => applyBulkStatus('COMING_SOON')} className="premium-action-btn px-3 py-2 rounded-xl bg-amber-500/20 text-amber-100 text-xs font-bold">Coming Soon</button>
            <button onClick={() => applyBulkStatus('DRAFT')} className="premium-action-btn px-3 py-2 rounded-xl bg-slate-500/20 text-slate-100 text-xs font-bold">Move to Draft</button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sky-50/60 border-b border-sky-100 text-slate-500 uppercase text-[10px]">
                <th className="py-3.5 px-4 font-semibold w-10"><input type="checkbox" aria-label="Select all filtered products" checked={filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.id))} onChange={(e) => setSelectedIds(e.target.checked ? Array.from(new Set([...selectedIds, ...filtered.map((p) => p.id)])) : selectedIds.filter((id) => !filtered.some((p) => p.id === id)))} /></th>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">SKU</th>
                <th className="py-3.5 px-4 font-semibold">Price / MRP</th>
                <th className="py-3.5 px-4 font-semibold">Stock</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#F8FDFF] transition-colors">
                  <td className="py-3 px-4"><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelected(product.id)} aria-label={`Select ${product.name}`} /></td>
                  {/* Title & Image */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnail}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-sky-100 bg-sky-50 shrink-0"
                      />
                      <div className="truncate max-w-[200px]">
                        <p className="font-bold text-[#032B42] truncate">{product.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{product.shortDescription}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0875B5] bg-sky-50 px-2 py-0.5 rounded-md">
                      {product.category.replace('-', ' ')}
                    </span>
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{product.sku || product.id.toUpperCase().replace('PROD-', '')}</td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#032B42]">₹{product.price}</p>
                    {product.mrp && <p className="text-[10px] text-slate-400 line-through">₹{product.mrp}</p>}
                  </td>

                  {/* Stock with quick edit */}
                  <td className="py-3 px-4">
                    {editingStockId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={tempStockValue}
                          onChange={(e) => setTempStockValue(Number(e.target.value))}
                          className="w-16 p-1 border border-[#0875B5] rounded text-xs"
                        />
                        <button
                          onClick={() => handleSaveStock(product.id)}
                          className="p-1 bg-[#0875B5] text-white rounded hover:bg-[#064463]"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartStockEdit(product)}
                        className="cursor-pointer group flex items-center gap-1.5"
                      >
                        <span
                          className={`font-mono font-bold ${
                            product.stock <= 5 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {product.stock} units
                        </span>
                        {product.stock <= 5 && (
                          <AlertTriangle className="w-3 h-3 text-amber-500" title="Low stock" />
                        )}
                        <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          (edit)
                        </span>
                        {customerFeatureService.getAlertCount(product.id) > 0 && <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{customerFeatureService.getAlertCount(product.id)} alerts</span>}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        product.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : product.status === 'OUT_OF_STOCK'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => duplicateProduct(product)}
                        className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Duplicate Product as Draft"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 text-slate-400 hover:text-[#0875B5] hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
