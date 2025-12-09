#!/bin/bash

# =============================================================================
# RAG Ketoan - Backup Script (Backup cả 2 database: n8n và ketoan)
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
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="ragketoan_backup_$TIMESTAMP"
TEMP_DIR="$BACKUP_DIR/$BACKUP_NAME"

# Database config từ .env
source "$SCRIPT_DIR/.env"
POSTGRES_CONTAINER="ragketoan-postgres-1"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}           📦 RAG Ketoan - Backup Database               ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kiểm tra container đang chạy
if ! docker ps --format '{{.Names}}' | grep -q "$POSTGRES_CONTAINER"; then
    echo -e "${RED}[ERROR] Container $POSTGRES_CONTAINER không đang chạy!${NC}"
    echo -e "${YELLOW}[INFO] Chạy ./start.sh trước khi backup.${NC}"
    exit 1
fi

# Tạo thư mục backup
mkdir -p "$TEMP_DIR"
echo -e "${CYAN}[INFO] Đang tạo backup tại: $BACKUP_DIR${NC}"
echo ""

# =============================================================================
# 1. Backup .env file
# =============================================================================
echo -e "${YELLOW}[1/5] Backup .env file...${NC}"
cp "$SCRIPT_DIR/.env" "$TEMP_DIR/.env"
echo -e "${GREEN}      ✓ .env${NC}"

# =============================================================================
# 2. Backup Prisma schema
# =============================================================================
echo -e "${YELLOW}[2/5] Backup Prisma schema...${NC}"
mkdir -p "$TEMP_DIR/ketoan_prisma"
cp "$SCRIPT_DIR/ketoan/prisma/schema.prisma" "$TEMP_DIR/ketoan_prisma/"
echo -e "${GREEN}      ✓ ketoan/prisma/schema.prisma${NC}"

# =============================================================================
# 3. Backup n8n demo data
# =============================================================================
echo -e "${YELLOW}[3/5] Backup n8n demo data...${NC}"
if [ -d "$SCRIPT_DIR/n8n/demo-data" ]; then
    cp -r "$SCRIPT_DIR/n8n/demo-data" "$TEMP_DIR/n8n_demo_data"
    echo -e "${GREEN}      ✓ n8n/demo-data/${NC}"
else
    echo -e "${YELLOW}      ⚠ n8n/demo-data không tồn tại, bỏ qua${NC}"
fi

# =============================================================================
# 4. Backup PostgreSQL databases
# =============================================================================
echo -e "${YELLOW}[4/5] Backup PostgreSQL databases...${NC}"

# 4a. Backup database n8n
echo -e "${CYAN}      → Backup database: n8n${NC}"
docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" -d n8n -Fc > "$TEMP_DIR/postgres_n8n.dump" 2>/dev/null
if [ $? -eq 0 ]; then
    N8N_SIZE=$(du -h "$TEMP_DIR/postgres_n8n.dump" | cut -f1)
    echo -e "${GREEN}      ✓ n8n database ($N8N_SIZE)${NC}"
else
    echo -e "${RED}      ✗ Lỗi backup database n8n${NC}"
fi

# 4b. Backup database ketoan
echo -e "${CYAN}      → Backup database: ketoan${NC}"
# Kiểm tra database ketoan có tồn tại không
DB_EXISTS=$(docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='ketoan'" 2>/dev/null || echo "0")
if [ "$DB_EXISTS" = "1" ]; then
    docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" -d ketoan -Fc > "$TEMP_DIR/postgres_ketoan.dump" 2>&1
    KETOAN_SIZE=$(du -h "$TEMP_DIR/postgres_ketoan.dump" 2>/dev/null | cut -f1)
    if [ -n "$KETOAN_SIZE" ] && [ -s "$TEMP_DIR/postgres_ketoan.dump" ]; then
        echo -e "${GREEN}      ✓ ketoan database ($KETOAN_SIZE)${NC}"
    else
        echo -e "${RED}      ✗ Lỗi backup database ketoan${NC}"
    fi
else
    echo -e "${YELLOW}      ⚠ Database ketoan chưa tồn tại, bỏ qua${NC}"
fi

# =============================================================================
# 5. Tạo file tar.gz
# =============================================================================
echo -e "${YELLOW}[5/5] Đang nén backup...${NC}"
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$TEMP_DIR"

FINAL_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}           ✅ BACKUP HOÀN TẤT!                            ${GREEN}║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 File backup: ${NC}$BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo -e "${CYAN}📦 Kích thước:  ${NC}$FINAL_SIZE"
echo ""
echo -e "${YELLOW}Nội dung backup:${NC}"
echo -e "   • .env (cấu hình)"
echo -e "   • ketoan_prisma/schema.prisma"
echo -e "   • n8n_demo_data/ (workflows + credentials)"
echo -e "   • postgres_n8n.dump (database n8n)"
echo -e "   • postgres_ketoan.dump (database ketoan)"
echo ""
echo -e "${BLUE}💡 Để restore, chạy: ./restore.sh $BACKUP_NAME.tar.gz${NC}"
