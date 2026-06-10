-- Seed data for FruityRescue AI
-- Admin password: admin123 → bcrypt hash
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin FruityRescue', 'admin@fruityrescue.com', '$2b$12$WH80TYFUHD1QmlqQEmrnhO1XUkB4RTs0hGFC0K5/iQVKlNlH5Z0D.', 'admin'),
  ('Budi Santoso', 'budi@email.com', '$2b$12$WH80TYFUHD1QmlqQEmrnhO1XUkB4RTs0hGFC0K5/iQVKlNlH5Z0D.', 'donor'),
  ('Siti Aminah', 'siti@email.com', '$2b$12$WH80TYFUHD1QmlqQEmrnhO1XUkB4RTs0hGFC0K5/iQVKlNlH5Z0D.', 'donor')
ON CONFLICT (email) DO NOTHING;

INSERT INTO recipients (name, type, address, contact, capacity_kg) VALUES
  ('Panti Asuhan Cahaya Kasih', 'orphanage', 'Jl. Merdeka No. 45, Bandung', '022-1234567', 150),
  ('Panti Asuhan Harapan Bangsa', 'orphanage', 'Jl. Sudirman No. 12, Jakarta', '021-9876543', 200),
  ('Peternakan Pak Budi', 'livestock', 'Jl. Raya Bogor KM 30, Bogor', '0812-3456-7890', 300),
  ('Peternakan Maju Jaya', 'livestock', 'Jl. Raya Bekasi No. 88, Bekasi', '0813-5678-1234', 250),
  ('Kompos Organik Nusantara', 'compost', 'Jl. Margonda Raya No. 100, Depok', '0815-7890-4567', 500)
ON CONFLICT DO NOTHING;

-- Sample fruits with allocations
INSERT INTO fruits (donor_id, donor_name, contact, location, quantity_kg, fruit_name, status, ai_confidence, freshness_score, estimated_days, visual_condition, quick_recommendation, storage_tips, ai_recommendation, ai_reason, created_at) VALUES
  (2, 'Budi Santoso', '0812-1111-2222', 'Bandung', 5.0, 'Apel', 'fresh', 0.95, 85, 7, 'Warna merah cerah, kulit mulus', 'Langsung konsumsi atau donasikan', 'Simpan di kulkas suhu 2-4°C', 'orphanage', 'Buah segar, cocok untuk konsumsi langsung', NOW() - INTERVAL '1 day'),
  (2, 'Budi Santoso', '0812-1111-2222', 'Bandung', 3.0, 'Jeruk', 'fresh', 0.88, 78, 5, 'Warna oranye segar, tekstur kenyal', 'Segera distribusikan', 'Simpan di tempat sejuk', 'orphanage', 'Buah segar, cocok untuk konsumsi langsung', NOW() - INTERVAL '2 days'),
  (3, 'Siti Aminah', '0813-3333-4444', 'Jakarta', 8.0, 'Pisang', 'rotten', 0.92, 15, 0, 'Kulit hitam, tekstur lembek', 'Gunakan sebagai pakan ternak', 'Tidak dapat disimpan', 'livestock', 'Pisang busuk masih memiliki kandungan gizi tinggi untuk ternak', NOW() - INTERVAL '3 days'),
  (3, 'Siti Aminah', '0813-3333-4444', 'Jakarta', 2.5, 'Mangga', 'fresh', 0.91, 82, 4, 'Warna kuning merata, aroma harum', 'Donasikan segera', 'Simpan di suhu ruang', 'orphanage', 'Buah segar, cocok untuk konsumsi langsung', NOW() - INTERVAL '1 day'),
  (2, 'Budi Santoso', '0812-1111-2222', 'Bogor', 10.0, 'Semangka', 'rotten', 0.87, 8, 0, 'Kulit lunak, bau fermentasi', 'Jadikan pupuk kompos', 'Tidak dapat disimpan', 'compost', 'Semangka busuk terlalu berair untuk pakan ternak, lebih baik dijadikan kompos', NOW() - INTERVAL '4 days'),
  (3, 'Siti Aminah', '0813-3333-4444', 'Depok', 4.0, 'Pepaya', 'fresh', 0.93, 90, 6, 'Kulit kuning-oranye, daging buah padat', 'Distribusikan ke panti', 'Simpan di kulkas jika sudah matang', 'orphanage', 'Buah segar, cocok untuk konsumsi langsung', NOW() - INTERVAL '5 days'),
  (2, 'Budi Santoso', '0812-1111-2222', 'Bekasi', 6.0, 'Nanas', 'rotten', 0.85, 12, 0, 'Kulit coklat, bagian bawah lembek', 'Gunakan sebagai pakan ternak', 'Tidak dapat disimpan', 'livestock', 'Nanas busuk masih bisa diolah untuk pakan ternak', NOW() - INTERVAL '6 days'),
  (3, 'Siti Aminah', '0813-3333-4444', 'Jakarta', 3.5, 'Anggur', 'fresh', 0.96, 88, 3, 'Butiran penuh, warna ungu pekat', 'Segera donasikan', 'Simpan di kulkas 0-2°C', 'orphanage', 'Buah segar, cocok untuk konsumsi langsung', NOW() - INTERVAL '1 day');

-- Allocations for the fruits above
INSERT INTO allocations (fruit_id, recipient_id, allocation_type, status, notes, created_at) VALUES
  (1, 1, 'orphanage', 'confirmed', 'Dikirim ke Panti Cahaya Kasih', NOW() - INTERVAL '1 day'),
  (2, 2, 'orphanage', 'confirmed', 'Dikirim ke Panti Harapan Bangsa', NOW() - INTERVAL '2 days'),
  (3, 3, 'livestock', 'confirmed', 'Dikirim ke Peternakan Pak Budi', NOW() - INTERVAL '3 days'),
  (4, 1, 'orphanage', 'pending', 'Menunggu pengiriman', NOW() - INTERVAL '1 day'),
  (5, 5, 'compost', 'confirmed', 'Dikirim ke Kompos Organik Nusantara', NOW() - INTERVAL '4 days'),
  (6, 2, 'orphanage', 'received', 'Diterima oleh panti', NOW() - INTERVAL '5 days'),
  (7, 4, 'livestock', 'pending', 'Menunggu pickup', NOW() - INTERVAL '6 days'),
  (8, 1, 'orphanage', 'pending', 'Menunggu pengiriman', NOW() - INTERVAL '1 day');
