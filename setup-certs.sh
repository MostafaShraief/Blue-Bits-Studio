#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Blue Bits Studio — Self-Signed Certificate Generator
# Generates a self-signed TLS certificate for the droplet IP.
# Run BEFORE deploying with Docker Compose.
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/certs"
IP="${1:-139.59.157.34}"

mkdir -p "$CERTS_DIR"

if [[ -f "$CERTS_DIR/bluebits.crt" && -f "$CERTS_DIR/bluebits.key" ]]; then
    echo "✓ Certificates already exist at $CERTS_DIR — skipping generation."
    echo "  To regenerate, delete the files and re-run this script."
    exit 0
fi

echo "Generating self-signed TLS certificate for IP: $IP..."
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$CERTS_DIR/bluebits.key" \
    -out "$CERTS_DIR/bluebits.crt" \
    -subj "/C=US/ST=State/L=City/O=Blue Bits Studio/CN=$IP" \
    -addext "subjectAltName=IP:$IP"

chmod 600 "$CERTS_DIR/bluebits.key"

echo "✓ Certificate generated:"
echo "  Cert: $CERTS_DIR/bluebits.crt"
echo "  Key:  $CERTS_DIR/bluebits.key"
echo ""
echo "Deploy with: docker compose up -d --build"
