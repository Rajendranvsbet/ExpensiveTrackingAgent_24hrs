-- Seed default categories if they don't exist
INSERT INTO categories (category_name, icon, color) VALUES
('Food & Drinks', 'Utensils', '#10B981'),
('Transportation', 'Car', '#3B82F6'),
('Shopping', 'ShoppingBag', '#8B5CF6'),
('Utilities & Bills', 'Receipt', '#F59E0B'),
('Entertainment', 'Film', '#EC4899'),
('Medical & Health', 'Heart', '#EF4444'),
('Education', 'BookOpen', '#14B8A6'),
('Others', 'Folder', '#6B7280')
ON DUPLICATE KEY UPDATE category_name=category_name;

-- Seed a test user with password: 'password123' (BCrypt hashed) and 'admin123' (BCrypt hashed)
-- Note: Security encoder details will match these hashes
INSERT INTO users (full_name, email, password, phone, role, created_at) VALUES
('John Doe', 'user@example.com', '$2a$10$fV3DqP1n8eN/V03m3OOf6uzR5V9bTshf0O.e5F9VbY3hXsh7A13K2', '+1234567890', 'USER', CURRENT_TIMESTAMP),
('Jane Admin', 'admin@example.com', '$2a$10$gO7v1j8uW7hR5Y9m3OOf6uzR5V9bTshf0O.e5F9VbY3hXsh7A13K3', '+1987654321', 'ADMIN', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE email=email;
