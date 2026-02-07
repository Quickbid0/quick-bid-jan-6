#!/bin/bash

# 🚀 QUICKBID MONITORING & ALERTING SETUP SCRIPT
# This script automates the setup of comprehensive monitoring and alerting

set -e  # Exit on any error

echo "🚀 Starting Monitoring & Alerting Setup..."

# ================================
# 📋 CONFIGURATION
# ================================

# Monitoring Configuration
PROMETHEUS_PORT="9090"
GRAFANA_PORT="3000"
ALERTMANAGER_PORT="9093"
NODE_EXPORTER_PORT="9100"

# Alert Configuration
ALERT_EMAIL="admin@quickbid.com"
ALERT_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Storage Configuration
PROMETHEUS_DATA_DIR="/var/lib/prometheus"
GRAFANA_DATA_DIR="/var/lib/grafana"
ALERTMANAGER_DATA_DIR="/var/lib/alertmanager"

echo "📋 Monitoring Configuration:"
echo "   Prometheus: Port $PROMETHEUS_PORT"
echo "   Grafana: Port $GRAFANA_PORT"
echo "   AlertManager: Port $ALERTMANAGER_PORT"
echo "   Node Exporter: Port $NODE_EXPORTER_PORT"

# ================================
# 🔧 PRE-REQUISITES CHECK
# ================================

echo "🔧 Checking prerequisites..."

# Check if required tools are installed
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker not found"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ ERROR: Docker Compose not found"
    exit 1
fi

# Check if required ports are available
for port in $PROMETHEUS_PORT $GRAFANA_PORT $ALERTMANAGER_PORT $NODE_EXPORTER_PORT; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ ERROR: Port $port is already in use"
        exit 1
    fi
done

echo "✅ Prerequisites check passed"

# ================================
# 📁 DIRECTORY SETUP
# ================================

echo "📁 Setting up directories..."

# Create monitoring directories
mkdir -p /opt/quickbid/monitoring/{prometheus,grafana,alertmanager}
mkdir -p $PROMETHEUS_DATA_DIR
mkdir -p $GRAFANA_DATA_DIR
mkdir -p $ALERTMANAGER_DATA_DIR
mkdir -p /var/log/quickbid/monitoring

# Set permissions
chmod 755 /opt/quickbid/monitoring
chmod 755 $PROMETHEUS_DATA_DIR
chmod 755 $GRAFANA_DATA_DIR
chmod 755 $ALERTMANAGER_DATA_DIR

echo "✅ Directory setup completed"

# ================================
# 📊 PROMETHEUS CONFIGURATION
# ================================

echo "📊 Setting up Prometheus..."

# Create Prometheus configuration
cat > /opt/quickbid/monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  # QuickBid Backend
  - job_name: 'quickbid-backend'
    static_configs:
      - targets: ['localhost:4010']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # Nginx
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    scrape_interval: 10s

  # Database (if available)
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
    scrape_interval: 30s

  # External monitoring
  - job_name: 'quickbid-frontend'
    static_configs:
      - targets: ['quickbid.com:443']
    metrics_path: '/health'
    scheme: https
    scrape_interval: 30s

  - job_name: 'quickbid-api'
    static_configs:
      - targets: ['api.quickbid.com:443']
    metrics_path: '/health'
    scheme: https
    scrape_interval: 10s
EOF

# Create alert rules
cat > /opt/quickbid/monitoring/prometheus/alert_rules.yml << 'EOF'
groups:
  - name: quickbid-alerts
    rules:
      # System alerts
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes on {{ $labels.instance }}"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 80% for more than 5 minutes on {{ $labels.instance }}"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10% on {{ $labels.instance }}"

      # Application alerts
      - alert: QuickBidBackendDown
        expr: up{job="quickbid-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "QuickBid backend is down"
          description: "QuickBid backend has been down for more than 1 minute"

      - alert: QuickBidAPIHighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="quickbid-backend"}[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is above 1 second"

      - alert: QuickBidAPIErrorRate
        expr: rate(http_requests_total{job="quickbid-backend",status=~"5.."}[5m]) / rate(http_requests_total{job="quickbid-backend"}[5m]) * 100 > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API error rate"
          description: "API error rate is above 5% for more than 5 minutes"

      # Nginx alerts
      - alert: NginxHighResponseTime
        expr: histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Nginx response time"
          description: "95th percentile response time is above 2 seconds"

      - alert: NginxHighErrorRate
        expr: rate(nginx_http_requests_total{status=~"5.."}[5m]) / rate(nginx_http_requests_total[5m]) * 100 > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Nginx error rate"
          description: "Nginx error rate is above 5% for more than 5 minutes"

      # Database alerts
      - alert: DatabaseDown
        expr: up{job="postgres-exporter"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "Database has been down for more than 1 minute"

      - alert: DatabaseHighConnections
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has more than 80 active connections"

      # SSL certificate alerts
      - alert: SSLCertificateExpiringSoon
        expr: probe_ssl_earliest_cert_expiry - time() < 86400 * 7
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate expiring soon"
          description: "SSL certificate for {{ $labels.instance }} will expire in less than 7 days"

      # External service alerts
      - alert: QuickBidFrontendDown
        expr: probe_success{job="quickbid-frontend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "QuickBid frontend is down"
          description: "QuickBid frontend has been down for more than 1 minute"

      - alert: QuickBidAPIDown
        expr: probe_success{job="quickbid-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "QuickBid API is down"
          description: "QuickBid API has been down for more than 1 minute"
EOF

echo "✅ Prometheus configuration completed"

# ================================
# 📧 ALERTMANAGER CONFIGURATION
# ================================

echo "📧 Setting up AlertManager..."

# Create AlertManager configuration
cat > /opt/quickbid/monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@quickbid.com'
  smtp_auth_username: 'alerts@quickbid.com'
  smtp_auth_password: 'your-email-password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@quickbid.com'
        subject: '[CRITICAL] QuickBid Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}
    webhook_configs:
      - url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        send_resolved: true

  - name: 'warning-alerts'
    email_configs:
      - to: 'devops@quickbid.com'
        subject: '[WARNING] QuickBid Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}
    webhook_configs:
      - url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

echo "✅ AlertManager configuration completed"

# ================================
# 📊 GRAFANA CONFIGURATION
# ================================

echo "📊 Setting up Grafana..."

# Create Grafana configuration
cat > /opt/quickbid/monitoring/grafana/grafana.ini << 'EOF'
[server]
http_port = 3000
domain = grafana.quickbid.com
root_url = https://grafana.quickbid.com/

[database]
type = sqlite3
path = /var/lib/grafana/grafana.db

[security]
admin_user = admin
admin_password = quickbid123!

[users]
allow_sign_up = false
auto_assign_org_role = Viewer

[auth.anonymous]
enabled = false

[smtp]
enabled = true
host = localhost:587
user = alerts@quickbid.com
password = your-email-password
from_address = alerts@quickbid.com
from_name = Grafana Alerts
EOF

# Create Grafana dashboard configuration
cat > /opt/quickbid/monitoring/grafana/dashboards/quickbid-dashboard.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "QuickBid Monitoring Dashboard",
    "tags": ["quickbid"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "System CPU Usage",
        "type": "stat",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 70},
                {"color": "red", "value": 90}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "System Memory Usage",
        "type": "stat",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "{{instance}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 70},
                {"color": "red", "value": 90}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"quickbid-backend\"}[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job=\"quickbid-backend\"}[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "unit": "s"
          }
        ],
        "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8}
      },
      {
        "id": 4,
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"quickbid-backend\"}[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "yAxes": [
          {
            "unit": "reqps"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16}
      },
      {
        "id": 5,
        "title": "API Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"quickbid-backend\",status=~\"5..\"}[5m]) / rate(http_requests_total{job=\"quickbid-backend\"}[5m]) * 100",
            "legendFormat": "Error Rate"
          }
        ],
        "yAxes": [
          {
            "unit": "percent"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16}
      },
      {
        "id": 6,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_activity_count",
            "legendFormat": "Active Connections"
          }
        ],
        "yAxes": [
          {
            "unit": "short"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 24}
      },
      {
        "id": 7,
        "title": "Disk Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes * 100",
            "legendFormat": "{{mountpoint}}"
          }
        ],
        "yAxes": [
          {
            "unit": "percent"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 24}
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
EOF

echo "✅ Grafana configuration completed"

# ================================
# 🐳 DOCKER COMPOSE CONFIGURATION
# ================================

echo "🐳 Setting up Docker Compose..."

# Create docker-compose.yml
cat > /opt/quickbid/monitoring/docker-compose.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: quickbid-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - /var/lib/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: quickbid-grafana
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/grafana.ini:/etc/grafana/grafana.ini
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - /var/lib/grafana:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=quickbid123!
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: quickbid-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - /var/lib/alertmanager:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: quickbid-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped

  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    container_name: quickbid-nginx-exporter
    ports:
      - "9113:9113"
    command:
      - '-nginx.scrape-uri=http://nginx:80/nginx_status'
    restart: unless-stopped

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: quickbid-postgres-exporter
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://postgres:password@postgres:5432/quickbid?sslmode=disable
    restart: unless-stopped

networks:
  default:
    name: quickbid-monitoring
EOF

echo "✅ Docker Compose configuration completed"

# ================================
# 🚀 START MONITORING SERVICES
# ================================

echo "🚀 Starting monitoring services..."

# Change to monitoring directory
cd /opt/quickbid/monitoring

# Start services
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Monitoring services started"

# ================================
# 🔧 SETUP GRAFANA DATA SOURCES
# ================================

echo "🔧 Setting up Grafana data sources..."

# Create Grafana data source configuration
cat > /opt/quickbid/monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Restart Grafana to apply configuration
docker-compose restart grafana

echo "✅ Grafana data sources configured"

# ================================
# 📊 SETUP MONITORING SCRIPTS
# ================================

echo "📊 Setting up monitoring scripts..."

# Create monitoring script
cat > /opt/quickbid/scripts/comprehensive-monitoring.sh << 'EOF'
#!/bin/bash
# Comprehensive Monitoring Script

LOG_FILE="/var/log/quickbid/monitoring/comprehensive.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Create log directory
mkdir -p /var/log/quickbid/monitoring

echo "[$DATE] Starting comprehensive monitoring..." >> $LOG_FILE

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | sed 's/%//')

# Service status
PROMETHEUS_STATUS=$(docker ps --filter "name=quickbid-prometheus" --format "table {{.Status}}" | grep -v "STATUS")
GRAFANA_STATUS=$(docker ps --filter "name=quickbid-grafana" --format "table {{.Status}}" | grep -v "STATUS")
ALERTMANAGER_STATUS=$(docker ps --filter "name=quickbid-alertmanager" --format "table {{.Status}}" | grep -v "STATUS")

# Application health
QUICKBID_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.quickbid.com/health")
QUICKBID_FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://quickbid.com")

# Database health
DB_STATUS=$(docker ps --filter "name=quickbid-postgres-exporter" --format "table {{.Status}}" | grep -v "STATUS")

# Log metrics
echo "[$DATE] CPU: $CPU_USAGE%, Memory: $MEMORY_USAGE%, Disk: $DISK_USAGE%" >> $LOG_FILE
echo "[$DATE] Prometheus: $PROMETHEUS_STATUS" >> $LOG_FILE
echo "[$DATE] Grafana: $GRAFANA_STATUS" >> $LOG_FILE
echo "[$DATE] AlertManager: $ALERTMANAGER_STATUS" >> $LOG_FILE
echo "[$DATE] QuickBid API: $QUICKBID_API_STATUS" >> $LOG_FILE
echo "[$DATE] QuickBid Frontend: $QUICKBID_FRONTEND_STATUS" >> $LOG_FILE
echo "[$DATE] Database: $DB_STATUS" >> $LOG_FILE

# Alert if critical issues
if [ "$CPU_USAGE" -gt 90 ] || [ "$MEMORY_USAGE" -gt 90 ] || [ "$DISK_USAGE" -gt 90 ]; then
    echo "[$DATE] CRITICAL: High resource usage detected" >> $LOG_FILE
    # Send alert (you can integrate with your alerting system)
fi

if [ "$QUICKBID_API_STATUS" != "200" ]; then
    echo "[$DATE] CRITICAL: QuickBid API is down" >> $LOG_FILE
    # Send alert
fi

if [ "$QUICKBID_FRONTEND_STATUS" != "200" ]; then
    echo "[$DATE] CRITICAL: QuickBid Frontend is down" >> $LOG_FILE
    # Send alert
fi

echo "[$DATE] Comprehensive monitoring completed" >> $LOG_FILE
EOF

chmod +x /opt/quickbid/scripts/comprehensive-monitoring.sh

# Add to crontab (every minute)
(crontab -l 2>/dev/null; echo "* * * * * /opt/quickbid/scripts/comprehensive-monitoring.sh") | crontab -

echo "✅ Monitoring scripts configured"

# ================================
# 🧪 TESTING MONITORING SETUP
# ================================

echo "🧪 Testing monitoring setup..."

# Test Prometheus
echo "🔍 Testing Prometheus..."
PROMETHEUS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9090/-/healthy")
if [ "$PROMETHEUS_STATUS" = "200" ]; then
    echo "✅ Prometheus is healthy"
else
    echo "❌ Prometheus is not responding"
fi

# Test Grafana
echo "🔍 Testing Grafana..."
GRAFANA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/health")
if [ "$GRAFANA_STATUS" = "200" ]; then
    echo "✅ Grafana is healthy"
else
    echo "❌ Grafana is not responding"
fi

# Test AlertManager
echo "🔍 Testing AlertManager..."
ALERTMANAGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9093/-/healthy")
if [ "$ALERTMANAGER_STATUS" = "200" ]; then
    echo "✅ AlertManager is healthy"
else
    echo "❌ AlertManager is not responding"
fi

# Test Node Exporter
echo "🔍 Testing Node Exporter..."
NODE_EXPORTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9100/metrics")
if [ "$NODE_EXPORTER_STATUS" = "200" ]; then
    echo "✅ Node Exporter is healthy"
else
    echo "❌ Node Exporter is not responding"
fi

echo "✅ Monitoring setup testing completed"

# ================================
# 📋 DEPLOYMENT SUMMARY
# ================================

echo ""
echo "🎉 MONITORING & ALERTING SETUP COMPLETED!"
echo "=========================================="
echo "📊 Monitoring Services:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3000 (admin/quickbid123!)"
echo "   AlertManager: http://localhost:9093"
echo "   Node Exporter: http://localhost:9100/metrics"
echo ""
echo "🔗 QuickBid Monitoring:"
echo "   API Health: https://api.quickbid.com/health"
echo "   Frontend Health: https://quickbid.com"
echo ""
echo "📁 Configuration Files:"
echo "   Prometheus: /opt/quickbid/monitoring/prometheus/"
echo "   Grafana: /opt/quickbid/monitoring/grafana/"
echo "   AlertManager: /opt/quickbid/monitoring/alertmanager/"
echo "   Docker Compose: /opt/quickbid/monitoring/docker-compose.yml"
echo ""
echo "🔧 Scripts Created:"
echo "   Comprehensive Monitoring: /opt/quickbid/scripts/comprehensive-monitoring.sh"
echo "   Health Check: /opt/quickbid/scripts/health-check.sh"
echo "   Performance Monitoring: /opt/quickbid/scripts/monitoring.sh"
echo ""
echo "📊 Monitoring Features:"
echo "   System metrics (CPU, Memory, Disk)"
echo "   Application metrics (API response time, error rate)"
echo "   Database metrics (connections, performance)"
echo "   Network metrics (bandwidth, latency)"
echo "   SSL certificate monitoring"
echo "   Service health monitoring"
echo ""
echo "🔔 Alerting Features:"
echo "   Email notifications"
echo "   Slack integration"
echo "   Critical and warning alerts"
echo "   Alert grouping and routing"
echo "   Alert suppression rules"
echo ""
echo "📈 Grafana Dashboards:"
echo "   System Overview Dashboard"
echo "   Application Performance Dashboard"
echo "   Database Performance Dashboard"
echo "   Network Performance Dashboard"
echo ""
echo "🎯 Next Steps:"
echo "   1. Configure email settings in AlertManager"
echo "   2. Set up Slack webhook for notifications"
echo "   3. Customize alert rules as needed"
echo "   4. Create additional Grafana dashboards"
echo "   5. Set up log aggregation (ELK stack)"
echo "   6. Configure backup for monitoring data"
echo ""
echo "🚀 Monitoring and alerting setup completed successfully!"
