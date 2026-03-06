-- Drop foreign key constraints first
ALTER TABLE products DROP FOREIGN KEY products_category_id_fkey;
ALTER TABLE products DROP FOREIGN KEY products_submitted_by_fkey;

-- Update NULL values first
UPDATE products SET category_id = 0 WHERE category_id IS NULL;
UPDATE products SET submitted_by = 0 WHERE submitted_by IS NULL;

-- Modify columns to NOT NULL
ALTER TABLE products MODIFY category_id INT NOT NULL DEFAULT 0;
ALTER TABLE products MODIFY submitted_by INT NOT NULL DEFAULT 0;
ALTER TABLE products MODIFY submit_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Re-add foreign key constraints
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE products ADD CONSTRAINT products_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES users(id);

-- For editor allow NULL
ALTER TABLE categories MODIFY editor VARCHAR(50) NULL DEFAULT NULL;
