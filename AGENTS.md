# Master Project Orchestration Agent

If you are working on Backend, read `BACKEND_AGENTS.md`.

**System Vision:** This is a Unified Academic Platform. It acts as a single centralized portal where various AI-assisted workflows are categorized and accessible as independent sub-systems (tabs/cards), strictly governed by dynamic Role-Based Access Control (RBAC).

**Server Ready:** Ensure that your current step can work on a server (VPS), not only in the current local host machine.

### Tech Stack

| Layer       | Technology                       |
| :---------- | :------------------------------- |
| Frontend    | Vite 7, React 19, React Router 7 |
| Styling     | Tailwind CSS v4 (Vite plugin)    |
| Backend     | C# .NET                          |
| DB          | SQLite                           |
| API         | RESTful                          |
| Package Mgr | pnpm                             |

### Reference
To understand both frontend and backend, **always** read:
- **AGENTS.md for Backend:** Read `Backend/AGENTS.md` and `DATABASE.md` for C#, DB structure, SystemCodes, physical file management, and files documentation.
- **AGENTS.md for Frontend:** Read `Frontend/src/AGENTS.md` for UI categorization, Arabic RTL styling, dynamic feature rendering, Tailwind v4 rules, and files documentation.

### Master Code Rules

*   **Tailwind CSS v4 exclusively** — no inline `style={}` unless dynamic values require it.
*   Never use hardcoded hex color values in Tailwind classes.
*   Dark mode: use `dark:` variant (respects `prefers-color-scheme`).
*   Use `lucide-react` for icons; do not create custom inline SVG icons from scratch.
*   RTL: this is an Arabic-first app. Use logical properties instead of physical `left` / `right` properties.
*   Log errors with sufficient context (function name, relevant IDs, SystemCodes).
*   `main` branch is protected. Always create new feature/fix branches for tasks if you're not already on one.
*   Always do atomic commits.
*   Keep `.gitignore` updated.

### Quality Assurance (QA)

*   For end-to-end testing, always use DevTools MCP tool to test changes *yourself*.
*   If you did a significant change, ensure that your work is clean through a full E2E test.
*   Verify RBAC UI enforcement: Ensure users cannot see or navigate to UI tabs they do not have database permission for.

---

## Deployment

Read `.deploy.env` at the project root for VPS IP, SSH user, and credentials.

### Architecture

```
User → nginx:80 (proxy)
         ├── /api/*       → backend:8080  (.NET)
         ├── /uploads/*   → backend:8080  (static files)
         ├── /seq/*       → seq:80        (log viewer, stripped prefix)
         └── /            → frontend:80   (nginx serving React SPA)
```

All containers run via Docker Compose on a single VPS. Images are pushed to GHCR. CI/CD builds on push to `main`.

### Infrastructure Summary

| Component   | Role                        | Image                                      | Mem Limit |
|:------------|:----------------------------|:-------------------------------------------|:----------|
| backend     | .NET 9 Web API + Pandoc CLI | `ghcr.io/*/bluebits-backend:latest`        | 512M      |
| frontend    | React SPA (nginx)           | `ghcr.io/*/bluebits-frontend:latest`       | 128M      |
| seq         | Structured log viewer       | `datalust/seq:latest`                      | 256M      |
| nginx       | Reverse proxy               | `nginx:stable-alpine`                      | 64M       |

### Database & Storage

| Path                      | Content                       | Persistence |
|:--------------------------|:------------------------------|:------------|
| `Backend/data/`           | SQLite DB (`bluebits.db`)     | bind mount  |
| `Backend/uploads/`        | User-uploaded files           | bind mount  |
| `Resources/PandocTemplates/` | .dotx templates            | bind mount  |
| `seq-data` (named volume) | Seq event store               | Docker volume |

### Quick Commands

```bash
# === Manual deploy (pull latest code, rebuild, restart) ===
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && \
  git pull origin main && \
  docker compose up -d --build --remove-orphans"

# === Restart a single service ===
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && docker compose up -d --force-recreate backend"

# === View logs ===
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && docker compose logs --tail=50 backend"
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && docker compose logs --tail=50 -f"   # follow all

# === Pull latest images from GHCR and restart ===
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && docker compose pull && docker compose up -d --remove-orphans"

# === Clean up unused Docker resources ===
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && docker system prune -f"

# === Full reset (remove containers, volumes, rebuild from scratch) ===
ssh ${VPS_USER}@${VPS_IP} "cd /opt/bluebits && \
  docker compose down -v && \
  git pull origin main && \
  docker compose up -d --build"
```

### CI/CD

Workflow: `.github/workflows/deploy.yml` — triggers on push to `main`.

1. Builds & pushes backend + frontend images to GHCR.
2. SSHes into the VPS, pulls images, and restarts containers.

**Required GitHub Secrets** (set in repo → Settings → Secrets and variables → Actions):

| Secret            | Value                        |
|:------------------|:-----------------------------|
| `DROPLET_HOST`    | `139.59.157.34`              |
| `DROPLET_USER`    | `root`                       |
| `DROPLET_SSH_KEY` | content of `~/.ssh/id_ed25519` (the **full** private key, including `-----BEGIN ...-----` headers) |

### Monitoring with Seq

Open **http://139.59.157.34/seq/** — login: `admin` / `bluebits123`.

Useful searches:
- `@Level = "Error"` — all errors
- `UserId = "N/A"` — unauthenticated requests
- `SystemCode = "PANDOC"` — Pandoc workflow events
- `SessionId = "42"` — a specific session

Structured properties pushed on every error log: `UserId`, `SessionId`, `SystemCode`, `TraceId`.

### Key Files

| File                                | Purpose                            |
|:------------------------------------|:-----------------------------------|
| `docker-compose.yml`                | Orchestrates all 4 services        |
| `nginx.conf`                        | Reverse proxy config with SPA      |
| `Backend/Dockerfile`                | Multi-stage .NET 9 build + pandoc  |
| `Frontend/Dockerfile`               | pnpm build → nginx static serve    |
| `.github/workflows/deploy.yml`      | CI/CD push-to-deploy pipeline      |
| `setup-server.sh`                   | One-time VPS setup (swap, Docker)  |
| `Backend/appsettings.Docker.json`   | Docker-specific Serilog sinks      |

### VPS Details

- **Provider:** DigitalOcean Droplet
- **IP:** 139.59.157.34
- **OS:** Ubuntu 24.04 LTS
- **Specs:** 1 vCPU, 2 GB RAM, 70 GB disk + 4 GB swap
- **Services:** Docker, Docker Compose, UFW (22, 80 open)