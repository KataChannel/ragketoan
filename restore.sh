#!/bin/bash

# =============================================================================
# RAG Ketoan - Restore Script (Restore cả 2 database: n8n và ketoan)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backups"

# Database config từ .env
source "$SCRIPT_DIR/.env"
POSTGRES_CONTAINER="ragketoan-postgres-1"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}           📥 RAG Ketoan - Restore Database              ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kiểm tra tham số
if [ -z "$1" ]; then
    echo -e "${YELLOW}Danh sách backup có sẵn:${NC}"
    echo ""
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "  Không có file backup nào."
    echo ""
    echo -e "${CYAN}Cách dùng: ./restore.sh <backup_file.tar.gz>${NC}"
    echo -e "${CYAN}Ví dụ:    ./restore.sh ragketoan_backup_20251207_120000.tar.gz${NC}"
    exit 1
fi

BACKUP_FILE="$1"

# Nếu chỉ truyền tên file, thêm path
if [[ ! "$BACKUP_FILE" == /* ]]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Kiểm tra file tồn tại
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}[ERROR] Không tìm thấy file: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${CYAN}📦 File backup: $BACKUP_FILE${NC}"
echo ""

# Kiểm tra container đang chạy
if ! docker ps --format '{{.Names}}' | grep -q "$POSTGRES_CONTAINER"; then
    echo -e "${RED}[ERROR] Container $POSTGRES_CONTAINER không đang chạy!${NC}"
    echo -e "${YELLOW}[INFO] Chạy ./start.sh trước khi restore.${NC}"
    exit 1
fi

# Cảnh báo
echo -e "${RED}⚠️  CẢNH BÁO: Thao tác này sẽ GHI ĐÈ dữ liệu hiện tại!${NC}"
read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${GREEN}[OK] Đã hủy thao tác.${NC}"
    exit 0
fi

echo ""

# Tạo thư mục tạm
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}[1/5] Giải nén backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
BACKUP_FOLDER=$(ls "$TEMP_DIR")
EXTRACTED="$TEMP_DIR/$BACKUP_FOLDER"

# =============================================================================
# 2. Restore .env (tuỳ chọn)
# =============================================================================
echo -e "${YELLOW}[2/5] Kiểm tra .env...${NC}"
if [ -f "$EXTRACTED/.env" ]; then
    read -p "      Bạn có muốn restore .env? (y/N): " restore_env
    if [ "$restore_env" = "y" ] || [ "$restore_env" = "Y" ]; then
        cp "$EXTRACTED/.env" "$SCRIPT_DIR/.env"
        echo -e "${GREEN}      ✓ .env đã được restore${NC}"
    else
        echo -e "${CYAN}      → Giữ nguyên .env hiện tại${NC}"
    fi
fi

# =============================================================================
# 3. Restore Prisma schema (tuỳ chọn)
# =============================================================================
echo -e "${YELLOW}[3/5] Kiểm tra Prisma schema...${NC}"
if [ -f "$EXTRACTED/ketoan_prisma/schema.prisma" ]; then
    read -p "      Bạn có muốn restore schema.prisma? (y/N): " restore_schema
    if [ "$restore_schema" = "y" ] || [ "$restore_schema" = "Y" ]; then
        cp "$EXTRACTED/ketoan_prisma/schema.prisma" "$SCRIPT_DIR/ketoan/prisma/"
        echo -e "${GREEN}      ✓ schema.prisma đã được restore${NC}"
    else
        echo -e "${CYAN}      → Giữ nguyên schema.prisma hiện tại${NC}"
    fi
fi

# =============================================================================
# 4. Restore n8n demo data (tuỳ chọn)
# =============================================================================
echo -e "${YELLOW}[4/5] Kiểm tra n8n demo data...${NC}"
if [ -d "$EXTRACTED/n8n_demo_data" ]; then
    read -p "      Bạn có muốn restore n8n demo data? (y/N): " restore_n8n
    if [ "$restore_n8n" = "y" ] || [ "$restore_n8n" = "Y" ]; then
        rm -rf "$SCRIPT_DIR/n8n/demo-data"
        cp -r "$EXTRACTED/n8n_demo_data" "$SCRIPT_DIR/n8n/demo-data"
        echo -e "${GREEN}      ✓ n8n demo data đã được restore${NC}"
    else
        echo -e "${CYAN}      → Giữ nguyên n8n demo data hiện tại${NC}"
    fi
fi

# =============================================================================
# 5. Restore PostgreSQL databases
# =============================================================================
echo -e "${YELLOW}[5/5] Restore PostgreSQL databases...${NC}"

# 5a. Restore database n8n
if [ -f "$EXTRACTED/postgres_n8n.dump" ]; then
    echo -e "${CYAN}      → Restore database: n8n${NC}"
    # Drop và tạo lại database
    docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS n8n;" 2>/dev/null || true
    docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -c "CREATE DATABASE n8n;" 2>/dev/null
    # Restore
    docker exec -i "$POSTGRES_CONTAINER" pg_restore -U "$POSTGRES_USER" -d n8n < "$EXTRACTED/postgres_n8n.dump" 2>/dev/null || true
    echo -e "${GREEN}      ✓ n8n database restored${NC}"
elif [ -f "$EXTRACTED/postgres_db.dump" ]; then
    # Hỗ trợ backup cũ (chỉ có postgres_db.dump)
    echo -e "${CYAN}      → Restore database: n8n (từ postgres_db.dump)${NC}"
    docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS n8n;" 2>/dev/null || true
    docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -c "CREATE DATABASE n8n;" 2>/dev/null
    docker exec -i "$POSTGRES_CONTAINER" pg_restore -U "$POSTGRES_USER" -d n8n < "$EXTRACTED/postgres_db.dump" 2>/dev/null || true
    echo -e "${GREEN}      ✓ n8n database restored${NC}"
fi

# 5b. Restore database ketoan
if [ -f "$EXTRACTED/postgres_ketoan.dump" ]; then
    echo -e "${CYAN}      → Restore database: ketoan${NC}"
    # Drop và tạo lại database
    docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS ketoan;" 2>/dev/null || true
    docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -c "CREATE DATABASE ketoan;" 2>/dev/null
    # Restore
    docker exec -i "$POSTGRES_CONTAINER" pg_restore -U "$POSTGRES_USER" -d ketoan < "$EXTRACTED/postgres_ketoan.dump" 2>/dev/null || true
    echo -e "${GREEN}      ✓ ketoan database restored${NC}"
else
    echo -e "${YELLOW}      ⚠ Không có postgres_ketoan.dump trong backup${NC}"
    echo -e "${CYAN}      → Chạy 'cd ketoan && bun prisma db push' để tạo schema${NC}"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}           ✅ RESTORE HOÀN TẤT!                           ${GREEN}║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Lưu ý:${NC}"
echo -e "   • Restart các services: ./restart.sh"
echo -e "   • Nếu schema thay đổi: cd ketoan && bun prisma db push"
echo -e "   • Kiểm tra n8n: http://localhost:5678"
echo -e "   • Kiểm tra ketoan: http://localhost:3000"
