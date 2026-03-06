-- First update NULL values to empty strings
UPDATE categories SET description = '' WHERE description IS NULL;
UPDATE categories SET creator = '' WHERE creator IS NULL;
UPDATE categories SET editor = '' WHERE editor IS NULL;
UPDATE categories SET remark = '' WHERE remark IS NULL;
UPDATE categories SET nameEn = '' WHERE nameEn IS NULL;

UPDATE products SET packageName = '' WHERE packageName IS NULL;
UPDATE products SET packageSize = '' WHERE packageSize IS NULL;
UPDATE products SET gpLink = '' WHERE gpLink IS NULL;
UPDATE products SET gaLink = '' WHERE gaLink IS NULL;
UPDATE products SET gp_rating = 0 WHERE gp_rating IS NULL;
UPDATE products SET settlement_type = '' WHERE settlement_type IS NULL;
UPDATE products SET attribution_window = 0 WHERE attribution_window IS NULL;
UPDATE products SET shelfStatus = '' WHERE shelfStatus IS NULL;
UPDATE products SET submitter_name = '' WHERE submitter_name IS NULL;
UPDATE products SET targetCountries = '' WHERE targetCountries IS NULL;

-- Then modify columns to NOT NULL
ALTER TABLE categories MODIFY nameEn VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE categories MODIFY description TEXT NOT NULL;
ALTER TABLE categories MODIFY creator VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE categories MODIFY editor VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE categories MODIFY remark VARCHAR(200) NOT NULL DEFAULT '';

ALTER TABLE products MODIFY packageName VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY packageSize VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY gpLink VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY gaLink VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY gp_rating DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE products MODIFY settlement_type VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY attribution_window INT NOT NULL DEFAULT 0;
ALTER TABLE products MODIFY shelfStatus VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY submitter_name VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE products MODIFY targetCountries VARCHAR(200) NOT NULL DEFAULT '';
