#!/bin/bash

# QuickMela Production Monitoring Setup
# Configure CloudWatch, Grafana, and AI-specific monitoring

set -e

# Configuration
APP_NAME="quickmela"
ENVIRONMENT="production"
REGION="us-east-1"
CLUSTER_NAME="$APP_NAME-cluster"
SERVICE_NAME="$APP_NAME-backend-service"
WORKER_SERVICE_NAME="$APP_NAME-worker-service"
LOG_GROUP_NAME="/ecs/$APP_NAME-backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_ai() {
    echo -e "${PURPLE}[AI]${NC} $1"
}

# Create CloudWatch log groups
create_log_groups() {
    log_info "Creating CloudWatch log groups..."

    aws logs create-log-group \
        --log-group-name "/ecs/$APP_NAME-backend" \
        --region $REGION || true

    aws logs create-log-group \
        --log-group-name "/ecs/$APP_NAME-worker" \
        --region $REGION || true

    aws logs create-log-group \
        --log-group-name "/ecs/$APP_NAME-monitoring" \
        --region $REGION || true

    log_success "CloudWatch log groups created"
}

# Create CloudWatch alarms
create_cloudwatch_alarms() {
    log_info "Creating CloudWatch alarms..."

    # Backend service alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-backend-health" \
        --alarm-description "Backend service health check failed" \
        --metric-name "HealthyHostCount" \
        --namespace "AWS/ApplicationELB" \
        --statistic "Average" \
        --period 300 \
        --threshold 1 \
        --comparison-operator "LessThanThreshold" \
        --dimensions "Name=LoadBalancer,Value=$APP_NAME-alb" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-backend-high-cpu" \
        --alarm-description "Backend CPU usage is high" \
        --metric-name "CPUUtilization" \
        --namespace "AWS/ECS" \
        --statistic "Average" \
        --period 300 \
        --threshold 80 \
        --comparison-operator "GreaterThanThreshold" \
        --dimensions "Name=ClusterName,Value=$CLUSTER_NAME" "Name=ServiceName,Value=$SERVICE_NAME" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-backend-high-memory" \
        --alarm-description "Backend memory usage is high" \
        --metric-name "MemoryUtilization" \
        --namespace "AWS/ECS" \
        --statistic "Average" \
        --period 300 \
        --threshold 85 \
        --comparison-operator "GreaterThanThreshold" \
        --dimensions "Name=ClusterName,Value=$CLUSTER_NAME" "Name=ServiceName,Value=$SERVICE_NAME" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-backend-high-error-rate" \
        --alarm-description "Backend error rate is high" \
        --metric-name "HTTPCode_Target_5XX_Count" \
        --namespace "AWS/ApplicationELB" \
        --statistic "Sum" \
        --period 300 \
        --threshold 10 \
        --comparison-operator "GreaterThanThreshold" \
        --dimensions "Name=LoadBalancer,Value=$APP_NAME-alb" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    # Database alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-db-high-cpu" \
        --alarm-description "Database CPU usage is high" \
        --metric-name "CPUUtilization" \
        --namespace "AWS/RDS" \
        --statistic "Average" \
        --period 300 \
        --threshold 80 \
        --comparison-operator "GreaterThanThreshold" \
        --dimensions "Name=DBInstanceIdentifier,Value=$APP_NAME-postgres" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    # AI-specific alarms
    log_ai "Creating AI-specific alarms..."

    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-ai-face-recognition-down" \
        --alarm-description "AI Face Recognition system is down" \
        --metric-name "FaceRecognitionErrors" \
        --namespace "QuickMela/AI" \
        --statistic "Sum" \
        --period 300 \
        --threshold 5 \
        --comparison-operator "GreaterThanThreshold" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-ai-fraud-high-error-rate" \
        --alarm-description "AI Fraud Detection error rate is high" \
        --metric-name "FraudDetectionErrors" \
        --namespace "QuickMela/AI" \
        --statistic "Sum" \
        --period 300 \
        --threshold 10 \
        --comparison-operator "GreaterThanThreshold" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-ai-low-accuracy" \
        --alarm-description "AI recommendation accuracy is low" \
        --metric-name "RecommendationAccuracy" \
        --namespace "QuickMela/AI" \
        --statistic "Average" \
        --period 3600 \
        --threshold 70 \
        --comparison-operator "LessThanThreshold" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    log_success "CloudWatch alarms created"
}

# Create CloudWatch dashboard
create_cloudwatch_dashboard() {
    log_info "Creating CloudWatch dashboard..."

    DASHBOARD_BODY=$(cat <<EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/ECS", "CPUUtilization", "ClusterName", "$CLUSTER_NAME", "ServiceName", "$SERVICE_NAME"],
                    [".", "MemoryUtilization", ".", ".", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "ECS Service Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "$APP_NAME-alb"],
                    [".", "HTTPCode_Target_2XX_Count", ".", "."],
                    [".", "HTTPCode_Target_4XX_Count", ".", "."],
                    [".", "HTTPCode_Target_5XX_Count", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Application Load Balancer Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "$APP_NAME-postgres"],
                    [".", "DatabaseConnections", ".", "."],
                    [".", "FreeStorageSpace", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Database Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 6,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["QuickMela/AI", "FaceRecognitionAccuracy"],
                    [".", "FraudDetectionAccuracy"],
                    [".", "RecommendationAccuracy"],
                    [".", "VoiceBiddingAccuracy"]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "AI System Performance",
                "period": 3600
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 12,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["QuickMela/Business", "UserRegistrations"],
                    [".", "ActiveAuctions"],
                    [".", "CompletedTransactions"],
                    [".", "Revenue"]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Business Metrics",
                "period": 3600
            }
        },
        {
            "type": "log",
            "x": 12,
            "y": 12,
            "width": 12,
            "height": 6,
            "properties": {
                "query": "SOURCE '$LOG_GROUP_NAME' | fields @timestamp, @message | sort @timestamp desc | limit 100",
                "region": "$REGION",
                "title": "Recent Application Logs",
                "view": "table"
            }
        }
    ]
}
EOF
)

    aws cloudwatch put-dashboard \
        --dashboard-name "$APP_NAME-dashboard" \
        --dashboard-body "$DASHBOARD_BODY" \
        --region $REGION

    log_success "CloudWatch dashboard created"
}

# Setup custom AI metrics
setup_ai_metrics() {
    log_ai "Setting up AI-specific custom metrics..."

    # This would typically involve setting up custom metric filters
    # or using AWS Lambda to publish custom metrics

    log_info "Creating metric filters for AI performance..."

    # Create metric filter for AI errors
    aws logs put-metric-filter \
        --log-group-name "/ecs/$APP_NAME-backend" \
        --filter-name "AI-Face-Recognition-Errors" \
        --filter-pattern "[timestamp, level, message, ...] message =~ \"face.*recognition.*error\"" \
        --metric-transformations '[
            {
                "metricName": "FaceRecognitionErrors",
                "metricNamespace": "QuickMela/AI",
                "metricValue": "1",
                "defaultValue": 0
            }
        ]' \
        --region $REGION

    aws logs put-metric-filter \
        --log-group-name "/ecs/$APP_NAME-backend" \
        --filter-name "AI-Fraud-Detection-Errors" \
        --filter-pattern "[timestamp, level, message, ...] message =~ \"fraud.*detection.*error\"" \
        --metric-transformations '[
            {
                "metricName": "FraudDetectionErrors",
                "metricNamespace": "QuickMela/AI",
                "metricValue": "1",
                "defaultValue": 0
            }
        ]' \
        --region $REGION

    log_success "AI custom metrics configured"
}

# Setup SNS for alerts
setup_sns_alerts() {
    log_info "Setting up SNS for alerts..."

    # Create SNS topic for alerts
    TOPIC_ARN=$(aws sns create-topic \
        --name "$APP_NAME-alerts" \
        --region $REGION \
        --query "TopicArn" \
        --output text)

    log_success "SNS topic created: $TOPIC_ARN"

    # Subscribe email to alerts (you'll need to provide email)
    read -p "Enter email for alerts: " ALERT_EMAIL
    if [ -n "$ALERT_EMAIL" ]; then
        aws sns subscribe \
            --topic-arn "$TOPIC_ARN" \
            --protocol email \
            --notification-endpoint "$ALERT_EMAIL" \
            --region $REGION
        log_info "Alert email subscription created. Please confirm the subscription email."
    fi

    echo "$TOPIC_ARN"
}

# Setup X-Ray for distributed tracing
setup_xray() {
    log_info "Setting up AWS X-Ray for distributed tracing..."

    # Create X-Ray group
    aws xray create-group \
        --group-name "$APP_NAME-tracing" \
        --filter-expression "service(\"$APP_NAME-backend\")" \
        --region $REGION

    log_success "X-Ray tracing configured"
}

# Setup backup monitoring
setup_backup_monitoring() {
    log_info "Setting up backup monitoring..."

    # Create alarms for backup failures
    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-backup-failed" \
        --alarm-description "Database backup has failed" \
        --metric-name "FailedBackups" \
        --namespace "QuickMela/Backup" \
        --statistic "Sum" \
        --period 86400 \
        --threshold 0 \
        --comparison-operator "GreaterThanThreshold" \
        --region $REGION \
        --alarm-actions "arn:aws:sns:$REGION:$(aws sts get-caller-identity --query Account --output text):$APP_NAME-alerts"

    log_success "Backup monitoring configured"
}

# Main function
main() {
    echo "📊 QUICKMELA PRODUCTION MONITORING SETUP"
    echo "=========================================="
    echo "Environment: $ENVIRONMENT"
    echo "Region: $REGION"
    echo "Cluster: $CLUSTER_NAME"
    echo ""

    create_log_groups
    create_cloudwatch_alarms
    create_cloudwatch_dashboard
    setup_ai_metrics
    TOPIC_ARN=$(setup_sns_alerts)
    setup_xray
    setup_backup_monitoring

    echo ""
    echo "🎉 PRODUCTION MONITORING SETUP COMPLETED!"
    echo ""
    echo "📊 Monitoring URLs:"
    echo "   CloudWatch Dashboard: https://$REGION.console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=$APP_NAME-dashboard"
    echo "   ECS Cluster: https://$REGION.console.aws.amazon.com/ecs/home?region=$REGION#/clusters/$CLUSTER_NAME/services"
    echo "   CloudWatch Logs: https://$REGION.console.aws.amazon.com/cloudwatch/home?region=$REGION#logsV2:log-groups/log-group/\$252Fecs\$252F$APP_NAME-backend"
    echo "   X-Ray: https://$REGION.console.aws.amazon.com/xray/home?region=$REGION#/groups/$APP_NAME-tracing"
    echo ""
    echo "🚨 Alert Configuration:"
    echo "   SNS Topic: $TOPIC_ARN"
    echo "   Active Alarms: 8 CloudWatch alarms configured"
    echo ""
    echo "🤖 AI Monitoring:"
    echo "   Face Recognition accuracy tracking"
    echo "   Fraud Detection performance monitoring"
    echo "   Recommendation accuracy metrics"
    echo "   Voice bidding success rates"
    echo ""
    echo "Next steps:"
    echo "1. Verify dashboard displays correctly"
    echo "2. Test alert notifications"
    echo "3. Configure Grafana (optional)"
    echo "4. Set up PagerDuty/Slack integrations"
    echo "5. Create runbooks for common alerts"
    echo ""
    echo "📈 QuickMela Production Monitoring Active!"
}

# Run main function
main "$@"
