-- ==============================================================================
-- SISTEM MANAJEMEN INVENTARIS & LOGISTIK
-- INSPEKTORAT DAERAH PROVINSI SUMATERA UTARA
-- Database Schema (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABEL PROFIL PENGGUNA (PROFILES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    nip VARCHAR(50),
    phone VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. TABEL MASTER KATEGORI ASET (CATEGORIES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. TABEL MASTER RUANGAN / UNIT KERJA (LOCATIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    floor VARCHAR(50) DEFAULT 'Lantai 1',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. TABEL MASTER BUKU INDUK ASET (ITEMS / INVENTORY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE, -- Contoh: 'INV-ELK-001'
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(150), -- Denormalized for fast filtering
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    location_name VARCHAR(150), -- Denormalized for fast filtering
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'Unit', -- 'Unit', 'Pcs', 'Set', 'Dus', 'Buah'
    condition VARCHAR(50) NOT NULL DEFAULT 'Baik', -- 'Baik' | 'Rusak Ringan' | 'Rusak Berat'
    price BIGINT NOT NULL DEFAULT 0, -- Nilai perolehan/harga satuan dlm Rupiah
    person_in_charge VARCHAR(255) NOT NULL, -- Nama pemegang barang / PJ
    person_nip VARCHAR(50), -- NIP pemegang barang
    received_at DATE NOT NULL DEFAULT CURRENT_DATE, -- Tanggal perolehan
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TABEL TRANSAKSI PENERIMAAN / PENGADAAN (INCOMING_TRANSACTIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.incoming_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(100) NOT NULL UNIQUE, -- Contoh: 'BM-2026-00128'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'Unit',
    price_per_unit BIGINT NOT NULL DEFAULT 0,
    total_price BIGINT NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL, -- 'Pengadaan APBD' | 'e-Katalog LKPP' | 'Hibah / Bantuan' | dll
    supplier VARCHAR(255) NOT NULL, -- PT / Rekanan
    target_location VARCHAR(150) NOT NULL,
    received_by VARCHAR(255) NOT NULL, -- Pegawai penerima
    document_number VARCHAR(100), -- No Dokumen BAST
    notes TEXT,
    proof_image_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. TABEL TRANSAKSI PENGELUARAN / DISTRIBUSI (OUTGOING_TRANSACTIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.outgoing_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(100) NOT NULL UNIQUE, -- Contoh: 'BK-2026-00094'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'Unit',
    purpose VARCHAR(150) NOT NULL, -- 'Operasional Audit Lapangan' | 'Distribusi Rutin' | dll
    target_location VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_nip VARCHAR(50),
    officer_name VARCHAR(255) NOT NULL, -- Petugas logistik penyerah
    status VARCHAR(50) NOT NULL DEFAULT 'Didistribusikan', -- 'Didistribusikan' | 'Dipinjam' | 'Dalam Servis'
    document_number VARCHAR(100), -- No Surat Tugas / BAST Keluar
    notes TEXT,
    proof_image_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. TABEL PENGATURAN SISTEM & INSTANSI (SYSTEM_SETTINGS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name VARCHAR(255) NOT NULL DEFAULT 'Inspektorat Daerah Provinsi Sumatera Utara',
    sub_name VARCHAR(255) NOT NULL DEFAULT 'Pemerintah Provinsi Sumatera Utara',
    address TEXT NOT NULL DEFAULT 'Jalan Jenderal A. Yani No. 40, Medan, Sumatera Utara (20111)',
    phone VARCHAR(50) DEFAULT '(061) 453-2940',
    email VARCHAR(100) DEFAULT 'inspektorat@sumutprov.go.id',
    website VARCHAR(150) DEFAULT 'https://inspektorat.sumutprov.go.id',
    head_officer VARCHAR(255) DEFAULT 'Drs. H. Ahmad Fauzi, M.Si',
    head_nip VARCHAR(50) DEFAULT '19780412 200112 1 002',
    head_position VARCHAR(150) DEFAULT 'Pejabat Penatausahaan Pengguna Barang',
    logistics_officer VARCHAR(255) DEFAULT 'Budi Santoso, S.Kom',
    logistics_nip VARCHAR(50) DEFAULT '19890214 201201 1 004',
    logistics_position VARCHAR(150) DEFAULT 'Pengurus Barang Pengguna',
    low_stock_threshold INTEGER NOT NULL DEFAULT 2,
    code_prefix_item VARCHAR(20) NOT NULL DEFAULT 'INV',
    code_prefix_incoming VARCHAR(20) NOT NULL DEFAULT 'BM',
    code_prefix_outgoing VARCHAR(20) NOT NULL DEFAULT 'BK',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8.D TABEL MASTER SATUAN BARANG (ITEM UNITS)
CREATE TABLE IF NOT EXISTS public.item_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. OTOMATISASI DATABASE TRIGGERS (STOCK SYNCHRONIZATION)
-- ==============================================================================

-- A. Auto-Increase Stock on Incoming Transaction
CREATE OR REPLACE FUNCTION public.handle_incoming_stock_increase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.items
    SET stock = stock + NEW.quantity,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_incoming_transaction ON public.incoming_transactions;
CREATE TRIGGER tr_on_incoming_transaction
    AFTER INSERT ON public.incoming_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_incoming_stock_increase();

-- B. Auto-Decrease Stock on Outgoing Transaction
CREATE OR REPLACE FUNCTION public.handle_outgoing_stock_decrease()
RETURNS TRIGGER AS $$
BEGIN
    -- Pastikan stok mencukupi
    IF (SELECT stock FROM public.items WHERE id = NEW.item_id) < NEW.quantity THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk transaksi barang keluar!';
    END IF;

    UPDATE public.items
    SET stock = stock - NEW.quantity,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_outgoing_transaction ON public.outgoing_transactions;
CREATE TRIGGER tr_on_outgoing_transaction
    AFTER INSERT ON public.outgoing_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_outgoing_stock_decrease();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES & STORAGE
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_units ENABLE ROW LEVEL SECURITY;

-- Allow full read & write access without 403 Forbidden errors
DROP POLICY IF EXISTS "Allow authenticated full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated full access to locations" ON public.locations;
DROP POLICY IF EXISTS "Allow authenticated full access to items" ON public.items;
DROP POLICY IF EXISTS "Allow authenticated full access to incoming_transactions" ON public.incoming_transactions;
DROP POLICY IF EXISTS "Allow authenticated full access to outgoing_transactions" ON public.outgoing_transactions;
DROP POLICY IF EXISTS "Allow authenticated full access to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow full access to procurement_sources" ON public.procurement_sources;
DROP POLICY IF EXISTS "Allow full access to distribution_purposes" ON public.distribution_purposes;
DROP POLICY IF EXISTS "Allow full access to outgoing_statuses" ON public.outgoing_statuses;
DROP POLICY IF EXISTS "Allow full access to item_units" ON public.item_units;

CREATE POLICY "Allow full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to items" ON public.items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to incoming_transactions" ON public.incoming_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to outgoing_transactions" ON public.outgoing_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to procurement_sources" ON public.procurement_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to distribution_purposes" ON public.distribution_purposes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to outgoing_statuses" ON public.outgoing_statuses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to item_units" ON public.item_units FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. AKTIFKAN SUPABASE REALTIME (INSTANT LIVE SYNC)
-- ==============================================================================
-- Mengaktifkan pengiriman data instan via WebSocket saat ada perubahan (Insert, Update, Delete)
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incoming_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outgoing_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_sources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.distribution_purposes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outgoing_statuses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_units;


