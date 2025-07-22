-- Tạm thời disable RLS để test (CHỈ DÙNG ĐỂ TEST)
-- NHỚ ENABLE LẠI SAU KHI TEST XONG

-- Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Kiểm tra xem có thể insert user được không
INSERT INTO users (name, email, password) 
VALUES ('Test User', 'test@example.com', 'hashed_password_here');

-- Kiểm tra dữ liệu
SELECT * FROM users WHERE email = 'test@example.com';

-- Xóa user test
DELETE FROM users WHERE email = 'test@example.com';

-- QUAN TRỌNG: Enable lại RLS sau khi test
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
