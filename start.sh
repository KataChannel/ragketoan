#!/bin/bash

# =============================================================================
# RAG Ketoan - Start Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default profile
PROFILE="cpu"
SERVICE=""

# Backup settings
BACKUP_DIR="$SCRIPT_DIR/backups"
MAX_BACKUPS=5  # Số lượng backup tối đa giữ lại
COMPRESSION_LEVEL=9  # Mức nén cao nhất cho gzip

# Function to show banner
show_banner() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}${BOLD}         🚀 RAG Ketoan - Self-hosted AI Kit 🚀            ${NC}${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to show menu
show_menu() {
    echo -e "${CYAN}Chọn service bạn muốn chạy:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 🤖 N8N + AI Stack     (n8n, Ollama, Qdrant, PostgreSQL)"
    echo -e "  ${GREEN}2)${NC} 📊 Ketoan Frontend    (Next.js App)"
    echo -e "  ${GREEN}3)${NC} 🧠 RAG Service        (Python FastAPI RAG)"
    echo -e "  ${GREEN}4)${NC} 🔥 Tất cả             (N8N + AI + RAG + Ketoan)"
    echo -e "  ${GREEN}5)${NC} 🛑 Dừng tất cả        (Stop all services)"
    echo -e "  ${GREEN}6)${NC} 🔫 Kill ports         (Giải phóng ports)"
    echo -e "  ${GREEN}7)${NC} 📊 Xem trạng thái     (Status)"
    echo -e "  ${GREEN}8)${NC} 📜 Xem logs           (Logs)"
    echo -e "  ${GREEN}9)${NC} 💾 Backup dữ liệu     (Backup data)"
    echo -e "  ${GREEN}r)${NC} 🔄 Restore dữ liệu    (Restore data)"
    echo -e "  ${GREEN}l)${NC} 🔧 Cấu hình LLM       (Ollama/Google AI)"
    echo -e "  ${GREEN}g)${NC} 🔀 Git commit & push  (Auto git)"
    echo -e "  ${GREEN}0)${NC} ❌ Thoát"
    echo ""
}

# Function to show GPU menu
show_gpu_menu() {
    echo -e "${CYAN}Chọn cấu hình GPU:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 💻 CPU only (mặc định)"
    echo -e "  ${GREEN}2)${NC} 🎮 Nvidia GPU"
    echo -e "  ${GREEN}3)${NC} 🔴 AMD GPU"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[ERROR] Docker chưa được cài đặt!${NC}"
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}[ERROR] Docker Compose chưa được cài đặt!${NC}"
        exit 1
    fi
}

# Function to check .env file
check_env() {
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        echo -e "${YELLOW}[INFO] File .env không tồn tại. Đang tạo từ .env.example...${NC}"
        if [ -f "$SCRIPT_DIR/.env.example" ]; then
            cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
            echo -e "${GREEN}[OK] File .env đã được tạo. Hãy cập nhật các secrets!${NC}"
        else
            echo -e "${RED}[ERROR] File .env.example không tồn tại!${NC}"
            exit 1
        fi
    fi
}

# Function to start N8N + AI Stack
start_n8n() {
    echo -e "${GREEN}[INFO] Đang khởi động N8N + AI Stack với profile: ${PROFILE}${NC}"
    echo ""
    cd "$SCRIPT_DIR"
    docker compose --profile "$PROFILE" up -d
    
    echo ""
    echo -e "${GREEN}✅ N8N + AI Stack đã khởi động!${NC}"
    echo ""
    echo -e "  📊 n8n:        ${BLUE}http://localhost:5678${NC}"
    echo -e "  🔍 Qdrant:     ${BLUE}http://localhost:6333${NC}"
    echo -e "  🤖 Ollama:     ${BLUE}http://localhost:11434${NC}"
}

# Function to start RAG Service
start_rag_service() {
    echo -e "${GREEN}[INFO] Đang khởi động RAG Service (Python FastAPI)...${NC}"
    echo ""
    
    cd "$SCRIPT_DIR"
    
    # Check if rag-service directory exists
    if [ ! -d "$SCRIPT_DIR/rag-service" ]; then
        echo -e "${RED}[ERROR] Thư mục rag-service không tồn tại!${NC}"
        return 1
    fi
    
    # Build and start RAG service container
    docker compose build rag-service
    docker compose up -d rag-service
    
    # Wait for service to be healthy
    echo -e "${YELLOW}[INFO] Đang chờ RAG Service khởi động...${NC}"
    local max_wait=60
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            break
        fi
        sleep 2
        waited=$((waited + 2))
        echo -ne "\r  Đang chờ... ${waited}s"
    done
    echo ""
    
    # Show LLM info
    local llm_info=$(curl -s http://localhost:8000/llm-info 2>/dev/null)
    local llm_provider=$(echo "$llm_info" | grep -o '"provider":"[^"]*"' | cut -d'"' -f4)
    local llm_model=$(echo "$llm_info" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
    local llm_type=$(echo "$llm_info" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
    
    echo ""
    echo -e "${GREEN}✅ RAG Service đã khởi động!${NC}"
    echo ""
    echo -e "  🧠 RAG API:    ${BLUE}http://localhost:8000${NC}"
    echo -e "  📚 Docs:       ${BLUE}http://localhost:8000/docs${NC}"
    if [ -n "$llm_provider" ]; then
        echo -e "  🤖 LLM:        ${CYAN}$llm_provider${NC} ($llm_model) - ${YELLOW}$llm_type${NC}"
    fi
}

# Function to show LLM configuration
show_llm_config() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}${BOLD}              🔧 Cấu hình LLM Provider                     ${NC}${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Load current .env
    if [ -f "$SCRIPT_DIR/.env" ]; then
        set -a
        source "$SCRIPT_DIR/.env"
        set +a
    fi
    
    local current_provider="${LLM_PROVIDER:-ollama}"
    
    echo -e "${CYAN}Cấu hình hiện tại:${NC}"
    echo -e "  Provider:      ${GREEN}$current_provider${NC}"
    if [ "$current_provider" == "google" ]; then
        echo -e "  Google Model:  ${GREEN}${GOOGLE_MODEL:-gemini-1.5-flash}${NC}"
        if [ -n "$GOOGLE_API_KEY" ]; then
            echo -e "  API Key:       ${GREEN}✓ Đã cấu hình${NC}"
        else
            echo -e "  API Key:       ${RED}✗ Chưa cấu hình${NC}"
        fi
    else
        echo -e "  Ollama Model:  ${GREEN}${OLLAMA_MODEL:-llama3.2:latest}${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Chọn LLM Provider:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 🏠 Ollama (Local)       - 100% private, offline"
    echo -e "  ${GREEN}2)${NC} ☁️  Google AI Studio    - Fast, high quality"
    echo -e "  ${GREEN}0)${NC} ↩️  Quay lại"
    echo ""
    
    read -p "Chọn provider [0-2]: " llm_choice
    
    case $llm_choice in
        1)
            configure_ollama
            ;;
        2)
            configure_google_ai
            ;;
        0|*)
            return 0
            ;;
    esac
}

# Function to configure Ollama
configure_ollama() {
    echo ""
    echo -e "${CYAN}Cấu hình Ollama (Local):${NC}"
    echo ""
    echo -e "  Các model phổ biến:"
    echo -e "    ${GREEN}1)${NC} llama3.2:latest    (Mặc định, cân bằng)"
    echo -e "    ${GREEN}2)${NC} llama3.2:1b        (Nhẹ, nhanh)"
    echo -e "    ${GREEN}3)${NC} llama3.2:3b        (Tốt hơn)"
    echo -e "    ${GREEN}4)${NC} qwen2.5:7b         (Đa ngôn ngữ)"
    echo -e "    ${GREEN}5)${NC} mistral:latest     (Nhanh, chất lượng)"
    echo ""
    
    read -p "Chọn model [1-5] hoặc nhập tên model: " model_choice
    
    local model=""
    case $model_choice in
        1) model="llama3.2:latest" ;;
        2) model="llama3.2:1b" ;;
        3) model="llama3.2:3b" ;;
        4) model="qwen2.5:7b" ;;
        5) model="mistral:latest" ;;
        *) model="$model_choice" ;;
    esac
    
    if [ -z "$model" ]; then
        model="llama3.2:latest"
    fi
    
    # Update .env file
    update_env_var "LLM_PROVIDER" "ollama"
    update_env_var "OLLAMA_MODEL" "$model"
    
    echo ""
    echo -e "${GREEN}✅ Đã cấu hình Ollama với model: $model${NC}"
    echo -e "${YELLOW}[TIP] Restart RAG Service để áp dụng: docker compose restart rag-service${NC}"
}

# Function to configure Google AI Studio
configure_google_ai() {
    echo ""
    echo -e "${CYAN}Cấu hình Google AI Studio:${NC}"
    echo ""
    echo -e "  ${YELLOW}Lấy API Key tại:${NC} ${BLUE}https://aistudio.google.com/app/apikey${NC}"
    echo ""
    
    read -p "Nhập Google API Key (hoặc Enter để giữ nguyên): " api_key
    
    echo ""
    echo -e "  Các model hỗ trợ:"
    echo -e "    ${GREEN}1)${NC} gemini-1.5-flash       (Nhanh, free tier lớn)"
    echo -e "    ${GREEN}2)${NC} gemini-1.5-pro         (Chất lượng cao nhất)"
    echo -e "    ${GREEN}3)${NC} gemini-2.0-flash-exp   (Mới nhất, experimental)"
    echo ""
    
    read -p "Chọn model [1-3]: " model_choice
    
    local model=""
    case $model_choice in
        1) model="gemini-1.5-flash" ;;
        2) model="gemini-1.5-pro" ;;
        3) model="gemini-2.0-flash-exp" ;;
        *) model="gemini-1.5-flash" ;;
    esac
    
    # Update .env file
    update_env_var "LLM_PROVIDER" "google"
    update_env_var "GOOGLE_MODEL" "$model"
    if [ -n "$api_key" ]; then
        update_env_var "GOOGLE_API_KEY" "$api_key"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Đã cấu hình Google AI Studio với model: $model${NC}"
    echo -e "${YELLOW}[TIP] Restart RAG Service để áp dụng: docker compose restart rag-service${NC}"
}

# Function to update .env variable
update_env_var() {
    local key="$1"
    local value="$2"
    local env_file="$SCRIPT_DIR/.env"
    
    if grep -q "^${key}=" "$env_file" 2>/dev/null; then
        # Update existing
        sed -i "s|^${key}=.*|${key}=${value}|" "$env_file"
    elif grep -q "^# *${key}=" "$env_file" 2>/dev/null; then
        # Uncomment and update
        sed -i "s|^# *${key}=.*|${key}=${value}|" "$env_file"
    else
        # Add new
        echo "${key}=${value}" >> "$env_file"
    fi
}

# Function to start Ketoan
start_ketoan() {
    echo -e "${GREEN}[INFO] Đang khởi động Ketoan Frontend...${NC}"
    echo ""
    
    cd "$SCRIPT_DIR/ketoan"
    
    # Kill any existing Next.js processes
    echo -e "${YELLOW}[INFO] Đang dừng các process Next.js cũ...${NC}"
    pkill -9 -f "next dev" 2>/dev/null || true
    pkill -9 -f "next-server" 2>/dev/null || true
    pkill -9 -f "next-router-worker" 2>/dev/null || true
    
    # Kill port 3000 if in use
    local port_pids=$(lsof -t -i:3000 2>/dev/null)
    if [ -n "$port_pids" ]; then
        echo -e "${YELLOW}[INFO] Đang giải phóng port 3000...${NC}"
        for pid in $port_pids; do
            kill -9 $pid 2>/dev/null || true
        done
    fi
    
    # Remove Next.js lock file if exists
    if [ -f "$SCRIPT_DIR/ketoan/.next/dev/lock" ]; then
        echo -e "${YELLOW}[INFO] Đang xóa lock file...${NC}"
        rm -f "$SCRIPT_DIR/ketoan/.next/dev/lock"
    fi
    
    # Wait a moment for ports to be released
    sleep 1
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[INFO] Đang cài đặt dependencies...${NC}"
        npm install
    fi
    
    # Start Next.js dev server in background
    echo -e "${GREEN}[INFO] Đang khởi động Next.js development server...${NC}"
    npm run dev &
    KETOAN_PID=$!
    echo $KETOAN_PID > "$SCRIPT_DIR/.ketoan.pid"
    
    echo ""
    echo -e "${GREEN}✅ Ketoan Frontend đã khởi động!${NC}"
    echo ""
    echo -e "  📊 Ketoan:     ${BLUE}http://localhost:3000${NC}"
}

# Function to start all services
start_all() {
    start_n8n
    echo ""
    start_rag_service
    echo ""
    start_ketoan
}

# Function to get backup size (human readable)
get_size() {
    local size=$1
    if [ $size -ge 1073741824 ]; then
        echo "$(echo "scale=2; $size/1073741824" | bc)GB"
    elif [ $size -ge 1048576 ]; then
        echo "$(echo "scale=2; $size/1048576" | bc)MB"
    elif [ $size -ge 1024 ]; then
        echo "$(echo "scale=2; $size/1024" | bc)KB"
    else
        echo "${size}B"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo -e "${YELLOW}[INFO] Đang dọn dẹp backup cũ (giữ lại $MAX_BACKUPS backup gần nhất)...${NC}"
    
    # Đếm số backup hiện tại
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        local to_delete=$((backup_count - MAX_BACKUPS))
        echo -e "${YELLOW}[INFO] Đang xóa $to_delete backup cũ...${NC}"
        
        # Xóa các backup cũ nhất
        ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n $to_delete | while read file; do
            echo -e "  ${RED}Xóa:${NC} $(basename "$file")"
            rm -f "$file"
        done
    fi
}

# Function to backup data
backup_data() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="ragketoan_backup_${timestamp}"
    local temp_dir="$BACKUP_DIR/temp_${timestamp}"
    
    echo -e "${GREEN}[INFO] Bắt đầu backup dữ liệu...${NC}"
    echo ""
    
    # Tạo thư mục backup nếu chưa tồn tại
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$temp_dir"
    
    # 1. Backup .env file
    echo -e "${CYAN}[1/5] Backup file .env...${NC}"
    if [ -f "$SCRIPT_DIR/.env" ]; then
        cp "$SCRIPT_DIR/.env" "$temp_dir/"
        echo -e "  ${GREEN}✓${NC} .env"
    fi
    
    # 2. Backup PostgreSQL database (nén trực tiếp)
    echo -e "${CYAN}[2/5] Backup PostgreSQL database...${NC}"
    
    # Tìm container postgres của project này (ragketoan-postgres-1 hoặc postgres)
    local pg_container=""
    for name in "ragketoan-postgres-1" "ragketoan_postgres_1" "postgres"; do
        if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
            pg_container="$name"
            break
        fi
    done
    
    if [ -n "$pg_container" ]; then
        echo -e "  ${CYAN}Container:${NC} $pg_container"
        
        # Load env để lấy credentials
        if [ -f "$SCRIPT_DIR/.env" ]; then
            set -a
            source "$SCRIPT_DIR/.env"
            set +a
        fi
        
        # Sử dụng pg_dump với custom format (-Fc) để tối ưu dung lượng
        # Thêm timeout 60s để tránh treo
        timeout 60 docker exec "$pg_container" pg_dump -U "${POSTGRES_USER:-postgres}" \
            -d "${POSTGRES_DB:-n8n}" \
            -Fc --compress=9 \
            > "$temp_dir/postgres_db.dump" 2>/dev/null
        
        if [ $? -eq 0 ] && [ -s "$temp_dir/postgres_db.dump" ]; then
            local db_size=$(stat -f%z "$temp_dir/postgres_db.dump" 2>/dev/null || stat -c%s "$temp_dir/postgres_db.dump" 2>/dev/null)
            echo -e "  ${GREEN}✓${NC} postgres_db.dump ($(get_size ${db_size:-0}))"
        else
            echo -e "  ${YELLOW}⚠${NC} Không thể backup PostgreSQL (lỗi pg_dump hoặc timeout)"
            rm -f "$temp_dir/postgres_db.dump"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} PostgreSQL container không chạy, bỏ qua..."
    fi
    
    # 3. Backup N8N data (workflows, credentials đã export)
    echo -e "${CYAN}[3/5] Backup N8N demo data...${NC}"
    if [ -d "$SCRIPT_DIR/n8n/demo-data" ]; then
        cp -r "$SCRIPT_DIR/n8n/demo-data" "$temp_dir/n8n_demo_data"
        echo -e "  ${GREEN}✓${NC} n8n_demo_data"
    fi
    
    # 4. Backup shared folder
    echo -e "${CYAN}[4/5] Backup shared data...${NC}"
    if [ -d "$SCRIPT_DIR/shared" ] && [ "$(ls -A "$SCRIPT_DIR/shared" 2>/dev/null)" ]; then
        cp -r "$SCRIPT_DIR/shared" "$temp_dir/shared"
        echo -e "  ${GREEN}✓${NC} shared"
    else
        echo -e "  ${YELLOW}⚠${NC} Thư mục shared trống hoặc không tồn tại"
    fi
    
    # 5. Backup Prisma schema và migrations
    echo -e "${CYAN}[5/5] Backup Prisma schema...${NC}"
    if [ -d "$SCRIPT_DIR/ketoan/prisma" ]; then
        mkdir -p "$temp_dir/ketoan_prisma"
        cp -r "$SCRIPT_DIR/ketoan/prisma/"* "$temp_dir/ketoan_prisma/" 2>/dev/null || true
        echo -e "  ${GREEN}✓${NC} ketoan_prisma"
    fi
    
    # Tạo file tar.gz với compression tối đa
    echo ""
    echo -e "${CYAN}[INFO] Đang nén backup với mức nén tối đa...${NC}"
    
    cd "$temp_dir"
    tar -cf - . | gzip -${COMPRESSION_LEVEL} > "$BACKUP_DIR/${backup_name}.tar.gz"
    
    # Cleanup temp
    rm -rf "$temp_dir"
    
    # Lấy kích thước file backup
    local final_size=$(stat -f%z "$BACKUP_DIR/${backup_name}.tar.gz" 2>/dev/null || stat -c%s "$BACKUP_DIR/${backup_name}.tar.gz" 2>/dev/null)
    
    echo ""
    echo -e "${GREEN}✅ Backup hoàn tất!${NC}"
    echo -e "  ${CYAN}File:${NC} ${backup_name}.tar.gz"
    echo -e "  ${CYAN}Kích thước:${NC} $(get_size ${final_size:-0})"
    echo -e "  ${CYAN}Đường dẫn:${NC} $BACKUP_DIR/${backup_name}.tar.gz"
    
    # Cleanup old backups
    cleanup_old_backups
}

# Function to list available backups
list_backups() {
    echo -e "${CYAN}Danh sách backup có sẵn:${NC}"
    echo ""
    
    local i=1
    local backups=()
    
    if [ -d "$BACKUP_DIR" ]; then
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                backups+=("$file")
                local filename=$(basename "$file")
                local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
                local filedate=$(stat -f"%Sm" -t"%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c"%y" "$file" 2>/dev/null | cut -d'.' -f1)
                echo -e "  ${GREEN}$i)${NC} $filename ($(get_size ${filesize:-0})) - $filedate"
                ((i++))
            fi
        done < <(ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null)
    fi
    
    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "  ${YELLOW}Không có backup nào!${NC}"
        return 1
    fi
    
    echo ""
    printf '%s\n' "${backups[@]}"
}

# Function to restore data
restore_data() {
    echo -e "${GREEN}[INFO] Khôi phục dữ liệu từ backup${NC}"
    echo ""
    
    # List backups and get selection
    local backups=()
    local i=1
    
    if [ -d "$BACKUP_DIR" ]; then
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                backups+=("$file")
                local filename=$(basename "$file")
                local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
                echo -e "  ${GREEN}$i)${NC} $filename ($(get_size ${filesize:-0}))"
                ((i++))
            fi
        done < <(ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null)
    fi
    
    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${YELLOW}Không có backup nào để restore!${NC}"
        return 1
    fi
    
    echo -e "  ${GREEN}0)${NC} Hủy"
    echo ""
    
    read -p "Chọn backup để restore [0-$((${#backups[@]}))]: " selection
    
    if [ "$selection" == "0" ] || [ -z "$selection" ]; then
        echo -e "${YELLOW}Đã hủy restore.${NC}"
        return 0
    fi
    
    if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backups[@]} ]; then
        echo -e "${RED}Lựa chọn không hợp lệ!${NC}"
        return 1
    fi
    
    local selected_backup="${backups[$((selection-1))]}"
    local backup_filename=$(basename "$selected_backup")
    
    echo ""
    echo -e "${YELLOW}⚠️  CẢNH BÁO: Restore sẽ ghi đè dữ liệu hiện tại!${NC}"
    read -p "Bạn có chắc chắn muốn restore từ $backup_filename? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${YELLOW}Đã hủy restore.${NC}"
        return 0
    fi
    
    local temp_dir="$BACKUP_DIR/restore_temp_$(date +%s)"
    mkdir -p "$temp_dir"
    
    echo ""
    echo -e "${CYAN}[1/5] Giải nén backup...${NC}"
    tar -xzf "$selected_backup" -C "$temp_dir"
    
    # Restore .env
    echo -e "${CYAN}[2/5] Restore file .env...${NC}"
    if [ -f "$temp_dir/.env" ]; then
        cp "$temp_dir/.env" "$SCRIPT_DIR/.env"
        echo -e "  ${GREEN}✓${NC} .env"
    fi
    
    # Restore PostgreSQL
    echo -e "${CYAN}[3/5] Restore PostgreSQL database...${NC}"
    if [ -f "$temp_dir/postgres_db.dump" ]; then
        # Tìm container postgres của project này
        local pg_container=""
        for name in "ragketoan-postgres-1" "ragketoan_postgres_1" "postgres"; do
            if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
                pg_container="$name"
                break
            fi
        done
        
        if [ -n "$pg_container" ]; then
            echo -e "  ${CYAN}Container:${NC} $pg_container"
            
            # Load env để lấy credentials
            if [ -f "$SCRIPT_DIR/.env" ]; then
                set -a
                source "$SCRIPT_DIR/.env"
                set +a
            fi
            
            # Restore using pg_restore với timeout
            timeout 120 docker exec -i "$pg_container" pg_restore -U "${POSTGRES_USER:-postgres}" \
                -d "${POSTGRES_DB:-n8n}" \
                --clean --if-exists \
                < "$temp_dir/postgres_db.dump" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} PostgreSQL database restored"
            else
                echo -e "  ${YELLOW}⚠${NC} Lỗi khi restore PostgreSQL (có thể do schema conflicts)"
            fi
        else
            echo -e "  ${YELLOW}⚠${NC} PostgreSQL container không chạy. Hãy khởi động trước khi restore."
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} Không có PostgreSQL backup trong file này"
    fi
    
    # Restore N8N demo data
    echo -e "${CYAN}[4/5] Restore N8N demo data...${NC}"
    if [ -d "$temp_dir/n8n_demo_data" ]; then
        rm -rf "$SCRIPT_DIR/n8n/demo-data"
        cp -r "$temp_dir/n8n_demo_data" "$SCRIPT_DIR/n8n/demo-data"
        echo -e "  ${GREEN}✓${NC} n8n_demo_data"
    fi
    
    # Restore shared folder
    echo -e "${CYAN}[5/5] Restore shared data...${NC}"
    if [ -d "$temp_dir/shared" ]; then
        cp -r "$temp_dir/shared/"* "$SCRIPT_DIR/shared/" 2>/dev/null || true
        echo -e "  ${GREEN}✓${NC} shared"
    fi
    
    # Restore Prisma schema
    if [ -d "$temp_dir/ketoan_prisma" ]; then
        echo -e "${CYAN}[Bonus] Restore Prisma schema...${NC}"
        cp -r "$temp_dir/ketoan_prisma/"* "$SCRIPT_DIR/ketoan/prisma/" 2>/dev/null || true
        echo -e "  ${GREEN}✓${NC} ketoan_prisma"
    fi
    
    # Cleanup temp
    rm -rf "$temp_dir"
    
    echo ""
    echo -e "${GREEN}✅ Restore hoàn tất từ: $backup_filename${NC}"
    echo -e "${YELLOW}[TIP] Nếu bạn đã restore PostgreSQL, có thể cần restart các containers.${NC}"
}

# Parse arguments for non-interactive mode
while [[ $# -gt 0 ]]; do
    case $1 in
        --gpu|--nvidia)
            PROFILE="gpu-nvidia"
            shift
            ;;
        --amd)
            PROFILE="gpu-amd"
            shift
            ;;
        --cpu)
            PROFILE="cpu"
            shift
            ;;
        --n8n)
            SERVICE="n8n"
            shift
            ;;
        --ketoan)
            SERVICE="ketoan"
            shift
            ;;
        --all)
            SERVICE="all"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Service Options:"
            echo "  --n8n       Chạy N8N + AI Stack"
            echo "  --ketoan    Chạy Ketoan Frontend"
            echo "  --rag       Chạy RAG Service (Python FastAPI)"
            echo "  --all       Chạy tất cả services"
            echo ""
            echo "GPU Options:"
            echo "  --cpu       Chạy với CPU (mặc định)"
            echo "  --gpu       Chạy với Nvidia GPU"
            echo "  --nvidia    Giống --gpu"
            echo "  --amd       Chạy với AMD GPU"
            echo ""
            echo "LLM Provider:"
            echo "  --llm-ollama   Sử dụng Ollama (local)"
            echo "  --llm-google   Sử dụng Google AI Studio (cloud)"
            echo ""
            echo "Backup/Restore Options:"
            echo "  --backup    Backup dữ liệu dự án"
            echo "  --restore   Restore dữ liệu từ backup"
            echo ""
            echo "Git Options:"
            echo "  --git       Auto git add, commit và push"
            echo ""
            echo "Other:"
            echo "  -h, --help  Hiển thị trợ giúp"
            echo ""
            echo "Nếu không có tham số, script sẽ hiển thị menu tương tác."
            exit 0
            ;;
        --backup)
            SERVICE="backup"
            shift
            ;;
        --restore)
            SERVICE="restore"
            shift
            ;;
        --git)
            SERVICE="git"
            shift
            ;;
        --rag)
            SERVICE="rag"
            shift
            ;;
        --llm-ollama)
            SERVICE="llm-config"
            LLM_SET="ollama"
            shift
            ;;
        --llm-google)
            SERVICE="llm-config"
            LLM_SET="google"
            shift
            ;;
        *)
            echo -e "${RED}Tùy chọn không hợp lệ: $1${NC}"
            exit 1
            ;;
    esac
done

# Main script
show_banner
check_prerequisites
check_env

# Auto git commit and push
auto_git() {
    echo -e "${CYAN}[GIT] Auto commit và push...${NC}"
    cd "$SCRIPT_DIR"
    
    # Check if there are changes
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
        git add . 2>/dev/null
        git commit -m "auto: $timestamp" 2>/dev/null
        git push 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓${NC} Đã push code lên git"
        else
            echo -e "  ${YELLOW}⚠${NC} Không thể push (có thể chưa config remote)"
        fi
    else
        echo -e "  ${GREEN}✓${NC} Không có thay đổi mới"
    fi
    echo ""
}

# Non-interactive mode
if [ -n "$SERVICE" ]; then
    case $SERVICE in
        n8n)
            start_n8n
            ;;
        ketoan)
            start_ketoan
            ;;
        rag)
            start_rag_service
            ;;
        all)
            start_all
            ;;
        backup)
            backup_data
            ;;
        restore)
            restore_data
            ;;
        git)
            auto_git
            ;;
        llm-config)
            if [ "$LLM_SET" == "ollama" ]; then
                update_env_var "LLM_PROVIDER" "ollama"
                echo -e "${GREEN}✅ Đã chuyển sang Ollama (local)${NC}"
            elif [ "$LLM_SET" == "google" ]; then
                update_env_var "LLM_PROVIDER" "google"
                echo -e "${GREEN}✅ Đã chuyển sang Google AI Studio${NC}"
                echo -e "${YELLOW}[IMPORTANT] Hãy đảm bảo GOOGLE_API_KEY đã được cấu hình trong .env${NC}"
            fi
            echo -e "${YELLOW}[TIP] Restart RAG Service: docker compose restart rag-service${NC}"
            ;;
    esac
    exit 0
fi

# Interactive mode
while true; do
    show_menu
    read -p "Nhập lựa chọn của bạn [0-9, r, l, g]: " choice
    echo ""
    
    case $choice in
        1)
            # Show GPU menu for N8N
            show_gpu_menu
            read -p "Nhập lựa chọn GPU [1-3]: " gpu_choice
            case $gpu_choice in
                1) PROFILE="cpu" ;;
                2) PROFILE="gpu-nvidia" ;;
                3) PROFILE="gpu-amd" ;;
                *) PROFILE="cpu" ;;
            esac
            echo ""
            start_n8n
            break
            ;;
        2)
            start_ketoan
            break
            ;;
        3)
            # RAG Service
            start_rag_service
            break
            ;;
        4)
            # Show GPU menu for all
            show_gpu_menu
            read -p "Nhập lựa chọn GPU [1-3]: " gpu_choice
            case $gpu_choice in
                1) PROFILE="cpu" ;;
                2) PROFILE="gpu-nvidia" ;;
                3) PROFILE="gpu-amd" ;;
                *) PROFILE="cpu" ;;
            esac
            echo ""
            start_all
            break
            ;;
        5)
            # Stop all services
            "$SCRIPT_DIR/stop.sh"
            echo ""
            ;;
        6)
            # Kill ports
            "$SCRIPT_DIR/kill-ports.sh"
            echo ""
            ;;
        7)
            # Show status
            "$SCRIPT_DIR/status.sh"
            echo ""
            ;;
        8)
            # Show logs
            "$SCRIPT_DIR/logs.sh"
            break
            ;;
        9)
            # Backup data
            backup_data
            echo ""
            ;;
        r|R)
            # Restore data
            restore_data
            echo ""
            ;;
        l|L)
            # LLM Configuration
            show_llm_config
            echo ""
            ;;
        g|G)
            # Git auto commit and push
            auto_git
            echo ""
            ;;
        0)
            echo -e "${YELLOW}Tạm biệt! 👋${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Lựa chọn không hợp lệ. Vui lòng chọn 0-9, r, l hoặc g.${NC}"
            echo ""
            ;;
    esac
done

echo ""
echo -e "${YELLOW}[TIP] Dùng './stop.sh' để dừng tất cả services${NC}"
echo -e "${YELLOW}[TIP] Dùng './logs.sh' để xem logs${NC}"
echo -e "${YELLOW}[TIP] Dùng './status.sh' để xem trạng thái${NC}"
echo -e "${YELLOW}[TIP] Dùng './start.sh --backup' để backup dữ liệu${NC}"
echo -e "${YELLOW}[TIP] Dùng './start.sh --restore' để restore dữ liệu${NC}"
echo -e "${YELLOW}[TIP] Dùng './start.sh --rag' để chạy RAG Service${NC}"
echo -e "${YELLOW}[TIP] Dùng './start.sh --llm-google' để chuyển sang Google AI${NC}"
echo -e "${YELLOW}[TIP] Dùng './start.sh --git' để auto git commit & push${NC}"
