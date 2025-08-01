// Complete starter codes for all 30 JavaScript projects
const projectStarterCodes = {
  1: `<!-- HTML -->
<div id="clock" class="clock">
  <div class="time">00:00:00</div>
  <div class="date">January 1, 2024</div>
</div>

<!-- CSS -->
<style>
.clock {
  text-align: center;
  font-family: 'Arial', sans-serif;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.time {
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
.date {
  font-size: 1.5rem;
  margin-top: 10px;
  opacity: 0.9;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Use setInterval and Date object to update the clock every second
</script>`,

  2: `<!-- HTML -->
<div class="counter">
  <h1>Counter</h1>
  <div class="count">0</div>
  <div class="buttons">
    <button class="btn decrease">-</button>
    <button class="btn reset">Reset</button>
    <button class="btn increase">+</button>
  </div>
</div>

<!-- CSS -->
<style>
.counter {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.count {
  font-size: 6rem;
  font-weight: bold;
  margin: 30px 0;
  color: #333;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}
.btn {
  padding: 15px 30px;
  font-size: 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
.decrease { background: #dc3545; color: white; }
.reset { background: #6c757d; color: white; }
.increase { background: #28a745; color: white; }
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle increment, decrement, and reset functionality
</script>`,

  3: `<!-- HTML -->
<div class="container">
  <h1>Color Flipper</h1>
  <div class="color-display">
    <span class="color-text">#f1f5f8</span>
  </div>
  <button class="btn btn-hero" id="btn">flip color</button>
</div>

<!-- CSS -->
<style>
.container {
  text-align: center;
  padding: 40px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.color-display {
  background: #f1f5f8;
  padding: 40px;
  border-radius: 15px;
  margin: 30px 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.color-text {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
}
.btn {
  padding: 15px 30px;
  font-size: 1.3rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #333;
  color: white;
  transition: all 0.3s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Generate random colors and update the display
</script>`,

  4: `<!-- HTML -->
<div class="container">
  <h1>Keyboard Event Detector</h1>
  <div class="key-display">
    <div class="key">Press any key</div>
    <div class="key-info">
      <div class="key-name">Key Name: <span id="keyName">-</span></div>
      <div class="key-code">Key Code: <span id="keyCode">-</span></div>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.container {
  text-align: center;
  padding: 40px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.key-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50px;
  border-radius: 20px;
  margin: 30px 0;
  color: white;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}
.key {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
.key-info {
  font-size: 1.5rem;
  line-height: 2;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Listen for keydown events and display key information
</script>`,

  5: `<!-- HTML -->
<div class="container">
  <h1>FAQ Accordion</h1>
  <div class="faq-container">
    <div class="faq-item">
      <div class="faq-question">What is JavaScript?</div>
      <div class="faq-answer">JavaScript is a programming language used to create interactive websites.</div>
    </div>
    <div class="faq-item">
      <div class="faq-question">How do I learn JavaScript?</div>
      <div class="faq-answer">Start with basics, practice coding, and build projects.</div>
    </div>
    <div class="faq-item">
      <div class="faq-question">What are the benefits of JavaScript?</div>
      <div class="faq-answer">JavaScript makes websites interactive and dynamic.</div>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}
.faq-item {
  border: 1px solid #ddd;
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.faq-question {
  padding: 20px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  transition: background 0.3s ease;
}
.faq-question:hover {
  background: #e9ecef;
}
.faq-answer {
  padding: 0 20px;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}
.faq-answer.active {
  padding: 20px;
  max-height: 200px;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle accordion expand/collapse functionality
</script>`
};

// Export for use in seeder
module.exports = projectStarterCodes; 