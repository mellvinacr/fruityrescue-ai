CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('donor', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('orphanage', 'livestock', 'compost')),
  address TEXT NOT NULL,
  contact VARCHAR(50),
  capacity_kg FLOAT DEFAULT 100,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fruits (
  id SERIAL PRIMARY KEY,
  donor_id INTEGER REFERENCES users(id),
  donor_name VARCHAR(100),
  contact VARCHAR(50),
  location TEXT,
  photo_url TEXT,
  quantity_kg FLOAT,
  notes TEXT,
  fruit_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','fresh','rotten')),
  ai_confidence FLOAT,
  freshness_score INTEGER,
  estimated_days INTEGER,
  visual_condition TEXT,
  quick_recommendation TEXT,
  storage_tips TEXT,
  ai_recommendation VARCHAR(20),
  ai_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allocations (
  id SERIAL PRIMARY KEY,
  fruit_id INTEGER REFERENCES fruits(id),
  recipient_id INTEGER REFERENCES recipients(id),
  allocation_type VARCHAR(20) CHECK (allocation_type IN ('orphanage','livestock','compost')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','received')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
