# 📊 MONITORING & ALERTING DEPLOYMENT GUIDE

## 📋 **OVERVIEW**

This guide provides comprehensive instructions for setting up enterprise-grade monitoring and alerting for the QuickBid platform, ensuring real-time visibility into system health, performance, and security.

---

## 🏗️ **MONITORING ARCHITECTURE**

### **1.1 Infrastructure Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │     Grafana     │    │  AlertManager  │
│   (Metrics)     │───▶│   (Dashboard)   │───▶│   (Alerting)    │
│   Port 9090     │    │   Port 3000     │    │   Port 9093     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐            ┌─────▼─────┐         ┌─────▼─────┐
    │  Node   │            │  Docker   │         │  Email/   │
    │Exporter │            │ Compose   │         │  Slack    │
    │ Port 9100│            │  Stack    │         │ Alerts    │
    └─────────┘            └───────────┘         └───────────┘
```

### **1.2 Monitoring Stack Components**

#### **Prometheus**
- **Role**: Metrics collection and storage
- **Port**: 9090
- **Retention**: 200 hours
- **Scrape Interval**: 15 seconds

#### **Grafana**
- **Role**: Visualization and dashboards
- **Port**: 3000
- **Database**: SQLite
- **Authentication**: Built-in

#### **AlertManager**
- **Role**: Alert routing and notification
- **Port**: 9093
- **Channels**: Email, Slack
- **Grouping**: By alert severity

---

## 📊 **PROMETHEUS CONFIGURATION**

### **2.1 Prometheus Setup**

#### **Install Prometheus**
```bash
# Using Docker (Recommended)
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /opt/quickbid/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v /var/lib/prometheus:/prometheus \
  prom/prometheus:latest

# Using Docker Compose
cd /opt/quickbid/monitoring
docker-compose up -d prometheus
```

#### **Prometheus Configuration**
```yaml
# /opt/quickbid/monitoring/prometheus/prometheus.yml
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

  # Database
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
```

### **2.2 Alert Rules Configuration**

#### **System Alerts**
```yaml
# /opt/quickbid/monitoring/prometheus/alert_rules.yml
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
```

---

## 📧 **ALERTMANAGER CONFIGURATION**

### **3.1 AlertManager Setup**

#### **Install AlertManager**
```bash
# Using Docker
docker run -d \
  --name alertmanager \
  -p 9093:9093 \
  -v /opt/quickbid/monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml \
  -v /var/lib/alertmanager:/alertmanager \
  prom/alertmanager:latest

# Using Docker Compose
cd /opt/quickbid/monitoring
docker-compose up -d alertmanager
```

#### **AlertManager Configuration**
```yaml
# /opt/quickbid/monitoring/alertmanager/alertmanager.yml
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
```

---

## 📊 **GRAFANA CONFIGURATION**

### **4.1 Grafana Setup**

#### **Install Grafana**
```bash
# Using Docker
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -v /opt/quickbid/monitoring/grafana.ini:/etc/grafana/grafana.ini \
  -v /var/lib/grafana:/var/lib/grafana \
  -e "GF_SECURITY_ADMIN_PASSWORD=quickbid123!" \
  grafana/grafana:latest

# Using Docker Compose
cd /opt/quickbid/monitoring
docker-compose up -d grafana
```

#### **Grafana Configuration**
```ini
# /opt/quickbid/monitoring/grafana/grafana.ini
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
```

### **4.2 Grafana Data Sources**

#### **Prometheus Data Source**
```yaml
# /opt/quickbid/monitoring/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### **4.3 Grafana Dashboards**

#### **System Overview Dashboard**
```json
{
  "dashboard": {
    "id": null,
    "title": "QuickBid System Overview",
    "tags": ["quickbid", "system"],
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
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

---

## 🐳 **DOCKER COMPOSE DEPLOYMENT**

### **5.1 Complete Stack Configuration**

#### **Docker Compose File**
```yaml
# /opt/quickbid/monitoring/docker-compose.yml
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
```

---

## 🔧 **APPLICATION METRICS**

### **6.1 Backend Metrics Integration**

#### **Prometheus Client Integration**
```typescript
// src/metrics/prometheus.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly activeConnections: Gauge<string>;

  constructor() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });
  }

  incrementHttpRequests(method: string, route: string, statusCode: string) {
    this.httpRequestsTotal.inc({ method, route, status_code });
  }

  observeHttpRequestDuration(method: string, route: string, statusCode: string, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code }, duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

#### **Metrics Middleware**
```typescript
// src/metrics/metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode.toString();

      this.prometheusService.incrementHttpRequests(method, route, statusCode);
      this.prometheusService.observeHttpRequestDuration(method, route, statusCode, duration);
    });

    next();
  }
}
```

---

## 📊 **CUSTOM METRICS**

### **7.1 Business Metrics**

#### **Auction Metrics**
```typescript
// src/metrics/auction.metrics.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class AuctionMetrics {
  private readonly auctionsCreated: Counter<string>;
  private readonly bidsPlaced: Counter<string>;
  private readonly auctionDuration: Histogram<string>;
  private readonly activeAuctions: Gauge<string>;

  constructor() {
    this.auctionsCreated = new Counter({
      name: 'auctions_created_total',
      help: 'Total number of auctions created',
      labelNames: ['category', 'seller_type'],
    });

    this.bidsPlaced = new Counter({
      name: 'bids_placed_total',
      help: 'Total number of bids placed',
      labelNames: ['auction_id', 'bidder_type'],
    });

    this.auctionDuration = new Histogram({
      name: 'auction_duration_seconds',
      help: 'Duration of auctions in seconds',
      labelNames: ['category'],
      buckets: [300, 600, 900, 1800, 3600, 7200, 14400],
    });

    this.activeAuctions = new Gauge({
      name: 'active_auctions_count',
      help: 'Number of active auctions',
      labelNames: ['category'],
    });
  }

  incrementAuctionsCreated(category: string, sellerType: string) {
    this.auctionsCreated.inc({ category, seller_type: sellerType });
  }

  incrementBidsPlaced(auctionId: string, bidderType: string) {
    this.bidsPlaced.inc({ auction_id: auctionId, bidder_type: bidderType });
  }

  observeAuctionDuration(category: string, duration: number) {
    this.auctionDuration.observe({ category }, duration);
  }

  setActiveAuctions(category: string, count: number) {
    this.activeAuctions.set({ category }, count);
  }
}
```

---

## 🔔 **ALERTING STRATEGIES**

### **8.1 Alert Routing**

#### **Critical Alerts**
```yaml
# Immediate notification for critical issues
- alert: QuickBidBackendDown
  expr: up{job="quickbid-backend"} == 0
  for: 1m
  labels:
    severity: critical
    team: platform
  annotations:
    summary: "QuickBid backend is down"
    description: "QuickBid backend has been down for more than 1 minute"
    runbook_url: "https://runbooks.quickbid.com/backend-down"
```

#### **Warning Alerts**
```yaml
# Warning alerts for performance issues
- alert: QuickBidAPIHighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="quickbid-backend"}[5m])) > 1
  for: 5m
  labels:
    severity: warning
    team: platform
  annotations:
    summary: "High API response time"
    description: "95th percentile response time is above 1 second"
    runbook_url: "https://runbooks.quickbid.com/high-response-time"
```

### **8.2 Alert Suppression**

#### **Maintenance Windows**
```yaml
# Suppress alerts during maintenance
- alert: SuppressMaintenance
  expr: maintenance_mode == 1
  for: 0m
  labels:
    severity: info
  annotations:
    summary: "Maintenance mode active"
    description: "Alerts are suppressed during maintenance"
```

---

## 📈 **PERFORMANCE MONITORING**

### **9.1 Application Performance Monitoring**

#### **Response Time Monitoring**
```typescript
// src/middleware/performance.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds

      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
      }

      // Add performance header
      res.setHeader('X-Response-Time', `${duration}ms`);
    });

    next();
  }
}
```

### **9.2 Database Performance**

#### **Database Query Monitoring**
```typescript
// src/metrics/database.metrics.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class DatabaseMetrics {
  private readonly dbQueriesTotal: Counter<string>;
  private readonly dbQueryDuration: Histogram<string>;

  constructor() {
    this.dbQueriesTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table'],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    });
  }

  incrementDbQueries(operation: string, table: string) {
    this.dbQueriesTotal.inc({ operation, table });
  }

  observeDbQueryDuration(operation: string, table: string, duration: number) {
    this.dbQueryDuration.observe({ operation, table }, duration);
  }
}
```

---

## 🔧 **LOGGING INTEGRATION**

### **10.1 Structured Logging**

#### **Log Configuration**
```typescript
// src/config/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

### **10.2 Log Aggregation**

#### **ELK Stack Integration**
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **11.1 Pre-Deployment**
- [ ] Docker and Docker Compose installed
- [ ] Monitoring directories created
- [ ] Prometheus configuration created
- [ ] AlertManager configuration created
- [ ] Grafana configuration created
- [ ] Alert rules defined
- [ ] Dashboards created
- [ ] Email/Slack integration configured

### **11.2 Post-Deployment**
- [ ] All monitoring services running
- [ ] Metrics being collected
- [ ] Alerts being triggered
- [ ] Dashboards displaying data
- [ ] Log aggregation working
- [ ] Performance monitoring active
- [ ] Backup procedures in place

---

## 🧪 **TESTING PROCEDURES**

### **12.1 Monitoring Tests**

#### **Service Health Tests**
```bash
# Test Prometheus
curl http://localhost:9090/-/healthy

# Test Grafana
curl http://localhost:3000/api/health

# Test AlertManager
curl http://localhost:9093/-/healthy

# Test Node Exporter
curl http://localhost:9100/metrics
```

#### **Alert Tests**
```bash
# Trigger test alert
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning"
    },
    "annotations": {
      "summary": "This is a test alert"
    }
  }]'
```

---

## 🔧 **TROUBLESHOOTING**

### **13.1 Common Issues**

#### **Prometheus Issues**
```bash
# Check Prometheus logs
docker logs quickbid-prometheus

# Check configuration
docker exec quickbid-prometheus promtool check config /etc/prometheus/prometheus.yml

# Check targets
curl http://localhost:9090/api/v1/targets
```

#### **Grafana Issues**
```bash
# Check Grafana logs
docker logs quickbid-grafana

# Check data source
curl -u admin:quickbid123! http://localhost:3000/api/datasources

# Check dashboard
curl -u admin:quickbid123! http://localhost:3000/api/dashboards
```

#### **AlertManager Issues**
```bash
# Check AlertManager logs
docker logs quickbid-alertmanager

# Check configuration
docker exec quickbid-alertmanager amtool check-config /etc/alertmanager/alertmanager.yml

# Check alerts
curl http://localhost:9093/api/v1/alerts
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **14.1 Monitoring Performance**

#### **Prometheus Optimization**
```yaml
# Optimize Prometheus configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'quickbid-production'
    replica: 'prometheus-1'

# Storage optimization
storage:
  tsdb:
    path: /prometheus
    retention.time: 200h
    retention.size: 10GB
```

#### **Grafana Optimization**
```ini
# Optimize Grafana performance
[server]
http_addr = 0.0.0.0
http_port = 3000
enforce_domain = true
domain = grafana.quickbid.com

[database]
type = sqlite3
path = /var/lib/grafana/grafana.db
cache_ttl = 60

[session]
provider = file
provider_config = sessions
session_life_time = 86400
```

---

## 🎯 **NEXT STEPS**

### **15.1 Immediate Actions**
1. **Deploy monitoring stack** to production
2. **Configure alert channels** (email, Slack)
3. **Create custom dashboards** for business metrics
4. **Set up log aggregation** with ELK stack
5. **Configure backup** for monitoring data

### **15.2 Long-term Planning**
1. **Implement distributed tracing** (Jaeger)
2. **Set up synthetic monitoring** (Pingdom)
3. **Implement chaos engineering** tests
4. **Create automated runbooks**
5. **Set up multi-region monitoring**

---

## 🚀 **MONITORING & ALERTING DEPLOYMENT READY**

**🎉 Monitoring and alerting deployment guide completed!**

**📊 Status: Ready for implementation**
**🎯 Next: Complete Week 2 deployment**
**🚀 Timeline: On track for Week 2 completion**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
