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
          Next
        </button>
        <button
          v-else
          @click="completeOnboarding"
          class="btn btn-success"
        >
          Get Started!
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

<style scoped>
.get-started {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
}

.header p {
  color: #7f8c8d;
  font-size: 1.2rem;
}

.content {
  display: flex;
  gap: 2rem;
}

.steps {
  flex: 1;
}

.step {
  display: flex;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.step:hover {
  background-color: #f5f5f5;
}

.step.active {
  border-color: #7993de;
  background-color: #f0f9f5;
}

.step-number {
  width: 40px;
  height: 40px;
  background-color: #7993de;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-weight: bold;
}

.step-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.step-info p {
  margin: 0;
  color: #7f8c8d;
}

.step-content {
  flex: 2;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}

.step-content h2 {
  color: #2c3e50;
  margin-top: 0;
}

.code-example {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  overflow-x: auto;
}

pre {
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #007bff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #2c3e50;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-success {
  background-color: #007bff;
  color: white;
}

.btn-success:hover {
  background-color: #007bff;
}

.footer {
  text-align: center;
  margin-top: 2rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.footer a {
  color: #040407;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
}
</style>
