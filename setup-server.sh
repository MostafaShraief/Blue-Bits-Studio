#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Blue Bits Studio — Server Initialization Script
# Target: Ubuntu 22.04/24.04 LTS (DigitalOcean Droplet)
# ============================================================

SCRIPT_NAME=$(basename "$0")
LOG_FILE="/var/log/${SCRIPT_NAME%.sh}.log"

exec > >(tee -a "$LOG_FILE") 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "=== Blue Bits Studio Server Initialization ==="

# --- Root check ---
if [[ $EUID -ne 0 ]]; then
    log "ERROR: This script must be run as root (use sudo)."
    exit 1
fi

# --- 1. Create 4GB swap ---
if swapon --show | grep -q '/swapfile'; then
    log "✓ Swap file already exists, skipping creation."
else
    log "Creating 4GB swap file..."
    dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    log "✓ Swap file created and enabled."
fi

if grep -q '/swapfile' /etc/fstab; then
    log "✓ /swapfile already in /etc/fstab."
else
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log "✓ /swapfile added to /etc/fstab."
fi

SYSCTL_SWAP="/etc/sysctl.d/99-swap.conf"
if [[ -f "$SYSCTL_SWAP" ]] && grep -q 'vm.swappiness' "$SYSCTL_SWAP"; then
    log "✓ vm.swappiness already set."
else
    echo 'vm.swappiness=10' >> "$SYSCTL_SWAP"
    sysctl -p "$SYSCTL_SWAP"
    log "✓ vm.swappiness=10 configured."
fi

# --- 2. Install Docker ---
if command -v docker &>/dev/null; then
    log "✓ Docker already installed, skipping."
else
    log "Installing Docker via official script..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sh /tmp/get-docker.sh
    rm -f /tmp/get-docker.sh
    log "✓ Docker installed."
fi

if docker compose version &>/dev/null; then
    log "✓ Docker Compose plugin already installed."
else
    log "Installing Docker Compose plugin..."
    apt-get update -qq
    apt-get install -y -qq docker-compose-plugin
    log "✓ Docker Compose plugin installed."
fi

log "Verifying Docker installation..."
docker run hello-world && log "✓ Docker hello-world verification passed."

if groups "$SUDO_USER" | grep -q docker; then
    log "✓ User '$SUDO_USER' already in docker group."
else
    usermod -aG docker "$SUDO_USER"
    log "✓ User '$SUDO_USER' added to docker group (log out & back in to take effect)."
fi

# --- 3. Create app directory ---
if [[ -d /opt/bluebits ]]; then
    log "✓ /opt/bluebits already exists."
else
    mkdir -p /opt/bluebits
    log "✓ /opt/bluebits created."
fi

# --- 3b. Generate self-signed TLS certificate ---
CERT_DIR="/opt/bluebits/certs"
if [[ -f "$CERT_DIR/bluebits.crt" ]]; then
    log "✓ TLS certificate already exists, skipping."
else
    log "Generating self-signed TLS certificate for $VPS_IP..."
    # Check if .deploy.env exists for VPS_IP, otherwise use default
    DEPLOY_ENV="/opt/bluebits/.deploy.env"
    if [[ -f "$DEPLOY_ENV" ]]; then
        IP=$(grep -oP 'DROPLET_HOST=\K.*' "$DEPLOY_ENV" || echo "139.59.157.34")
    else
        IP="139.59.157.34"
    fi
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout "$CERT_DIR/bluebits.key" \
        -out "$CERT_DIR/bluebits.crt" \
        -subj "/C=US/ST=State/L=City/O=Blue Bits Studio/CN=$IP" \
        -addext "subjectAltName=IP:$IP"
    chmod 600 "$CERT_DIR/bluebits.key"
    log "✓ Self-signed TLS certificate generated for $IP."
fi

# --- 4. Configure UFW ---
if command -v ufw &>/dev/null; then
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw --force enable
    log "✓ UFW configured: ports 22, 80, 443 allowed."
else
    log "WARNING: UFW not available. Install it with: apt-get install -y ufw"
fi

# --- 5. Print next-step instructions ---
cat << 'INSTRUCTIONS'
╔══════════════════════════════════════════════════════════════╗
║                   SETUP COMPLETE                            ║
╠══════════════════════════════════════════════════════════════╣
║ Next steps:                                                 ║
║                                                             ║
║ 1. Log out and back in (or run `newgrp docker`) so your     ║
║    user can use Docker without sudo.                        ║
║                                                             ║
║ 2. Clone the repo:                                          ║
║    cd /opt/bluebits                                         ║
║    git clone <your-repo-url> .                              ║
║                                                             ║
║ 3. Deploy with Docker Compose:                              ║
║    docker compose up --build -d                             ║
║                                                             ║
║ 4. Check logs:                                              ║
║    docker compose logs -f                                   ║
║                                                             ║
║ Full log saved to: /var/log/setup-server.log                ║
╚══════════════════════════════════════════════════════════════╝
INSTRUCTIONS

log "=== Blue Bits Studio initialization complete ==="
