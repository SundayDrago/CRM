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
          <input type="text" id="name" v-model="name" placeholder="John Doe" required>
          <span class="input-icon"><i class="fas fa-user"></i></span>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" v-model="email" placeholder="john@example.com" required>
          <span class="input-icon"><i class="fas fa-envelope"></i></span>
        </div>

        <div class="form-group">
          <label for="message">Your Message</label>
          <textarea id="message" v-model="message" placeholder="How can we help you?" required></textarea>
          <span class="input-icon"><i class="fas fa-pen"></i></span>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">
            <span>Send Message</span>
            <i class="fas fa-paper-plane"></i>
          </button>
          <button type="button" class="cancel-btn" @click="goBack">
            <span>Cancel</span>
            <i class="fas fa-times"></i>
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

<style scoped>
/* Base Styles */
:root {
  --primary-color: #4361ee;
  --primary-hover: #3a56d4;
  --danger-color: #f72585;
  --danger-hover: #e5177b;
  --text-color: #2b2d42;
  --text-light: #8d99ae;
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
}

/* Contact Container */
.contact-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--bg-color);
  background-image: radial-gradient(circle at 10% 20%, rgba(91, 173, 254, 0.1) 0%, rgba(245, 245, 245, 0.1) 90%);
}

.contact-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 580px;
  overflow: hidden;
  transform: translateY(0);
  transition: var(--transition);
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.contact-header {
  padding: 2.5rem 2.5rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  color: white;
}

.contact-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 400;
}

/* Contact Form */
.contact-form {
  padding: 2rem 2.5rem;
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-color);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: var(--transition);
  background-color: #f9fafb;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 2.4rem;
  color: var(--text-light);
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  background-color: white;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.submit-btn {
  background-color: var(--primary-color);
  color: rgb(5, 3, 3);
  border: 1px solid;
  position: relative;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.8;
}

.submit-btn.loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-left: 8px;
}

.cancel-btn {
  background-color: white;
  color: var(--danger-color);
  border: 1px solid #e0e0e0;
}

.cancel-btn:hover {
  background-color: #fef2f2;
  color: var(--danger-hover);
  border-color: #fecaca;
}

/* Contact Info */
.contact-info {
  padding: 1.5rem 2.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #eee;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.info-item i {
  font-size: 1rem;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.contact-card {
  animation: fadeIn 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-container {
    padding: 1rem;
  }

  .contact-header,
  .contact-form {
    padding: 1.5rem;
  }

  .contact-header h1 {
    font-size: 1.8rem;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .contact-header {
    padding: 1.5rem 1rem;
  }

  .contact-form {
    padding: 1.5rem 1rem;
  }

  .contact-info {
    padding: 1rem;
  }
}
</style>