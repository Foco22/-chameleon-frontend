# Docker Deployment Guide

## Quick Start

```bash
cd cam-frontend
docker compose up -d
```

Open: **http://localhost:8080**

## Commands

### Start the frontend
```bash
docker compose up -d
```

### View logs
```bash
docker compose logs -f
```

### Stop the frontend
```bash
docker compose down
```

### Rebuild after code changes
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Check if running
```bash
docker compose ps
```

## Port Configuration

The frontend runs on port **8080** by default.

To change the port, edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Change 3000 to your desired port
```

## API Configuration

Make sure the API URL in `api.js` matches your backend:
```javascript
const API_BASE_URL = 'http://34.31.148.75:5000';
```

## Troubleshooting

### Port already in use
```bash
# Change port in docker-compose.yml or stop the conflicting service
sudo lsof -i :8080
```

### Cannot connect to backend
1. Check if backend is running
2. Verify API URL in `api.js`
3. Check CORS settings in backend
4. Open browser DevTools (F12) and check Console for errors

### Docker build fails
```bash
# Clean up and rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
docker compose up -d
```
