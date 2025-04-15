<template>
  <div class="advisory-committee">
    <header class="header">
      <h1>Customer Segmentation Advisory Committee</h1>
      <p class="subtitle">Ensuring strategic alignment and continuous improvement of our customer segmentation approach</p>
    </header>

    <main class="main-content">
      <section class="purpose-section">
        <h2>Committee Purpose</h2>
        <div class="purpose-cards">
          <div class="card">
            <div class="card-icon">📊</div>
            <h3>Strategic Alignment</h3>
            <p>Ensure segmentation aligns with business goals across marketing, sales, and product development.</p>
          </div>
          <div class="card">
            <div class="card-icon">🔍</div>
            <h3>Criteria Identification</h3>
            <p>Suggest valuable segmentation dimensions like demographics, behavior, and spending habits.</p>
          </div>
          <div class="card">
            <div class="card-icon">📈</div>
            <h3>Performance Review</h3>
            <p>Evaluate segmentation effectiveness through campaign metrics and business outcomes.</p>
          </div>
          <div class="card">
            <div class="card-icon">🔄</div>
            <h3>Iterative Improvement</h3>
            <p>Provide feedback to enhance segmentation logic, model features, and data collection.</p>
          </div>
        </div>
      </section>

      <section class="members-section">
        <h2>Committee Members</h2>
        <div class="members-grid">
          <div class="member-card" v-for="member in committeeMembers" :key="member.id">
            <div class="member-avatar">{{ member.initials }}</div>
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <p class="role">{{ member.role }}</p>
              <p class="department">{{ member.department }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="meetings-section">
        <h2>Upcoming Meetings</h2>
        <div class="meetings-list">
          <div class="meeting-card" v-for="meeting in upcomingMeetings" :key="meeting.id">
            <div class="meeting-date">
              <span class="day">{{ meeting.day }}</span>
              <span class="month">{{ meeting.month }}</span>
            </div>
            <div class="meeting-details">
              <h3>{{ meeting.title }}</h3>
              <p><span class="detail-label">Time:</span> {{ meeting.time }}</p>
              <p><span class="detail-label">Location:</span> {{ meeting.location }}</p>
              <p><span class="detail-label">Agenda:</span> {{ meeting.agenda }}</p>
            </div>
            <button class="rsvp-button">RSVP</button>
          </div>
        </div>
      </section>

      <section class="feedback-section">
        <h2>Provide Feedback</h2>
        <form @submit.prevent="submitFeedback" class="feedback-form">
          <div class="form-group">
            <label for="feedback-type">Feedback Type</label>
            <select id="feedback-type" v-model="feedback.type" required>
              <option value="">Select feedback type</option>
              <option value="segmentation">Segmentation Logic</option>
              <option value="criteria">Segmentation Criteria</option>
              <option value="performance">Performance Metrics</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="feedback-message">Your Feedback</label>
            <textarea id="feedback-message" v-model="feedback.message" required placeholder="Please provide detailed feedback..."></textarea>
          </div>
          <button type="submit" class="submit-button">Submit Feedback</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      committeeMembers: [
        { id: 1, name: "Alex Johnson", initials: "AJ", role: "CMO", department: "Marketing" },
        { id: 2, name: "Maria Garcia", initials: "MG", role: "VP Sales", department: "Sales" },
        { id: 3, name: "David Kim", initials: "DK", role: "Product Lead", department: "Product" },
        { id: 4, name: "Sarah Chen", initials: "SC", role: "Data Scientist", department: "Analytics" },
        { id: 5, name: "James Wilson", initials: "JW", role: "Customer Success", department: "Operations" },
        { id: 6, name: "Priya Patel", initials: "PP", role: "UX Researcher", department: "Design" }
      ],
      upcomingMeetings: [
        { 
          id: 1, 
          day: "15", 
          month: "Jun", 
          title: "Q2 Segmentation Review", 
          time: "10:00 AM - 11:30 AM", 
          location: "Conference Room A / Zoom", 
          agenda: "Review Q2 campaign performance by segment, discuss potential new criteria" 
        },
        { 
          id: 2, 
          day: "28", 
          month: "Jul", 
          title: "Mid-Year Strategy Session", 
          time: "2:00 PM - 4:00 PM", 
          location: "Executive Boardroom", 
          agenda: "Align segmentation with H2 business goals, review feedback from stakeholders" 
        }
      ],
      feedback: {
        type: "",
        message: ""
      }
    };
  },
  methods: {
    submitFeedback() {
      // In a real app, this would send to a backend
      alert(`Thank you for your ${this.feedback.type} feedback!`);
      this.feedback = { type: "", message: "" };
    }
  }
};
</script>

<style>
/* Base Styles */
.advisory-committee {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  line-height: 1.6;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom:10px;
border-bottom: 2px solid #3498db;
}

/* Purpose Section */
.purpose-section {
margin-bottom: 40px;
}

.purpose-cards {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
}

.card {
background: #f9f9f9;
padding: 20px;
border-radius: 8px;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
text-align: center;
transition: transform 0.2s;
}

.card:hover {
transform: translateY(-5px);
}

.card-icon {
font-size: 2rem;
margin-bottom: 10px;
}

.card h3 {
color: #2c3e50;
margin-bottom: 10px;
}

.card p {
color: #7f8c8d;
font-size: 0.95rem;
}

/* Members Section */
.members-section {
margin-bottom: 40px;
}

.members-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 20px;
}

.member-card {
display: flex;
align-items: center;
background: #fff;
padding: 15px;
border-radius: 8px;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.member-avatar {
width: 50px;
height: 50px;
background: #3498db;
color: #fff;
display: flex;
align-items: center;
justify-content: center;
border-radius: 50%;
margin-right: 15px;
font-weight: bold;
}

.member-info h3 {
margin: 0;
color: #2c3e50;
font-size: 1.1rem;
}

.member-info .role,
.member-info .department {
color: #7f8c8d;
font-size: 0.9rem;
margin: 2px 0;
}

/* Meetings Section */
.meetings-section {
margin-bottom: 40px;
}

.meetings-list {
display: flex;
flex-direction: column;
gap: 20px;
}

.meeting-card {
display: flex;
align-items: center;
background: #fff;
padding: 20px;
border-radius: 8px;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.meeting-date {
text-align: center;
margin-right: 20px;
background: #3498db;
color: #fff;
padding: 10px;
border-radius: 8px;
min-width: 60px;
}

.meeting-date .day {
display: block;
font-size: 1.5rem;
font-weight: bold;
}

.meeting-date .month {
font-size: 0.9rem;
}

.meeting-details h3 {
margin: 0 0 10px;
color: #2c3e50;
}

.meeting-details p {
margin: 5px 0;
color: #7f8c8d;
}

.detail-label {
font-weight: bold;
color: #2c3e50;
}

.rsvp-button {
margin-left: auto;
padding: 10px 20px;
background: #3498db;
color: #fff;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background 0.2s;
}

.rsvp-button:hover {
background: #2980b9;
}

/* Feedback Section */
.feedback-section {
margin-bottom: 40px;
}

.feedback-form {
background: #fff;
padding: 20px;
border-radius: 8px;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-group {
margin-bottom: 20px;
}

.form-group label {
display: block;
margin-bottom: 5px;
color: #2c3e50;
font-weight: bold;
}

.form-group select,
.form-group textarea {
width: 100%;
padding: 10px;
border: 1px solid #ddd;
border-radius: 5px;
font-size: 1rem;
}

.form-group textarea {
min-height: 100px;
resize: vertical;
}

.submit-button {
display: block;
width: 100%;
padding: 10px;
background: #3498db;
color: #fff;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 1rem;
transition: background 0.2s;
}

.submit-button:hover {
background: #2980b9;
}

/* Responsive Design */
@media (max-width: 768px) {
.purpose-cards,
.members-grid {
grid-template-columns: 1fr;
}

.meeting-card {
flex-direction: column;
align-items: flex-start;
}

.meeting-date {
margin-bottom: 10px;
margin-right: 0;
}

.rsvp-button {
margin-left: 0;
margin-top: 10px;
}
}
</style>