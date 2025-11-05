#!/bin/bash

################################################################################
# Restore Script for Self-hosted AI Starter Kit (Optimized)
# 
# This script restores data from optimized backups:
# - PostgreSQL database
# - Qdrant vector database
# - n8n essential data
# - Configuration files (.env)
# - Shared data folder
#
# Note: Ollama models will be re-downloaded automatically after restore
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_question() {
    echo -e "${BLUE}[?]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
}

list_available_backups() {
    print_info "Available backups:"
    echo ""
    
    if [ ! -d "./backups" ]; then
        print_error "No backups directory found"
        exit 1
    fi
    
    cd ./backups
    backups=($(ls -t backup_data_*.tar.gz backup_*.tar.gz 2>/dev/null))
    
    if [ ${#backups[@]} -eq 0 ]; then
        print_error "No backups found"
        exit 1
    fi
    
    for i in "${!backups[@]}"; do
        size=$(du -sh "${backups[$i]}" | cut -f1)
        date=$(echo "${backups[$i]}" | sed 's/backup_\(data_\)\?\(.*\)\.tar\.gz/\2/' | sed 's/_/ /')
        backup_type="optimized"
        if [[ "${backups[$i]}" == backup_data_* ]]; then
            backup_type="✓ optimized"
        else
            backup_type="full"
        fi
        echo "  [$i] ${backups[$i]} (${size}) - ${date} [${backup_type}]"
    done
    
    cd ..
    echo ""
}

select_backup() {
    if [ -n "$1" ]; then
        BACKUP_FILE="$1"
        if [ ! -f "${BACKUP_FILE}" ]; then
            print_error "Backup file not found: ${BACKUP_FILE}"
            exit 1
        fi
    else
        list_available_backups
        
        cd ./backups
        backups=($(ls -t backup_data_*.tar.gz backup_*.tar.gz 2>/dev/null))
        cd ..
        
        print_question "Select backup number to restore (0-$((${#backups[@]}-1))): "
        read -r selection
        
        if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -ge "${#backups[@]}" ]; then
            print_error "Invalid selection"
            exit 1
        fi
        
        BACKUP_FILE="./backups/${backups[$selection]}"
    fi
    
    print_info "Selected backup: ${BACKUP_FILE}"
}

confirm_restore() {
    print_warn "WARNING: This will replace all current data with the backup!"
    print_question "Are you sure you want to continue? (yes/no): "
    read -r confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_info "Restore cancelled"
        exit 0
    fi
}

stop_services() {
    print_info "Stopping Docker services..."
    
    # Try to detect which profile is running
    if docker ps --format '{{.Names}}' | grep -q "ollama-cpu"; then
        docker compose --profile cpu down || true
    elif docker ps --format '{{.Names}}' | grep -q "ollama-gpu"; then
        docker compose --profile gpu-nvidia down || true
    elif docker ps --format '{{.Names}}' | grep -q "ollama-gpu-amd"; then
        docker compose --profile gpu-amd down || true
    else
        docker compose down || true
    fi
    
    print_info "Services stopped"
}

extract_backup() {
    print_info "Extracting backup..."
    
    BACKUP_DIR="./backups"
    RESTORE_TEMP="${BACKUP_DIR}/restore_temp"
    
    # Remove old temp directory if exists
    rm -rf "${RESTORE_TEMP}"
    mkdir -p "${RESTORE_TEMP}"
    
    # Extract backup
    tar xzf "${BACKUP_FILE}" -C "${RESTORE_TEMP}"
    
    # Find the extracted directory
    EXTRACTED_DIR=$(find "${RESTORE_TEMP}" -maxdepth 1 -type d \( -name "backup_data_*" -o -name "backup_*" \) | head -1)
    
    if [ -z "$EXTRACTED_DIR" ]; then
        print_error "Failed to find extracted backup directory"
        exit 1
    fi
    
    print_info "Backup extracted to: ${EXTRACTED_DIR}"
}

restore_env_file() {
    print_info "Restoring .env file..."
    
    if [ -f "${EXTRACTED_DIR}/.env" ]; then
        # Backup current .env if exists
        if [ -f ".env" ]; then
            cp .env .env.backup.$(date +"%Y%m%d_%H%M%S")
            print_info "Current .env backed up"
        fi
        
        cp "${EXTRACTED_DIR}/.env" .env
        print_info ".env file restored successfully"
    else
        print_warn ".env file not found in backup, skipping..."
    fi
}

restore_shared_folder() {
    print_info "Restoring shared folder..."
    
    if [ -d "${EXTRACTED_DIR}/shared" ]; then
        # Backup current shared folder if exists
        if [ -d "shared" ]; then
            mv shared "shared.backup.$(date +"%Y%m%d_%H%M%S")"
            print_info "Current shared folder backed up"
        fi
        
        cp -r "${EXTRACTED_DIR}/shared" ./shared
        print_info "Shared folder restored successfully"
    else
        print_warn "Shared folder not found in backup, skipping..."
    fi
}

restore_n8n_data() {
    print_info "Restoring n8n demo data..."
    
    if [ -d "${EXTRACTED_DIR}/n8n/demo-data" ]; then
        # Backup current n8n data if exists
        if [ -d "n8n/demo-data" ]; then
            mv n8n/demo-data "n8n/demo-data.backup.$(date +"%Y%m%d_%H%M%S")"
            print_info "Current n8n demo data backed up"
        fi
        
        mkdir -p n8n
        cp -r "${EXTRACTED_DIR}/n8n/demo-data" ./n8n/demo-data
        print_info "n8n demo data restored successfully"
    else
        print_warn "n8n demo data not found in backup, skipping..."
    fi
}

restore_docker_volumes() {
    print_info "Restoring critical Docker volumes..."
    
    if [ ! -d "${EXTRACTED_DIR}/volumes" ]; then
        print_warn "No volumes found in backup, skipping..."
        return
    fi
    
    # Get project name (directory name)
    PROJECT_NAME=$(basename "$(pwd)")
    
    for volume_backup in "${EXTRACTED_DIR}/volumes"/*.tar.gz; do
        if [ ! -f "$volume_backup" ]; then
            continue
        fi
        
        volume_name=$(basename "$volume_backup" .tar.gz)
        
        # Skip Ollama and Postgres volumes from old backups
        if [[ "$volume_name" == *"ollama_storage"* ]]; then
            print_info "⊘ Skipping Ollama volume (models will be re-downloaded)"
            continue
        fi
        
        if [[ "$volume_name" == *"postgres_storage"* ]]; then
            print_info "⊘ Skipping Postgres volume (using database dump instead)"
            continue
        fi
        
        print_info "Restoring volume: ${volume_name}"
        
        # Remove existing volume if it exists
        if docker volume inspect "${volume_name}" &> /dev/null; then
            print_warn "Removing existing volume: ${volume_name}"
            docker volume rm "${volume_name}" || true
        fi
        
        # Create new volume
        docker volume create "${volume_name}"
        
        # Restore data to volume
        docker run --rm \
            -v "${volume_name}:/data" \
            -v "$(pwd)/${EXTRACTED_DIR}/volumes:/backup" \
            alpine \
            sh -c "cd /data && tar xzf /backup/$(basename "$volume_backup")"
        
        print_info "✓ Volume ${volume_name} restored successfully"
    done
}

restore_postgres_dump() {
    print_info "Restoring PostgreSQL database..."
    
    # Check both old and new dump locations
    local dump_file=""
    if [ -f "${EXTRACTED_DIR}/postgres/database.dump" ]; then
        dump_file="${EXTRACTED_DIR}/postgres/database.dump"
        dump_format="custom"
    elif [ -f "${EXTRACTED_DIR}/postgres_dump/database.sql" ]; then
        dump_file="${EXTRACTED_DIR}/postgres_dump/database.sql"
        dump_format="sql"
    else
        print_warn "PostgreSQL dump not found in backup, skipping..."
        return
    fi
    
    # We need to start postgres first to restore the dump
    print_info "Starting PostgreSQL container temporarily..."
    
    docker compose up -d postgres
    
    # Wait for postgres to be ready
    print_info "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    # Wait for postgres to accept connections
    for i in {1..30}; do
        if docker exec postgres pg_isready -U "${POSTGRES_USER:-postgres}" &> /dev/null; then
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    # Drop existing database and recreate
    print_info "Recreating database..."
    docker exec postgres psql -U "${POSTGRES_USER:-postgres}" -c "DROP DATABASE IF EXISTS ${POSTGRES_DB:-n8n};" 2>/dev/null || true
    docker exec postgres psql -U "${POSTGRES_USER:-postgres}" -c "CREATE DATABASE ${POSTGRES_DB:-n8n};"
    
    # Restore dump based on format
    if [ "$dump_format" = "custom" ]; then
        print_info "Restoring compressed database dump..."
        docker cp "$dump_file" postgres:/tmp/database.dump
        docker exec postgres pg_restore \
            -U "${POSTGRES_USER:-postgres}" \
            -d "${POSTGRES_DB:-n8n}" \
            -c \
            /tmp/database.dump 2>/dev/null || true
        docker exec postgres rm /tmp/database.dump
    else
        print_info "Restoring SQL database dump..."
        docker exec -i postgres psql -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-n8n}" < "$dump_file"
    fi
    
    print_info "✓ PostgreSQL database restored successfully"
    
    # Stop postgres
    docker compose stop postgres
}

cleanup_temp() {
    print_info "Cleaning up temporary files..."
    rm -rf "${RESTORE_TEMP}"
    print_info "Cleanup completed"
}

start_services() {
    print_question "Which profile do you want to start? (cpu/gpu-nvidia/gpu-amd/none): "
    read -r profile
    
    case "$profile" in
        cpu)
            print_info "Starting services with CPU profile..."
            docker compose --profile cpu up -d
            ;;
        gpu-nvidia)
            print_info "Starting services with GPU (Nvidia) profile..."
            docker compose --profile gpu-nvidia up -d
            ;;
        gpu-amd)
            print_info "Starting services with GPU (AMD) profile..."
            docker compose --profile gpu-amd up -d
            ;;
        none)
            print_info "Services not started. You can start them manually later."
            return
            ;;
        *)
            print_warn "Invalid profile. Services not started."
            return
            ;;
    esac
    
    print_info "Services started successfully"
}

display_restore_info() {
    print_info "✓ Restore completed successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Next steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  1. Check services status:"
    echo "     docker compose ps"
    echo ""
    echo "  2. Access n8n at:"
    echo "     http://localhost:5678"
    echo ""
    echo "  3. Ollama models download status:"
    echo "     docker compose logs -f ollama-pull-llama-cpu"
    echo "     (or ollama-pull-llama-gpu / ollama-pull-llama-gpu-amd)"
    echo ""
    echo "  4. Check all logs if needed:"
    echo "     docker compose logs -f"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    print_warn "Note: Ollama models are being re-downloaded automatically."
    print_warn "This may take several minutes depending on your internet speed."
    echo ""
    
    if [ -f "${EXTRACTED_DIR}/backup_info.txt" ]; then
        print_info "Backup information:"
        echo ""
        cat "${EXTRACTED_DIR}/backup_info.txt"
    fi
}

# Main execution
main() {
    print_info "Starting restore process..."
    
    # Check prerequisites
    check_docker
    
    # Select backup
    select_backup "$1"
    
    # Confirm restore
    confirm_restore
    
    # Stop services
    stop_services
    
    # Extract backup
    extract_backup
    
    # Restore components
    restore_env_file
    restore_shared_folder
    restore_n8n_data
    restore_docker_volumes
    restore_postgres_dump
    
    # Cleanup
    cleanup_temp
    
    # Start services
    start_services
    
    # Display info
    display_restore_info
}

# Run main function
main "$@"
