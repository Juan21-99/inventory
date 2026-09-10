-- ==============================================================================
-- SISTEM MANAJEMEN INVENTARIS & LOGISTIK
-- INSPEKTORAT DAERAH PROVINSI SUMATERA UTARA
-- Initial Seed Data (Supabase)
-- ==============================================================================

-- 1. SEED SYSTEM SETTINGS
INSERT INTO public.system_settings (
    institution_name,
    sub_name,
    address,
    phone,
    email,
    website,
    head_officer,
    head_nip,
    head_position,
    logistics_officer,
    logistics_nip,
    logistics_position,
    low_stock_threshold,
    code_prefix_item,
    code_prefix_incoming,
    code_prefix_outgoing
) VALUES (
    'Inspektorat Daerah Provinsi Sumatera Utara',
    'Pemerintah Provinsi Sumatera Utara',
    'Jalan Jenderal A. Yani No. 40, Medan, Sumatera Utara (20111)',
    '(061) 453-2940',
    'inspektorat@sumutprov.go.id',
    'https://inspektorat.sumutprov.go.id',
    'Drs. H. Ahmad Fauzi, M.Si',
    '19780412 200112 1 002',
    'Pejabat Penatausahaan Pengguna Barang',
    'Budi Santoso, S.Kom',
    '19890214 201201 1 004',
    'Pengurus Barang Pengguna',
    2,
    'INV',
    'BM',
    'BK'
) ON CONFLICT DO NOTHING;

-- 2. SEED MASTER CATEGORIES
INSERT INTO public.categories (id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Elektronik & Komputer', 'Perangkat komputer, laptop, proyektor, printer, dan server'),
('c2222222-2222-2222-2222-222222222222', 'Furnitur & Mebel', 'Meja kerja, kursi ergonomis, lemari berkas, dan partisi ruangan'),
('c3333333-3333-3333-3333-333333333333', 'Alat Pengawasan & Investigasi', 'Kamera digital, voice recorder, scanner portabel, drone survei'),
('c4444444-4444-4444-4444-444444444444', 'Kendaraan Dinas', 'Mobil operasional pengawasan dan sepeda motor dinas lapangan'),
('c5555555-5555-5555-5555-555555555555', 'ATK & Persediaan Logistik', 'Kertas HVS, toner printer, map arsip, buku register')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED MASTER LOCATIONS (RUANGAN)
INSERT INTO public.locations (id, name, floor, description) VALUES
('l1111111-1111-1111-1111-111111111111', 'Ruang Inspektur', 'Lantai 2', 'Ruang Kerja Pimpinan Inspektur Daerah'),
('l2222222-2222-2222-2222-222222222222', 'Ruang Irban I (Pemerintahan)', 'Lantai 1', 'Inspektur Pembantu Wilayah I'),
('l3333333-3333-3333-3333-333333333333', 'Ruang Irban II (Perekonomian & Pembangunan)', 'Lantai 1', 'Inspektur Pembantu Wilayah II'),
('l4444444-4444-4444-4444-444444444444', 'Ruang Irban III (Kesejahteraan Rakyat)', 'Lantai 2', 'Inspektur Pembantu Wilayah III'),
('l5555555-5555-5555-5555-555555555555', 'Ruang Irban Khusus (Investigasi)', 'Lantai 2', 'Pemeriksaan Khusus & Saber Pungli'),
('l6666666-6666-6666-6666-666666666666', 'Sekretariat & Kepegawaian', 'Lantai 1', 'Pelayanan Administrasi Umum & Tata Usaha'),
('l7777777-7777-7777-7777-777777777777', 'Gudang Logistik & Arsip', 'Lantai 1 (Belakang)', 'Penyimpanan Stok Persediaan Logistik')
ON CONFLICT (name) DO NOTHING;

-- 4. SEED MASTER ITEMS (BUKU INDUK ASET)
INSERT INTO public.items (
    id, code, name, category_id, category_name, location_id, location_name, stock, unit, condition, price, person_in_charge, person_nip, received_at
) VALUES
('i1111111-1111-1111-1111-111111111111', 'INV-ELK-001', 'Laptop Lenovo ThinkPad T14 Gen 4 Intel Core i7 16GB/512GB', 'c1111111-1111-1111-1111-111111111111', 'Elektronik & Komputer', 'l2222222-2222-2222-2222-222222222222', 'Ruang Irban I (Pemerintahan)', 8, 'Unit', 'Baik', 19500000, 'Muhammad Rizky, S.E., M.Si', '19840715 200903 1 003', '2026-01-15'),
('i2222222-2222-2222-2222-222222222222', 'INV-ELK-002', 'Proyektor Epson EB-E500 3300 Lumens XGA HDMI', 'c1111111-1111-1111-1111-111111111111', 'Elektronik & Komputer', 'l6666666-6666-6666-6666-666666666666', 'Sekretariat & Kepegawaian', 3, 'Unit', 'Baik', 6200000, 'Budi Santoso, S.Kom', '19890214 201201 1 004', '2026-02-10'),
('i3333333-3333-3333-3333-333333333333', 'INV-FRN-001', 'Kursi Kerja Ergonomis Indachi Executive High Back Mesh', 'c2222222-2222-2222-2222-222222222222', 'Furnitur & Mebel', 'l3333333-3333-3333-3333-333333333333', 'Ruang Irban II (Perekonomian & Pembangunan)', 12, 'Unit', 'Baik', 1850000, 'Hj. Nurhalimah Siregar, S.H.', '19791103 200502 2 001', '2026-01-20'),
('i4444444-4444-4444-4444-444444444444', 'INV-ATK-001', 'Kertas HVS PaperOne A4 80gr Rim', 'c5555555-5555-5555-5555-555555555555', 'ATK & Persediaan Logistik', 'l7777777-7777-7777-7777-777777777777', 'Gudang Logistik & Arsip', 45, 'Rim', 'Baik', 58000, 'Budi Santoso, S.Kom', '19890214 201201 1 004', '2026-03-01'),
('i5555555-5555-5555-5555-555555555555', 'INV-AWAS-001', 'Voice Recorder Sony ICD-TX660 Digital Stereo', 'c3333333-3333-3333-3333-333333333333', 'Alat Pengawasan & Investigasi', 'l5555555-5555-5555-5555-555555555555', 'Ruang Irban Khusus (Investigasi)', 4, 'Unit', 'Baik', 2150000, 'Drs. H. Ahmad Fauzi, M.Si', '19780412 200112 1 002', '2026-02-15'),
('i6666666-6666-6666-6666-666666666666', 'INV-ELK-003', 'Printer Canon imageCLASS LBP6030 Laser Monokrom', 'c1111111-1111-1111-1111-111111111111', 'Elektronik & Komputer', 'l4444444-4444-4444-4444-444444444444', 'Ruang Irban III (Kesejahteraan Rakyat)', 1, 'Unit', 'Rusak Ringan', 2450000, 'Ir. Hendra Gunawan', '19810520 200701 1 012', '2025-11-10')
ON CONFLICT (code) DO NOTHING;
