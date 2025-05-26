<template>
  <div class="get-started">
    <header class="header">
      <h1>Welcome to Our Customer Segmentation System</h1>
      <p>Let's guide you through the steps to get started with understanding your customer data!</p>
    </header>

    <main class="content">
      <div class="steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="{ 'active': currentStep === index }"
          @click="currentStep = index"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-info">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>

      <div class="step-content">
        <h2>{{ steps[currentStep].title }}</h2>
        <p>{{ steps[currentStep].details }}</p>
        <div v-if="steps[currentStep].code" class="code-example">
          <pre><code>{{ steps[currentStep].code }}</code></pre>
        </div>
      </div>

      <div class="actions">
        <button
          v-if="currentStep > 0"
          @click="prevStep"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          class="btn btn-primary"
        >
          <span>Next</span>
          <span class="arrow-icon">→</span>
        </button>
        <button
          v-else
          @click="completeOnboarding"
          class="btn btn-primary"
        >
          <span>Get Started!</span>
          <span class="arrow-icon">→</span>
        </button>
      </div>
    </main>

    <footer class="footer">
      <p>Need help? <a href="/contact-us">Contact support</a></p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'GetStarted',
  data() {
    return {
      currentStep: 0,
      steps: [
        {
          title: 'Step 1: Collect Customer Data',
          description: 'Gather relevant customer data from your CRM or database.',
          details: 'To create effective customer segments, ensure that you have access to sufficient customer data such as demographics, purchase history, or browsing behavior.',
          code: `// Example: Fetching customer data from the database
fetch('/api/customers')
  .then(response => response.json())
  .then(data => console.log(data));`
        },
        {
          title: 'Step 2: Analyze the Data',
          description: 'Perform data analysis to identify patterns and trends.',
          details: 'Use statistical or machine learning models to understand relationships and common characteristics across your customer data.',
          code: `// Example: Data analysis with clustering (K-means)
import { KMeans } from 'ml-kmeans';

const customerData = [{ age: 25, income: 50000 }, { age: 30, income: 60000 }];
const kmeans = new KMeans();
const result = kmeans.cluster(customerData, 2);
console.log(result);`
        },
        {
          title: 'Step 3: Define Customer Segments',
          description: 'Segment your customers into meaningful groups.',
          details: 'Based on your analysis, create customer segments that align with business goals, like age groups, spending behavior, or purchase preferences.',
          code: `// Example: Defining customer segments
const segments = {
  young: customerData.filter(customer => customer.age < 30),
  highSpenders: customerData.filter(customer => customer.income > 75000),
};
console.log(segments);`
        },
        {
          title: 'Step 4: Take Action',
          description: 'Utilize customer segments for targeted marketing and personalized strategies.',
          details: 'Now that you have your segments, apply them for personalized campaigns, improved customer service, or tailored product recommendations.',
          code: null
        }
      ]
    }
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    completeOnboarding() {
      this.$emit('onboarding-complete')
      // Alternatively, you could route to the dashboard
      // this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped lang="scss">
// Consistent Color Palette
$primary: #4CAF50; // Green from UserLoginPage.vue
$secondary: #1e293b; // Dark gray for headers
$accent: #10b981; // Emerald green for secondary actions
$background: #f8fafc; // Light gray background
$text: #334155; // Slate gray for body text
$error: #ef4444; // Red for error states
$border: #e2e8f0; // Light gray for borders
$white: #ffffff; // White for cards
$disabled: #cccccc; // Gray for disabled state
$code-bg: #1e293b; // Dark background for code blocks
$code-text: #f8f8f2; // Light text for code blocks

// Typography
$font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
$font-family-mono: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
$font-size-base: 1rem;
$font-size-sm: 0.875rem;
$font-size-lg: 1.125rem;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

// Spacing
$spacing-unit: 1rem;
$spacing-xs: $spacing-unit * 0.25;
$spacing-sm: $spacing-unit * 0.5;
$spacing-md: $spacing-unit;
$spacing-lg: $spacing-unit * 1.5;
$spacing-xl: $spacing-unit * 2;

// Border Radius
$border-radius-sm: 6px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-pill: 50px;

// Shadows
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.1);

// Animation
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.get-started {
  max-width: 1000px;
  margin: 0 auto;
  padding: $spacing-xl;
  font-family: $font-family;
  background: $background;
  min-height: 100vh;
  animation: fadeInUp 0.6s ease-out;
}

.header {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: $font-weight-bold;
  color: $secondary;
  margin-bottom: $spacing-sm;
}

.header p {
  font-size: $font-size-lg;
  color: $text;
  line-height: 1.6;
}

.content {
  display: flex;
  gap: $spacing-lg;
}

.steps {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.step {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $white;
  border-radius: $border-radius-md;
  border: 1px solid $border;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: $shadow-sm;

  &:hover {
    transform: scale(1.02);
    box-shadow: $shadow-md;
  }

  &.active {
    border-color: $primary;
    background: lighten($primary, 45%);
    box-shadow: $shadow-md;
  }
}

.step-number {
  width: 40px;
  height: 40px;
  background: $primary;
  color: $white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
}

.step-info {
  flex: 1;
}

.step-info h3 {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $secondary;
  margin: 0 0 $spacing-xs;
}

.step-info p {
  font-size: $font-size-sm;
  color: $text;
  margin: 0;
}

.step-content {
  flex: 2;
  background: $white;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
}

.step-content h2 {
  font-size: 1.75rem;
  font-weight: $font-weight-bold;
  color: $secondary;
  margin: 0 0 $spacing-md;
}

.step-content p {
  font-size: $font-size-base;
  color: $text;
  line-height: 1.6;
  margin-bottom: $spacing-lg;
}

.code-example {
  background: $code-bg;
  color: $code-text;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  margin-top: $spacing-md;
  overflow-x: auto;
  font-family: $font-family-mono;
  font-size: $font-size-sm;
}

pre {
  margin: 0;
}

code {
  white-space: pre-wrap;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  font-family: $font-family;
  border: none;
  border-radius: $border-radius-pill;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: $primary;
  color: $white;

  &:hover {
    background: #388E3C; // Darker green from UserLoginPage.vue
    transform: translateY(-2px);
  }
}

.btn-secondary {
  background: $border;
  color: $text;

  &:hover {
    background: darken($border, 10%);
    transform: translateY(-2px);
  }
}

.arrow-icon {
  margin-left: 8px;
  font-size: $font-size-base;
}

.footer {
  text-align: center;
  margin-top: $spacing-xl;
  font-size: $font-size-sm;
  color: $text;
}

.footer a {
  color: $primary;
  text-decoration: none;
  font-weight: $font-weight-medium;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .get-started {
    padding: $spacing-md;
  }

  .content {
    flex-direction: column;
  }

  .step-content {
    padding: $spacing-md;
  }

  .header h1 {
    font-size: 2rem;
  }

  .header p {
    font-size: $font-size-base;
  }

  .actions {
    justify-content: center;
  }
}
</style>