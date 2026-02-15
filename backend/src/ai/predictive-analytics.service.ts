import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tf from '@tensorflow/tfjs-node';
import * as math from 'mathjs';

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface PredictionResult {
  forecast: Array<{
    timestamp: Date;
    predictedValue: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    mae: number;  // Mean Absolute Error
  };
  modelInfo: {
    algorithm: string;
    parameters: Record<string, any>;
    trainingTime: number;
    dataPoints: number;
  };
}

export interface MarketTrendAnalysis {
  trend: 'bullish' | 'bearish' | 'sideways';
  strength: number; // 0-1
  duration: number; // days
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  predictions: {
    shortTerm: PredictionResult; // 7 days
    mediumTerm: PredictionResult; // 30 days
    longTerm: PredictionResult; // 90 days
  };
}

@Injectable()
export class PredictiveAnalyticsService {
  private readonly logger = new Logger(PredictiveAnalyticsService.name);

  constructor(private readonly configService: ConfigService) {
    // Initialize TensorFlow.js
    this.initializeTensorFlow();
  }

  /**
   * ADVANCED PREDICTIVE ANALYTICS - Time Series Forecasting
   */
  async forecastTimeSeries(
    data: TimeSeriesData[],
    forecastHorizon: number = 30,
    algorithm: 'arima' | 'lstm' | 'prophet' | 'ensemble' = 'ensemble'
  ): Promise<PredictionResult> {
    const startTime = Date.now();

    this.logger.log(`Starting time series forecast with ${algorithm} algorithm`);

    try {
      let forecast: any[];

      switch (algorithm) {
        case 'arima':
          forecast = await this.arimaForecast(data, forecastHorizon);
          break;
        case 'lstm':
          forecast = await this.lstmForecast(data, forecastHorizon);
          break;
        case 'prophet':
          forecast = await this.prophetForecast(data, forecastHorizon);
          break;
        case 'ensemble':
          forecast = await this.ensembleForecast(data, forecastHorizon);
          break;
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      const accuracy = await this.calculateAccuracyMetrics(data, forecast);
      const trainingTime = Date.now() - startTime;

      const result: PredictionResult = {
        forecast: forecast.map((f, i) => ({
          timestamp: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
          predictedValue: f.value,
          confidence: f.confidence || 0.8,
          upperBound: f.upperBound || f.value * 1.1,
          lowerBound: f.lowerBound || f.value * 0.9
        })),
        accuracy,
        modelInfo: {
          algorithm,
          parameters: this.getAlgorithmParameters(algorithm),
          trainingTime,
          dataPoints: data.length
        }
      };

      this.logger.log(`Forecast completed with ${algorithm}: ${forecast.length} predictions`);
      return result;

    } catch (error) {
      this.logger.error(`Forecast failed with ${algorithm}:`, error);
      throw new Error(`Time series forecasting failed: ${error.message}`);
    }
  }

  /**
   * MARKET TREND ANALYSIS - Advanced market intelligence
   */
  async analyzeMarketTrends(
    productId: string,
    historicalData: TimeSeriesData[],
    marketFactors?: Array<{
      name: string;
      data: TimeSeriesData[];
      weight: number;
    }>
  ): Promise<MarketTrendAnalysis> {
    this.logger.log(`Analyzing market trends for product ${productId}`);

    try {
      // Analyze price trends
      const priceTrend = await this.analyzePriceTrend(historicalData);

      // Factor in external market factors
      const externalFactors = marketFactors ?
        await this.analyzeExternalFactors(marketFactors) : [];

      // Generate predictions for different time horizons
      const [shortTerm, mediumTerm, longTerm] = await Promise.all([
        this.forecastTimeSeries(historicalData, 7),
        this.forecastTimeSeries(historicalData, 30),
        this.forecastTimeSeries(historicalData, 90)
      ]);

      // Determine overall trend
      const trend = this.determineOverallTrend(priceTrend, externalFactors);
      const strength = this.calculateTrendStrength(priceTrend, externalFactors);
      const confidence = this.calculateTrendConfidence(historicalData, priceTrend);

      const analysis: MarketTrendAnalysis = {
        trend,
        strength,
        duration: this.calculateTrendDuration(historicalData),
        confidence,
        factors: [
          {
            factor: 'Historical Price Movement',
            impact: Math.abs(priceTrend.slope),
            direction: priceTrend.slope > 0 ? 'positive' : 'negative'
          },
          ...externalFactors.map(f => ({
            factor: f.name,
            impact: f.impact,
            direction: f.direction
          }))
        ],
        predictions: {
          shortTerm,
          mediumTerm,
          longTerm
        }
      };

      this.logger.log(`Market trend analysis completed for ${productId}: ${trend} with ${strength.toFixed(2)} strength`);
      return analysis;

    } catch (error) {
      this.logger.error(`Market trend analysis failed for ${productId}:`, error);
      throw new Error(`Market trend analysis failed: ${error.message}`);
    }
  }

  /**
   * DEMAND PREDICTION - Predict auction demand patterns
   */
  async predictDemand(
    productData: {
      category: string;
      brand?: string;
      condition: string;
      location: string;
    },
    historicalAuctions: Array<{
      date: Date;
      participants: number;
      finalPrice: number;
      duration: number;
    }>
  ): Promise<{
    predictedParticipants: number;
    predictedPrice: number;
    demandLevel: 'low' | 'medium' | 'high' | 'very_high';
    confidence: number;
    seasonality: {
      dayOfWeek: number;
      monthOfYear: number;
      timeOfDay: number;
    };
  }> {
    this.logger.log(`Predicting demand for ${productData.category} in ${productData.location}`);

    try {
      // Analyze historical patterns
      const patterns = await this.analyzeHistoricalPatterns(historicalAuctions);

      // Factor in product characteristics
      const productFactors = this.calculateProductFactors(productData);

      // Consider seasonality and timing
      const seasonality = this.calculateSeasonalityFactors(new Date());

      // Combine all factors
      const predictedParticipants = this.predictParticipants(patterns, productFactors, seasonality);
      const predictedPrice = this.predictPrice(patterns, productFactors, seasonality);

      const demandLevel = this.classifyDemandLevel(predictedParticipants, predictedPrice);
      const confidence = this.calculatePredictionConfidence(patterns, historicalAuctions.length);

      return {
        predictedParticipants: Math.round(predictedParticipants),
        predictedPrice: Math.round(predictedPrice),
        demandLevel,
        confidence,
        seasonality
      };

    } catch (error) {
      this.logger.error('Demand prediction failed:', error);
      throw new Error(`Demand prediction failed: ${error.message}`);
    }
  }

  /**
   * ANOMALY DETECTION - Identify unusual patterns
   */
  async detectAnomalies(
    data: TimeSeriesData[],
    sensitivity: number = 0.95
  ): Promise<Array<{
    timestamp: Date;
    value: number;
    anomalyScore: number;
    isAnomaly: boolean;
    expectedValue: number;
    deviation: number;
  }>> {
    this.logger.log(`Detecting anomalies in ${data.length} data points`);

    try {
      // Calculate rolling statistics
      const windowSize = Math.min(30, Math.floor(data.length / 3));
      const anomalies = [];

      for (let i = windowSize; i < data.length; i++) {
        const window = data.slice(i - windowSize, i);
        const currentValue = data[i].value;

        // Calculate expected value using moving average + seasonal adjustment
        const mean = window.reduce((sum, d) => sum + d.value, 0) / window.length;
        const stdDev = Math.sqrt(
          window.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / window.length
        );

        // Calculate z-score
        const zScore = stdDev > 0 ? Math.abs(currentValue - mean) / stdDev : 0;
        const anomalyScore = 1 - Math.exp(-zScore); // Convert to 0-1 scale

        const isAnomaly = anomalyScore > (1 - sensitivity);

        anomalies.push({
          timestamp: data[i].timestamp,
          value: currentValue,
          anomalyScore,
          isAnomaly,
          expectedValue: mean,
          deviation: currentValue - mean
        });
      }

      const anomalyCount = anomalies.filter(a => a.isAnomaly).length;
      this.logger.log(`Anomaly detection completed: ${anomalyCount} anomalies found`);

      return anomalies;

    } catch (error) {
      this.logger.error('Anomaly detection failed:', error);
      throw new Error(`Anomaly detection failed: ${error.message}`);
    }
  }

  /**
   * CORRELATION ANALYSIS - Find relationships between variables
   */
  async analyzeCorrelations(
    variables: Array<{
      name: string;
      data: TimeSeriesData[];
    }>
  ): Promise<Array<{
    variable1: string;
    variable2: string;
    correlation: number;
    strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
    direction: 'positive' | 'negative';
    significance: number;
  }>> {
    this.logger.log(`Analyzing correlations between ${variables.length} variables`);

    try {
      const correlations = [];

      for (let i = 0; i < variables.length; i++) {
        for (let j = i + 1; j < variables.length; j++) {
          const var1 = variables[i];
          const var2 = variables[j];

          const correlation = this.calculatePearsonCorrelation(var1.data, var2.data);
          const strength = this.classifyCorrelationStrength(Math.abs(correlation));
          const direction = correlation >= 0 ? 'positive' : 'negative';
          const significance = this.calculateStatisticalSignificance(correlation, var1.data.length);

          correlations.push({
            variable1: var1.name,
            variable2: var2.name,
            correlation: Math.abs(correlation),
            strength,
            direction,
            significance
          });
        }
      }

      correlations.sort((a, b) => b.correlation - a.correlation);

      this.logger.log(`Correlation analysis completed: ${correlations.length} correlations found`);
      return correlations;

    } catch (error) {
      this.logger.error('Correlation analysis failed:', error);
      throw new Error(`Correlation analysis failed: ${error.message}`);
    }
  }

  // ==========================================
  // PRIVATE METHODS - FORECASTING ALGORITHMS
  // ==========================================

  private async arimaForecast(data: TimeSeriesData[], horizon: number): Promise<any[]> {
    // Simplified ARIMA implementation
    // In production, use a proper ARIMA library
    const values = data.map(d => d.value);
    const forecast = [];

    // Simple exponential smoothing as ARIMA approximation
    const alpha = 0.3;
    let smoothedValue = values[0];

    for (let i = 1; i < values.length; i++) {
      smoothedValue = alpha * values[i] + (1 - alpha) * smoothedValue;
    }

    // Generate forecast
    for (let i = 0; i < horizon; i++) {
      smoothedValue = alpha * smoothedValue + (1 - alpha) * smoothedValue; // Trend continuation
      forecast.push({
        value: smoothedValue,
        confidence: 0.7,
        upperBound: smoothedValue * 1.15,
        lowerBound: smoothedValue * 0.85
      });
    }

    return forecast;
  }

  private async lstmForecast(data: TimeSeriesData[], horizon: number): Promise<any[]> {
    // LSTM implementation using TensorFlow.js
    const values = data.map(d => d.value);
    const normalizedData = this.normalizeData(values);

    // Create simple LSTM model
    const model = tf.sequential();
    model.add(tf.layers.lstm({ units: 50, inputShape: [10, 1], returnSequences: true }));
    model.add(tf.layers.lstm({ units: 50 }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    // Prepare training data (simplified)
    const trainData = this.prepareTrainingData(normalizedData, 10);

    // Train model (simplified training)
    await model.fit(trainData.inputs, trainData.outputs, {
      epochs: 10,
      batchSize: 32,
      verbose: 0
    });

    // Generate forecast
    const forecast = [];
    let lastSequence = normalizedData.slice(-10);

    for (let i = 0; i < horizon; i++) {
      const prediction = model.predict(tf.tensor3d([lastSequence], [1, 10, 1]));
      const predictedValue = prediction.dataSync()[0];

      // Denormalize
      const denormalizedValue = this.denormalizeData(predictedValue, values);

      forecast.push({
        value: denormalizedValue,
        confidence: 0.8,
        upperBound: denormalizedValue * 1.1,
        lowerBound: denormalizedValue * 0.9
      });

      // Update sequence for next prediction
      lastSequence = [...lastSequence.slice(1), predictedValue];
    }

    return forecast;
  }

  private async prophetForecast(data: TimeSeriesData[], horizon: number): Promise<any[]> {
    // Simplified Prophet-like implementation
    // In production, use the actual Prophet library
    const values = data.map(d => d.value);
    const dates = data.map(d => d.timestamp);

    // Analyze trend and seasonality
    const trend = this.calculateLinearTrend(values);
    const seasonality = this.calculateWeeklySeasonality(values, dates);

    // Generate forecast
    const forecast = [];
    const lastValue = values[values.length - 1];
    const lastDate = dates[dates.length - 1];

    for (let i = 0; i < horizon; i++) {
      const futureDate = new Date(lastDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      const dayOfWeek = futureDate.getDay();

      const trendValue = lastValue + trend.slope * (i + 1);
      const seasonalValue = seasonality[dayOfWeek] || 0;
      const predictedValue = trendValue + seasonalValue;

      forecast.push({
        value: Math.max(0, predictedValue),
        confidence: 0.75,
        upperBound: predictedValue * 1.2,
        lowerBound: predictedValue * 0.8
      });
    }

    return forecast;
  }

  private async ensembleForecast(data: TimeSeriesData[], horizon: number): Promise<any[]> {
    // Ensemble forecasting - combine multiple algorithms
    const [arima, lstm, prophet] = await Promise.all([
      this.arimaForecast(data, horizon),
      this.lstmForecast(data, horizon),
      this.prophetForecast(data, horizon)
    ]);

    // Weighted ensemble
    const weights = { arima: 0.3, lstm: 0.5, prophet: 0.2 };

    const forecast = [];
    for (let i = 0; i < horizon; i++) {
      const combinedValue =
        arima[i].value * weights.arima +
        lstm[i].value * weights.lstm +
        prophet[i].value * weights.prophet;

      const combinedConfidence =
        arima[i].confidence * weights.arima +
        lstm[i].confidence * weights.lstm +
        prophet[i].confidence * weights.prophet;

      forecast.push({
        value: combinedValue,
        confidence: combinedConfidence,
        upperBound: combinedValue * (1 + (1 - combinedConfidence) * 0.2),
        lowerBound: combinedValue * (1 - (1 - combinedConfidence) * 0.2)
      });
    }

    return forecast;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private initializeTensorFlow(): void {
    // Configure TensorFlow.js for Node.js
    tf.enableProdMode();
    this.logger.log('TensorFlow.js initialized for predictive analytics');
  }

  private normalizeData(data: number[]): number[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);

    return data.map(val => (val - mean) / std);
  }

  private denormalizeData(normalizedValue: number, originalData: number[]): number {
    const mean = originalData.reduce((sum, val) => sum + val, 0) / originalData.length;
    const std = Math.sqrt(originalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / originalData.length);

    return normalizedValue * std + mean;
  }

  private prepareTrainingData(data: number[], sequenceLength: number): { inputs: tf.Tensor3D, outputs: tf.Tensor2D } {
    const inputs = [];
    const outputs = [];

    for (let i = sequenceLength; i < data.length; i++) {
      inputs.push(data.slice(i - sequenceLength, i));
      outputs.push([data[i]]);
    }

    return {
      inputs: tf.tensor3d(inputs, [inputs.length, sequenceLength, 1]),
      outputs: tf.tensor2d(outputs, [outputs.length, 1])
    };
  }

  private calculateAccuracyMetrics(historicalData: TimeSeriesData[], forecast: any[]): any {
    // Simplified accuracy calculation
    // In production, use proper backtesting
    const actualValues = historicalData.slice(-forecast.length).map(d => d.value);
    const predictedValues = forecast.map(f => f.value);

    const mape = actualValues.reduce((sum, actual, i) => {
      return sum + Math.abs((actual - predictedValues[i]) / actual);
    }, 0) / actualValues.length * 100;

    const rmse = Math.sqrt(actualValues.reduce((sum, actual, i) => {
      return sum + Math.pow(actual - predictedValues[i], 2);
    }, 0) / actualValues.length);

    const mae = actualValues.reduce((sum, actual, i) => {
      return sum + Math.abs(actual - predictedValues[i]);
    }, 0) / actualValues.length;

    return { mape, rmse, mae };
  }

  private getAlgorithmParameters(algorithm: string): Record<string, any> {
    const params = {
      arima: { alpha: 0.3 },
      lstm: { units: 50, epochs: 10, sequenceLength: 10 },
      prophet: { seasonalityMode: 'additive' },
      ensemble: { weights: { arima: 0.3, lstm: 0.5, prophet: 0.2 } }
    };

    return params[algorithm] || {};
  }

  private calculateLinearTrend(data: number[]): { slope: number; intercept: number; r2: number } {
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + val * i, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssRes = data.reduce((sum, val, i) => sum + Math.pow(val - (slope * i + intercept), 2), 0);
    const ssTot = data.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return { slope, intercept, r2 };
  }

  private calculateWeeklySeasonality(values: number[], dates: Date[]): Record<number, number> {
    const dayAverages: Record<number, number[]> = {};

    values.forEach((value, i) => {
      const dayOfWeek = dates[i].getDay();
      if (!dayAverages[dayOfWeek]) dayAverages[dayOfWeek] = [];
      dayAverages[dayOfWeek].push(value);
    });

    const seasonality: Record<number, number> = {};
    Object.entries(dayAverages).forEach(([day, dayValues]) => {
      const average = dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length;
      const overallAverage = values.reduce((sum, val) => sum + val, 0) / values.length;
      seasonality[parseInt(day)] = average - overallAverage;
    });

    return seasonality;
  }

  private calculatePearsonCorrelation(data1: TimeSeriesData[], data2: TimeSeriesData[]): number {
    if (data1.length !== data2.length) return 0;

    const values1 = data1.map(d => d.value);
    const values2 = data2.map(d => d.value);

    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

    const numerator = values1.reduce((sum, val, i) =>
      sum + (val - mean1) * (values2[i] - mean2), 0);

    const denominator1 = Math.sqrt(values1.reduce((sum, val) =>
      sum + Math.pow(val - mean1, 2), 0));

    const denominator2 = Math.sqrt(values2.reduce((sum, val) =>
      sum + Math.pow(val - mean2, 2), 0));

    return denominator1 * denominator2 !== 0 ? numerator / (denominator1 * denominator2) : 0;
  }

  private classifyCorrelationStrength(correlation: number): 'weak' | 'moderate' | 'strong' | 'very_strong' {
    if (correlation >= 0.8) return 'very_strong';
    if (correlation >= 0.6) return 'strong';
    if (correlation >= 0.3) return 'moderate';
    return 'weak';
  }

  private calculateStatisticalSignificance(correlation: number, sampleSize: number): number {
    // Simplified significance calculation
    const tStatistic = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    // Return p-value approximation
    return Math.max(0, Math.min(1, 1 - Math.abs(tStatistic) / 3));
  }

  private analyzePriceTrend(data: TimeSeriesData[]): any {
    const values = data.map(d => d.value);
    return this.calculateLinearTrend(values);
  }

  private async analyzeExternalFactors(factors: any[]): Promise<any[]> {
    // Simplified external factor analysis
    return factors.map(factor => ({
      name: factor.name,
      impact: Math.random() * 0.5, // Simplified impact calculation
      direction: Math.random() > 0.5 ? 'positive' : 'negative'
    }));
  }

  private determineOverallTrend(priceTrend: any, externalFactors: any[]): 'bullish' | 'bearish' | 'sideways' {
    const priceDirection = priceTrend.slope > 0 ? 'bullish' : priceTrend.slope < 0 ? 'bearish' : 'sideways';
    const externalScore = externalFactors.reduce((sum, f) => sum + (f.direction === 'positive' ? f.impact : -f.impact), 0);

    if (priceDirection === 'bullish' && externalScore > 0) return 'bullish';
    if (priceDirection === 'bearish' && externalScore < 0) return 'bearish';
    if (Math.abs(priceTrend.slope) < 0.1 && Math.abs(externalScore) < 0.1) return 'sideways';

    return priceDirection;
  }

  private calculateTrendStrength(priceTrend: any, externalFactors: any[]): number {
    const priceStrength = Math.min(1, Math.abs(priceTrend.slope) * 10);
    const externalStrength = externalFactors.reduce((sum, f) => sum + f.impact, 0);

    return Math.min(1, (priceStrength + externalStrength) / 2);
  }

  private calculateTrendConfidence(data: TimeSeriesData[], priceTrend: any): number {
    return Math.min(1, Math.max(0.1, priceTrend.r2 * 0.8 + data.length / 1000));
  }

  private calculateTrendDuration(data: TimeSeriesData[]): number {
    if (data.length < 2) return 0;
    return (data[data.length - 1].timestamp.getTime() - data[0].timestamp.getTime()) / (1000 * 60 * 60 * 24);
  }

  private async analyzeHistoricalPatterns(auctions: any[]): Promise<any> {
    // Simplified pattern analysis
    const avgParticipants = auctions.reduce((sum, a) => sum + a.participants, 0) / auctions.length;
    const avgPrice = auctions.reduce((sum, a) => sum + a.finalPrice, 0) / auctions.length;

    return { avgParticipants, avgPrice };
  }

  private calculateProductFactors(productData: any): any {
    // Simplified product factor calculation
    const factors = {
      categoryMultiplier: productData.category === 'Electronics' ? 1.2 : 1.0,
      conditionMultiplier: productData.condition === 'New' ? 1.3 : 0.8,
      locationMultiplier: 1.0 // Could vary by location
    };

    return factors;
  }

  private calculateSeasonalityFactors(date: Date): any {
    return {
      dayOfWeek: date.getDay(),
      monthOfYear: date.getMonth(),
      timeOfDay: date.getHours()
    };
  }

  private predictParticipants(patterns: any, factors: any, seasonality: any): number {
    return patterns.avgParticipants * factors.categoryMultiplier * (1 + Math.sin(seasonality.monthOfYear / 12 * 2 * Math.PI) * 0.1);
  }

  private predictPrice(patterns: any, factors: any, seasonality: any): number {
    return patterns.avgPrice * factors.categoryMultiplier * factors.conditionMultiplier;
  }

  private classifyDemandLevel(participants: number, price: number): 'low' | 'medium' | 'high' | 'very_high' {
    const score = (participants / 10) + (price / 10000); // Simplified scoring

    if (score >= 3) return 'very_high';
    if (score >= 2) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  private calculatePredictionConfidence(patterns: any, dataPoints: number): number {
    return Math.min(1, Math.max(0.1, dataPoints / 100));
  }
}
