#!/bin/bash

################################################################################
# Backup Script for Self-hosted AI Starter Kit (Optimized)
# 
# This script backs up ONLY essential data to minimize backup size:
# - PostgreSQL database (n8n workflows, credentials, executions)
# - Qdrant vector database (embeddings)
# - n8n user files and settings
# - Configuration files (.env)
# - Shared data folder
#
# EXCLUDED for size optimization:
# - Ollama models (can be re-downloaded)
# - Full n8n volume (only backup critical data)
################################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_data_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

create_backup_directory() {
    print_info "Creating backup directory: ${BACKUP_PATH}"
    mkdir -p "${BACKUP_PATH}"
}

backup_env_file() {
    print_info "Backing up .env file..."
    if [ -f ".env" ]; then
        cp .env "${BACKUP_PATH}/.env"
        print_info ".env file backed up successfully"
    else
        print_warn ".env file not found, skipping..."
    fi
}

backup_shared_folder() {
    print_info "Backing up shared folder..."
    if [ -d "shared" ]; then
        cp -r shared "${BACKUP_PATH}/shared"
        print_info "Shared folder backed up successfully"
    else
        print_warn "Shared folder not found, skipping..."
    fi
}

backup_n8n_data() {
    print_info "Backing up n8n demo data..."
    if [ -d "n8n/demo-data" ]; then
        mkdir -p "${BACKUP_PATH}/n8n"
        cp -r n8n/demo-data "${BACKUP_PATH}/n8n/demo-data"
        print_info "n8n demo data backed up successfully"
    else
        print_warn "n8n demo data not found, skipping..."
    fi
}

backup_critical_volumes() {
    print_info "Backing up critical Docker volumes (optimized)..."
    
    # Get project name (directory name)
    PROJECT_NAME=$(basename "$(pwd)")
    
    mkdir -p "${BACKUP_PATH}/volumes"
    
    # Backup Qdrant storage (vector database - CRITICAL)
    local qdrant_volume="${PROJECT_NAME}_qdrant_storage"
    if docker volume inspect "${qdrant_volume}" &> /dev/null; then
        print_info "Backing up Qdrant vector database..."
        docker run --rm \
            -v "${qdrant_volume}:/data" \
            -v "$(pwd)/${BACKUP_PATH}/volumes:/backup" \
            alpine \
            tar czf "/backup/${qdrant_volume}.tar.gz" -C /data .
        
        local size=$(du -sh "${BACKUP_PATH}/volumes/${qdrant_volume}.tar.gz" | cut -f1)
        print_info "✓ Qdrant backed up (${size})"
    else
        print_warn "Qdrant volume not found, skipping..."
    fi
    
    # Backup only essential n8n data (not full volume)
    local n8n_volume="${PROJECT_NAME}_n8n_storage"
    if docker volume inspect "${n8n_volume}" &> /dev/null; then
        print_info "Backing up n8n essential data (excluding cache/temp)..."
        
        # Backup only critical n8n directories
        docker run --rm \
            -v "${n8n_volume}:/data" \
            -v "$(pwd)/${BACKUP_PATH}/volumes:/backup" \
            alpine \
            sh -c "cd /data && tar czf /backup/${n8n_volume}.tar.gz \
                --exclude='.cache' \
                --exclude='cache' \
                --exclude='.npm' \
                --exclude='tmp' \
                --exclude='temp' \
                --exclude='*.log' \
                . 2>/dev/null || tar czf /backup/${n8n_volume}.tar.gz ."
        
        local size=$(du -sh "${BACKUP_PATH}/volumes/${n8n_volume}.tar.gz" | cut -f1)
        print_info "✓ n8n data backed up (${size})"
    else
        print_warn "n8n volume not found, skipping..."
    fi
    
    # SKIP Ollama storage (models can be re-downloaded)
    print_info "⊘ Skipping Ollama models (can be re-downloaded to save space)"
    
    # SKIP Postgres volume (we use pg_dump instead for efficiency)
    print_info "⊘ Skipping Postgres volume (using pg_dump instead)"
}

backup_postgres_dump() {
    print_info "Creating PostgreSQL database dump (compressed)..."
    
    # Check if postgres container is running
    if docker ps --format '{{.Names}}' | grep -q "^postgres$"; then
        # Load environment variables
        if [ -f ".env" ]; then
            export $(grep -v '^#' .env | xargs)
        fi
        
        mkdir -p "${BACKUP_PATH}/postgres"
        
        # Create compressed SQL dump (custom format for better compression)
        docker exec postgres pg_dump \
            -U "${POSTGRES_USER:-postgres}" \
            -d "${POSTGRES_DB:-n8n}" \
            -F c \
            -f /tmp/database.dump
        
        # Copy dump from container
        docker cp postgres:/tmp/database.dump "${BACKUP_PATH}/postgres/database.dump"
        
        # Clean up temp file in container
        docker exec postgres rm /tmp/database.dump
        
        local size=$(du -sh "${BACKUP_PATH}/postgres/database.dump" | cut -f1)
        print_info "✓ PostgreSQL dump created (${size})"
    else
        print_warn "PostgreSQL container is not running, skipping database dump..."
    fi
}

create_backup_info() {
    print_info "Creating backup information file..."
    
    cat > "${BACKUP_PATH}/backup_info.txt" << EOF
Backup Information (Optimized)
==============================
Backup Date: $(date)
Backup Name: ${BACKUP_NAME}
System: Self-hosted AI Starter Kit
Backup Type: Data-only (optimized for size)

Contents:
---------
✓ .env configuration file
✓ shared/ folder (user data)
✓ n8n demo data (workflows & credentials)
✓ n8n essential data (excluding cache/temp)
✓ PostgreSQL database dump (compressed)
✓ Qdrant vector database

Excluded (can be recreated):
----------------------------
⊘ Ollama models (can be re-downloaded)
⊘ Cache and temporary files
⊘ Log files

Docker Information:
-------------------
$(docker --version)

Backup Components:
------------------
$(find "${BACKUP_PATH}" -type f -exec du -sh {} \; 2>/dev/null | sort -hr || echo "Error listing files")

Total Backup Size:
------------------
$(du -sh "${BACKUP_PATH}" | cut -f1)

Restore Instructions:
---------------------
1. Run: ./restore.sh
2. Select this backup from the list
3. Confirm restoration
4. After restore, Ollama models will be re-downloaded automatically
EOF
    
    print_info "✓ Backup information file created"
}

compress_backup() {
    print_info "Compressing backup..."
    
    cd "${BACKUP_DIR}"
    tar czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    
    if [ $? -eq 0 ]; then
        # Remove uncompressed backup
        rm -rf "${BACKUP_NAME}"
        print_info "Backup compressed successfully: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
        print_info "Backup size: $(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)"
    else
        print_error "Failed to compress backup"
        exit 1
    fi
}

cleanup_old_backups() {
    print_info "Cleaning up old backups (keeping last 7)..."
    
    cd "${BACKUP_DIR}"
    ls -t backup_data_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
    
    print_info "✓ Old backups cleaned up (keeping 7 most recent)"
}

# Main execution
main() {
    print_info "Starting backup process..."
    print_info "Timestamp: ${TIMESTAMP}"
    
    # Check prerequisites
    check_docker
    
    # Create backup directory
    create_backup_directory
    
    # Perform backups (optimized order)
    backup_env_file
    backup_shared_folder
    backup_n8n_data
    backup_postgres_dump
    backup_critical_volumes
    
    # Create backup info
    create_backup_info
    
    # Compress backup
    compress_backup
    
    # Cleanup old backups
    cleanup_old_backups
    
    print_info "✓ Backup completed successfully!"
    print_info "Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
}

# Run main function
main
