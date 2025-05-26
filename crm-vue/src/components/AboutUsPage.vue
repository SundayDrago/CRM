<template>
  <div class="about-us-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <i class="fas fa-chart-pie hero-icon"></i>
        <h1>About Customer Segmentation</h1>
        <p class="hero-subtitle">
          Empowering businesses with advanced analytics and AI-driven insights.
        </p>
      </div>
    </section>

    <!-- Overview Section -->
    <section class="overview-section">
      <div class="section-header">
        <h2>Who We Are</h2>
        <p class="section-subtitle">
          Pioneering the future of customer understanding through cutting-edge technology.
        </p>
      </div>
      <div class="overview-content">
        <p>
          The Customer Segmentation System is an innovative platform designed to help businesses unlock the power of their customer data. By leveraging advanced machine learning and real-time analytics, we provide actionable insights that drive growth, optimize marketing strategies, and enhance customer experiences.
        </p>
        <p>
          Founded by a team of data scientists, industry experts, and technology enthusiasts, our mission is to make sophisticated analytics accessible to businesses of all sizes. Whether you're a startup or an enterprise, we’re here to help you understand your audience like never before.
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="mission-section">
      <div class="section-header">
        <h2>Our Mission</h2>
        <p class="section-subtitle">Transforming data into opportunity.</p>
      </div>
      <div class="mission-cards">
        <div class="mission-card">
          <i class="fas fa-lightbulb card-icon"></i>
          <h3>Innovation</h3>
          <p>Delivering state-of-the-art tools to uncover hidden patterns in customer behavior.</p>
        </div>
        <div class="mission-card">
          <i class="fas fa-users card-icon"></i>
          <h3>Empowerment</h3>
          <p>Enabling businesses to make data-driven decisions with confidence.</p>
        </div>
        <div class="mission-card">
          <i class="fas fa-shield-alt card-icon"></i>
          <h3>Trust</h3>
          <p>Ensuring ethical data practices and robust security for your peace of mind.</p>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-section">
      <div class="section-header">
        <h2>Meet Our Team</h2>
        <p class="section-subtitle">The minds behind the magic.</p>
      </div>
      <div class="team-grid">
        <div v-for="member in teamMembers" :key="member.id" class="team-card">
          <div class="team-avatar">
            <img :src="member.avatar" :alt="member.name" class="avatar" />
          </div>
          <h3>{{ member.name }}</h3>
          <p class="team-title">{{ member.title }}</p>
          <p class="team-bio">{{ member.bio }}</p>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section">
      <h2>Ready to Transform Your Business?</h2>
      <p>Join thousands of companies leveraging our platform to gain a competitive edge.</p>
      <router-link to="/register" class="cta-btn">
        <span>Get Started</span>
        <span class="arrow-icon">→</span>
      </router-link>
    </section>

    <!-- Back to Home Link -->
    <router-link to="/" class="back-link">
      <i class="fas fa-arrow-left"></i> Return to Home
    </router-link>
  </div>
</template>

<script>
export default {
  name: "AboutUsPage",
  data() {
    return {
      teamMembers: [
        {
          id: 1,
          name: "Geriga Sunday Drago",
          title: "Project Leader",
          bio: "Guides the team with strategic vision and expertise in data analytics.",
          avatar: require("@/assets/img-3.jpg"),
        },
        {
          id: 2,
          name: "Akoldou Samuel Wel",
          title: "Project Coordinator & Developer",
          bio: "Coordinates project efforts and builds robust system features.",
          avatar: require("@/assets/img-2.jpg"),
        },
      ],
    };
  },
};
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

// Typography
$font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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

.about-us-container {
  min-height: 100vh;
  background: linear-gradient(135deg, $background 0%, darken($background, 3%) 100%);
  padding: $spacing-xl;
  position: relative;
}

.hero-section {
  text-align: center;
  padding: $spacing-xl;
  background: $white;
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-xl;
  box-shadow: $shadow-lg;
  animation: fadeInUp 0.6s ease-out;

  .hero-icon {
    font-size: 3rem;
    color: $primary;
    margin-bottom: $spacing-lg;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: $font-weight-bold;
    color: $secondary;
    margin-bottom: $spacing-sm;
  }

  .hero-subtitle {
    font-size: $font-size-lg;
    color: $text;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
}

.section-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  h2 {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    color: $secondary;
    margin-bottom: $spacing-sm;
  }

  .section-subtitle {
    font-size: $font-size-base;
    color: $text;
    line-height: 1.6;
  }
}

.overview-section {
  max-width: 800px;
  margin: 0 auto $spacing-xl;
  padding: $spacing-lg;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  animation: fadeInUp 0.8s ease-out;

  p {
    font-size: $font-size-base;
    color: $text;
    line-height: 1.6;
    margin-bottom: $spacing-md;
  }
}

.mission-section {
  max-width: 1000px;
  margin: 0 auto $spacing-xl;
}

.mission-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-lg;
}

.mission-card {
  background: $white;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  text-align: center;
  box-shadow: $shadow-md;
  transition: all 0.3s ease;
  animation: fadeInUp 1s ease-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: $shadow-lg;
  }

  .card-icon {
    font-size: 2rem;
    color: $primary;
    margin-bottom: $spacing-md;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $secondary;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: $text;
    line-height: 1.6;
  }
}

.team-section {
  max-width: 1000px;
  margin: 0 auto $spacing-xl;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
}

.team-card {
  background: $white;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  text-align: center;
  box-shadow: $shadow-md;
  transition: all 0.3s ease;
  animation: fadeInUp 1.2s ease-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: $shadow-lg;
  }

  .team-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto $spacing-md;
    overflow: hidden;
    border-radius: 50%;
    border: 3px solid $primary;

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h3 {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $secondary;
    margin-bottom: $spacing-xs;
  }

  .team-title {
    font-size: $font-size-sm;
    color: $primary;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-sm;
  }

  .team-bio {
    font-size: $font-size-sm;
    color: $text;
    line-height: 1.6;
  }
}

.cta-section {
  text-align: center;
  padding: $spacing-xl;
  background: lighten($background, 2%);
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-xl;
  box-shadow: $shadow-lg;
  animation: fadeInUp 1.4s ease-out;

  h2 {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    color: $secondary;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-base;
    color: $text;
    margin-bottom: $spacing-lg;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background: $primary;
    color: $white;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    text-decoration: none;
    border-radius: $border-radius-pill;
    transition: all 0.3s ease;

    &:hover {
      background: #388E3C; // Darker green from UserLoginPage.vue
      transform: translateY(-2px);
    }
  }

  .arrow-icon {
    margin-left: 8px;
    font-size: $font-size-base;
  }
}

.back-link {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  color: $primary;
  text-decoration: none;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  transition: all 0.2s ease;

  &:hover {
    color: darken($primary, 10%);
    text-decoration: underline;
  }

  i {
    font-size: $font-size-sm;
  }
}

@media (max-width: 768px) {
  .about-us-container {
    padding: $spacing-lg;
  }

  .hero-section {
    padding: $spacing-lg;

    h1 {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: $font-size-base;
    }
  }

  .mission-cards,
  .team-grid {
    grid-template-columns: 1fr;
  }

  .overview-section {
    padding: $spacing-md;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .about-us-container {
    padding: $spacing-md;
  }

  .hero-section {
    padding: $spacing-md;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .cta-section h2 {
    font-size: 1.5rem;
  }
}
</style>