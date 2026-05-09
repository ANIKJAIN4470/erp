import { useState, useEffect } from 'react';
import { PackagePlus, Search, Loader2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/shared/DataTable';
import { Modal } from '../components/shared/Modal';
import { demoInventory } from '../data/demoData';

const Inventory = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({ product_name: '', sku: '', quantity: '', unit_price: '' });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.get('/inventory/');
      const rows = data.results || data || [];
      setProducts(rows.length ? rows : demoInventory);
    } catch (err) {
      console.error(err);
      setProducts(demoInventory);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inventory/', newProduct);
      setShowModal(false);
      setNewProduct({ product_name: '', sku: '', quantity: '', unit_price: '' });
      fetchInventory();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filtered = products.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: products.length,
    low: products.filter(p => p.status === 'low_stock').length,
    out: products.filter(p => p.status === 'out_of_stock').length
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Inventory Control</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Comprehensive SKU management and stock optimization dashboard.</p>
        </div>
        {['admin', 'inventory'].includes(role) && (
          <button className="nav-link active" onClick={() => setShowModal(true)} style={{ border: 'none', cursor: 'pointer' }}>
            <PackagePlus size={16} /> <span>Add New SKU</span>
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card-premium" style={{ borderLeft: '4px solid var(--border-strong)' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Inventory</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.total} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Items</span></div>
        </div>
        <div className="card-premium" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Low Stock</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.low} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>SKUs</span></div>
        </div>
        <div className="card-premium" style={{ borderLeft: '4px solid var(--error)' }}>
          <div style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Out of Stock</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.out} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>SKUs</span></div>
        </div>
      </div>

      <div className="card-premium" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div className="header-search" style={{ width: '100%' }}>
          <Search size={14} color="var(--text-dim)" />
          <input 
            type="text" 
            placeholder="Search catalog by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        headers={['Product', 'SKU', 'Unit Price', 'Quantity', 'Status']}
        loading={loading}
      >
        {filtered.map(p => (
          <tr key={p.id}>
            <td style={{ fontWeight: '600' }}>{p.product_name}</td>
            <td style={{ fontSize: '0.8rem', opacity: 0.7, fontFamily: 'monospace' }}>{p.sku}</td>
            <td style={{ fontWeight: '600' }}>${Number(p.unit_price).toLocaleString()}</td>
            <td style={{ fontWeight: '700' }}>{p.quantity}</td>
            <td>
              <span className={`risk-tag ${p.status === 'out_of_stock' ? 'high' : p.status === 'low_stock' ? 'medium' : ''}`}>
                {p.status.replace('_', ' ').toUpperCase()}
              </span>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Product to Warehouse">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Product Name</label>
            <input 
              type="text" 
              className="card-premium" 
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
              value={newProduct.product_name}
              onChange={e => setNewProduct({...newProduct, product_name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>SKU</label>
            <input 
              type="text" 
              className="card-premium" 
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
              value={newProduct.sku}
              onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Quantity</label>
              <input 
                type="number" 
                className="card-premium" 
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
                value={newProduct.quantity}
                onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Price ($)</label>
              <input 
                type="number" 
                className="card-premium" 
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
                value={newProduct.unit_price}
                onChange={e => setNewProduct({...newProduct, unit_price: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="nav-link active" style={{ border: 'none', padding: '0.8rem', justifyContent: 'center', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : 'Commit to Catalog'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
