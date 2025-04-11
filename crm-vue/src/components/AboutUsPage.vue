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
      <router-link to="/register" class="cta-btn">Get Started</router-link>
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
          name: "Dr. Sarah Chen",
          title: "Chief Data Scientist",
          bio: "Leads our AI research with over 15 years in machine learning.",
          avatar: "/assets/team/sarah-chen.jpg",
        },
        {
          id: 2,
          name: "Michael Rodriguez",
          title: "Head of Product",
          bio: "Drives product innovation with a focus on user experience.",
          avatar: "/assets/team/michael-rodriguez.jpg",
        },
        {
          id: 3,
          name: "Priya Patel",
          title: "Lead Engineer",
          bio: "Architects our scalable analytics infrastructure.",
          avatar: "/assets/team/priya-patel.jpg",
        },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
$primary: #4a6cf7;
$secondary: #2d3748;
$accent: #ed64a6;
$background: #f7fafc;
$text: #2d3748;
$error: #e53e3e;
$border: #e2e8f0;

.about-us-container {
  min-height: 100vh;
  background: linear-gradient(135deg, $background 0%, darken($background, 5%) 100%);
  padding: 2rem;
  position: relative;
}

.hero-section {
  text-align: center;
  padding: 4rem 1rem;
  background: $primary;
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  .hero-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: $text;
    margin-bottom: 0.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
    color: lighten($text, 20%);
  }
}

.overview-section {
  max-width: 800px;
  margin: 0 auto 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  p {
    font-size: 1rem;
    color: lighten($text, 10%);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
}

.mission-section {
  max-width: 1000px;
  margin: 0 auto 3rem;
}

.mission-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.mission-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .card-icon {
    font-size: 2rem;
    color: $primary;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: lighten($text, 20%);
  }
}

.team-section {
  max-width: 1000px;
  margin: 0 auto 3rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.team-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .team-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
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
    font-size: 1.2rem;
    font-weight: 600;
    color: $text;
    margin-bottom: 0.25rem;
  }

  .team-title {
    font-size: 0.9rem;
    color: $primary;
    margin-bottom: 0.5rem;
  }

  .team-bio {
    font-size: 0.85rem;
    color: lighten($text, 20%);
  }
}

.cta-section {
  text-align: center;
  padding: 3rem 1rem;
  background: $primary;
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 1.5rem;
  }

  .cta-btn {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: white;
    color: $primary;
    font-weight: 500;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: darken(white, 10%);
    }
  }
}

.back-link {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  color: $primary;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem;

    h1 {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }
  }

  .mission-cards,
  .team-grid {
    grid-template-columns: 1fr;
  }

  .overview-section {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .about-us-container {
    padding: 1rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }
}
</style>