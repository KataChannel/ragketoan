# Backup và Restore Hệ thống (Tối ưu hóa)

Tài liệu hướng dẫn sử dụng các script backup và restore **đã tối ưu hóa dung lượng** cho Self-hosted AI Starter Kit.

## 🎯 Điểm nổi bật

- ✅ **Chỉ backup dữ liệu quan trọng** - Giảm dung lượng backup đến 70-90%
- ✅ **Nén tối ưu** - Sử dụng PostgreSQL custom format và tar.gz
- ✅ **Restore nhanh** - Tự động tải lại Ollama models sau restore
- ✅ **An toàn** - Backup dữ liệu hiện tại trước khi restore

## 📊 So sánh dung lượng

| Phương pháp | Dung lượng | Thời gian backup |
|-------------|-----------|------------------|
| Backup đầy đủ (cũ) | ~5-15 GB | 15-30 phút |
| **Backup tối ưu (mới)** | **~500 MB - 2 GB** | **3-8 phút** |

*Lưu ý: Dung lượng phụ thuộc vào số lượng workflows, executions và vector embeddings*

## Mục lục

- [Tổng quan](#tổng-quan)
- [Yêu cầu](#yêu-cầu)
- [Cách sử dụng](#cách-sử-dụng)
  - [Backup](#backup)
  - [Restore](#restore)
- [Dữ liệu được backup](#dữ-liệu-được-backup)
- [Cấu trúc backup](#cấu-trúc-backup)
- [Lưu ý quan trọng](#lưu-ý-quan-trọng)

## Tổng quan

Hệ thống cung cấp 2 script chính:
- `backup.sh`: Tạo bản sao lưu toàn bộ dữ liệu hệ thống
- `restore.sh`: Khôi phục dữ liệu từ bản backup

## Yêu cầu

- Docker và Docker Compose đã được cài đặt
- Quyền thực thi script (chmod +x)
- Đủ dung lượng ổ cứng để lưu backup

## Cách sử dụng

### Backup

#### Backup đơn giản:
```bash
./backup.sh
```

Script sẽ tự động:
1. Tạo thư mục `backups/` nếu chưa có
2. Backup toàn bộ dữ liệu
3. Nén thành file `.tar.gz`
4. Đặt tên theo format: `backup_YYYYMMDD_HHMMSS.tar.gz`
5. Tự động xóa các backup cũ (giữ lại 5 bản mới nhất)

#### Ví dụ output:
```
[INFO] Starting backup process...
[INFO] Timestamp: 20250103_143025
[INFO] Creating backup directory: ./backups/backup_data_20250103_143025
[INFO] Backing up .env file...
[INFO] ✓ .env file backed up successfully
[INFO] Backing up shared folder...
[INFO] Backing up n8n demo data...
[INFO] Creating PostgreSQL database dump (compressed)...
[INFO] ✓ PostgreSQL dump created (45M)
[INFO] Backing up critical Docker volumes (optimized)...
[INFO] Backing up Qdrant vector database...
[INFO] ✓ Qdrant backed up (156M)
[INFO] Backing up n8n essential data (excluding cache/temp)...
[INFO] ✓ n8n data backed up (89M)
[INFO] ⊘ Skipping Ollama models (can be re-downloaded to save space)
[INFO] ⊘ Skipping Postgres volume (using pg_dump instead)
[INFO] Compressing backup...
[INFO] ✓ Backup completed successfully!
[INFO] Backup location: ./backups/backup_data_20250103_143025.tar.gz
[INFO] Backup size: 312M (saved ~8.7GB compared to full backup)
```

### Restore

#### Restore interaktif (chọn backup):
```bash
./restore.sh
```

Script sẽ hiển thị danh sách các backup có sẵn và cho phép bạn chọn:
```
Available backups:

  [0] backup_data_20250103_143025.tar.gz (312M) - 20250103 143025 [✓ optimized]
  [1] backup_data_20250103_120000.tar.gz (298M) - 20250103 120000 [✓ optimized]
  [2] backup_20250102_180000.tar.gz (8.2G) - 20250102 180000 [full]

[?] Select backup number to restore (0-2): 
```

**Lưu ý**: Backup có nhãn `[✓ optimized]` là backup đã tối ưu hóa.

#### Restore từ file cụ thể:
```bash
./restore.sh ./backups/backup_20250103_143025.tar.gz
```

#### Quy trình restore:
1. Script sẽ yêu cầu xác nhận (nhập `yes`)
2. Dừng tất cả Docker services
3. Giải nén backup
4. Restore từng thành phần:
   - File `.env`
   - Thư mục `shared/`
   - n8n demo data
   - **Qdrant vector database**
   - **n8n essential data**
   - **PostgreSQL database** (từ dump nén)
5. Hỏi profile để khởi động (cpu/gpu-nvidia/gpu-amd/none)
6. Khởi động services (nếu chọn)
7. **Ollama tự động tải models** (llama3.2 mặc định)

**⚠️ SAU KHI RESTORE**:
- Ollama models sẽ được tự động tải lại
- Có thể mất 5-15 phút tùy tốc độ internet
- Kiểm tra: `docker compose logs -f ollama-pull-llama-cpu`

**⚠️ LƯU Ý**: Dữ liệu hiện tại sẽ được backup tự động trước khi restore:
- `.env` → `.env.backup.YYYYMMDD_HHMMSS`
- `shared/` → `shared.backup.YYYYMMDD_HHMMSS/`
- `n8n/demo-data/` → `n8n/demo-data.backup.YYYYMMDD_HHMMSS/`

## Dữ liệu được backup

### ✅ Được backup (Dữ liệu quan trọng)

#### 1. File cấu hình
- `.env` - Biến môi trường, passwords, secrets

#### 2. Thư mục dữ liệu
- `shared/` - Dữ liệu chia sẻ giữa host và containers
- `n8n/demo-data/` - Workflows và credentials mẫu

#### 3. PostgreSQL Database (Nén tối ưu)
- Workflows definitions
- Credentials (encrypted)
- Execution history
- User settings
- **Format**: PostgreSQL custom dump (compressed)

#### 4. Qdrant Vector Database
- Vector embeddings
- Collections metadata
- **Quan trọng**: Không thể tái tạo được nếu mất

#### 5. n8n Essential Data
- User files
- Custom nodes
- Settings
- **Loại trừ**: cache, temp files, logs

### ⊘ KHÔNG backup (Có thể tái tạo)

#### 1. Ollama Models
- **Lý do**: Models có thể tải lại từ Ollama
- **Dung lượng tiết kiệm**: 3-10 GB
- **Tự động tải lại**: Sau khi restore, models sẽ tự động download

#### 2. Cache & Temporary Files
- n8n cache
- npm cache
- Temporary files
- Log files

#### 3. Postgres Volume
- **Lý do**: Sử dụng pg_dump thay thế (nhỏ hơn và hiệu quả hơn)
- **Dung lượng tiết kiệm**: 50-70%

## Cấu trúc backup

Backup tối ưu có cấu trúc như sau:

```
backup_data_YYYYMMDD_HHMMSS/
├── .env                          # File cấu hình (CRITICAL)
├── shared/                       # Thư mục shared (nếu có)
├── n8n/
│   └── demo-data/               # n8n workflows & credentials
├── volumes/
│   ├── ragketoan_n8n_storage.tar.gz     # n8n data (tối ưu, ~50-200MB)
│   └── ragketoan_qdrant_storage.tar.gz  # Vector DB (~100MB-1GB)
├── postgres/
│   └── database.dump            # PostgreSQL custom dump (~10-100MB)
└── backup_info.txt              # Thông tin backup

Total: ~200MB - 2GB (thay vì 5-15GB)
```

### So sánh với backup đầy đủ:

**Backup cũ (đầy đủ)**:
```
backup_YYYYMMDD_HHMMSS/
├── volumes/
│   ├── ragketoan_n8n_storage.tar.gz      # ~500MB
│   ├── ragketoan_postgres_storage.tar.gz # ~200MB
│   ├── ragketoan_ollama_storage.tar.gz   # ~5-10GB ❌
│   └── ragketoan_qdrant_storage.tar.gz   # ~500MB
└── postgres_dump/
    └── database.sql             # ~50-200MB (không nén)
```

## Lưu ý quan trọng

### Bảo mật
- ⚠️ File `.env` chứa passwords và secrets - **BẢO MẬT BACKUP**
- Không share backup files công khai
- Lưu trữ backup ở nơi an toàn

### Dung lượng
- Backup tối ưu: **~200MB - 2GB** (thay vì 5-15GB)
- Backup có thể lớn hơn nếu:
  - Nhiều execution history trong PostgreSQL
  - Nhiều vector embeddings trong Qdrant
  - Nhiều custom files trong shared folder
- Script tự động giữ lại **7 backup mới nhất** (có thể điều chỉnh)
- Có thể điều chỉnh trong script (tìm `tail -n +8`)

### Ollama Models
- ⚠️ **Không được backup** để tiết kiệm dung lượng
- **Tự động tải lại** sau restore
- Default model: `llama3.2` (~2GB)
- Nếu cần models khác, chỉnh sửa `docker-compose.yml`:
  ```yaml
  command:
    - "-c"
    - "sleep 3; ollama pull llama3.2 && ollama pull mistral"
  ```

### Quá trình restore
- ⚠️ **CẢNH BÁO**: Restore sẽ XÓA toàn bộ dữ liệu hiện tại
- Dữ liệu cũ sẽ được backup tự động trước khi restore
- Services sẽ bị dừng trong quá trình restore
- PostgreSQL database sẽ bị drop và recreate
- **Ollama models sẽ tự động download lại** (mất 5-15 phút)

### Tối ưu hóa
- Backup **KHÔNG bao gồm**:
  - ❌ Ollama models (tiết kiệm 3-10GB)
  - ❌ Cache files
  - ❌ Log files
  - ❌ Temporary files
  - ❌ npm/pip cache
- Sử dụng PostgreSQL custom dump (nén tốt hơn SQL dump)
- Loại bỏ cache/temp từ n8n volume

### Khắc phục sự cố

#### Lỗi: "Docker daemon is not running"
```bash
sudo systemctl start docker
```

#### Lỗi: "Permission denied"
```bash
chmod +x backup.sh restore.sh
```

#### Lỗi: Volume không tồn tại
- Kiểm tra tên project (tên thư mục)
- Volume names có format: `<project>_<volume>`
- Xem volumes: `docker volume ls`

#### Restore không thành công
1. Kiểm tra logs: `docker compose logs`
2. Xem backup_info.txt trong backup
3. Kiểm tra Ollama models: `docker compose logs ollama-pull-llama-cpu`
4. Restore thủ công từng phần nếu cần

#### Ollama models không tải được
```bash
# Kiểm tra Ollama service
docker compose logs ollama-cpu  # hoặc ollama-gpu

# Tải model thủ công
docker exec -it ollama ollama pull llama3.2

# Kiểm tra models đã có
docker exec -it ollama ollama list
```

#### Cần thêm models
```bash
# Vào container Ollama
docker exec -it ollama bash

# Tải thêm models
ollama pull mistral
ollama pull codellama
ollama pull phi
```

### Best Practices

1. **Backup định kỳ**:
   ```bash
   # Thêm vào crontab để backup tự động
   0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
   ```

2. **Test restore định kỳ**:
   - Test restore trên môi trường dev
   - Đảm bảo backup có thể restore được

3. **Backup trước khi update**:
   ```bash
   ./backup.sh
   docker compose pull
   docker compose --profile cpu up -d  # hoặc gpu-nvidia/gpu-amd
   ```

4. **Lưu backup offline**:
   - Copy backup ra ổ cứng ngoài
   - Upload lên cloud storage (mã hóa trước)
   - Sử dụng nhiều bản backup

5. **Quản lý Ollama models**:
   ```bash
   # Xem models hiện có
   docker exec ollama ollama list
   
   # Xóa models không dùng để tiết kiệm dung lượng
   docker exec ollama ollama rm <model-name>
   ```

## 📈 Tối ưu hóa thêm

### Giảm kích thước backup PostgreSQL

Nếu bạn có quá nhiều execution history:

```bash
# Vào n8n UI > Settings > Log Streaming
# Hoặc xóa executions cũ qua PostgreSQL

docker exec -it postgres psql -U postgres -d n8n

# Xóa executions cũ hơn 30 ngày
DELETE FROM execution_entity WHERE "startedAt" < NOW() - INTERVAL '30 days';
```

### Giảm kích thước Qdrant

Nếu có quá nhiều vectors không cần thiết:

```bash
# Truy cập Qdrant UI
open http://localhost:6333/dashboard

# Hoặc dùng API để xóa collections không dùng
curl -X DELETE http://localhost:6333/collections/{collection_name}
```

### Backup chọn lọc

Nếu chỉ cần backup workflows (không có executions):

```bash
# Backup chỉ workflows từ n8n
docker exec n8n n8n export:workflow --all --output=/data/shared/workflows_backup.json

# Restore workflows
docker exec n8n n8n import:workflow --input=/data/shared/workflows_backup.json
```

### Tự động hóa backup

#### Crontab (backup hàng ngày lúc 2 giờ sáng):
```bash
# Mở crontab editor
crontab -e

# Thêm dòng sau
0 2 * * * cd /mnt/chikiet/kata2025/ragketoan && ./backup.sh >> /var/log/ragketoan-backup.log 2>&1
```

#### Systemd timer:
Tạo file `/etc/systemd/system/ragketoan-backup.service`:
```ini
[Unit]
Description=Backup RAG Ketoan System

[Service]
Type=oneshot
WorkingDirectory=/mnt/chikiet/kata2025/ragketoan
ExecStart=/mnt/chikiet/kata2025/ragketoan/backup.sh
User=your-username
```

Tạo file `/etc/systemd/system/ragketoan-backup.timer`:
```ini
[Unit]
Description=Daily Backup for RAG Ketoan System

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Kích hoạt:
```bash
sudo systemctl enable ragketoan-backup.timer
sudo systemctl start ragketoan-backup.timer
```

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker compose logs`
2. Script output và error messages
3. File `backup_info.txt` trong backup
4. Permissions của files và directories

## License

Các script này là một phần của Self-hosted AI Starter Kit project.
