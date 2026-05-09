import React, { useState, useEffect } from 'react';
import { 
  Package, Boxes, AlertTriangle, ArrowDown, 
  BarChart, Layers, Search, Plus 
} from 'lucide-react';
import api from '../../api';

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await api.get('/inventory/');
        setItems(data.results || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const lowStock = items.filter(item => item.quantity < 10);

  return (
    <div className="inventory-dashboard animate-fade-in">
      <div className="inventory-hero-stats">
        <div className="i-hero-card glass warning">
          <div className="icon-box"><AlertTriangle size={32}/></div>
          <div className="details">
            <h3>{lowStock.length}</h3>
            <p>Low Stock Items</p>
          </div>
          <button className="action-link">Restock All</button>
        </div>
        <div className="i-hero-card glass info">
          <div className="icon-box"><Package size={32}/></div>
          <div className="details">
            <h3>{items.length}</h3>
            <p>Total SKUs</p>
          </div>
        </div>
        <div className="i-hero-card glass success">
          <div className="icon-box"><Layers size={32}/></div>
          <div className="details">
            <h3>1,204</h3>
            <p>Units in Warehouse</p>
          </div>
        </div>
      </div>

      <div className="inventory-grid">
        <div className="stock-monitor glass">
          <div className="section-header">
            <h4>Live Stock Monitor</h4>
            <div className="search-bar">
              <Search size={16}/>
              <input type="text" placeholder="Filter by SKU or Name..." />
            </div>
          </div>
          <div className="stock-table">
            <div className="t-head">
              <span>Product</span>
              <span>SKU</span>
              <span>Stock</span>
              <span>Price</span>
              <span>Trend</span>
            </div>
            {items.slice(0, 8).map(item => (
              <div key={item.id} className="t-row">
                <span className="p-name">{item.product_name}</span>
                <span className="p-sku">{item.sku || 'N/A'}</span>
                <span className={`p-stock ${item.quantity < 10 ? 'low' : ''}`}>{item.quantity}</span>
                <span className="p-price">${item.unit_price}</span>
                <span className="p-trend"><ArrowDown size={14} color="#ff4d4d"/> 4%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="inventory-actions">
          <div className="widget glass quick-add">
            <h4>Inventory Control</h4>
            <button className="btn-action primary"><Plus size={18}/> New SKU Entry</button>
            <button className="btn-action"><BarChart size={18}/> Generate Manifest</button>
            <button className="btn-action"><Boxes size={18}/> Transfer Stock</button>
          </div>

          <div className="widget glass warehouse-stats">
            <h4>Warehouse Allocation</h4>
            <div className="allocation-chart">
              {/* Simple CSS bars for demo */}
              <div className="a-bar">
                <label>Section A (Electronics)</label>
                <div className="bar"><div className="fill" style={{width: '85%'}}></div></div>
              </div>
              <div className="a-bar">
                <label>Section B (Clothing)</label>
                <div className="bar"><div className="fill" style={{width: '40%'}}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
