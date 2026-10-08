// ==============================================================================
// OmniSpec Default Product Catalog & Category Definitions
// Curated benchmark specifications, verified store prices, and price history
// ==============================================================================

export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-phones',
    slug: 'smartphones',
    name: 'Smartphones',
    icon: 'Smartphone',
    spec_defs: [
      { key: 'display_size', label: 'Display Size', unit: 'in', dir: 1, type: 'number', group: 'Display' },
      { key: 'refresh_rate', label: 'Refresh Rate', unit: 'Hz', dir: 1, type: 'number', group: 'Display' },
      { key: 'peak_brightness', label: 'Peak Brightness', unit: 'nits', dir: 1, type: 'number', group: 'Display' },
      { key: 'processor', label: 'Processor', unit: '', dir: 0, type: 'text', group: 'Performance' },
      { key: 'ram_gb', label: 'RAM', unit: 'GB', dir: 1, type: 'number', group: 'Performance' },
      { key: 'base_storage_gb', label: 'Base Storage', unit: 'GB', dir: 1, type: 'number', group: 'Storage' },
      { key: 'main_camera_mp', label: 'Main Camera', unit: 'MP', dir: 1, type: 'number', group: 'Camera' },
      { key: 'optical_zoom', label: 'Optical Zoom', unit: 'x', dir: 1, type: 'number', group: 'Camera' },
      { key: 'battery_mah', label: 'Battery Capacity', unit: 'mAh', dir: 1, type: 'number', group: 'Battery & Charging' },
      { key: 'charging_speed_w', label: 'Wired Fast Charging', unit: 'W', dir: 1, type: 'number', group: 'Battery & Charging' },
      { key: 'weight_g', label: 'Weight', unit: 'g', dir: -1, type: 'number', group: 'Chassis & Build' },
      { key: 'water_resistance', label: 'Water Resistance', unit: '', dir: 0, type: 'text', group: 'Chassis & Build' }
    ]
  },
  {
    id: 'cat-laptops',
    slug: 'laptops',
    name: 'Laptops',
    icon: 'Laptop',
    spec_defs: [
      { key: 'screen_size_in', label: 'Screen Size', unit: 'in', dir: 1, type: 'number', group: 'Display' },
      { key: 'resolution', label: 'Resolution', unit: '', dir: 0, type: 'text', group: 'Display' },
      { key: 'refresh_rate_hz', label: 'Refresh Rate', unit: 'Hz', dir: 1, type: 'number', group: 'Display' },
      { key: 'processor', label: 'Processor / Chip', unit: '', dir: 0, type: 'text', group: 'Performance' },
      { key: 'ram_gb', label: 'Unified Memory / RAM', unit: 'GB', dir: 1, type: 'number', group: 'Performance' },
      { key: 'storage_gb', label: 'SSD Storage', unit: 'GB', dir: 1, type: 'number', group: 'Storage' },
      { key: 'battery_life_hours', label: 'Battery Life', unit: 'hrs', dir: 1, type: 'number', group: 'Battery & Power' },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', dir: -1, type: 'number', group: 'Chassis & Build' }
    ]
  },
  {
    id: 'cat-audio',
    slug: 'headphones',
    name: 'Headphones & Audio',
    icon: 'Headphones',
    spec_defs: [
      { key: 'driver_size_mm', label: 'Driver Size', unit: 'mm', dir: 1, type: 'number', group: 'Acoustics' },
      { key: 'anc_rating', label: 'Active Noise Cancellation', unit: '/10', dir: 1, type: 'number', group: 'Noise Cancelling' },
      { key: 'battery_anc_hours', label: 'Battery Life (ANC On)', unit: 'hrs', dir: 1, type: 'number', group: 'Battery' },
      { key: 'quick_charge_mins', label: 'Quick Charge for 3h', unit: 'mins', dir: -1, type: 'number', group: 'Battery' },
      { key: 'bluetooth_version', label: 'Bluetooth Codec Support', unit: '', dir: 0, type: 'text', group: 'Connectivity' },
      { key: 'weight_g', label: 'Weight', unit: 'g', dir: -1, type: 'number', group: 'Comfort' }
    ]
  },
  {
    id: 'cat-wearables',
    slug: 'smartwatches',
    name: 'Smartwatches',
    icon: 'Watch',
    spec_defs: [
      { key: 'display_brightness_nits', label: 'Peak Brightness', unit: 'nits', dir: 1, type: 'number', group: 'Display' },
      { key: 'battery_days', label: 'Standard Battery Life', unit: 'days', dir: 1, type: 'number', group: 'Battery' },
      { key: 'water_rating_m', label: 'Water Resistance', unit: 'm', dir: 1, type: 'number', group: 'Durability' },
      { key: 'ecg_sensor', label: 'ECG & Blood Oxygen', unit: '', dir: 1, type: 'bool', group: 'Health & Sensors' },
      { key: 'case_material', label: 'Chassis Material', unit: '', dir: 0, type: 'text', group: 'Build' },
      { key: 'weight_g', label: 'Weight (case)', unit: 'g', dir: -1, type: 'number', group: 'Build' }
    ]
  },
  {
    id: 'cat-tablets',
    slug: 'tablets',
    name: 'Tablets',
    icon: 'Tablet',
    spec_defs: [
      { key: 'screen_size_in', label: 'Display Size', unit: 'in', dir: 1, type: 'number', group: 'Display' },
      { key: 'panel_type', label: 'Panel Technology', unit: '', dir: 0, type: 'text', group: 'Display' },
      { key: 'refresh_rate_hz', label: 'Refresh Rate', unit: 'Hz', dir: 1, type: 'number', group: 'Display' },
      { key: 'processor', label: 'Chipset', unit: '', dir: 0, type: 'text', group: 'Performance' },
      { key: 'storage_gb', label: 'Base Storage', unit: 'GB', dir: 1, type: 'number', group: 'Storage' },
      { key: 'battery_wh', label: 'Battery Size', unit: 'Wh', dir: 1, type: 'number', group: 'Power' },
      { key: 'weight_g', label: 'Weight', unit: 'g', dir: -1, type: 'number', group: 'Portability' }
    ]
  }
];

export const DEFAULT_PRODUCTS = [
  // --- SMARTPHONES ---
  {
    id: 'prod-iphone-16-pro-max',
    category_id: 'cat-phones',
    brand: 'Apple',
    name: 'iPhone 16 Pro Max',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    specs: {
      display_size: 6.9,
      refresh_rate: 120,
      peak_brightness: 2000,
      processor: 'A18 Pro (3nm)',
      ram_gb: 8,
      base_storage_gb: 256,
      main_camera_mp: 48,
      optical_zoom: 5,
      battery_mah: 4685,
      charging_speed_w: 27,
      weight_g: 227,
      water_resistance: 'IP68 (6m, 30 min)'
    },
    store_prices: [
      { id: 'sp-1-1', store: 'Amazon', price: 1199.00, url: 'https://www.amazon.com/dp/B0D1XD1476' },
      { id: 'sp-1-2', store: 'Best Buy', price: 1199.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-1-3', store: 'B&H Photo', price: 1199.00, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-1-4', store: 'Apple Store', price: 1199.00, url: 'https://www.apple.com' }
    ],
    price_history: [
      { id: 'ph-1-1', price: 1249.00, recorded_at: '2024-09-20' },
      { id: 'ph-1-2', price: 1229.00, recorded_at: '2024-10-15' },
      { id: 'ph-1-3', price: 1199.00, recorded_at: '2024-11-20' },
      { id: 'ph-1-4', price: 1189.00, recorded_at: '2024-12-05' },
      { id: 'ph-1-5', price: 1199.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-galaxy-s24-ultra',
    category_id: 'cat-phones',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    specs: {
      display_size: 6.8,
      refresh_rate: 120,
      peak_brightness: 2600,
      processor: 'Snapdragon 8 Gen 3',
      ram_gb: 12,
      base_storage_gb: 256,
      main_camera_mp: 200,
      optical_zoom: 5,
      battery_mah: 5000,
      charging_speed_w: 45,
      weight_g: 232,
      water_resistance: 'IP68 (1.5m, 30 min)'
    },
    store_prices: [
      { id: 'sp-2-1', store: 'Amazon', price: 1049.99, url: 'https://www.amazon.com' },
      { id: 'sp-2-2', store: 'Best Buy', price: 1099.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-2-3', store: 'B&H Photo', price: 1079.00, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-2-4', store: 'Walmart', price: 1099.00, url: 'https://www.walmart.com' }
    ],
    price_history: [
      { id: 'ph-2-1', price: 1299.99, recorded_at: '2024-02-15' },
      { id: 'ph-2-2', price: 1199.99, recorded_at: '2024-05-10' },
      { id: 'ph-2-3', price: 1149.00, recorded_at: '2024-08-01' },
      { id: 'ph-2-4', price: 1049.99, recorded_at: '2024-11-28' },
      { id: 'ph-2-5', price: 1049.99, recorded_at: '2025-01-10' }
    ]
  },
  {
    id: 'prod-pixel-9-pro-xl',
    category_id: 'cat-phones',
    brand: 'Google',
    name: 'Pixel 9 Pro XL',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    specs: {
      display_size: 6.8,
      refresh_rate: 120,
      peak_brightness: 3000,
      processor: 'Google Tensor G4',
      ram_gb: 16,
      base_storage_gb: 128,
      main_camera_mp: 50,
      optical_zoom: 5,
      battery_mah: 5060,
      charging_speed_w: 37,
      weight_g: 221,
      water_resistance: 'IP68'
    },
    store_prices: [
      { id: 'sp-3-1', store: 'Amazon', price: 949.00, url: 'https://www.amazon.com' },
      { id: 'sp-3-2', store: 'Best Buy', price: 999.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-3-3', store: 'Google Store', price: 1099.00, url: 'https://store.google.com' }
    ],
    price_history: [
      { id: 'ph-3-1', price: 1099.00, recorded_at: '2024-09-01' },
      { id: 'ph-3-2', price: 1049.00, recorded_at: '2024-10-15' },
      { id: 'ph-3-3', price: 949.00, recorded_at: '2024-11-29' },
      { id: 'ph-3-4', price: 949.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-oneplus-12',
    category_id: 'cat-phones',
    brand: 'OnePlus',
    name: 'OnePlus 12',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    specs: {
      display_size: 6.82,
      refresh_rate: 120,
      peak_brightness: 4500,
      processor: 'Snapdragon 8 Gen 3',
      ram_gb: 16,
      base_storage_gb: 256,
      main_camera_mp: 50,
      optical_zoom: 3,
      battery_mah: 5400,
      charging_speed_w: 80,
      weight_g: 220,
      water_resistance: 'IP65'
    },
    store_prices: [
      { id: 'sp-4-1', store: 'Amazon', price: 699.99, url: 'https://www.amazon.com' },
      { id: 'sp-4-2', store: 'Best Buy', price: 749.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-4-3', store: 'OnePlus Direct', price: 699.99, url: 'https://www.oneplus.com' }
    ],
    price_history: [
      { id: 'ph-4-1', price: 799.99, recorded_at: '2024-03-01' },
      { id: 'ph-4-2', price: 749.99, recorded_at: '2024-07-15' },
      { id: 'ph-4-3', price: 699.99, recorded_at: '2024-11-20' },
      { id: 'ph-4-4', price: 699.99, recorded_at: '2025-01-15' }
    ]
  },

  // --- LAPTOPS ---
  {
    id: 'prod-macbook-pro-16',
    category_id: 'cat-laptops',
    brand: 'Apple',
    name: 'MacBook Pro 16" (M3 Max)',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    specs: {
      screen_size_in: 16.2,
      resolution: '3456 x 2234 Liquid Retina XDR',
      refresh_rate_hz: 120,
      processor: 'Apple M3 Max (16-Core CPU, 40-Core GPU)',
      ram_gb: 36,
      storage_gb: 1000,
      battery_life_hours: 22,
      weight_kg: 2.16
    },
    store_prices: [
      { id: 'sp-5-1', store: 'Amazon', price: 3199.00, url: 'https://www.amazon.com' },
      { id: 'sp-5-2', store: 'B&H Photo', price: 3149.00, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-5-3', store: 'Best Buy', price: 3249.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-5-4', store: 'Apple Store', price: 3499.00, url: 'https://www.apple.com' }
    ],
    price_history: [
      { id: 'ph-5-1', price: 3499.00, recorded_at: '2024-01-10' },
      { id: 'ph-5-2', price: 3299.00, recorded_at: '2024-06-15' },
      { id: 'ph-5-3', price: 3149.00, recorded_at: '2024-11-25' },
      { id: 'ph-5-4', price: 3149.00, recorded_at: '2025-01-12' }
    ]
  },
  {
    id: 'prod-dell-xps-16',
    category_id: 'cat-laptops',
    brand: 'Dell',
    name: 'XPS 16 (9640)',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=700&q=80',
    rating: 4.6,
    specs: {
      screen_size_in: 16.3,
      resolution: '3840 x 2400 4K OLED Touch',
      refresh_rate_hz: 90,
      processor: 'Intel Core Ultra 9 185H + RTX 4070',
      ram_gb: 32,
      storage_gb: 1000,
      battery_life_hours: 13,
      weight_kg: 2.20
    },
    store_prices: [
      { id: 'sp-6-1', store: 'Dell Direct', price: 2499.99, url: 'https://www.dell.com' },
      { id: 'sp-6-2', store: 'Best Buy', price: 2399.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-6-3', store: 'Amazon', price: 2449.00, url: 'https://www.amazon.com' }
    ],
    price_history: [
      { id: 'ph-6-1', price: 2799.00, recorded_at: '2024-04-10' },
      { id: 'ph-6-2', price: 2599.00, recorded_at: '2024-08-20' },
      { id: 'ph-6-3', price: 2399.99, recorded_at: '2024-11-28' },
      { id: 'ph-6-4', price: 2399.99, recorded_at: '2025-01-10' }
    ]
  },
  {
    id: 'prod-thinkpad-x1-carbon',
    category_id: 'cat-laptops',
    brand: 'Lenovo',
    name: 'ThinkPad X1 Carbon Gen 12',
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    specs: {
      screen_size_in: 14.0,
      resolution: '2880 x 1800 2.8K OLED',
      refresh_rate_hz: 120,
      processor: 'Intel Core Ultra 7 155H',
      ram_gb: 32,
      storage_gb: 1000,
      battery_life_hours: 14,
      weight_kg: 1.09
    },
    store_prices: [
      { id: 'sp-7-1', store: 'Lenovo Store', price: 1749.00, url: 'https://www.lenovo.com' },
      { id: 'sp-7-2', store: 'B&H Photo', price: 1699.00, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-7-3', store: 'Amazon', price: 1729.00, url: 'https://www.amazon.com' }
    ],
    price_history: [
      { id: 'ph-7-1', price: 2199.00, recorded_at: '2024-05-01' },
      { id: 'ph-7-2', price: 1899.00, recorded_at: '2024-09-15' },
      { id: 'ph-7-3', price: 1699.00, recorded_at: '2024-11-28' },
      { id: 'ph-7-4', price: 1699.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-zephyrus-g16',
    category_id: 'cat-laptops',
    brand: 'ASUS',
    name: 'ROG Zephyrus G16 (OLED)',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    specs: {
      screen_size_in: 16.0,
      resolution: '2560 x 1600 2.5K ROG Nebula OLED',
      refresh_rate_hz: 240,
      processor: 'Intel Core Ultra 9 185H + RTX 4080',
      ram_gb: 32,
      storage_gb: 1000,
      battery_life_hours: 10,
      weight_kg: 1.95
    },
    store_prices: [
      { id: 'sp-8-1', store: 'Best Buy', price: 2299.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-8-2', store: 'Amazon', price: 2349.99, url: 'https://www.amazon.com' },
      { id: 'sp-8-3', store: 'B&H Photo', price: 2299.00, url: 'https://www.bhphotovideo.com' }
    ],
    price_history: [
      { id: 'ph-8-1', price: 2699.99, recorded_at: '2024-04-01' },
      { id: 'ph-8-2', price: 2499.00, recorded_at: '2024-08-10' },
      { id: 'ph-8-3', price: 2299.00, recorded_at: '2024-11-25' },
      { id: 'ph-8-4', price: 2299.00, recorded_at: '2025-01-12' }
    ]
  },

  // --- HEADPHONES & AUDIO ---
  {
    id: 'prod-sony-wh1000xm5',
    category_id: 'cat-audio',
    brand: 'Sony',
    name: 'WH-1000XM5 Wireless ANC',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    specs: {
      driver_size_mm: 30,
      anc_rating: 9.6,
      battery_anc_hours: 30,
      quick_charge_mins: 3,
      bluetooth_version: 'LDAC, AAC, SBC, BT 5.2',
      weight_g: 250
    },
    store_prices: [
      { id: 'sp-9-1', store: 'Amazon', price: 328.00, url: 'https://www.amazon.com' },
      { id: 'sp-9-2', store: 'Best Buy', price: 329.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-9-3', store: 'B&H Photo', price: 328.00, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-9-4', store: 'Target', price: 349.99, url: 'https://www.target.com' }
    ],
    price_history: [
      { id: 'ph-9-1', price: 399.99, recorded_at: '2024-02-01' },
      { id: 'ph-9-2', price: 348.00, recorded_at: '2024-07-15' },
      { id: 'ph-9-3', price: 298.00, recorded_at: '2024-11-29' },
      { id: 'ph-9-4', price: 328.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-bose-qc-ultra',
    category_id: 'cat-audio',
    brand: 'Bose',
    name: 'QuietComfort Ultra Headphones',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    specs: {
      driver_size_mm: 35,
      anc_rating: 9.8,
      battery_anc_hours: 24,
      quick_charge_mins: 15,
      bluetooth_version: 'Snapdragon Sound, aptX Adaptive, BT 5.3',
      weight_g: 252
    },
    store_prices: [
      { id: 'sp-10-1', store: 'Amazon', price: 379.00, url: 'https://www.amazon.com' },
      { id: 'sp-10-2', store: 'Best Buy', price: 379.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-10-3', store: 'Bose Direct', price: 429.00, url: 'https://www.bose.com' }
    ],
    price_history: [
      { id: 'ph-10-1', price: 429.00, recorded_at: '2024-03-01' },
      { id: 'ph-10-2', price: 399.00, recorded_at: '2024-08-15' },
      { id: 'ph-10-3', price: 349.00, recorded_at: '2024-11-28' },
      { id: 'ph-10-4', price: 379.00, recorded_at: '2025-01-14' }
    ]
  },
  {
    id: 'prod-airpods-max',
    category_id: 'cat-audio',
    brand: 'Apple',
    name: 'AirPods Max (USB-C)',
    image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=80',
    rating: 4.6,
    specs: {
      driver_size_mm: 40,
      anc_rating: 9.5,
      battery_anc_hours: 20,
      quick_charge_mins: 5,
      bluetooth_version: 'Apple H1 Chip, AAC, BT 5.0',
      weight_g: 386
    },
    store_prices: [
      { id: 'sp-11-1', store: 'Amazon', price: 499.00, url: 'https://www.amazon.com' },
      { id: 'sp-11-2', store: 'Best Buy', price: 499.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-11-3', store: 'Apple Store', price: 549.00, url: 'https://www.apple.com' }
    ],
    price_history: [
      { id: 'ph-11-1', price: 549.00, recorded_at: '2024-09-20' },
      { id: 'ph-11-2', price: 529.00, recorded_at: '2024-11-15' },
      { id: 'ph-11-3', price: 499.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-sennheiser-momentum-4',
    category_id: 'cat-audio',
    brand: 'Sennheiser',
    name: 'Momentum 4 Wireless',
    image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    specs: {
      driver_size_mm: 42,
      anc_rating: 9.0,
      battery_anc_hours: 60,
      quick_charge_mins: 10,
      bluetooth_version: 'aptX Adaptive, aptX HD, AAC, BT 5.2',
      weight_g: 293
    },
    store_prices: [
      { id: 'sp-12-1', store: 'Amazon', price: 279.95, url: 'https://www.amazon.com' },
      { id: 'sp-12-2', store: 'B&H Photo', price: 279.95, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-12-3', store: 'Best Buy', price: 299.99, url: 'https://www.bestbuy.com' }
    ],
    price_history: [
      { id: 'ph-12-1', price: 379.95, recorded_at: '2024-03-10' },
      { id: 'ph-12-2', price: 319.00, recorded_at: '2024-08-15' },
      { id: 'ph-12-3', price: 249.95, recorded_at: '2024-11-29' },
      { id: 'ph-12-4', price: 279.95, recorded_at: '2025-01-12' }
    ]
  },

  // --- SMARTWATCHES ---
  {
    id: 'prod-apple-watch-ultra-2',
    category_id: 'cat-wearables',
    brand: 'Apple',
    name: 'Watch Ultra 2',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    specs: {
      display_brightness_nits: 3000,
      battery_days: 3,
      water_rating_m: 100,
      ecg_sensor: true,
      case_material: 'Titanium (Grade 5)',
      weight_g: 61.4
    },
    store_prices: [
      { id: 'sp-13-1', store: 'Amazon', price: 749.00, url: 'https://www.amazon.com' },
      { id: 'sp-13-2', store: 'Best Buy', price: 749.00, url: 'https://www.bestbuy.com' },
      { id: 'sp-13-3', store: 'Apple Store', price: 799.00, url: 'https://www.apple.com' }
    ],
    price_history: [
      { id: 'ph-13-1', price: 799.00, recorded_at: '2024-05-01' },
      { id: 'ph-13-2', price: 779.00, recorded_at: '2024-09-10' },
      { id: 'ph-13-3', price: 729.00, recorded_at: '2024-11-28' },
      { id: 'ph-13-4', price: 749.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-galaxy-watch-ultra',
    category_id: 'cat-wearables',
    brand: 'Samsung',
    name: 'Galaxy Watch Ultra',
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    specs: {
      display_brightness_nits: 3000,
      battery_days: 4,
      water_rating_m: 100,
      ecg_sensor: true,
      case_material: 'Titanium Cushion',
      weight_g: 60.5
    },
    store_prices: [
      { id: 'sp-14-1', store: 'Amazon', price: 549.99, url: 'https://www.amazon.com' },
      { id: 'sp-14-2', store: 'Best Buy', price: 579.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-14-3', store: 'Samsung Direct', price: 649.99, url: 'https://www.samsung.com' }
    ],
    price_history: [
      { id: 'ph-14-1', price: 649.99, recorded_at: '2024-07-20' },
      { id: 'ph-14-2', price: 599.99, recorded_at: '2024-10-10' },
      { id: 'ph-14-3', price: 499.99, recorded_at: '2024-11-29' },
      { id: 'ph-14-4', price: 549.99, recorded_at: '2025-01-14' }
    ]
  },
  {
    id: 'prod-garmin-fenix-7-pro',
    category_id: 'cat-wearables',
    brand: 'Garmin',
    name: 'Fenix 7 Pro Sapphire Solar',
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    specs: {
      display_brightness_nits: 1000,
      battery_days: 22,
      water_rating_m: 100,
      ecg_sensor: true,
      case_material: 'Fiber-reinforced Polymer & Titanium',
      weight_g: 73
    },
    store_prices: [
      { id: 'sp-15-1', store: 'Amazon', price: 699.99, url: 'https://www.amazon.com' },
      { id: 'sp-15-2', store: 'B&H Photo', price: 699.99, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-15-3', store: 'Garmin Direct', price: 799.99, url: 'https://www.garmin.com' }
    ],
    price_history: [
      { id: 'ph-15-1', price: 899.99, recorded_at: '2024-02-15' },
      { id: 'ph-15-2', price: 799.99, recorded_at: '2024-07-01' },
      { id: 'ph-15-3', price: 699.99, recorded_at: '2024-11-28' },
      { id: 'ph-15-4', price: 699.99, recorded_at: '2025-01-10' }
    ]
  },

  // --- TABLETS ---
  {
    id: 'prod-ipad-pro-13-m4',
    category_id: 'cat-tablets',
    brand: 'Apple',
    name: 'iPad Pro 13" (M4 OLED)',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    specs: {
      screen_size_in: 13.0,
      panel_type: 'Tandem Ultra Retina OLED',
      refresh_rate_hz: 120,
      processor: 'Apple M4 (9-Core CPU, 10-Core GPU)',
      storage_gb: 256,
      battery_wh: 38.99,
      weight_g: 579
    },
    store_prices: [
      { id: 'sp-16-1', store: 'Amazon', price: 1199.00, url: 'https://www.amazon.com' },
      { id: 'sp-16-2', store: 'Best Buy', price: 1199.00, url: 'https://www.bestbuy.com' },
      { id: 'sp-16-3', store: 'B&H Photo', price: 1199.00, url: 'https://www.bhphotovideo.com' },
      { id: 'sp-16-4', store: 'Apple Store', price: 1299.00, url: 'https://www.apple.com' }
    ],
    price_history: [
      { id: 'ph-16-1', price: 1299.00, recorded_at: '2024-05-20' },
      { id: 'ph-16-2', price: 1249.00, recorded_at: '2024-09-15' },
      { id: 'ph-16-3', price: 1199.00, recorded_at: '2024-11-29' },
      { id: 'ph-16-4', price: 1199.00, recorded_at: '2025-01-15' }
    ]
  },
  {
    id: 'prod-galaxy-tab-s9-ultra',
    category_id: 'cat-tablets',
    brand: 'Samsung',
    name: 'Galaxy Tab S9 Ultra',
    image_url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    specs: {
      screen_size_in: 14.6,
      panel_type: 'Dynamic AMOLED 2X',
      refresh_rate_hz: 120,
      processor: 'Snapdragon 8 Gen 2 for Galaxy',
      storage_gb: 256,
      battery_wh: 43.1,
      weight_g: 732
    },
    store_prices: [
      { id: 'sp-17-1', store: 'Amazon', price: 949.99, url: 'https://www.amazon.com' },
      { id: 'sp-17-2', store: 'Best Buy', price: 999.99, url: 'https://www.bestbuy.com' },
      { id: 'sp-17-3', store: 'B&H Photo', price: 979.00, url: 'https://www.bhphotovideo.com' }
    ],
    price_history: [
      { id: 'ph-17-1', price: 1199.99, recorded_at: '2024-03-01' },
      { id: 'ph-17-2', price: 1049.99, recorded_at: '2024-08-15' },
      { id: 'ph-17-3', price: 899.99, recorded_at: '2024-11-28' },
      { id: 'ph-17-4', price: 949.99, recorded_at: '2025-01-14' }
    ]
  }
];

// Helper to attach category spec_defs and category objects to products
export function enrichProductsWithCategories(products, categories) {
  const catMap = new Map(categories.map(c => [c.id, c]));
  return products.map(prod => {
    const cat = catMap.get(prod.category_id) || prod.categories;
    return {
      ...prod,
      categories: cat
    };
  });
}
