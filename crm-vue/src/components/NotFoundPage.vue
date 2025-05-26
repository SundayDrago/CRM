<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <div class="not-found-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
      <router-link to="/login" class="home-link">
        <span>Back to Login</span>
        <span class="arrow-icon">→</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',
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

.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background 0%, darken($background, 3%) 100%);
  padding: $spacing-md;
}

.not-found-card {
  width: 100%;
  max-width: 440px;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  padding: $spacing-xl;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.not-found-icon {
  font-size: 4rem;
  color: $error;
  margin-bottom: $spacing-lg;

  i {
    animation: pulse 2s infinite ease-in-out;
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

h1 {
  font-size: 2.25rem;
  font-weight: $font-weight-bold;
  color: $secondary;
  margin-bottom: $spacing-sm;
}

p {
  font-size: $font-size-lg;
  color: $text;
  margin-bottom: $spacing-xl;
  line-height: 1.6;
}

.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  font-family: $font-family;
  border-radius: $border-radius-pill;
  cursor: pointer;
  transition: all 0.3s ease;
  background: $primary;
  color: $white;
  text-decoration: none;

  &:hover {
    background: #388E3C; // Darker green from UserLoginPage.vue
    transform: translateY(-2px);
  }
}

.arrow-icon {
  margin-left: 8px;
  font-size: $font-size-base;
}

@media (max-width: 480px) {
  .not-found-container {
    padding: $spacing-sm;
  }

  .not-found-card {
    margin: $spacing-sm;
    padding: $spacing-lg;
  }

  h1 {
    font-size: 1.875rem;
  }

  p {
    font-size: $font-size-base;
  }

  .not-found-icon {
    font-size: 3rem;
  }
}
</style>