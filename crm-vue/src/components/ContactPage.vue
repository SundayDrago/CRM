<template>
  <div class="contact-container">
    <div class="contact-card">
      <div class="contact-header">
        <h1>Get in Touch</h1>
        <p class="subtitle">We're here to help and answer any questions you might have.</p>
      </div>

      <form @submit.prevent="submitForm" class="contact-form">
        <div class="form-group">
          <label for="name">Your Name</label>
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input type="text" id="name" v-model="name" placeholder="John Doe" required>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input type="email" id="email" v-model="email" placeholder="john@example.com" required>
          </div>
        </div>

        <div class="form-group">
          <label for="message">Your Message</label>
          <div class="input-wrapper">
            <i class="fas fa-pen input-icon"></i>
            <textarea id="message" v-model="message" placeholder="How can we help you?" required></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span>Send Message</span>
            <span class="arrow-icon" v-if="!isSubmitting">→</span>
            <div v-else class="spinner"></div>
          </button>
          <button type="button" class="cancel-btn" @click="goBack">
            <span>Cancel</span>
          </button>
        </div>
      </form>

      <div class="contact-info">
        <div class="info-item">
          <i class="fas fa-envelope-open-text"></i>
          <span>yacobedan@gmail.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const name = ref("");
    const email = ref("");
    const message = ref("");
    const isSubmitting = ref(false);

    function submitForm() {
      if (isSubmitting.value) return;

      isSubmitting.value = true;

      try {
        const recipient = "yacobedan@gmail.com";
        const subject = encodeURIComponent(`New Contact Form Submission from ${name.value}`);
        const body = encodeURIComponent(
          `Name: ${name.value}\nEmail: ${email.value}\n\nMessage:\n${message.value}`
        );

        // Open email client
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

        // Clear form fields
        name.value = "";
        email.value = "";
        message.value = "";

        // Show success message
        alert("Your message has been sent successfully! We'll get back to you soon.");

        // Redirect to HomePage
        router.push("/");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error sending your message. Please try again.");
      } finally {
        isSubmitting.value = false;
      }
    }

    function goBack() {
      router.push("/");
    }

    return { name, email, message, isSubmitting, submitForm, goBack };
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

.contact-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background 0%, darken($background, 3%) 100%);
  padding: $spacing-md;
}

.contact-card {
  width: 100%;
  max-width: 580px;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.contact-header {
  padding: $spacing-xl;
  text-align: center;
}

.contact-header h1 {
  font-size: 2.25rem;
  font-weight: $font-weight-bold;
  color: $secondary;
  margin-bottom: $spacing-sm;
}

.subtitle {
  font-size: $font-size-base;
  color: $text;
  line-height: 1.6;
}

.contact-form {
  padding: $spacing-xl;
}

.form-group {
  margin-bottom: $spacing-lg;
}

.form-group label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text;
  margin-bottom: $spacing-sm;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  color: lighten($text, 25%);
  font-size: $font-size-sm;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: $spacing-sm $spacing-md $spacing-sm $spacing-xl;
  border: 1px solid $border;
  border-radius: $border-radius-md;
  font-size: $font-size-base;
  font-family: $font-family;
  transition: all 0.2s ease;
  background: $white;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
  }

  &::placeholder {
    color: lighten($text, 40%);
  }
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
  padding-top: $spacing-md;
}

.form-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.submit-btn,
.cancel-btn {
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
}

.submit-btn {
  background: $primary;
  color: $white;
  border: none;

  &:hover:not(:disabled) {
    background: #388E3C; // Darker green from UserLoginPage.vue
    transform: translateY(-2px);
  }

  &:disabled {
    background: $disabled;
    cursor: not-allowed;
  }
}

.arrow-icon {
  margin-left: 8px;
  font-size: $font-size-base;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: $white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.cancel-btn {
  background: $border;
  color: $text;
  border: none;

  &:hover {
    background: darken($border, 10%);
    transform: translateY(-2px);
  }
}

.contact-info {
  padding: $spacing-lg;
  background: lighten($background, 2%);
  border-top: 1px solid $border;
}

.info-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $text;
}

.info-item i {
  color: $primary;
  font-size: $font-size-base;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .contact-container {
    padding: $spacing-sm;
  }

  .contact-card {
    max-width: 100%;
  }

  .contact-header,
  .contact-form {
    padding: $spacing-lg;
  }

  .contact-header h1 {
    font-size: 1.875rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .contact-header,
  .contact-form,
  .contact-info {
    padding: $spacing-md;
  }

  .contact-header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: $font-size-sm;
  }
}
</style>