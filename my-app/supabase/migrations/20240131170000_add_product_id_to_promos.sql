-- Add product_id column to promos table
ALTER TABLE promos
ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Enable RLS for this new column (implicitly covered by existing policies, but good to note)
