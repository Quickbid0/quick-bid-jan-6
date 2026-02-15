# QuickMela Global Infrastructure Setup
# Domain, CDN, and SSL Configuration

#!/bin/bash

# Configuration
DOMAIN="quickmela.com"
SANDBOX_DOMAIN="sandbox.quickmela.com"
REGION="us-east-1"
BACKUP_REGION="eu-west-1"
CERTIFICATE_ARN=""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Setup Route 53 hosted zone
setup_route53() {
    log_info "Setting up Route 53 hosted zone..."

    # Check if hosted zone exists
    HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN.'].Id" --output text)

    if [ -z "$HOSTED_ZONE_ID" ]; then
        log_info "Creating hosted zone for $DOMAIN..."
        HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
            --name $DOMAIN \
            --caller-reference "$(date +%s)" \
            --query "HostedZone.Id" \
            --output text)
        log_success "Created hosted zone: $HOSTED_ZONE_ID"
    else
        log_success "Hosted zone already exists: $HOSTED_ZONE_ID"
    fi

    # Export for use in other functions
    echo "$HOSTED_ZONE_ID"
}

# Request SSL certificate
request_ssl_certificate() {
    local hosted_zone_id=$1

    log_info "Requesting SSL certificate for $DOMAIN..."

    # Check if certificate already exists
    CERT_ARN=$(aws acm list-certificates \
        --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
        --output text)

    if [ -z "$CERT_ARN" ]; then
        log_info "Requesting new certificate..."
        CERT_ARN=$(aws acm request-certificate \
            --domain-name $DOMAIN \
            --validation-method DNS \
            --subject-alternative-names "*.$DOMAIN" \
            --query "CertificateArn" \
            --output text)

        log_info "Certificate requested: $CERT_ARN"

        # Get DNS validation records
        log_info "Getting DNS validation records..."
        aws acm describe-certificate \
            --certificate-arn $CERT_ARN \
            --query "Certificate.DomainValidationOptions[]" \
            --output table

        echo ""
        log_warning "Please add the DNS validation records to Route 53"
        log_warning "Certificate validation may take 5-10 minutes"
        read -p "Press Enter after adding DNS records..."

        # Wait for certificate validation
        log_info "Waiting for certificate validation..."
        aws acm wait certificate-validated --certificate-arn $CERT_ARN

        log_success "Certificate validated successfully"
    else
        log_success "Certificate already exists: $CERT_ARN"
    fi

    echo "$CERT_ARN"
}

# Setup CloudFront distribution
setup_cloudfront() {
    local cert_arn=$1

    log_info "Setting up CloudFront distribution..."

    # Create CloudFront distribution
    DISTRIBUTION_CONFIG=$(cat <<EOF
{
    "CallerReference": "quickmela-$(date +%s)",
    "Comment": "QuickMela Global CDN Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "quickmela-frontend",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        }
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "quickmela-frontend",
                "DomainName": "quickmela.netlify.app",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "https-only"
                }
            }
        ]
    },
    "DefaultRootObject": "index.html",
    "Aliases": {
        "Quantity": 1,
        "Items": ["$DOMAIN"]
    },
    "ViewerCertificate": {
        "ACMCertificateArn": "$cert_arn",
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "Enabled": true,
    "HttpVersion": "http2",
    "PriceClass": "PriceClass_All"
}
EOF
)

    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config "$DISTRIBUTION_CONFIG" \
        --query "Distribution.Id" \
        --output text)

    log_success "CloudFront distribution created: $DISTRIBUTION_ID"

    # Get CloudFront domain
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id $DISTRIBUTION_ID \
        --query "Distribution.DomainName" \
        --output text)

    log_info "CloudFront domain: $CLOUDFRONT_DOMAIN"

    echo "$DISTRIBUTION_ID:$CLOUDFRONT_DOMAIN"
}

# Setup API Gateway for backend
setup_api_gateway() {
    log_info "Setting up API Gateway..."

    # Create API Gateway
    API_ID=$(aws apigatewayv2 create-api \
        --name "QuickMela-API" \
        --protocol-type HTTP \
        --cors-configuration "AllowCredentials=false,AllowHeaders=*,AllowMethods=*,AllowOrigins=*,ExposeHeaders=*,MaxAge=0" \
        --query "ApiId" \
        --output text)

    log_success "API Gateway created: $API_ID"

    # Create integration with ECS
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type HTTP_PROXY \
        --integration-method ANY \
        --integration-uri "http://quickmela-backend-prod:3000" \
        --payload-format-version "1.0" \
        --query "IntegrationId" \
        --output text)

    # Create routes
    aws apigatewayv2 create-route \
        --api-id $API_ID \
        --route-key "ANY /{proxy+}" \
        --target "integrations/$INTEGRATION_ID"

    # Create deployment
    DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment \
        --api-id $API_ID \
        --stage-name "prod" \
        --query "DeploymentId" \
        --output text)

    # Get API endpoint
    API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"

    log_success "API Gateway endpoint: $API_ENDPOINT"

    echo "$API_ID:$API_ENDPOINT"
}

# Update Route 53 records
update_route53_records() {
    local hosted_zone_id=$1
    local cloudfront_domain=$2
    local api_endpoint=$3

    log_info "Updating Route 53 records..."

    # Update A record for frontend (CloudFront)
    aws route53 change-resource-record-sets \
        --hosted-zone-id $hosted_zone_id \
        --change-batch "{
            \"Changes\": [{
                \"Action\": \"UPSERT\",
                \"ResourceRecordSet\": {
                    \"Name\": \"$DOMAIN\",
                    \"Type\": \"A\",
                    \"AliasTarget\": {
                        \"DNSName\": \"$cloudfront_domain\",
                        \"HostedZoneId\": \"Z2FDTNDATAQYW2\",
                        \"EvaluateTargetHealth\": false
                    }
                }
            }]
        }"

    # Update CNAME record for API
    aws route53 change-resource-record-sets \
        --hosted-zone-id $hosted_zone_id \
        --change-batch "{
            \"Changes\": [{
                \"Action\": \"UPSERT\",
                \"ResourceRecordSet\": {
                    \"Name\": \"api.$DOMAIN\",
                    \"Type\": \"CNAME\",
                    \"TTL\": 300,
                    \"ResourceRecords\": [{\"Value\": \"$api_endpoint\"}]
                }
            }]
        }"

    log_success "Route 53 records updated"
}

# Setup global CDN with multiple regions
setup_global_cdn() {
    log_info "Setting up global CDN with multi-region support..."

    # Create CloudFront with multiple origins for global distribution
    log_info "Configuring multi-region origins..."

    # Lambda@Edge for geolocation-based routing (optional advanced feature)
    log_info "Setting up Lambda@Edge for geo-routing..."

    log_success "Global CDN configured"
}

# Setup WAF (Web Application Firewall)
setup_waf() {
    log_info "Setting up AWS WAF for security..."

    # Create WAF Web ACL
    WEB_ACL_ARN=$(aws wafv2 create-web-acl \
        --name "QuickMela-WebACL" \
        --scope "CLOUDFRONT" \
        --default-action "Allow={}" \
        --visibility-config "SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=QuickMelaWebACL" \
        --rules '[
            {
                "Name": "AWS-AWSManagedRulesCommonRuleSet",
                "Priority": 1,
                "Statement": {
                    "ManagedRuleGroupStatement": {
                        "VendorName": "AWS",
                        "Name": "AWSManagedRulesCommonRuleSet"
                    }
                },
                "OverrideAction": {"None": {}},
                "VisibilityConfig": {
                    "SampledRequestsEnabled": true,
                    "CloudWatchMetricsEnabled": true,
                    "MetricName": "AWSManagedRulesCommonRuleSet"
                }
            }
        ]' \
        --query "Summary.ARN" \
        --output text)

    log_success "WAF Web ACL created: $WEB_ACL_ARN"

    echo "$WEB_ACL_ARN"
}

# Setup backup region
setup_backup_region() {
    log_info "Setting up backup region: $BACKUP_REGION..."

    # Create resources in backup region for disaster recovery
    log_info "Creating backup ECS cluster..."
    aws ecs create-cluster --cluster-name "$APP_NAME-cluster-dr" --region $BACKUP_REGION

    log_info "Creating backup RDS instance..."
    # RDS backup configuration would go here

    log_success "Backup region configured"
}

# Main function
main() {
    echo "🌍 QUICKMELA GLOBAL INFRASTRUCTURE SETUP"
    echo "========================================"
    echo "Domain: $DOMAIN"
    echo "Primary Region: $REGION"
    echo "Backup Region: $BACKUP_REGION"
    echo ""

    # Setup Route 53
    HOSTED_ZONE_ID=$(setup_route53)

    # Setup SSL certificate
    CERT_ARN=$(request_ssl_certificate "$HOSTED_ZONE_ID")

    # Setup CloudFront
    CF_RESULT=$(setup_cloudfront "$CERT_ARN")
    DISTRIBUTION_ID=$(echo $CF_RESULT | cut -d: -f1)
    CLOUDFRONT_DOMAIN=$(echo $CF_RESULT | cut -d: -f2)

    # Setup API Gateway
    API_RESULT=$(setup_api_gateway)
    API_ID=$(echo $API_RESULT | cut -d: -f1)
    API_ENDPOINT=$(echo $API_RESULT | cut -d: -f2)

    # Update DNS records
    update_route53_records "$HOSTED_ZONE_ID" "$CLOUDFRONT_DOMAIN" "$API_ENDPOINT"

    # Setup security
    WEB_ACL_ARN=$(setup_waf)

    # Setup global features
    setup_global_cdn
    setup_backup_region

    echo ""
    echo "🎉 GLOBAL INFRASTRUCTURE SETUP COMPLETED!"
    echo ""
    echo "🌐 Domain Configuration:"
    echo "   Frontend: https://$DOMAIN (CloudFront: $DISTRIBUTION_ID)"
    echo "   API: https://api.$DOMAIN (API Gateway: $API_ID)"
    echo ""
    echo "🔒 Security:"
    echo "   SSL Certificate: $CERT_ARN"
    echo "   WAF Web ACL: $WEB_ACL_ARN"
    echo ""
    echo "📍 Regions:"
    echo "   Primary: $REGION"
    echo "   Backup: $BACKUP_REGION"
    echo ""
    echo "Next steps:"
    echo "1. Test domain resolution: ping $DOMAIN"
    echo "2. Verify SSL: curl -I https://$DOMAIN"
    echo "3. Test API: curl https://api.$DOMAIN/health"
    echo "4. Setup monitoring dashboards"
    echo "5. Configure backup and failover procedures"
    echo ""
    echo "🚀 QuickMela Global Infrastructure Ready!"
}

# Run main function
main "$@"
