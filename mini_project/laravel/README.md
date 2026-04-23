docker compose up -d --build

reset dữ liệu db và chạy lại seed:
---docker exec mini_project-worker-1 php artisan migrate:fresh --seed

tải thư viện export excel
---composer require maatwebsite/excel

cài ảnh
--- php artisan storage:link

cài giờ VN
APP_TIMEZONE=Asia/Ho_Chi_Minh

php artisan attendance:mark-absent 2026-04-17
php artisan schedule:work chạy cronjob

php artisan schedule:list chạy --force

3. Hệ thống Bộ lọc (Filters) mạnh mẽ
   API GET /api/v1/attendances hiện đã hỗ trợ các bộ lọc sau:
   month: Lọc theo tháng (VD: 2026-04).
   date
   : Lọc một ngày cụ thể.
   from_date & to_date: Lọc theo khoảng ngày.
   status: Lọc theo trạng thái (on_time, late, early_leave, late_early_leave, v.v.).
   Đặc biệt: status=auto_checkout sẽ lọc ra tất cả những người quên check-out đã được hệ thống tự động chốt.
   search: Tìm theo tên hoặc mã nhân viên (empCode).
   is_edited: Lọc những bản ghi đã bị sửa tay.
   is_completed: Lọc những ca chưa hoàn thành (chưa có giờ ra).
