-- Initialize sellers for recommended products
-- These IDs match the seller IDs used in the frontend mock products (mockProducts.ts)

MERGE INTO sellers (id, name, created_at, updated_at) 
KEY (id) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Premium Electronics Store', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002', 'Smart Tech Gadgets', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440003', 'Fashion & Accessories', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440004', 'Audio & Sound Equipment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
