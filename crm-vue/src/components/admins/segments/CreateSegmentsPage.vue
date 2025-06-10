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
        <p v-if="fetchStatus" :class="{'error': !fetchSuccess}">{{ fetchStatus }}</p>
        
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
            <div class="stat-item">
              <span class="stat-label">Average Order Value</span>
              <span class="stat-value">${{ purchasePatterns.avgOrderValue }}</span>
            </div>
          </div>
          
          <div class="segment-characteristics">
            <h4>Key Characteristics</h4>
            <ul>
              <li v-for="(value, key) in segmentCharacteristics" :key="key">
                <strong>{{ formatKey(key) }}:</strong> {{ value }}
              </li>
            </ul>
          </div>
          
          <div class="segment-visuals">
            <div class="visual-card">
              <h5>Category Preferences</h5>
              <div class="category-tags">
                <span v-for="(value, category) in productInterests" 
                      :key="category"
                      class="category-tag"
                      :style="{backgroundColor: getCategoryColor(category)}">
                  {{ category }} ({{ value }}%)
                </span>
              </div>
            </div>
            <div class="visual-card">
              <h5>Demographic Breakdown</h5>
              <div class="demographic-stats">
                <div class="demographic-item">
                  <span class="demographic-label">Gender</span>
                  <span class="demographic-value">{{ getTopValue(getClusterAttributes(selectedSegment)?.Gender) }}</span>
                </div>
                <div class="demographic-item">
                  <span class="demographic-label">Age Range</span>
                  <span class="demographic-value">{{ segmentCharacteristics['Age Range'] }}</span>
                </div>
                <div class="demographic-item">
                  <span class="demographic-label">Income Level</span>
                  <span class="demographic-value">{{ segmentCharacteristics['Income Level'] }}</span>
                </div>
                <div class="demographic-item">
                  <span class="demographic-label">Top Region</span>
                  <span class="demographic-value">{{ segmentCharacteristics['Region'] }}</span>
                </div>
              </div>
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
                <li>Loyalty program: {{ getLoyaltyStatus(selectedSegment) }}</li>
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
                <li>Satisfaction: {{ getAvgSatisfaction(selectedSegment) }}</li>
              </ul>
            </div>
          </div>
          
          <div class="insight-card">
            <div class="insight-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="insight-content">
              <h4>Top Interests</h4>
              <div class="top-interests">
                <div class="interest-item" v-for="(value, category) in productInterests" :key="category">
                  <div class="interest-category">{{ category }}</div>
                  <div class="interest-bar">
                    <div class="interest-fill" :style="{width: value + '%', backgroundColor: getCategoryColor(category)}"></div>
                  </div>
                  <div class="interest-value">{{ value }}%</div>
                </div>
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
                <div class="email-meta">
                  <span class="confidence-badge">Confidence: {{ emailSuggestions.confidence1 }}%</span>
                  <span class="email-tip">Best for: {{ getTopCategory(selectedSegment) }} buyers</span>
                </div>
              </div>
              <div class="email-example">
                <h5>Subject Line: {{ emailSuggestions.subject2 }}</h5>
                <p>{{ emailSuggestions.content2 }}</p>
                <div class="email-meta">
                  <span class="confidence-badge">Confidence: {{ emailSuggestions.confidence2 }}%</span>
                  <span class="email-tip">Best for: {{ getPurchaseFrequency(selectedSegment) }} purchasers</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="activeTab === 'ads'" class="ad-suggestions">
            <h4>Ad Targeting Recommendations</h4>
            <ul class="ad-targeting-list">
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
          <div class="metric-card">
            <div class="metric-value">{{ modelConfidence }}%</div>
            <div class="metric-label">Model Confidence</div>
          </div>
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
            <button class="integration-button" @click="sendToMailchimp">
              <i class="fab fa-mailchimp"></i> Mailchimp
            </button>
            <button class="integration-button" @click="sendToHubspot">
              <i class="fab fa-hubspot"></i> HubSpot
            </button>
            <button class="integration-button" @click="sendToGoogleAds">
              <i class="fas fa-chart-line"></i> Google Ads
            </button>
          </div>
          <div v-if="integrationStatus" class="integration-status" :class="{'success': integrationSuccess, 'error': !integrationSuccess}">
            <i :class="integrationSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            {{ integrationStatus }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CreateSegmentPage',
  data() {
    return {
      fetchStatus: '',
      fetchSuccess: false,
      segments: [],
      selectedSegment: 0,
      selectedSegmentData: null,
      segmentSize: 0,
      topCategory: '',
      segmentCharacteristics: {},
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
      integrationStatus: '',
      integrationSuccess: false,
      categoryColors: {
        'Electronics': '#4e79a7',
        'Health & Beauty': '#f28e2b',
        'Fashion': '#e15759',
        'Groceries': '#76b7b2',
        'Shoes': '#59a14f',
        'Home & Living': '#edc948'
      },
      clusterData: null // Store backend response
    };
  },
  async created() {
    await this.fetchClusterData();
  },
  methods: {
    async fetchClusterData() {
      try {
        this.fetchStatus = 'Loading cluster data...';
        const response = await axios.get('http://localhost:8000/cluster');
        this.clusterData = response.data;
        console.log('Fetched cluster data:', response.data); // Debug log
        console.log('Top_clusters:', response.data.Top_clusters); // Debug log
        this.fetchStatus = 'Data loaded successfully.';
        this.fetchSuccess = true;

        // Dynamically generate segments based on clusters
        this.segments = response.data.clusters.map((cluster, index) => ({
          value: cluster,
          label: this.getSegmentLabel(cluster, index)
        }));

        // Load data for the default segment
        this.selectedSegment = this.segments[0]?.value || 0;
        this.updateSegmentData();
      } catch (error) {
        this.fetchSuccess = false;
        this.fetchStatus = error.response?.data?.detail || 'Error fetching cluster data. Please ensure data is available.';
        console.error('Fetch error:', error);
        this.selectedSegmentData = false;
      }
    },
    async updateSegmentData() {
      if (!this.clusterData) {
        console.warn('No cluster data available for segment update');
        this.selectedSegmentData = false;
        return;
      }
      this.loadSegmentData(this.selectedSegment);
    },
    loadSegmentData(segmentId) {
      this.segmentSize = this.calculateSegmentSize(segmentId);
      this.topCategory = this.getTopCategory(segmentId);
      this.segmentCharacteristics = this.getSegmentCharacteristics(segmentId);
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
      this.modelConfidence = this.getModelConfidence(segmentId);
      this.recommendationRationale = this.getRecommendationRationale(segmentId);
      this.selectedSegmentData = true;
    },
    getSegmentLabel(cluster, index) {
      const labels = [
        'Tech Enthusiasts', 'Budget Shoppers', 'Home & Living Focused', 'Frequent Buyers',
        'Occasional Shoppers', 'High-Value Customers', 'Health Conscious', 'Impulse Shoppers',
        'Brand Loyalists', 'Eco-Conscious'
      ];
      return labels[index] || `Segment ${cluster}`;
    },
    calculateSegmentSize(segmentId) {
      const topClusters = this.clusterData?.Top_clusters || [];
      if (!Array.isArray(topClusters)) {
        console.error('Top_clusters is not an array:', topClusters);
        return 10; // Fallback value
      }
      const clusterData = topClusters.find(c => c.cluster === segmentId);
      return clusterData?.percentage || 10; // Fallback to 10 if no data
    },
    getTopCategory(segmentId) {
      const patterns = this.clusterData?.patterns_of_each_cluster?.[`cluster_${segmentId}`] || {};
      let maxCount = 0;
      let topCategory = '';
      for (const [category, count] of Object.entries(patterns)) {
        if (count > maxCount) {
          maxCount = count;
          topCategory = category;
        }
      }
      return topCategory || 'N/A';
    },
    getSegmentCharacteristics(segmentId) {
      return {
        'Age Range': this.getAgeRange(segmentId),
        'Income Level': this.getIncomeLevel(segmentId),
        'Region': this.getTopRegion(segmentId),
        'Purchase Frequency': this.getPurchaseFrequency(segmentId),
        'Loyalty Program': this.getLoyaltyStatus(segmentId),
        'Satisfaction Rating': this.getAvgSatisfaction(segmentId)
      };
    },
    getClusterAttributes(segmentId) {
      return (
        this.clusterData?.Attributes_of_top_clusters?.[`cluster_${segmentId}`] || {
          Gender: { Male: 50, Female: 40, Other: 10 },
          Age_encoded: { '1.0': 20, '2.0': 50, '3.0': 20, '4.0': 10 },
          Monthly_Income_encoded: { '1.0': 30, '2.0': 40, '3.0': 20, '4.0': 10 },
          region: { Central: 40, North: 30, South: 20, West: 10 },
          reg_freq: { Daily: 10, Weekly: 30, Monthly: 50, 'A few times a year': 10 },
          payment_mtd: { 'Mobile Money': 50, Card: 40, Cash: 10 },
          reason: { 'Discounts/offers': 40, Quality: 30, Convenience: 20, Other: 10 },
          loyality: { Yes: 50, No: 50 },
          rate_of_sat: { '1': 10, '2': 20, '3': 30, '4': 30, '5': 10 },
          avg_spending_encoded: { '1': 30, '2': 40, '3': 20, '4': 10 },
          device: { Smartphones: 60, Desktop: 30, Tablet: 10 },
          connection: { 'Mobile Data': 50, WiFi: 40, Other: 10 },
          referral: { Yes: 30, No: 70 }
        }
      );
    },
    getPurchasePatterns(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      return {
        avgOrderValue: this.getAvgSpending(attributes),
        frequency: this.getTopValue(attributes.reg_freq),
        paymentMethod: this.getTopValue(attributes.payment_mtd)
      };
    },
    getPreferredChannels(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      return {
        device: this.getTopValue(attributes.device),
        connection: this.getTopValue(attributes.connection),
        referral: this.getTopValue(attributes.referral) === 'Yes' ? 'High' : 'Low'
      };
    },
    getProductInterests(segmentId) {
      const distribution = this.clusterData?.category_distribution_by_cluster || {};
      const interests = {};
      for (const category in distribution) {
        if (distribution[category][`cluster_${segmentId}`]) {
          interests[category] = distribution[category][`cluster_${segmentId}`].toFixed(1);
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
      return suggestions;
    },
    getPromotionSuggestions(segmentId) {
      const suggestions = [];
      const attributes = this.getClusterAttributes(segmentId);
      if (this.getTopValue(attributes?.reason) === 'Discounts/offers') {
        suggestions.push("Offer exclusive discounts to this price-sensitive segment");
        suggestions.push("Create value bundles for popular products");
      }
      if (this.segmentCharacteristics['Purchase Frequency'] === 'High') {
        suggestions.push("Implement a tiered rewards program");
      }
      suggestions.push("Time-limited offers to create urgency");
      return suggestions;
    },
    getEngagementStrategies(segmentId) {
      const strategies = [];
      const attributes = this.getClusterAttributes(segmentId);
      if (this.getTopValue(attributes?.referral) === 'Yes') {
        strategies.push("Implement a referral program with incentives");
      }
      if (this.getTopValue(attributes?.loyality) === 'No') {
        strategies.push("Develop onboarding campaign to introduce loyalty program");
      }
      strategies.push("Personalized product recommendations based on browsing history");
      strategies.push("Engage with interactive content (quizzes, polls)");
      return strategies;
    },
    getEmailSuggestions(segmentId) {
      return {
        subject1: this.getEmailSubject1(segmentId),
        content1: this.getEmailContent1(segmentId),
        confidence1: 85,
        subject2: this.getEmailSubject2(),
        content2: this.getEmailContent2(),
        confidence2: 78
      };
    },
    getAdTargeting(segmentId) {
      const targeting = [];
      const attributes = this.getClusterAttributes(segmentId);
      targeting.push(`Target ${this.getTopValue(attributes?.Gender) || 'All'} users`);
      targeting.push(`Focus on ${this.getTopRegion(segmentId)} region`);
      if (this.topCategory) {
        targeting.push(`Highlight ${this.topCategory} products in ads`);
      }
      return targeting;
    },
    getLookalikeTip(segmentId) {
      return `Create lookalike audience based on ${this.segments.find(s => s.value === segmentId)?.label || 'this'} segment's characteristics`;
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
    getModelConfidence(segmentId) {
      return Math.min(95, 70 + segmentId * 3);
    },
    getRecommendationRationale(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const reason = this.getTopValue(attributes?.reason) || 'N/A';
      return `Recommendations are based on this segment's ${this.getTopCategory(segmentId)} purchasing behavior, 
              ${this.getPurchaseFrequency(segmentId)} purchase frequency, and preference for 
              ${reason}.`;
    },
    getTopValue(obj) {
      if (!obj) return 'N/A';
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
      const encoded = this.getClusterAttributes(segmentId)?.Age_encoded;
      if (!encoded) return '25-35';
      const topValue = this.getTopValue(encoded);
      switch(topValue) {
        case '1.0': return '18-25';
        case '2.0': return '25-35';
        case '3.0': return '35-45';
        case '4.0': return '45+';
        default: return '25-35';
      }
    },
    getIncomeLevel(segmentId) {
      const encoded = this.getClusterAttributes(segmentId)?.Monthly_Income_encoded;
      if (!encoded) return 'Medium';
      const topValue = this.getTopValue(encoded);
      switch(topValue) {
        case '1.0': return 'Low';
        case '2.0': return 'Medium';
        case '3.0': return 'High';
        case '4.0': return 'Very High';
        default: return 'Medium';
      }
    },
    getTopRegion(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      return attributes ? this.getTopValue(attributes.region) : 'Central';
    },
    getPurchaseFrequency(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      if (!attributes) return 'Monthly';
      const freq = this.getTopValue(attributes.reg_freq);
      return freq === 'A few times a year' ? 'Low' :
             freq === 'Monthly' ? 'Medium' :
             freq === 'Weekly' || freq === 'Daily' ? 'High' : 'Medium';
    },
    getLoyaltyStatus(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      return attributes ? this.getTopValue(attributes.loyality) : 'No';
    },
    getAvgSatisfaction(segmentId) {
      const attributes = this.getClusterAttributes(segmentId);
      const ratings = attributes?.rate_of_sat || { '1': 10, '2': 20, '3': 30, '4': 30, '5': 10 };
      let total = 0;
      let count = 0;
      for (const [rating, freq] of Object.entries(ratings)) {
        total += parseInt(rating) * freq;
        count += freq;
      }
      return count ? (total / count).toFixed(1) + '/5' : '3.5/5';
    },
    getAvgSpending(attributes) {
      const encoded = attributes?.avg_spending_encoded;
      if (!encoded) return '$100-200';
      const topValue = this.getTopValue(encoded);
      switch(topValue) {
        case '1': return '$50-100';
        case '2': return '$100-200';
        case '3': return '$200-500';
        case '4': return '$500+';
        default: return '$100-200';
      }
    },
    getEmailSubject1(segmentId) {
      const segmentName = this.segments.find(s => s.value === segmentId)?.label || 'Valued Customer';
      return `Exclusive Offer Just for ${segmentName}!`;
    },
    getEmailContent1(segmentId) {
      const segmentName = this.segments.find(s => s.value === segmentId)?.label || 'Valued Customer';
      return `As one of our valued ${segmentName}, 
              we're offering you special discounts on ${this.topCategory} products you'll love. 
              Shop now and save!`;
    },
    getEmailSubject2() {
      return `Your Personalized ${this.topCategory} Recommendations`;
    },
    getEmailContent2() {
      return `Based on your shopping preferences, we've selected these ${this.topCategory} 
              items just for you. Limited time offers available!`;
    },
    formatKey(key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getCategoryColor(category) {
      return this.categoryColors[category] || '#cccccc';
    },
    exportAs(format) {
      alert(`Exporting segment ${this.selectedSegment} data as ${format}`);
    },
    async sendToMailchimp() {
      try {
        this.integrationStatus = 'Preparing segment data for Mailchimp...';
        const segmentData = {
          name: this.segments.find(s => s.value === this.selectedSegment)?.label || 'Segment',
          criteria: {
            interests: this.productInterests,
            demographics: this.segmentCharacteristics,
            behavior: this.purchasePatterns,
            channels: this.preferredChannels
          },
          campaignSuggestions: this.campaignSuggestions
        };
        this.integrationStatus = 'Connecting to Mailchimp API...';
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.9) {
              resolve({ status: 'success', list_id: 'mock_list_123' });
            } else {
              reject(new Error('Mailchimp API rate limit exceeded'));
            }
          }, 1000);
        });
        this.integrationStatus = 'Creating audience segment...';
        await new Promise(resolve => setTimeout(resolve, 500));
        this.integrationSuccess = true;
        this.integrationStatus = `Segment "${segmentData.name}" successfully created in Mailchimp!`;
        console.log('Mailchimp integration: Segment created', segmentData);
      } catch (error) {
        this.integrationSuccess = false;
        this.integrationStatus = `Mailchimp integration failed: ${error.message || 'Unknown error'}`;
        console.error('Mailchimp integration error:', error);
      }
    },
    async sendToHubspot() {
      try {
        this.integrationStatus = 'Preparing segment data for HubSpot...';
        const segmentData = {
          name: this.segments.find(s => s.value === this.selectedSegment)?.label || 'Segment',
          filters: {
            properties: {
              age_range: this.segmentCharacteristics['Age Range'],
              income_level: this.segmentCharacteristics['Income Level'],
              region: this.segmentCharacteristics['Region'],
              purchase_frequency: this.purchasePatterns.frequency
            },
            interests: this.productInterests
          },
          recommendations: this.campaignSuggestions
        };
        this.integrationStatus = 'Authenticating with HubSpot API...';
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.85) {
              resolve({ status: 'success', list_id: 'mock_hubspot_list_456' });
            } else {
              reject(new Error('Invalid HubSpot credentials'));
            }
          }, 800);
        });
        this.integrationStatus = 'Creating dynamic list in HubSpot...';
        await new Promise(resolve => setTimeout(resolve, 600));
        this.integrationSuccess = true;
        this.integrationStatus = `Segment "${segmentData.name}" successfully created in HubSpot!`;
        console.log('HubSpot integration: Segment created', segmentData);
      } catch (error) {
        this.integrationSuccess = false;
        this.integrationStatus = `HubSpot integration failed: ${error.message || 'Connection error'}`;
        console.error('HubSpot integration error:', error);
      }
    },
    async sendToGoogleAds() {
      try {
        this.integrationStatus = 'Preparing audience data for Google Ads...';
        const audienceData = {
          name: this.segments.find(s => s.value === this.selectedSegment)?.label || 'Segment',
          attributes: {
            gender: this.getTopValue(this.getClusterAttributes(this.selectedSegment)?.Gender) || 'All',
            region: this.segmentCharacteristics['Region'] || '',
            interests: Object.keys(this.productInterests),
            purchase_behavior: this.purchasePatterns
          },
          targeting: this.getAdTargeting(this.selectedSegment)
        };
        this.integrationStatus = 'Connecting to Google Ads API...';
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.80) {
              resolve({ status: 'success', audience_id: 'mock_audience_789' });
            } else {
              reject(new Error('Google Ads API temporarily unavailable'));
            }
          }, 1200);
        });
        this.integrationStatus = 'Creating custom audience...';
        await new Promise(resolve => setTimeout(resolve, 700));
        this.integrationSuccess = true;
        this.integrationStatus = `Audience "${audienceData.name}" successfully created in Google Ads!`;
        console.log('Google Ads integration: Audience created', audienceData);
      } catch (error) {
        this.integrationSuccess = false;
        this.integrationStatus = `Google Ads integration failed: ${error.message || 'Unknown error'}`;
        console.error('Google Ads integration error:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Existing styles unchanged */
.recommendation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Add styles for upload section */
.upload-section {
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.upload-section h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.upload-section input[type="file"] {
  display: block;
  margin-bottom: 1rem;
}

.upload-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.upload-button:hover {
  background: #2980b9;
}

.upload-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.upload-section p.success {
  color: #2ecc71;
}

.upload-section p.error {
  color: #e74c3c;
}

/* Rest of the existing styles unchanged */
.header-section {
  margin-bottom: 2rem;
  text-align: center;
}
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

/* Segment Overview Styles */
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
  background-color: white;
  transition: border-color 0.3s ease;
}

.segment-selector select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.segment-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.segment-stats {
  display: flex;
  gap:1.5rem;
flex-wrap: wrap;
margin-bottom: 1.5rem;
}

.stat-item {
flex: 1 1 200px;
background: white;
border-radius: 6px;
padding: 1rem;
text-align: center;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
display: block;
font-size: 0.9rem;
color: #7f8c8d;
margin-bottom: 0.5rem;
}

.stat-value {
font-size: 1.2rem;
font-weight: 600;
color: #2c3e50;
}

.segment-characteristics {
margin-bottom: 1.5rem;
}

.segment-characteristics h4 {
font-size: 1.2rem;
color: #2c3e50;
margin-bottom: 1rem;
}

.segment-characteristics ul {
list-style: none;
padding: 0;
}

.segment-characteristics li {
font-size: 1rem;
color: #34495e;
margin-bottom: 0.5rem;
}

.segment-visuals {
display: flex;
gap: 1.5rem;
flex-wrap: wrap;
}

.visual-card {
flex: 1 1 300px;
background: white;
border-radius: 6px;
padding: 1rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.visual-card h5 {
font-size: 1.1rem;
color: #2c3e50;
margin-bottom: 1rem;
}

.category-tags {
display: flex;
flex-wrap: wrap;
gap: 0.5rem;
}

.category-tag {
padding: 0.5rem 1rem;
border-radius: 12px;
font-size: 0.9rem;
color: white;
font-weight: 500;
}

.demographic-stats {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 1rem;
}

.demographic-item {
text-align: center;
}

.demographic-label {
display: block;
font-size: 0.9rem;
color: #7f8c8d;
margin-bottom: 0.3rem;
}

.demographic-value {
font-size: 1rem;
font-weight: 600;
color: #2c3e50;
}

/* Behavioral Insights Styles */
.behavioral-insights {
margin-bottom: 3rem;
}

.insights-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 1.5rem;
}

.insight-card {
background: white;
border-radius: 6px;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
display: flex;
gap: 1rem;
}

.insight-icon {
font-size: 1.5rem;
color: #3498db;
}

.insight-content h4 {
font-size: 1.2rem;
color: #2c3e50;
margin-bottom: 1rem;
}

.insight-content ul {
list-style: none;
padding: 0;
}

.insight-content li {
font-size: 0.95rem;
color: #34495e;
margin-bottom: 0.5rem;
}

.top-interests {
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.interest-item {
display: grid;
grid-template-columns: 100px 1fr 50px;
align-items: center;
gap: 0.5rem;
}

.interest-category {
font-size: 0.9rem;
color: #34495e;
}

.interest-bar {
background: #ecf0f1;
border-radius: 12px;
height: 8px;
overflow: hidden;
}

.interest-fill {
height: 100%;
transition: width 0.3s ease;
}

.interest-value {
font-size: 0.9rem;
color: #34495e;
text-align: right;
}

/* Recommendations Section Styles */
.recommendations-section {
margin-bottom: 3rem;
}

.recommendation-cards {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 1.5rem;
}

.recommendation-card {
background: white;
border-radius: 6px;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 1rem;
}

.card-header i {
font-size: 1.2rem;
color: #3498db;
}

.card-header h4 {
font-size: 1.2rem;
color: #2c3e50;
margin: 0;
}

.card-content ul {
list-style: none;
padding: 0;
}

.card-content li {
font-size: 0.95rem;
color: #34495e;
margin-bottom: 0.5rem;
display: flex;
align-items: center;
gap: 0.5rem;
}

.card-content i {
color: #2ecc71;
}

/* Campaign Suggestions Styles */
.campaign-suggestions {
margin-bottom: 3rem;
}

.campaign-tabs {
display: flex;
gap: 0.5rem;
margin-bottom: 1.5rem;
}

.campaign-tabs button {
flex: 1;
padding: 0.75rem;
border: none;
border-radius: 6px;
background: #ecf0f1;
color: #34495e;
font-size: 1rem;
cursor: pointer;
transition: background 0.3s ease;
}

.campaign-tabs button.active {
background: #3498db;
color: white;
}

.campaign-tabs button i {
margin-right: 0.5rem;
}

.campaign-content {
background: #f8f9fa;
border-radius: 6px;
padding: 1.5rem;
}

.email-examples {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 1.5rem;
}

.email-example {
background: white;
border-radius: 6px;
padding: 1rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.email-example h5 {
font-size: 1.1rem;
color: #2c3e50;
margin-bottom: 0.5rem;
}

.email-example p {
font-size: 0.95rem;
color: #34495e;
margin-bottom: 0.75rem;
}

.email-meta {
display: flex;
justify-content: space-between;
align-items: center;
}

.confidence-badge {
background: #2ecc71;
color: white;
padding: 0.3rem 0.6rem;
border-radius: 12px;
font-size: 0.85rem;
}

.email-tip {
font-size: 0.85rem;
color: #7f8c8d;
}

.ad-targeting-list {
list-style: none;
padding: 0;
}

.ad-targeting-list li {
font-size: 0.95rem;
color: #34495e;
margin-bottom: 0.5rem;
display: flex;
align-items: center;
gap: 0.5rem;
}

.ad-targeting-list i {
color: #e74c3c;
}

.audience-tip {
margin-top: 1rem;
font-size: 0.95rem;
color: #34495e;
}

.timing-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1rem;
}

.timing-card {
background: white;
border-radius: 6px;
padding: 1rem;
text-align: center;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timing-channel {
font-size: 1rem;
font-weight: 600;
color: #2c3e50;
margin-bottom: 0.5rem;
}

.timing-details {
font-size: 0.9rem;
color: #34495e;
}

/* Predicted Outcomes Styles */
.outcomes-section {
margin-bottom: 3rem;
}

.outcome-metrics {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 1.5rem;
margin-bottom: 1.5rem;
}

.metric-card {
background: white;
border-radius: 6px;
padding: 1rem;
text-align: center;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-value {
font-size: 1.5rem;
font-weight: 600;
color: #2c3e50;
margin-bottom: 0.5rem;
}

.metric-label {
font-size: 0.9rem;
color: #7f8c8d;
}

.rationale-box {
background: #f8f9fa;
border-radius: 6px;
padding: 1.5rem;
}

.rationale-box h5 {
font-size: 1.1rem;
color: #2c3e50;
margin-bottom: 0.75rem;
}

.rationale-box p {
font-size: 0.95rem;
color: #34495e;
}

/* Export and Integration Styles */
.export-section {
margin-bottom: 3rem;
}

.export-options {
display: flex;
gap: 1rem;
margin-bottom: 1.5rem;
}

.export-button {
flex: 1;
padding: 0.75rem;
border: none;
border-radius: 6px;
background: #3498db;
color: white;
font-size: 1rem;
cursor: pointer;
transition: background 0.3s ease;
}

.export-button:hover {
background: #2980b9;
}

.export-button i {
margin-right: 0.5rem;
}

.integration-options h4 {
font-size: 1.2rem;
color: #2c3e50;
margin-bottom: 1rem;
}

.integration-buttons {
display: flex;
gap: 1rem;
}

.integration-button {
flex: 1;
padding: 0.75rem;
border: none;
border-radius: 6px;
background: #ecf0f1;
color: #34495e;
font-size: 1rem;
cursor: pointer;
transition: background 0.3s ease;
}

.integration-button:hover {
background: #dfe6e9;
}

.integration-button i {
margin-right: 0.5rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
.recommendation-container {
padding: 1rem;
}

.header-section h2 {
font-size: 1.5rem;
}

.subtitle {
font-size: 1rem;
}

.main-content {
padding: 1rem;
}

.segment-stats {
flex-direction: column;
}

.segment-visuals {
flex-direction: column;
}

.insights-grid {
grid-template-columns: 1fr;
}

.recommendation-cards {
grid-template-columns: 1fr;
}

.campaign-tabs {
flex-direction: column;
}

.outcome-metrics {
grid-template-columns: 1fr;
}

.export-options {
flex-direction: column;
}

.integration-buttons {
flex-direction: column;
}
}
</style>