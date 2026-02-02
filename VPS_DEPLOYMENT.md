# 🚀 Deploy WhatsApp Node to VPS

## 📋 Prerequisites on VPS

Make sure your VPS has:
- ✅ Node.js installed (v18+)
- ✅ npm installed
- ✅ Git installed (optional but recommended)
- ✅ n8n installed

Check versions:
```bash
node --version    # Should be v18+
npm --version     # Should be v8+
n8n --version     # Should be v1.0+
```

---

## 📦 Option 1: Deploy Using npm Package (Recommended)

### Step 1: Publish to npm (Optional - if you want to share)

On your local machine:

```bash
cd "path/to/n8n-whatsapp-button/n8n-whatsapp-button"
npm run build
npm publish
```

Then on VPS:
```bash
npm install n8n-nodes-whatsapp -g
```

---

## 📁 Option 2: Deploy Using Git + Build (Best for Private Use)

### Step 1: Push to Git Repository

On your local machine:

```bash
cd "path/to/n8n-whatsapp-button"
git init
git add .
git commit -m "Add WhatsApp node for n8n"
git remote add origin https://github.com/YOUR_USERNAME/n8n-whatsapp-button.git
git push -u origin main
```

### Step 2: SSH into VPS

```bash
ssh user@your-vps-ip
```

### Step 3: Clone Repository on VPS

```bash
cd ~/n8n-nodes  # or your preferred directory
git clone https://github.com/YOUR_USERNAME/n8n-whatsapp-button.git
cd n8n-whatsapp-button/n8n-whatsapp-button
```

### Step 4: Install & Build on VPS

```bash
npm install
npm run build
```

### Step 5: Link to n8n

```bash
# Find your n8n custom directory
ls ~/.n8n/custom

# If not exists, create it
mkdir -p ~/.n8n/custom

# Link the node
cd ~/.n8n/custom
npm link ../../path/to/n8n-nodes-whatsapp
```

**OR** copy the built files directly:

```bash
# Copy dist folder to n8n custom nodes
cp -r dist ~/.n8n/custom/n8n-nodes-whatsapp
cd ~/.n8n/custom/n8n-nodes-whatsapp
npm install
```

---

## 🔄 Option 3: Copy Built Files Directly (Fastest)

### Step 1: Build on Local Machine

```bash
cd "path/to/n8n-whatsapp-button/n8n-whatsapp-button"
npm run build
```

### Step 2: Compress Built Files

```bash
# On Windows PowerShell:
tar -czf whatsapp-node.tar.gz dist/ node_modules/n8n-workflow package.json

# On Mac/Linux:
tar -czf whatsapp-node.tar.gz dist/ node_modules/n8n-workflow package.json
```

### Step 3: Upload to VPS

```bash
# On your local machine:
scp whatsapp-node.tar.gz user@your-vps-ip:~/n8n-custom-nodes/
```

### Step 4: Extract on VPS

```bash
ssh user@your-vps-ip

cd ~/n8n-custom-nodes
tar -xzf whatsapp-node.tar.gz

# Create symlink or copy to n8n
mkdir -p ~/.n8n/custom/n8n-nodes-whatsapp
cp -r dist/* ~/.n8n/custom/n8n-nodes-whatsapp/
```

---

## 🐳 Option 4: Using Docker (Recommended for Production)

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy your project
COPY . .

# Install dependencies
RUN npm install

# Build the node
RUN npm run build

# Create n8n custom directory
RUN mkdir -p /root/.n8n/custom

# Copy built node to n8n
RUN cp -r dist /root/.n8n/custom/n8n-nodes-whatsapp

# Install n8n
RUN npm install -g n8n

# Expose port
EXPOSE 5678

# Start n8n
CMD ["n8n", "start"]
```

### Step 2: Build Docker Image

```bash
docker build -t n8n-whatsapp .
```

### Step 3: Run Docker Container

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/root/.n8n \
  n8n-whatsapp
```

---

## 📋 Detailed: Manual Setup on VPS (Step by Step)

### 1. SSH into your VPS

```bash
ssh user@your-vps-ip
# or if using key:
ssh -i /path/to/key.pem user@your-vps-ip
```

### 2. Create n8n Custom Nodes Directory

```bash
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
```

### 3. Option A: Clone from Git

```bash
git clone https://github.com/YOUR_USERNAME/n8n-whatsapp-button.git
cd n8n-whatsapp-button/n8n-whatsapp-button
npm install
npm run build
```

### Option B: Upload Files with SCP

**From your local machine:**

```bash
# Compress the project
tar -czf n8n-whatsapp.tar.gz n8n-whatsapp-button/

# Upload to VPS
scp n8n-whatsapp.tar.gz user@your-vps-ip:~/.n8n/custom/

# SSH back into VPS
ssh user@your-vps-ip

# Extract
cd ~/.n8n/custom
tar -xzf n8n-whatsapp.tar.gz
cd n8n-whatsapp-button/n8n-whatsapp-button

# Install and build
npm install
npm run build
```

### 4. Link to n8n

```bash
cd ~/.n8n/custom
npm link ./n8n-whatsapp-button/n8n-whatsapp-button
```

### 5. Restart n8n

```bash
# If n8n is running as systemd service:
sudo systemctl restart n8n

# Or if running manually:
# Kill the process
pkill -f "n8n start"

# Start again
n8n start
```

### 6. Verify Installation

Check n8n logs:
```bash
# If systemd:
sudo journalctl -u n8n -f

# Or check directly:
cat ~/.n8n/logs/n8n.log
```

Look for: `Loaded credentials: WhatsAppApi` and `Loaded nodes: WhatsApp`

---

## 🔐 Production Setup (Nginx + Systemd)

### Step 1: Create Systemd Service

Create `/etc/systemd/system/n8n.service`:

```ini
[Unit]
Description=n8n Workflow Automation
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/.n8n
ExecStart=/usr/local/bin/n8n start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

### Step 2: Enable Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n
```

### Step 3: Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/n8n`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Add SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check n8n is running
ps aux | grep n8n

# 2. Check port is listening
netstat -tlnp | grep 5678

# 3. Check log for loaded nodes
tail -100 ~/.n8n/logs/n8n.log | grep -i whatsapp

# 4. Curl the API
curl http://localhost:5678/api/v1/health

# 5. Open in browser
# Go to http://your-vps-ip:5678
# or https://your-domain.com (if Nginx+SSL setup)
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Node not loading** | Check `~/.n8n/logs/n8n.log` for errors |
| **Permission denied** | Use `sudo` or check file ownership |
| **npm: command not found** | Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **n8n: command not found** | Install globally: `npm install -g n8n` |
| **Port 5678 in use** | Change port: `N8N_PORT=8080 n8n start` |
| **Can't connect** | Check firewall: `sudo ufw allow 5678` |

---

## 📝 Quick Summary

**Local → VPS Deployment:**

1. Build locally: `npm run build`
2. Upload `dist/` folder to VPS: `~/.n8n/custom/`
3. SSH into VPS
4. Create symlink or copy to n8n
5. Restart n8n
6. Verify in logs
7. Access at `http://your-vps-ip:5678`

---

## 🎯 After Deployment

Once running on VPS:

1. **Add WhatsApp Credential** - Same as local
2. **Create Workflows** - Same as local
3. **Set Triggers** - Use Webhook, Timer, etc.
4. **Monitor Logs** - `tail -f ~/.n8n/logs/n8n.log`

---

Need help with your VPS? Share:
- Your VPS OS (Ubuntu, CentOS, etc.)
- Current n8n version
- Any error messages from logs
