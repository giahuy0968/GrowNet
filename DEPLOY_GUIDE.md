# Hướng dẫn Deploy GrowNet lên VPS

## Thông tin VPS
- **IP**: 202.92.6.223
- **User**: root
- **Port SSH**: 24700
- **OS**: Ubuntu 22.04 LTS

## Bước 1: Chuẩn bị VPS

### 1.1. Kết nối SSH vào VPS
```bash
ssh root@202.92.6.223 -p 24700
```

### 1.2. Cài đặt Docker & Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt install docker-compose -y

# Kiểm tra cài đặt
docker --version
docker-compose --version

# Cho phép Docker chạy không cần sudo (optional)
sudo usermod -aG docker $USER
```

### 1.3. Cài đặt Git (nếu chưa có)
```bash
sudo apt install git -y
```

## Bước 2: Upload Code lên VPS

### Phương án 1: Dùng Git (Khuyên dùng)
```bash
# Trên VPS
cd /var/www
sudo git clone https://github.com/giahuy0968/GrowNet.git
cd GrowNet
```

### Phương án 2: Dùng SCP từ máy Windows
```powershell
# Trên máy Windows (PowerShell)
# Nén project trước
Compress-Archive -Path "d:\GrowNet\*" -DestinationPath "d:\GrowNet.zip"

# Upload lên VPS
scp -P 24700 d:\GrowNet.zip root@202.92.6.223:/var/www/

# SSH vào VPS và giải nén
ssh root@202.92.6.223 -p 24700
cd /var/www
unzip GrowNet.zip -d GrowNet
cd GrowNet
```

### Phương án 3: Dùng WinSCP/FileZilla
1. Mở WinSCP/FileZilla
2. Kết nối: 202.92.6.223, port 24700, user root
3. Upload toàn bộ folder GrowNet lên `/var/www/`

## Bước 3: Cấu hình môi trường

```bash
# Tạo file .env từ example
cp .env.example .env

# Chỉnh sửa file .env
nano .env
```

Cập nhật các giá trị trong `.env`:
```env
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb://admin:changethispassword123@mongodb:27017/grownet?authSource=admin
FRONTEND_URL=http://202.92.6.223
JWT_SECRET=random-secure-string-here-$(openssl rand -base64 32)
SESSION_SECRET=another-random-string-$(openssl rand -base64 32)
```

## Bước 4: Cấu hình Docker Compose

Chỉnh sửa `docker-compose.yml` để thay đổi password MongoDB:
```bash
nano docker-compose.yml
```

Đổi password trong phần `MONGO_INITDB_ROOT_PASSWORD` và `MONGODB_URI`

## Bước 5: Build và chạy ứng dụng

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Kiểm tra status
docker-compose ps
```

## Bước 6: Cấu hình Firewall

```bash
# Cho phép các port cần thiết
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 24700/tcp
sudo ufw enable
```

## Bước 7: Truy cập ứng dụng

- **Frontend**: http://202.92.6.223
- **Backend API**: http://202.92.6.223/api/health
- **MongoDB**: localhost:27017 (chỉ truy cập được từ trong VPS)

## Quản lý Database

### Kết nối MongoDB từ VPS
```bash
# Vào container MongoDB
docker exec -it grownet-mongodb mongosh

# Hoặc dùng connection string
docker exec -it grownet-mongodb mongosh "mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin"
```

### Các lệnh MongoDB cơ bản
```javascript
// Chọn database
use grownet

// Xem collections
show collections

// Xem users
db.users.find().pretty()

// Thêm user mới
db.users.insertOne({
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
    createdAt: new Date()
})

// Cập nhật user
db.users.updateOne(
    { email: "test@example.com" },
    { $set: { bio: "New bio" } }
)

// Xóa user
db.users.deleteOne({ email: "test@example.com" })

// Đếm số users
db.users.countDocuments()

// Tìm kiếm
db.users.find({ username: /test/i })
```

### Backup Database
```bash
# Backup
docker exec grownet-mongodb mongodump --username admin --password changethispassword123 --authenticationDatabase admin --db grownet --out /backup

# Copy backup ra host
docker cp grownet-mongodb:/backup ./backup-$(date +%Y%m%d)

# Restore
docker exec -i grownet-mongodb mongorestore --username admin --password changethispassword123 --authenticationDatabase admin --db grownet /backup/grownet
```

### Kết nối MongoDB từ máy local (optional)
```bash
# Forward port từ VPS sang máy local
ssh -L 27017:localhost:27017 root@202.92.6.223 -p 24700

# Sau đó dùng MongoDB Compass hoặc mongosh
mongosh "mongodb://admin:changethispassword123@localhost:27017/grownet?authSource=admin"
```

## Các lệnh quản lý hữu ích

```bash
# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Start services
docker-compose start

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f mongodb

# Rebuild khi có thay đổi code
docker-compose down
docker-compose up -d --build

# Xóa tất cả và rebuild
docker-compose down -v  # -v để xóa cả volumes (DỮ LIỆU SẼ MẤT!)
docker-compose up -d --build

# Vào container để debug
docker exec -it grownet-backend sh
docker exec -it grownet-mongodb mongosh
```

## Cập nhật code mới

```bash
# Pull code mới
git pull origin main

# Rebuild
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Không truy cập được website
```bash
# Kiểm tra services
docker-compose ps

# Kiểm tra logs
docker-compose logs

# Kiểm tra firewall
sudo ufw status
```

### Database connection error
```bash
# Kiểm tra MongoDB
docker-compose logs mongodb

# Test connection
docker exec -it grownet-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Port đã bị sử dụng
```bash
# Xem process đang dùng port 80
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>
```

## Cài đặt SSL (HTTPS) - Optional

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy certificate (cần domain name)
sudo certbot --nginx -d yourdomain.com

# Auto renew
sudo certbot renew --dry-run
```

## Monitor & Logs

```bash
# Xem resource usage
docker stats

# Xem disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Bảo mật

1. **Đổi password MongoDB** trong `docker-compose.yml`
2. **Đổi JWT_SECRET và SESSION_SECRET** trong `.env`
3. **Giới hạn MongoDB** chỉ listen internal network
4. **Cấu hình fail2ban** để chống brute force SSH
5. **Regular updates**: `sudo apt update && sudo apt upgrade`
6. **Backup định kỳ** database

---

**Lưu ý**: Thay thế tất cả password mặc định trước khi deploy production!
