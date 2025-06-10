<template>
  <div class="recommendation-container">
    <!-- Header Section -->
    <div class="header-section">
      <h2>Customer Segmentation Recommendations</h2>
      <p class="subtitle">Tailored marketing strategies for each customer segment</p>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Segment Overview Section -->
      <div class="segment-overview">
        <h3>Segment Overview</h3>
        <div class="segment-selector">
          <label for="segment-select">Select Customer Segment</label>
          <select id="segment-select" v-model="selectedSegment" @change="updateSegmentData">
            <option v-for="segment in segments" :key="segment.value" :value="segment.value">{{ segment.label }}</option>
          </select>
        </div>
        
        <div class="segment-details" v-if="selectedSegmentData">
          <div class="segment-stats">
            <div class="stat-item">
              <span class="stat-label">Segment Size</span>
              <span class="stat-value">{{ segmentSize }}% of customers</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Top Category</span>
              <span class="stat-value">{{ topCategory }}</span>
            </div>
          </div>
          
          <div class="segment-characteristics">
            <h4>Key Characteristics</h4>
            <ul>
              <li v-for="(value, key) in segmentCharacteristics" :key="key">
                <strong>{{ formatKey(key) }}:</strong> {{ formatValue(value) }}
              </li>
            </ul>
          </div>
          
          <div class="segment-visuals">
            <div class="visual-card">
              <h5>{{ chartType }} Distribution</h5>
              <select v-model="chartType" @change="updateChartData">
                <option value="Category">Category Distribution</option>
                <option value="Demographic">Demographic Breakdown</option>
              </select>
              <DonutChart :chartData="currentChartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Behavioral Insights Section -->
      <div class="behavioral-insights" v-if="selectedSegmentData">
        <h3>Behavioral Insights</h3>
        
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="insight-content">
              <h4>Purchase Patterns</h4>
              <ul>
                <li>Average order value: ${{ purchasePatterns.avgOrderValue }}</li>
                <li>Purchase frequency: {{ purchasePatterns.frequency }}</li>
                <li>Preferred payment: {{ purchasePatterns.paymentMethod }}</li>
              </ul>
            </div>
          </div>
          
          <div class="insight-card">
            <div class="insight-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <div class="insight-content">
              <h4>Preferred Channels</h4>
              <ul>
                <li>Primary device: {{ preferredChannels.device }}</li>
                <li>Connection type: {{ preferredChannels.connection }}</li>
                <li>Referral rate: {{ preferredChannels.referral }}</li>
              </ul>
            </div>
          </div>
          
          <div class="insight-card">
            <div class="insight-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="insight-content">
              <h4>Product Interests</h4>
              <div class="product-interests">
                <span v-for="(value, category) in productInterests" 
                      :key="category"
                      class="interest-tag"
                      :style="{backgroundColor: getCategoryColor(category)}">
                  {{ category }} ({{ value }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recommendations Section -->
      <div class="recommendations-section" v-if="selectedSegmentData">
        <h3>Tailored Recommendations</h3>
        
        <div class="recommendation-cards">
          <div class="recommendation-card">
            <div class="card-header">
              <i class="fas fa-bullhorn"></i>
              <h4>Marketing Campaigns</h4>
            </div>
            <div class="card-content">
              <ul>
                <li v-for="(campaign, index) in campaignSuggestions" :key="index">
                  <i class="fas fa-check"></i> {{ campaign }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="recommendation-card">
            <div class="card-header">
              <i class="fas fa-percentage"></i>
              <h4>Promotions</h4>
            </div>
            <div class="card-content">
              <ul>
                <li v-for="(promo, index) in promotionSuggestions" :key="index">
                  <i class="fas fa-check"></i> {{ promo }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="recommendation-card">
            <div class="card-header">
              <i class="fas fa-users"></i>
              <h4>Engagement</h4>
            </div>
            <div class="card-content">
              <ul>
                <li v-for="(engagement, index) in engagementStrategies" :key="index">
                  <i class="fas fa-check"></i> {{ engagement }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Campaign Suggestions Section -->
      <div class="campaign-suggestions" v-if="selectedSegmentData">
        <h3>Campaign Implementation</h3>
        
        <div class="campaign-tabs">
          <button :class="{active: activeTab === 'email'}" @click="activeTab = 'email'">
            <i class="fas fa-envelope"></i> Email Campaigns
          </button>
          <button :class="{active: activeTab === 'ads'}" @click="activeTab = 'ads'">
            <i class="fas fa-ad"></i> Ad Targeting
          </button>
          <button :class="{active: activeTab === 'timing'}" @click="activeTab = 'timing'">
            <i class="fas fa-clock"></i> Timing
          </button>
        </div>
        
        <div class="campaign-content">
          <div v-if="activeTab === 'email'" class="email-suggestions">
            <h4>Suggested Email Campaigns</h4>
            <div class="email-examples">
              <div class="email-example">
                <h5>Subject Line: {{ emailSuggestions.subject1 }}</h5>
                <p>{{ emailSuggestions.content1 }}</p>
                <span class="confidence-badge">Confidence: {{ emailSuggestions.confidence1 }}%</span>
              </div>
              <div class="email-example">
                <h5>Subject Line: {{ emailSuggestions.subject2 }}</h5>
                <p>{{ emailSuggestions.content2 }}</p>
                <span class="confidence-badge">Confidence: {{ emailSuggestions.confidence2 }}%</span>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'ads'" class="ad-suggestions">
            <h4>Ad Targeting Recommendations</h4>
            <ul>
              <li v-for="(ad, index) in adTargeting" :key="index">
                <i class="fas fa-bullseye"></i> {{ ad }}
              </li>
            </ul>
            <div class="audience-tip">
              <p><strong>Lookalike Audience Tip:</strong> {{ lookalikeTip }}</p>
            </div>
          </div>
          
          <div v-if="activeTab === 'timing'" class="timing-suggestions">
            <h4>Optimal Timing</h4>
            <div class="timing-grid">
              <div class="timing-card" v-for="(time, channel) in optimalTiming" :key="channel">
                <div class="timing-channel">{{ channel }}</div>
                <div class="timing-details">{{ time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Predicted Outcomes Section -->
      <div class="outcomes-section" v-if="selectedSegmentData">
        <h3>Predicted Outcomes</h3>
        
        <div class="outcome-metrics">
          <div class="metric-card">
            <div class="metric-value">{{ predictedOutcomes.salesUplift }}%</div>
            <div class="metric-label">Projected Sales Uplift</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ predictedOutcomes.engagementIncrease }}%</div>
            <div class="metric-label">Engagement Increase</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ predictedOutcomes.retentionIncrease }}%</div>
            <div class="metric-label">Retention Increase</div>
          </div>
        </div>
        
        <div class="confidence-indicator">
          <div class="confidence-label">Model Confidence:</div>
          <div class="confidence-bar">
            <div class="confidence-fill" :style="{width: modelConfidence + '%'}"></div>
          </div>
          <div class="confidence-value">{{ modelConfidence }}%</div>
        </div>
        
        <div class="rationale-box">
          <h5>Recommendation Rationale</h5>
          <p>{{ recommendationRationale }}</p>
        </div>
      </div>
      
      <!-- Export and Integration Section -->
      <div class="export-section">
        <h3>Export & Integration</h3>
        
        <div class="export-options">
          <button class="export-button" @click="exportAs('PDF')">
            <i class="fas fa-file-pdf"></i> Export as PDF
          </button>
          <button class="export-button" @click="exportAs('CSV')">
            <i class="fas fa-file-csv"></i> Export as CSV
          </button>
          <button class="export-button" @click="exportAs('JSON')">
            <i class="fas fa-file-code"></i> Export as JSON
          </button>
        </div>
        
        <div class="integration-options">
          <h4>Send to Marketing Tools</h4>
          <div class="integration-buttons">
            <button class="integration-button">
              <i class="fab fa-mailchimp"></i> Mailchimp
            </button>
            <button class="integration-button">
              <i class="fab fa-hubspot"></i> HubSpot
            </button>
            <button class="integration-button">
              <i class="fas fa-chart-line"></i> Google Ads
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DonutChart from '@/components/Constants/DonutChart.vue';

export default {
  name: 'CustomerSegmentation',
  components: {
    DonutChart
  },
  props: {
    segmentationData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      segments: [],
      selectedSegment: 0,
      selectedSegmentData: null,
      segmentSize: 0,
      topCategory: '',
      segmentCharacteristics: {},
      categoryDistributionData: {},
      demographicData: {},
      currentChartData: {},
      chartType: 'Category',
      purchasePatterns: {},
      preferredChannels: {},
      productInterests: {},
      campaignSuggestions: [],
      promotionSuggestions: [],
      engagementStrategies: [],
      activeTab: 'email',
      emailSuggestions: {},
      adTargeting: [],
      lookalikeTip: '',
      optimalTiming: {},
      predictedOutcomes: {},
      modelConfidence: 0,
      recommendationRationale: '',
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      },
      categoryColors: {
        'Electronics': '#4e79a7',
        'Health & Beauty': '#f28e2b',
        'Fashion': '#e15759',
        'Groceries': '#76b7b2',
        'Shoes': '#59a14f',
        'Home & Living': '#edc948'
      }
    };
  },
  watch: {
    segmentationData: {
      immediate: true,
      handler(newData) {
        if (newData) {
          this.initializeSegments(newData);
        }
      }
    }
  },
  methods: {
    initializeSegments(data) {
      this.segments = data.clusters.map(clusterId => ({
        value: clusterId,
        label: `Cluster ${clusterId}`
      }));
      this.selectedSegment = this.segments[0]?.value || 0;
      this.loadSegmentData(this.selectedSegment);
      this.updateChartData();
    },
    
    updateSegmentData() {
      this.loadSegmentData(this.selectedSegment);
      this.updateChartData();
    },
    
    loadSegmentData(segmentId) {
      if (!this.segmentationData) {
        this.selectedSegmentData = null;
        return;
      }

      this.segmentSize = this.calculateSegmentSize(segmentId);
      this.topCategory = this.getTopCategory(segmentId);
      this.segmentCharacteristics = this.getSegmentCharacteristics(segmentId);
      this.categoryDistributionData = this.getCategoryDistributionData(segmentId);
      this.demographicData = this.getDemographicData(segmentId);
      this.purchasePatterns = this.getPurchasePatterns(segmentId);
      this.preferredChannels = this.getPreferredChannels(segmentId);
      this.productInterests = this.getProductInterests(segmentId);
      this.campaignSuggestions = this.getCampaignSuggestions();
      this.promotionSuggestions = this.getPromotionSuggestions(segmentId);
      this.engagementStrategies = this.getEngagementStrategies(segmentId);
      this.emailSuggestions = this.getEmailSuggestions(segmentId);
      this.adTargeting = this.getAdTargeting(segmentId);
      this.lookalikeTip = this.getLookalikeTip(segmentId);
      this.optimalTiming = this.getOptimalTiming();
      this.predictedOutcomes = this.getPredictedOutcomes(segmentId);
      this.modelConfidence = this.getModelConfidence();
      this.recommendationRationale = this.getRecommendationRationale(segmentId);
      this.selectedSegmentData = true;
    },
    
    calculateSegmentSize(segmentId) {
      const topClusters = this.segmentationData.Top_clusters || [];
      const clusterData = topClusters.find(cl => cl.cluster === segmentId);
      return clusterData?.percentage ? parseFloat(clusterData.percentage).toFixed(1) : 10;
    },
    
    getTopCategory(segmentId) {
      const patterns = this.segmentationData.patterns_of_each_cluster[segmentId] || {};
      let maxCount = 0;
      let topCategory = 'N/A';
      for (const [category, count] of Object.entries(patterns)) {
        if (count > maxCount) {
          maxCount = count;
          topCategory = category;
        }
      }
      return topCategory;
    },
    
    getSegmentCharacteristics(segmentId) {
      return {
        'Age Range': this.getAgeRange(segmentId),
        'Income Level': this.getIncomeLevel(segmentId),
        'Region': this.getPrimaryRegion(segmentId),
        'Purchase Frequency': this.getPurchaseFrequency(segmentId),
        'Loyalty Program': this.getLoyaltyStatus(segmentId),
        'Satisfaction Rating': this.getAvgSatisfaction(segmentId)
      };
    },
    
    getCategoryDistributionData(segmentId) {
      const distribution = this.segmentationData.cluster_category_distribution || {};
      const labels = [];
      const data = [];
      const backgroundColors = [];
      
      for (const [category, clusters] of Object.entries(distribution)) {
        const percentage = clusters[`${segmentId}`] || 0;
        if (percentage > 0) {
          labels.push(category);
          data.push(parseFloat(percentage));
          backgroundColors.push(this.categoryColors[category] || '#ccc');
        }
      }
      
      return {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      };
    },
    
    getDemographicData(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const genderData = attributes?.Gender?.[0] || { Male: 40, Female: 40, Other: 20 };
      
      return {
        labels: Object.keys(genderData),
        datasets: [{
          data: Object.values(genderData),
          backgroundColor: ['#4e79a7', '#f28e2b', '#59a14f'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      };
    },
    
    getClusterAttributes(segmentId) {
      const category = this.getTopCategory(segmentId);
      return this.segmentationData.Attributes_of_top_clusters[category]?.[segmentId] || null;
    },
    
    getPurchasePatterns(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      if (!attributes) {
        return {
          avgOrderValue: '50-100',
          frequency: 'Monthly',
          paymentMethod: 'Mobile Money'
        };
      }
      return {
        avgOrderValue: this.getAvgSpending(attributes), 
        frequency: this.getAverageValue(attributes?.reg_freq || {}),
        paymentMethod: this.getAverageValue(attributes?.payment_mtd || {}) 
      };
    },
    
    getPreferredChannels(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      if (!attributes) {
        return {
          device: 'Smartphones',
          connection: 'Mobile Data',
          referral: 'Low'
        };
      }
      
      return {
        device: this.getAverageValue(attributes?.device || {}),
        connection: this.getAverageValue(attributes?.connection || {}),
        referral: this.getAverageValue(attributes?.referral || {}) === 'Yes' ? 'High' : 'Low'
      };
    },
    
    getProductInterests(segmentId) {
      const distribution = this.segmentationData.category_distribution_by_cluster || {};
      const interests = {};
      
      for (const [category, clusters] of Object.entries(distribution)) {
        if (clusters[`${segmentId}`]) {
          interests[category] = parseFloat(clusters[`${segmentId}`]).toFixed(1);
        }
      }
      
      return interests;
    },
    
    getCampaignSuggestions() {
      const suggestions = [];
      if (this.segmentSize > 15) {
        suggestions.push("Launch targeted email campaign for this large segment");
      } else {
        suggestions.push("Create personalized campaigns for this niche segment");
      }
      if (this.topCategory === 'Electronics') {
        suggestions.push("Highlight tech products and accessories in campaigns");
      } else if (this.topCategory === 'Groceries') {
        suggestions.push("Focus on weekly deals and subscription options");
      }
      if (this.purchasePatterns.frequency.includes('Weekly') || 
          this.purchasePatterns.frequency.includes('Daily')) {
        suggestions.push("Implement a loyalty program for frequent buyers");
      }
      return suggestions.length ? suggestions : ["No specific campaigns recommended"];
    },
    
    getPromotionSuggestions(segmentId) {
      const suggestions = [];
      const attributes = this.getClusterAttributes(segmentId);
      
      if (this.getAverageValue(attributes?.reason || {}) === 'Discounts/offers') {
        suggestions.push("Offer exclusive discounts to this price-sensitive segment");
        suggestions.push("Create value bundles for popular products");
      }
      
      if (this.segmentCharacteristics['Purchase Frequency'] === 'High') {
        suggestions.push("Implement a tiered rewards program");
      }
      
      suggestions.push("Time-limited offers to create urgency");
      return suggestions.length ? suggestions : ["No specific promotions recommended"];
    },
    
    getEngagementStrategies(segmentId) {
      const strategies = [];
      const attributes = this.getClusterAttributes(segmentId);
      
      if (this.getAverageValue(attributes?.referral || {}) === 'Yes') {
        strategies.push("Implement a referral program with incentives");
      }
      
      if (this.getAverageValue(attributes?.loyality || {}) === 'No') {
        strategies.push("Develop onboarding campaign to introduce loyalty program");
      }
      
      strategies.push("Personalized product recommendations based on browsing history");
      strategies.push("Engage with interactive content (quizzes, polls)");
      return strategies.length ? strategies : ["No specific engagement strategies recommended"];
    },
    
    getEmailSuggestions(segmentId) {
      return {
        subject1: `Exclusive Offer for Cluster ${segmentId}!`,
        content1: `As a valued member of Cluster ${segmentId}, we're offering special discounts on ${this.topCategory} products. Shop now!`,
        confidence1: 85,
        subject2: `Your Personalized ${this.topCategory} Recommendations`,
        content2: `Based on your preferences, we've selected ${this.topCategory} items for you. Limited time offers available!`,
        confidence2: 78
      };
    },
    
    getAdTargeting(segmentId) {
      const targeting = [];
      const attributes = this.getClusterAttributes(segmentId);
      
      targeting.push(`Target ${this.getAverageValue(attributes?.Gender || {}) || 'All'} users`);
      targeting.push(`Focus on ${this.getPrimaryRegion(segmentId)} region`);
      
      if (this.topCategory) {
        targeting.push(`Highlight ${this.topCategory} products in ads`);
      }
      
      return targeting.length ? targeting : ["No specific ad targeting recommended"];
    },
    
    getLookalikeTip(segmentId) {
      return `Create lookalike audience based on Cluster ${segmentId} characteristics`;
    },
    
    getOptimalTiming() {
      return {
        'Email': 'Weekdays 9-11 AM',
        'Social Media': 'Evenings 7-9 PM',
        'Push Notifications': 'Weekends 10 AM-12 PM'
      };
    },
    
    getPredictedOutcomes(segmentId) {
      return {
        salesUplift: (10 + segmentId * 2).toFixed(1),
        engagementIncrease: (15 + segmentId * 1.5).toFixed(1),
        retentionIncrease: (5 + segmentId * 0.5).toFixed(1)
      };
    },
    
    getModelConfidence() {
      return Math.min(95, 70 + this.selectedSegment * 3);
    },
    
    getRecommendationRationale(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const reason = this.getAverageValue(attributes?.reason || {}) || 'N/A';
      return `Recommendations are based on this segment's ${this.topCategory} purchasing behavior, 
              ${this.getPurchaseFrequency(segmentId)} purchase frequency, and preference for 
              ${reason}.`;
    },
    
    getAverageValue(obj) {
      if (!obj || Object.keys(obj).length === 0) return 'N/A';
      let maxValue = 0;
      let topKey = '';
      for (const [key, value] of Object.entries(obj)) {
        if (value > maxValue) {
          maxValue = value;
          topKey = key;
        }
      }
      return topKey;
    },
    
    getAgeRange(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const encoded = attributes?.Age_encoded || {};
      const topValue = this.getAverageValue(encoded);
      switch (topValue) {
        case '1.0': return '18-24';
        case '2.0': return '25-34';
        case '3.0': return '35-44';
        case '4.0': return '45+';
        default: return '25-35';
      }
    },
    
    getIncomeLevel(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const encoded = attributes?.Monthly_Income_encoded || {};
      const topValue = this.getAverageValue(encoded);
      switch (topValue) {
        case '1.0': return 'Low';
        case '2.0': return 'Medium';
        case '3.0': return 'High';
        case '4.0': return 'Very High';
        default: return 'Medium';
      }
    },
    
    getPrimaryRegion(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      return this.getAverageValue(attributes?.region || {}) || 'Central';
    },
    
    getPurchaseFrequency(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const freq = this.getAverageValue(attributes?.reg_freq || {});
      return freq === 'A few times a year' ? 'Low' : 
             freq === 'Monthly' ? 'Medium' :
             freq === 'Weekly' || freq === 'Daily' ? 'High' : 'Medium';
    },
    
    getLoyaltyStatus(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      return this.getAverageValue(attributes?.loyality || {}) || 'No';
    },
    
    getAvgSatisfaction(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const ratings = attributes?.rate_of_sat || {};
      if (!Object.keys(ratings).length) return '3.5/5';
      
      let total = 0;
      let count = 0;
      for (const [rating, freq] of Object.entries(ratings)) {
        total += parseInt(rating) * freq;
        count += freq;
      }
      return count ? (total / count).toFixed(1) + '/5' : '3.5/5';
    },
    
    getAvgSpending(attributes) {
      const encoded = attributes?.avg_spending_encoded || {};
      const topValue = this.getAverageValue(encoded);
      switch (topValue) {
        case '1': return '$50-100';
        case '2': return '$100-200';
        case '3': return '$200-500';
        case '4': return '$500+';
        default: return '$100-200';
      }
    },
    
    updateChartData() {
      this.currentChartData = this.chartType === 'Category' 
        ? this.categoryDistributionData 
        : this.demographicData;
    },
    
    formatKey(key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    
    formatValue(value) {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value || 'N/A';
    },
    
    getCategoryColor(category) {
      return this.categoryColors[category] || '#cccccc';
    },
    
    exportAs(format) {
      alert(`Exporting Cluster ${this.selectedSegment} data as ${format}`);
    }
  }
};
</script>

<style scoped>
.recommendation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.header-section {
  margin-bottom: 2rem;
  text-align: center;
}

.header-section h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 0;
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.segment-overview {
  margin-bottom: 3rem;
}

.segment-selector {
  margin-bottom: 1.5rem;
}

.segment-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.segment-selector select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.segment-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.segment-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.segment-characteristics {
  margin-bottom: 1.5rem;
}

.segment-characteristics h4 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.segment-characteristics ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.segment-characteristics li {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.segment-visuals {
  margin-top: 1.5rem;
}

.visual-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.visual-card h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #2c3e50;
}

.visual-card select {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.behavioral-insights {
  margin-bottom: 3rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.insight-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
}

.insight-icon {
  background: #3498db;
  color: white;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.insight-content {
  padding: 1rem;
  flex: 1;
}

.insight-content h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.insight-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.insight-content li {
  padding: 0.25rem 0;
  font-size: 0.95rem;
}

.product-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.interest-tag {
  padding: 0.25rem 0.5rem;
  background: #eee;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}

.recommendations-section {
  margin-bottom: 3rem;
}

.recommendation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recommendation-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: #3498db;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header i {
  font-size: 1.2rem;
}

.card-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.card-content {
  padding: 1rem;
}

.card-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.card-content li {
  padding: 0.5rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.card-content li i {
  color: #3498db;
  margin-top: 0.2rem;
}

.campaign-suggestions {
  margin-bottom: 3rem;
}

.campaign-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.campaign-tabs button {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campaign-tabs button.active {
  background: #3498db;
  color: white;
}

.campaign-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.email-suggestions h4,
.ad-suggestions h4,
.timing-suggestions h4 {
  margin-top: 0;
}

.email-examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

.email-example {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.email-example h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #3498db;
}

.email-example p {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.confidence-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e8f4fc;
  color: #3498db;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.ad-suggestions ul {
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
}

.ad-suggestions li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ad-suggestions li i {
  color: #3498db;
}

.audience-tip {
  background: #f8f4e8;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 4px solid #f1c40f;
}
.timing-suggestions {
  margin-top: 1rem;
}

.timing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.timing-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  text-align: center;
}

.timing-channel {
  font-weight: 600;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.timing-details {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.outcomes-section {
  margin-bottom: 3rem;
}

.outcome-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.confidence-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.confidence-label {
  font-weight: 500;
  min-width: 120px;
}

.confidence-bar {
  flex: 1;
  height: 10px;
  background: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  transition: width 0.5s ease;
}

.confidence-value {
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.rationale-box {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.rationale-box h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.rationale-box p {
  margin-bottom: 0;
  line-height: 1.6;
}

.export-section {
  margin-top: 3rem;
}

.export-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.export-button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.export-button:hover {
  background: #2980b9;
}

.export-button i {
  font-size: 1.1rem;
}

.integration-options h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.integration-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.integration-button {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #2c3e50;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.integration-button:hover {
  border-color: #3498db;
  color: #3498db;
}

.integration-button i {
  font-size: 1.1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .segment-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .email-examples {
    grid-template-columns: 1fr;
  }
  
  .recommendation-cards {
    grid-template-columns: 1fr;
  }
  
  .export-options, .integration-buttons {
    flex-direction: column;
  }
  
  .export-button, .integration-button {
    width: 100%;
    justify-content: center;
  }
}

/* Animation for segment transitions */
.segment-details {
  transition: all 0.3s ease;
}

/* Tooltip styles */
[data-tooltip] {
  position: relative;
  cursor: pointer;
}

[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 10;
}

/* Loading state */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Accessibility focus styles */
button:focus, select:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
</style>