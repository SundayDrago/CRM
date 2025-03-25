<template>
  <div class="contact-container">
    <div class="contact">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.</p>

      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" v-model="name" placeholder="Enter your name" required>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" v-model="message" placeholder="Enter your message" required></textarea>
        </div>

        <div class="button-group">
          <button type="submit">Send Message</button>
          <button type="button" class="cancel-button" @click="goBack">Cancel</button>
        </div>
      </form>
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

    function submitForm() {
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
      alert("Your message has been sent successfully! Redirecting to Home Page...");

      // Redirect to HomePage
      router.push("/");
    }

    function goBack() {
      alert("You have canceled the contact form. Redirecting to Home Page...");
      router.push("/");
    }

    return { name, email, message, submitForm, goBack };
  },
};
</script>

<style scoped>
/* Contact Page Styling */
.contact-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f4f4;
  padding: 20px;
}

.contact {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

h1 {
  color: #222;
  font-size: 2em;
  margin-bottom: 10px;
}

p {
  color: #555;
  font-size: 1.1em;
  margin-bottom: 20px;
}

.form-group {
  text-align: left;
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  transition: border 0.3s ease;
  background: #fff;
}

input:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

textarea {
  height: 120px;
  resize: none;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  flex: 1;
  padding: 14px;
  background: #007bff;
  color: white;
  font-size: 1.2em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

button:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.cancel-button {
  background: #dc3545;
}

.cancel-button:hover {
  background: #a71d2a;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 600px) {
  .contact {
    padding: 20px;
  }

  h1 {
    font-size: 1.8em;
  }

  p {
    font-size: 1em;
  }

  button {
    font-size: 1.1em;
  }
}
</style>
