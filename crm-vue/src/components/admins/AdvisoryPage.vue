<template>
  <div class="advisory-committee">
    <h1>Advisory Committee</h1>
    <p class="description">
      The Advisory Committee provides strategic guidance, ensures ethical compliance, and validates technical aspects of the customer segmentation system.
    </p>

    <div class="content-container">
      <!-- Committee Members Section -->
      <div class="section">
        <h2>Committee Members</h2>
        <transition-group name="fade-slide" tag="div" class="members-list">
          <div v-for="member in committeeMembers" :key="member.id" class="member-card">
            <img :src="member.avatar" alt="Avatar" class="avatar" @error="(e) => e.target.src = defaultAvatar" />
            <strong>{{ member.name }}</strong>
            <p>{{ member.role }}</p>
            <a :href="'mailto:' + member.email" class="email-icon" title="Send Email">
              <i class="fas fa-envelope"></i>
            </a>
          </div>
        </transition-group>
      </div>

      <!-- Responsibilities Section -->
      <div class="section">
        <h2>Key Responsibilities</h2>
        <transition name="fade-slide">
          <ul class="responsibilities-list">
            <li v-for="responsibility in responsibilities" :key="responsibility.id">
              {{ responsibility.task }}
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdvisoryCommitteePage",
  data() {
    return {
      defaultAvatar: "https://via.placeholder.com/100", // Placeholder avatar
      committeeMembers: [
        { id: 1, name: "Dr. John Smith", role: "Faculty Supervisor", email: "john.smith@example.com", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
        { id: 2, name: "Prof. Jane Doe", role: "Ethics & Compliance Advisor", email: "jane.doe@example.com", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
        { id: 3, name: "Mr. Alex Brown", role: "Industry Expert", email: "alex.brown@example.com", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
        { id: 4, name: "Ms. Emily White", role: "Data Science Mentor", email: "emily.white@example.com", avatar: "https://randomuser.me/api/portraits/women/4.jpg" }
      ],
      responsibilities: [
        { id: 1, task: "Ensure ethical AI and fair segmentation practices." },
        { id: 2, task: "Validate compliance with academic research standards." },
        { id: 3, task: "Review technical aspects and data quality." },
        { id: 4, task: "Provide feedback for continuous improvement." }
      ]
    };
  }
};
</script>

<style scoped>
/* Main Container */
.advisory-committee {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 10px;
}

.description {
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  text-align: center;
}

h2 {
  color: #222;
  border-bottom: 2px solid #007bff;
  display: inline-block;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

/* Members List */
.members-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  justify-content: center;
}

.member-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.member-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Avatar */
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #007bff;
  margin-bottom: 10px;
}

.member-card strong {
  font-size: 16px;
  display: block;
  color: #333;
}

.member-card p {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.email-icon {
  color: #007bff;
  font-size: 18px;
  margin-top: 10px;
  display: inline-block;
  transition: color 0.3s;
}

.email-icon:hover {
  color: #0056b3;
}

/* Responsibilities List */
.responsibilities-list {
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 600px;
  margin: auto;
}

.responsibilities-list li {
  background: #e3f2fd;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background 0.3s ease;
}

.responsibilities-list li::before {
  content: "✔";
  color: #007bff;
  font-weight: bold;
}

.responsibilities-list li:hover {
  background: #d0e7fc;
  transform: scale(1.02);
  cursor: pointer;
}

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
