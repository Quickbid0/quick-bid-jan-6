import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EdgeNode {
  id: string;
  location: {
    region: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  capabilities: {
    gpu: boolean;
    tpu: boolean;
    memoryGB: number;
    storageGB: number;
    networkMbps: number;
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  load: {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    processingQueue: number;
  };
  models: Array<{
    modelId: string;
    version: string;
    lastUpdated: Date;
    performance: {
      latency: number;
      throughput: number;
      accuracy: number;
    };
  }>;
  lastHeartbeat: Date;
}

export interface EdgeInference {
  id: string;
  modelId: string;
  input: any;
  output: any;
  metadata: {
    edgeNodeId: string;
    userId: string;
    requestTime: Date;
    processingTime: number;
    inputSize: number;
    outputSize: number;
    cost: number;
  };
}

export interface EdgeDeployment {
  id: string;
  modelId: string;
  version: string;
  targetNodes: string[]; // Edge node IDs
  status: 'deploying' | 'deployed' | 'failed' | 'rolling_back';
  deploymentConfig: {
    minReplicas: number;
    maxReplicas: number;
    targetLatency: number; // milliseconds
    resourceLimits: {
      cpu: string;
      memory: string;
      gpu?: string;
    };
  };
  performance: {
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    throughput: number;
    errorRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class EdgeComputingService {
  private readonly logger = new Logger(EdgeComputingService.name);
  private edgeNodes: Map<string, EdgeNode> = new Map();
  private activeDeployments: Map<string, EdgeDeployment> = new Map();
  private inferenceHistory: Map<string, EdgeInference[]> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeEdgeNetwork();
  }

  /**
   * EDGE NETWORK MANAGEMENT
   */
  async registerEdgeNode(nodeConfig: Omit<EdgeNode, 'id' | 'status' | 'load' | 'models' | 'lastHeartbeat'>): Promise<EdgeNode> {
    this.logger.log(`Registering edge node in ${nodeConfig.location.city}, ${nodeConfig.location.country}`);

    try {
      const nodeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const edgeNode: EdgeNode = {
        id: nodeId,
        ...nodeConfig,
        status: 'online',
        load: {
          cpuUsage: 0,
          memoryUsage: 0,
          activeConnections: 0,
          processingQueue: 0
        },
        models: [],
        lastHeartbeat: new Date()
      };

      this.edgeNodes.set(nodeId, edgeNode);

      // Store edge node (in production, save to database)
      await this.storeEdgeNode(edgeNode);

      this.logger.log(`Edge node registered: ${nodeId}`);
      return edgeNode;

    } catch (error) {
      this.logger.error(`Edge node registration failed:`, error);
      throw new Error(`Edge node registration failed: ${error.message}`);
    }
  }

  async updateNodeStatus(nodeId: string, status: EdgeNode['status'], loadMetrics?: Partial<EdgeNode['load']>): Promise<EdgeNode> {
    const node = this.edgeNodes.get(nodeId);
    if (!node) {
      throw new Error('Edge node not found');
    }

    node.status = status;
    node.lastHeartbeat = new Date();

    if (loadMetrics) {
      Object.assign(node.load, loadMetrics);
    }

    // Update node (in production, save to database)
    await this.updateEdgeNode(node);

    this.logger.debug(`Edge node status updated: ${nodeId} -> ${status}`);
    return node;
  }

  async getOptimalEdgeNode(
    userLocation: { latitude: number; longitude: number },
    modelId: string,
    requirements?: {
      minGpu?: boolean;
      minMemoryGB?: number;
      maxLatency?: number;
    }
  ): Promise<EdgeNode | null> {
    this.logger.log(`Finding optimal edge node for model ${modelId} near ${userLocation.latitude}, ${userLocation.longitude}`);

    try {
      const availableNodes = Array.from(this.edgeNodes.values())
        .filter(node =>
          node.status === 'online' &&
          node.models.some(m => m.modelId === modelId) &&
          (!requirements?.minGpu || node.capabilities.gpu) &&
          (!requirements?.minMemoryGB || node.capabilities.memoryGB >= requirements.minMemoryGB)
        );

      if (availableNodes.length === 0) {
        return null;
      }

      // Find node with lowest latency and load
      const optimalNode = availableNodes
        .map(node => ({
          node,
          distance: this.calculateDistance(userLocation, node.location),
          loadScore: node.load.cpuUsage + node.load.memoryUsage,
          latency: this.estimateLatency(userLocation, node.location)
        }))
        .filter(item => !requirements?.maxLatency || item.latency <= requirements.maxLatency)
        .sort((a, b) => {
          // Prioritize: latency (40%), load (30%), distance (30%)
          const scoreA = a.latency * 0.4 + a.loadScore * 0.3 + a.distance * 0.3;
          const scoreB = b.latency * 0.4 + b.loadScore * 0.3 + b.distance * 0.3;
          return scoreA - scoreB;
        })[0]?.node;

      if (optimalNode) {
        this.logger.log(`Optimal edge node selected: ${optimalNode.id} (${optimalNode.location.city})`);
      }

      return optimalNode || null;

    } catch (error) {
      this.logger.error(`Edge node optimization failed:`, error);
      throw new Error(`Edge node optimization failed: ${error.message}`);
    }
  }

  /**
   * EDGE MODEL DEPLOYMENT
   */
  async deployModelToEdge(
    modelId: string,
    version: string,
    targetRegions: string[],
    deploymentConfig: EdgeDeployment['deploymentConfig']
  ): Promise<EdgeDeployment> {
    this.logger.log(`Deploying model ${modelId}:${version} to ${targetRegions.length} regions`);

    try {
      const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Find suitable edge nodes in target regions
      const targetNodes = Array.from(this.edgeNodes.values())
        .filter(node =>
          targetRegions.includes(node.location.region) &&
          node.status === 'online'
        )
        .map(node => node.id);

      if (targetNodes.length === 0) {
        throw new Error('No suitable edge nodes found in target regions');
      }

      const deployment: EdgeDeployment = {
        id: deploymentId,
        modelId,
        version,
        targetNodes,
        status: 'deploying',
        deploymentConfig,
        performance: {
          averageLatency: 0,
          p95Latency: 0,
          p99Latency: 0,
          throughput: 0,
          errorRate: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.activeDeployments.set(deploymentId, deployment);

      // Start deployment process
      await this.executeModelDeployment(deployment);

      // Store deployment (in production, save to database)
      await this.storeEdgeDeployment(deployment);

      this.logger.log(`Model deployment initiated: ${deploymentId}`);
      return deployment;

    } catch (error) {
      this.logger.error(`Model deployment failed:`, error);
      throw new Error(`Model deployment failed: ${error.message}`);
    }
  }

  /**
   * EDGE INFERENCE EXECUTION
   */
  async executeEdgeInference(
    modelId: string,
    input: any,
    userId: string,
    userLocation?: { latitude: number; longitude: number },
    requirements?: {
      maxLatency?: number;
      preferredNode?: string;
    }
  ): Promise<EdgeInference> {
    const startTime = Date.now();

    this.logger.log(`Executing edge inference for model ${modelId} by user ${userId}`);

    try {
      // Find optimal edge node
      const optimalNode = requirements?.preferredNode
        ? this.edgeNodes.get(requirements.preferredNode)
        : await this.getOptimalEdgeNode(userLocation || { latitude: 0, longitude: 0 }, modelId, requirements);

      if (!optimalNode) {
        throw new Error('No suitable edge node available for inference');
      }

      // Execute inference on edge node
      const result = await this.performEdgeInference(optimalNode, modelId, input);

      const processingTime = Date.now() - startTime;
      const inputSize = JSON.stringify(input).length;
      const outputSize = JSON.stringify(result).length;

      const inference: EdgeInference = {
        id: `inference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        modelId,
        input,
        output: result,
        metadata: {
          edgeNodeId: optimalNode.id,
          userId,
          requestTime: new Date(startTime),
          processingTime,
          inputSize,
          outputSize,
          cost: this.calculateInferenceCost(processingTime, optimalNode)
        }
      };

      // Store inference record
      if (!this.inferenceHistory.has(userId)) {
        this.inferenceHistory.set(userId, []);
      }
      this.inferenceHistory.get(userId)!.push(inference);

      // Update node load
      await this.updateNodeStatus(optimalNode.id, 'online', {
        activeConnections: optimalNode.load.activeConnections + 1,
        processingQueue: Math.max(0, optimalNode.load.processingQueue - 1)
      });

      this.logger.log(`Edge inference completed in ${processingTime}ms on node ${optimalNode.id}`);
      return inference;

    } catch (error) {
      this.logger.error(`Edge inference failed:`, error);
      throw new Error(`Edge inference failed: ${error.message}`);
    }
  }

  /**
   * EDGE ANALYTICS & MONITORING
   */
  async getEdgeAnalytics(timeRange: { start: Date; end: Date }): Promise<{
    network: {
      totalNodes: number;
      activeNodes: number;
      regions: Record<string, number>;
      averageLatency: number;
    };
    performance: {
      totalInferences: number;
      averageProcessingTime: number;
      p95Latency: number;
      errorRate: number;
      throughput: number;
    };
    costs: {
      totalCost: number;
      costPerInference: number;
      costByRegion: Record<string, number>;
    };
    models: Array<{
      modelId: string;
      totalInferences: number;
      averageLatency: number;
      errorRate: number;
      deployedNodes: number;
    }>;
  }> {
    this.logger.log('Generating edge analytics');

    try {
      const allInferences = Array.from(this.inferenceHistory.values()).flat();

      // Filter by time range
      const filteredInferences = allInferences.filter(
        inf => inf.metadata.requestTime >= timeRange.start && inf.metadata.requestTime <= timeRange.end
      );

      const totalInferences = filteredInferences.length;
      const totalCost = filteredInferences.reduce((sum, inf) => sum + inf.metadata.cost, 0);

      // Network analytics
      const nodes = Array.from(this.edgeNodes.values());
      const activeNodes = nodes.filter(n => n.status === 'online').length;

      const regions = nodes.reduce((acc, node) => {
        acc[node.location.region] = (acc[node.location.region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Performance analytics
      const processingTimes = filteredInferences.map(inf => inf.metadata.processingTime);
      const averageProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;

      const sortedTimes = [...processingTimes].sort((a, b) => a - b);
      const p95Latency = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;

      const errors = filteredInferences.filter(inf => !inf.output || inf.output.error).length;
      const errorRate = errors / totalInferences;

      const throughput = totalInferences / ((timeRange.end.getTime() - timeRange.start.getTime()) / 1000); // inferences per second

      // Model analytics
      const modelStats = new Map<string, {
        inferences: number;
        totalLatency: number;
        errors: number;
        nodes: Set<string>;
      }>();

      filteredInferences.forEach(inf => {
        if (!modelStats.has(inf.modelId)) {
          modelStats.set(inf.modelId, {
            inferences: 0,
            totalLatency: 0,
            errors: 0,
            nodes: new Set()
          });
        }

        const stats = modelStats.get(inf.modelId)!;
        stats.inferences++;
        stats.totalLatency += inf.metadata.processingTime;
        if (!inf.output || inf.output.error) stats.errors++;
        stats.nodes.add(inf.metadata.edgeNodeId);
      });

      const models = Array.from(modelStats.entries()).map(([modelId, stats]) => ({
        modelId,
        totalInferences: stats.inferences,
        averageLatency: stats.totalLatency / stats.inferences,
        errorRate: stats.errors / stats.inferences,
        deployedNodes: stats.nodes.size
      }));

      // Cost analytics
      const costByRegion = filteredInferences.reduce((acc, inf) => {
        const node = this.edgeNodes.get(inf.metadata.edgeNodeId);
        if (node) {
          acc[node.location.region] = (acc[node.location.region] || 0) + inf.metadata.cost;
        }
        return acc;
      }, {} as Record<string, number>);

      const analytics = {
        network: {
          totalNodes: nodes.length,
          activeNodes,
          regions,
          averageLatency: averageProcessingTime
        },
        performance: {
          totalInferences,
          averageProcessingTime,
          p95Latency,
          errorRate,
          throughput
        },
        costs: {
          totalCost,
          costPerInference: totalCost / totalInferences,
          costByRegion
        },
        models
      };

      return analytics;

    } catch (error) {
      this.logger.error('Edge analytics generation failed:', error);
      throw new Error(`Edge analytics generation failed: ${error.message}`);
    }
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  private async initializeEdgeNetwork(): Promise<void> {
    // Initialize edge network with predefined nodes
    const predefinedNodes = [
      {
        location: { region: 'us-east-1', country: 'US', city: 'Virginia', latitude: 39.0438, longitude: -77.4874 },
        capabilities: { gpu: true, tpu: false, memoryGB: 32, storageGB: 100, networkMbps: 1000 }
      },
      {
        location: { region: 'eu-west-1', country: 'Ireland', city: 'Dublin', latitude: 53.3498, longitude: -6.2603 },
        capabilities: { gpu: true, tpu: false, memoryGB: 64, storageGB: 200, networkMbps: 1000 }
      },
      {
        location: { region: 'ap-south-1', country: 'India', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
        capabilities: { gpu: true, tpu: true, memoryGB: 128, storageGB: 500, networkMbps: 1000 }
      },
      {
        location: { region: 'ap-southeast-1', country: 'Singapore', city: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
        capabilities: { gpu: false, tpu: true, memoryGB: 32, storageGB: 100, networkMbps: 500 }
      }
    ];

    for (const nodeConfig of predefinedNodes) {
      await this.registerEdgeNode(nodeConfig);
    }

    this.logger.log('Edge network initialized with predefined nodes');
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    // Haversine distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private estimateLatency(
    userLocation: { latitude: number; longitude: number },
    nodeLocation: { latitude: number; longitude: number }
  ): number {
    // Estimate network latency based on distance
    const distance = this.calculateDistance(userLocation, nodeLocation);

    // Base latency + distance-based latency
    // Speed of light in fiber is ~200,000 km/s, but real networks are slower
    const baseLatency = 20; // ms
    const distanceLatency = distance * 0.5; // ~0.5ms per 1000km (very rough estimate)

    return Math.round(baseLatency + distanceLatency);
  }

  private async storeEdgeNode(node: EdgeNode): Promise<void> {
    // In production, store in database
    this.logger.debug(`Edge node stored: ${node.id}`);
  }

  private async updateEdgeNode(node: EdgeNode): Promise<void> {
    // In production, update in database
    this.logger.debug(`Edge node updated: ${node.id}`);
  }

  private async storeEdgeDeployment(deployment: EdgeDeployment): Promise<void> {
    // In production, store in database
    this.logger.debug(`Edge deployment stored: ${deployment.id}`);
  }

  private async executeModelDeployment(deployment: EdgeDeployment): Promise<void> {
    // Deploy model to target edge nodes
    this.logger.debug(`Executing model deployment: ${deployment.id}`);

    // Simulate deployment process
    setTimeout(async () => {
      deployment.status = 'deployed';
      deployment.updatedAt = new Date();

      // Update node models
      for (const nodeId of deployment.targetNodes) {
        const node = this.edgeNodes.get(nodeId);
        if (node) {
          const existingModel = node.models.find(m => m.modelId === deployment.modelId);
          if (existingModel) {
            existingModel.version = deployment.version;
            existingModel.lastUpdated = new Date();
          } else {
            node.models.push({
              modelId: deployment.modelId,
              version: deployment.version,
              lastUpdated: new Date(),
              performance: { latency: 0, throughput: 0, accuracy: 0 }
            });
          }
        }
      }

      this.logger.log(`Model deployment completed: ${deployment.id}`);
    }, 30000); // Simulate 30-second deployment
  }

  private async performEdgeInference(node: EdgeNode, modelId: string, input: any): Promise<any> {
    // Simulate edge inference execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50)); // 50-250ms

    // Mock inference results based on model type
    if (modelId.includes('recommendation')) {
      return {
        recommendations: [
          { productId: 'prod1', score: 0.95, reason: 'Similar to previously viewed items' },
          { productId: 'prod2', score: 0.89, reason: 'Trending in your category' },
          { productId: 'prod3', score: 0.82, reason: 'High-rated by similar users' }
        ],
        processingTime: 120
      };
    }

    if (modelId.includes('fraud')) {
      return {
        isFraudulent: Math.random() > 0.95, // 5% fraud rate
        riskScore: Math.random(),
        reasons: ['Unusual bidding pattern', 'New user account'],
        confidence: 0.87
      };
    }

    if (modelId.includes('pricing')) {
      return {
        predictedPrice: input.basePrice * (0.9 + Math.random() * 0.2),
        confidence: 0.78,
        factors: ['Market demand', 'Item condition', 'Seasonal trends']
      };
    }

    // Default response
    return {
      result: 'inference_completed',
      confidence: 0.85,
      processingTime: Math.random() * 150 + 50
    };
  }

  private calculateInferenceCost(processingTime: number, node: EdgeNode): number {
    // Calculate cost based on resources used
    const baseCost = 0.001; // $0.001 per inference
    const gpuCost = node.capabilities.gpu ? 0.002 : 0;
    const timeCost = (processingTime / 1000) * 0.0001; // Cost per second

    return baseCost + gpuCost + timeCost;
  }

  /**
   * EDGE NETWORK OPTIMIZATION
   */
  async optimizeEdgeNetwork(): Promise<{
    recommendations: Array<{
      type: 'add_node' | 'remove_node' | 'redistribute_load' | 'upgrade_capacity';
      description: string;
      impact: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    performance: {
      networkEfficiency: number;
      averageLatency: number;
      coverageGaps: string[];
    };
  }> {
    this.logger.log('Optimizing edge network');

    try {
      const recommendations = [];
      const nodes = Array.from(this.edgeNodes.values());

      // Check for overloaded nodes
      const overloadedNodes = nodes.filter(node =>
        node.load.cpuUsage > 80 || node.load.memoryUsage > 85
      );

      for (const node of overloadedNodes) {
        recommendations.push({
          type: 'redistribute_load',
          description: `Reduce load on ${node.location.city} node (${node.load.cpuUsage}% CPU)`,
          impact: 'Improve response times and reduce failures',
          priority: 'high'
        });
      }

      // Check for coverage gaps
      const regions = [...new Set(nodes.map(n => n.location.region))];
      const missingRegions = this.getMissingRegions(regions);

      for (const region of missingRegions) {
        recommendations.push({
          type: 'add_node',
          description: `Add edge node in ${region} region`,
          impact: 'Reduce latency for users in this region',
          priority: 'medium'
        });
      }

      // Check for outdated nodes
      const outdatedNodes = nodes.filter(node =>
        node.capabilities.memoryGB < 16 || !node.capabilities.gpu
      );

      for (const node of outdatedNodes) {
        recommendations.push({
          type: 'upgrade_capacity',
          description: `Upgrade capacity for ${node.location.city} node`,
          impact: 'Support more complex AI models and higher throughput',
          priority: 'low'
        });
      }

      // Calculate network performance
      const analytics = await this.getEdgeAnalytics({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      });

      const optimization = {
        recommendations,
        performance: {
          networkEfficiency: this.calculateNetworkEfficiency(nodes),
          averageLatency: analytics.network.averageLatency,
          coverageGaps: missingRegions
        }
      };

      this.logger.log(`Network optimization completed: ${recommendations.length} recommendations`);
      return optimization;

    } catch (error) {
      this.logger.error('Network optimization failed:', error);
      throw new Error(`Network optimization failed: ${error.message}`);
    }
  }

  private getMissingRegions(existingRegions: string[]): string[] {
    const allRegions = [
      'us-east-1', 'us-west-1', 'us-west-2',
      'eu-west-1', 'eu-central-1',
      'ap-south-1', 'ap-southeast-1', 'ap-northeast-1',
      'sa-east-1'
    ];

    return allRegions.filter(region => !existingRegions.includes(region));
  }

  private calculateNetworkEfficiency(nodes: EdgeNode[]): number {
    const activeNodes = nodes.filter(n => n.status === 'online').length;
    const avgLoad = nodes.reduce((sum, node) => sum + node.load.cpuUsage + node.load.memoryUsage, 0) / nodes.length;

    // Efficiency = (active nodes / total nodes) * (1 - average load/200)
    return (activeNodes / nodes.length) * (1 - avgLoad / 200);
  }
}
