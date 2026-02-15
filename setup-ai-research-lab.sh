#!/bin/bash

# QuickMela AI Research Lab Setup
# Advanced ML Model Training Infrastructure

set -e

# Configuration
LAB_NAME="quickmela-ai-research-lab"
ENVIRONMENT="research"
REGION="us-east-1"
INSTANCE_TYPE="p3.2xlarge"  # GPU instance for ML training
AMI_ID="ami-0abcdef1234567890"  # Deep Learning AMI
KEY_PAIR="quickmela-research-key"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_research() {
    echo -e "${CYAN}[RESEARCH]${NC} $1"
}

# Create VPC for AI research
create_research_vpc() {
    log_research "Creating AI research VPC..."

    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block 10.0.0.0/16 \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$LAB_NAME-vpc},{Key=Environment,Value=$ENVIRONMENT}]" \
        --query 'Vpc.VpcId' \
        --output text \
        --region $REGION)

    log_info "Created VPC: $VPC_ID"

    # Create subnets
    PUBLIC_SUBNET=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.1.0/24 \
        --availability-zone ${REGION}a \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$LAB_NAME-public-subnet}]" \
        --query 'Subnet.SubnetId' \
        --output text \
        --region $REGION)

    PRIVATE_SUBNET=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.2.0/24 \
        --availability-zone ${REGION}a \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$LAB_NAME-private-subnet}]" \
        --query 'Subnet.SubnetId' \
        --output text \
        --region $REGION)

    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$LAB_NAME-igw}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text \
        --region $REGION)

    aws ec2 attach-internet-gateway \
        --vpc-id $VPC_ID \
        --internet-gateway-id $IGW_ID \
        --region $REGION

    # Create route table
    RT_ID=$(aws ec2 create-route-table \
        --vpc-id $VPC_ID \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$LAB_NAME-rt}]" \
        --query 'RouteTable.RouteTableId' \
        --output text \
        --region $REGION)

    aws ec2 create-route \
        --route-table-id $RT_ID \
        --destination-cidr-block 0.0.0.0/0 \
        --gateway-id $IGW_ID \
        --region $REGION

    aws ec2 associate-route-table \
        --subnet-id $PUBLIC_SUBNET \
        --route-table-id $RT_ID \
        --region $REGION

    echo "$VPC_ID:$PUBLIC_SUBNET:$PRIVATE_SUBNET"
}

# Create GPU training instances
create_ml_instances() {
    local vpc_info=$1
    local vpc_id=$(echo $vpc_info | cut -d: -f1)
    local public_subnet=$(echo $vpc_info | cut -d: -f2)

    log_research "Creating GPU ML training instances..."

    # Create security group
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$LAB_NAME-sg" \
        --description "AI Research Lab Security Group" \
        --vpc-id $vpc_id \
        --region $REGION \
        --query 'GroupId' \
        --output text)

    # Add security group rules
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $REGION

    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 8888 \
        --cidr 0.0.0.0/0 \
        --region $REGION  # Jupyter

    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 6006 \
        --cidr 0.0.0.0/0 \
        --region $REGION  # TensorBoard

    # Launch GPU instances
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id $AMI_ID \
        --count 1 \
        --instance-type $INSTANCE_TYPE \
        --key-name $KEY_PAIR \
        --security-group-ids $SG_ID \
        --subnet-id $public_subnet \
        --associate-public-ip-address \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$LAB_NAME-gpu-instance},{Key=Environment,Value=$ENVIRONMENT}]" \
        --user-data file://ml-instance-setup.sh \
        --query 'Instances[0].InstanceId' \
        --output text \
        --region $REGION)

    log_success "Created GPU instance: $INSTANCE_ID"

    # Wait for instance to be running
    log_info "Waiting for instance to be running..."
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

    # Get public IP
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text \
        --region $REGION)

    log_success "GPU instance ready at: $PUBLIC_IP"

    echo "$INSTANCE_ID:$PUBLIC_IP:$SG_ID"
}

# Setup ML instance configuration
create_ml_setup_script() {
    log_research "Creating ML instance setup script..."

    cat > ml-instance-setup.sh << 'EOF'
#!/bin/bash
set -e

# Update system
yum update -y

# Install NVIDIA drivers and CUDA
aws s3 cp s3://ec2-linux-nvidia-drivers/latest/NVIDIA-Linux-x86_64-470.82.01.run /tmp/NVIDIA-installer.run
chmod +x /tmp/NVIDIA-installer.run
/tmp/NVIDIA-installer.run --no-opengl-libs --no-man-page --no-drm --silent

# Install CUDA toolkit
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run
sh cuda_11.8.0_520.61.05_linux.run --silent --toolkit

# Setup environment variables
echo 'export PATH=/usr/local/cuda/bin${PATH:+:${PATH}}' >> /home/ec2-user/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}' >> /home/ec2-user/.bashrc

# Install Python and ML libraries
cd /home/ec2-user
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b -p /home/ec2-user/miniconda3
eval "$(/home/ec2-user/miniconda3/bin/conda shell.bash hook)"

# Create ML environment
conda create -n ml-research python=3.9 -y
conda activate ml-research

# Install ML libraries
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers datasets accelerate
pip install tensorflow-gpu
pip install scikit-learn pandas numpy matplotlib seaborn
pip install jupyterlab tensorboard
pip install boto3 awscli
pip install opencv-python pillow
pip install nltk spacy
pip install fastapi uvicorn
pip install wandb comet-ml

# Setup Jupyter
jupyter lab --generate-config
jupyter lab password  # Set password interactively

# Create startup script
cat > /home/ec2-user/start-jupyter.sh << 'INNER_EOF'
#!/bin/bash
cd /home/ec2-user
source miniconda3/bin/activate ml-research
export PATH=/usr/local/cuda/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root &
tensorboard --logdir ./tensorboard_logs --host 0.0.0.0 --port 6006 &
INNER_EOF

chmod +x /home/ec2-user/start-jupyter.sh

# Setup auto-start
echo "@reboot /home/ec2-user/start-jupyter.sh" | crontab -

# Create research directories
mkdir -p /home/ec2-user/research/{models,data,experiments,notebooks}
mkdir -p /home/ec2-user/tensorboard_logs

# Setup AWS credentials (if provided)
if [ -n "$AWS_ACCESS_KEY_ID" ]; then
    mkdir -p /home/ec2-user/.aws
    cat > /home/ec2-user/.aws/credentials << INNER_EOF2
[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
region = $REGION
INNER_EOF2
fi

chown -R ec2-user:ec2-user /home/ec2-user

log_success "ML instance setup completed"
EOF

    log_success "ML setup script created"
}

# Setup data storage and processing
create_data_infrastructure() {
    log_research "Setting up data storage and processing infrastructure..."

    # Create S3 buckets for datasets and models
    DATA_BUCKET="$LAB_NAME-datasets-$(date +%s)"
    MODELS_BUCKET="$LAB_NAME-models-$(date +%s)"

    aws s3 mb s3://$DATA_BUCKET --region $REGION
    aws s3 mb s3://$MODELS_BUCKET --region $REGION

    # Enable versioning on model bucket
    aws s3api put-bucket-versioning \
        --bucket $MODELS_BUCKET \
        --versioning-configuration Status=Enabled \
        --region $REGION

    # Create lifecycle policies
    aws s3api put-bucket-lifecycle-configuration \
        --bucket $DATA_BUCKET \
        --lifecycle-configuration '{
            "Rules": [{
                "ID": "Delete old datasets",
                "Status": "Enabled",
                "Filter": {"Prefix": "temp/"},
                "Expiration": {"Days": 30}
            }]
        }' \
        --region $REGION

    log_success "Data infrastructure created: $DATA_BUCKET, $MODELS_BUCKET"

    echo "$DATA_BUCKET:$MODELS_BUCKET"
}

# Setup monitoring and logging
setup_monitoring() {
    log_research "Setting up monitoring and logging for AI research..."

    # Create CloudWatch log groups
    aws logs create-log-group \
        --log-group-name "/ai-research/training-logs" \
        --region $REGION || true

    aws logs create-log-group \
        --log-group-name "/ai-research/experiment-logs" \
        --region $REGION || true

    # Setup CloudWatch alarms for GPU usage
    aws cloudwatch put-metric-alarm \
        --alarm-name "$LAB_NAME-gpu-utilization" \
        --alarm-description "GPU utilization monitoring" \
        --metric-name "GPUUtilization" \
        --namespace "AWS/EC2" \
        --statistic "Average" \
        --period 300 \
        --threshold 90 \
        --comparison-operator "GreaterThanThreshold" \
        --dimensions "Name=InstanceId,Value=$INSTANCE_ID" \
        --region $REGION

    log_success "Monitoring and logging configured"
}

# Create research dashboard
create_research_dashboard() {
    log_research "Creating AI research dashboard..."

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
                    ["AWS/EC2", "CPUUtilization", "InstanceId", "$INSTANCE_ID"],
                    [".", "GPUUtilization", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "ML Instance Performance",
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
                    ["AWS/S3", "NumberOfObjects", "BucketName", "$DATA_BUCKET"],
                    [".", "BucketSizeBytes", ".", "."]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Dataset Storage Metrics",
                "period": 3600
            }
        },
        {
            "type": "log",
            "x": 0,
            "y": 6,
            "width": 24,
            "height": 6,
            "properties": {
                "query": "SOURCE '/ai-research/training-logs' | fields @timestamp, @message | sort @timestamp desc | limit 100",
                "region": "$REGION",
                "title": "Training Logs",
                "view": "table"
            }
        }
    ]
}
EOF
)

    aws cloudwatch put-dashboard \
        --dashboard-name "$LAB_NAME-dashboard" \
        --dashboard-body "$DASHBOARD_BODY" \
        --region $REGION

    log_success "Research dashboard created"
}

# Main setup function
main() {
    echo "🧠 QUICKMELA AI RESEARCH LAB SETUP"
    echo "==================================="
    echo "Advanced ML Training Infrastructure"
    echo "Region: $REGION"
    echo "Instance: $INSTANCE_TYPE"
    echo ""

    create_ml_setup_script

    vpc_info=$(create_research_vpc)
    instance_info=$(create_ml_instances "$vpc_info")
    data_buckets=$(create_data_infrastructure)

    INSTANCE_ID=$(echo $instance_info | cut -d: -f1)
    PUBLIC_IP=$(echo $instance_info | cut -d: -f2)

    setup_monitoring
    create_research_dashboard

    echo ""
    echo "🎉 AI RESEARCH LAB SETUP COMPLETED!"
    echo ""
    echo "🧠 Research Environment:"
    echo "   GPU Instance: $INSTANCE_ID"
    echo "   Public IP: $PUBLIC_IP"
    echo "   Jupyter Lab: http://$PUBLIC_IP:8888"
    echo "   TensorBoard: http://$PUBLIC_IP:6006"
    echo ""
    echo "📊 Data Storage:"
    echo "   Datasets: s3://$DATA_BUCKET"
    echo "   Models: s3://$MODELS_BUCKET"
    echo ""
    echo "📈 Monitoring:"
    echo "   Dashboard: https://$REGION.console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=$LAB_NAME-dashboard"
    echo ""
    echo "🔬 Research Tools Ready:"
    echo "   PyTorch, TensorFlow, Transformers"
    echo "   Jupyter Lab, TensorBoard"
    echo "   GPU acceleration, CUDA support"
    echo "   AWS integration, experiment tracking"
    echo ""
    echo "Next steps:"
    echo "1. SSH to instance: ssh -i $KEY_PAIR.pem ec2-user@$PUBLIC_IP"
    echo "2. Start Jupyter: ./start-jupyter.sh"
    echo "3. Access TensorBoard for experiment tracking"
    echo "4. Upload datasets to S3 buckets"
    echo "5. Begin ML model training and research"
    echo ""
    echo "🚀 AI Research Lab Ready for Innovation!"
}

# Run main function
main "$@"
