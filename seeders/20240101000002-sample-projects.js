'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const projects = [];
    const startDate = new Date('2024-01-01');
    
    for (let day = 1; day <= 30; day++) {
      const deadline = new Date(startDate);
      deadline.setDate(startDate.getDate() + day - 1);
      deadline.setHours(23, 59, 59, 999);
      
      const isUnlocked = day <= 1; // Only first day unlocked initially
      
      projects.push({
        id: uuidv4(),
        day: day,
        title: `Day ${day}: ${getProjectTitle(day)}`,
        description: getProjectDescription(day),
        requirements: getProjectRequirements(day),
        difficulty: getDifficulty(day),
        maxScore: 100,
        deadline: deadline,
        isUnlocked: isUnlocked,
        isActive: true,
        sampleOutput: getSampleOutput(day),
        starterCode: getStarterCode(day),
        hints: getHints(day),
        tags: getTags(day),
        estimatedTime: getEstimatedTime(day),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('Projects', projects, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Projects', null, {});
  }
};

function getProjectTitle(day) {
  const titles = [
    'Digital Clock',
    'Counter App',
    'Color Flipper',
    'Keyboard Event Detector',
    'Accordion FAQ Section',
    'Modal Popup',
    'Image Slider (Carousel)',
    'Dark/Light Mode Toggle',
    'To-Do List App',
    'Calculator (Basic)',
    'Tip Calculator',
    'BMI Calculator',
    'Countdown Timer',
    'Quiz App',
    'Weather App',
    'GitHub Profile Viewer',
    'Image Gallery (API-based)',
    'Drum Kit / Soundboard',
    'Notes App',
    'Password Generator',
    'Typing Speed Test',
    'Memory Card Game',
    'Currency Converter',
    'Infinite Scroll Blog',
    'Real-Time Chat',
    'Movie Search App',
    'Drag-and-Drop Kanban Board',
    'E-commerce Cart UI',
    'Voice Assistant (Speech API)',
    'Portfolio Builder',
    'Final Project'
  ];
  return titles[day - 1] || `Project ${day}`;
}

function getProjectDescription(day) {
  const descriptions = [
    'Create a digital clock that updates every second using setInterval and Date objects.',
    'Build a counter app with increment, decrement, and reset functionality.',
    'Create a color flipper that generates random colors when clicked.',
    'Build a keyboard event detector that shows which key was pressed.',
    'Create an accordion FAQ section with expandable/collapsible content.',
    'Build a modal popup with overlay. Include a trigger button, modal content, and close functionality. Handle clicking outside modal to close. Add smooth animations.',
    'Create an image slider/carousel with navigation arrows and dots. Include auto-play functionality and pause on hover. Handle edge cases (first/last image).',
    'Implement a dark/light mode toggle. Store the preference in localStorage. Update all UI elements including colors, backgrounds, and text. Add smooth transitions.',
    'Build a to-do list app with add, edit, delete, and mark as complete functionality. Store todos in localStorage. Include input validation and empty state handling.',
    'Create a basic calculator with arithmetic operations.',
    'Build a tip calculator with bill amount and tip percentage inputs. Calculate tip amount and total bill. Include preset tip percentages and custom input. Show real-time calculations.',
    'Create a BMI calculator with height and weight inputs. Calculate BMI and display the result with category (underweight, normal, overweight, obese). Include input validation.',
    'Build a countdown timer with start, pause, and reset functionality. Allow setting custom time. Display time remaining in HH:MM:SS format. Add sound notification when complete.',
    'Create a quiz app with multiple choice questions. Track score and show progress. Include a results screen with final score and option to restart. Randomize question order.',
    'Build a weather app using a weather API.',
    'Create a GitHub profile viewer using the GitHub API. Display user info, repositories, and stats. Include search functionality and error handling for invalid usernames.',
    'Build an image gallery using the Unsplash API. Display images in a grid layout. Include search functionality and infinite scroll. Add loading states and error handling.',
    'Create a drum kit/soundboard with keyboard and mouse events. Map keyboard keys to different sounds. Include visual feedback and responsive design.',
    'Build a notes app with localStorage and CRUD operations. Include rich text editing, categories, and search functionality. Add export/import features.',
    'Create a password generator with customizable options.',
    'Build a typing speed test with WPM calculation. Display text to type, current word highlighting, and real-time accuracy. Include timer and results display.',
    'Create a memory card game with matching logic. Include shuffle functionality, timer, and score tracking. Add animations for card flips and matches.',
    'Build a currency converter using exchange rate APIs. Include multiple currencies, real-time rates, and historical data. Add favorite currencies feature.',
    'Create an infinite scroll blog with pagination. Load content dynamically as user scrolls. Include search and filtering options. Optimize performance.',
    'Build a real-time chat app using Firebase. Include user authentication, message history, and online status. Add file sharing and emoji support.',
    'Create a movie search app using TMDB API. Include search, filtering, and movie details. Add watchlist functionality and ratings.',
    'Build a drag-and-drop Kanban board with multiple columns. Include task creation, editing, and status updates. Add due dates and priority levels.',
    'Create an e-commerce cart UI with quantity management. Include product listing, cart functionality, and checkout process. Add wishlist and reviews.',
    'Build a voice assistant using Web Speech API. Include speech recognition and synthesis. Add custom commands and response handling.',
    'Create a portfolio builder with dynamic content and download. Allow users to customize layout, colors, and content. Include export to PDF functionality.',
    'Build a comprehensive final project combining all learned concepts.'
  ];
  return descriptions[day - 1] || `This is day ${day} of the JavaScript challenge. Complete the requirements below to earn points and improve your JavaScript skills.`;
}

function getProjectRequirements(day) {
  const requirements = [
    'Create a digital clock that displays current time and updates every second. Use setInterval for timing and Date object for getting current time. Style it with CSS to make it look modern.',
    'Build a counter app with three buttons: increment (+), decrement (-), and reset. Display the current count prominently. Add visual feedback for button interactions.',
    'Create a color flipper that generates random background colors. Include a button to change colors and display the current color name/hex value. Use arrays to store color names.',
    'Build a keyboard event detector that shows which key was pressed. Display the key name, key code, and add visual feedback. Handle both keydown and keyup events.',
    'Create an accordion FAQ section with multiple questions. Only one answer should be visible at a time. Add smooth animations for expanding/collapsing.',
    'Build a modal popup with overlay. Include a trigger button, modal content, and close functionality. Handle clicking outside modal to close. Add smooth animations.',
    'Create an image slider/carousel with navigation arrows and dots. Include auto-play functionality and pause on hover. Handle edge cases (first/last image).',
    'Implement a dark/light mode toggle. Store the preference in localStorage. Update all UI elements including colors, backgrounds, and text. Add smooth transitions.',
    'Build a to-do list app with add, edit, delete, and mark as complete functionality. Store todos in localStorage. Include input validation and empty state handling.',
    'Create a basic calculator with arithmetic operations (+, -, *, /). Include a display screen and number/operator buttons. Handle decimal points and clear functionality.',
    'Build a tip calculator with bill amount and tip percentage inputs. Calculate tip amount and total bill. Include preset tip percentages and custom input. Show real-time calculations.',
    'Create a BMI calculator with height and weight inputs. Calculate BMI and display the result with category (underweight, normal, overweight, obese). Include input validation.',
    'Build a countdown timer with start, pause, and reset functionality. Allow setting custom time. Display time remaining in HH:MM:SS format. Add sound notification when complete.',
    'Create a quiz app with multiple choice questions. Track score and show progress. Include a results screen with final score and option to restart. Randomize question order.',
    'Build a weather app using a weather API (OpenWeatherMap). Display current weather, temperature, humidity, and forecast. Include location search and geolocation.',
    'Create a GitHub profile viewer using the GitHub API. Display user info, repositories, and stats. Include search functionality and error handling for invalid usernames.',
    'Build an image gallery using the Unsplash API. Display images in a grid layout. Include search functionality and infinite scroll. Add loading states and error handling.',
    'Create a drum kit/soundboard with keyboard and mouse events. Map keyboard keys to different sounds. Include visual feedback and responsive design.',
    'Build a notes app with localStorage and CRUD operations. Include rich text editing, categories, and search functionality. Add export/import features.',
    'Create a password generator with customizable options (length, uppercase, lowercase, numbers, symbols). Include copy to clipboard functionality and strength indicator.',
    'Build a typing speed test with WPM calculation. Display text to type, current word highlighting, and real-time accuracy. Include timer and results display.',
    'Create a memory card game with matching logic. Include shuffle functionality, timer, and score tracking. Add animations for card flips and matches.',
    'Build a currency converter using exchange rate APIs. Include multiple currencies, real-time rates, and historical data. Add favorite currencies feature.',
    'Create an infinite scroll blog with pagination. Load content dynamically as user scrolls. Include search and filtering options. Optimize performance.',
    'Build a real-time chat app using Firebase. Include user authentication, message history, and online status. Add file sharing and emoji support.',
    'Create a movie search app using TMDB API. Include search, filtering, and movie details. Add watchlist functionality and ratings.',
    'Build a drag-and-drop Kanban board with multiple columns. Include task creation, editing, and status updates. Add due dates and priority levels.',
    'Create an e-commerce cart UI with quantity management. Include product listing, cart functionality, and checkout process. Add wishlist and reviews.',
    'Build a voice assistant using Web Speech API. Include speech recognition and synthesis. Add custom commands and response handling.',
    'Create a portfolio builder with dynamic content and download. Allow users to customize layout, colors, and content. Include export to PDF functionality.',
    'Build a comprehensive final project combining all learned concepts. Create a full-stack application with modern UI, API integration, and advanced features.'
  ];
  return requirements[day - 1] || 'Complete the assigned task.';
}

function getDifficulty(day) {
  if (day <= 10) return 'easy';
  if (day <= 20) return 'medium';
  if (day <= 30) return 'hard';
  return 'advanced';
}

function getSampleOutput(day) {
  const outputs = [
    'A digital clock displaying current time in HH:MM:SS format, updating every second',
    'Counter display with +, -, and Reset buttons, showing current count',
    'Background color changes randomly with color name/hex displayed',
    'Key information displayed when keys are pressed (key name, code)',
    'Expandable FAQ sections with smooth animations',
    'Modal popup with overlay, close button, and smooth transitions',
    'Image carousel with navigation arrows and auto-play',
    'Theme toggle with persistent storage and smooth transitions',
    'To-do list with add, edit, delete, and localStorage persistence',
    'Calculator with display screen and arithmetic operations',
    'Tip calculator with bill amount, tip percentage, and total calculation',
    'BMI calculator with height/weight inputs and category display',
    'Countdown timer with start/pause/reset and time display',
    'Quiz app with questions, scoring, and results screen',
    'Weather app with current conditions and forecast',
    'GitHub profile with user info and repositories',
    'Image gallery with search and infinite scroll',
    'Drum kit with keyboard mapping and visual feedback',
    'Notes app with rich text editing and categories',
    'Password generator with customizable options and strength indicator',
    'Typing test with WPM calculation and accuracy tracking',
    'Memory game with card matching and score tracking',
    'Currency converter with real-time exchange rates',
    'Blog with infinite scroll and search functionality',
    'Real-time chat with user authentication and messaging',
    'Movie search with filtering and detailed information',
    'Kanban board with drag-and-drop task management',
    'E-commerce cart with product management and checkout',
    'Voice assistant with speech recognition and synthesis',
    'Portfolio builder with customization and export options',
    'Comprehensive final project showcasing all skills'
  ];
  return outputs[day - 1] || `Sample output for day ${day} will be displayed here.`;
}

function getStarterCode(day) {
  const starterCodes = [
    `<!-- HTML -->
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
}
.time {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
}
.date {
  font-size: 1.2rem;
  color: #666;
  margin-top: 10px;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Use setInterval and Date object to update the clock every second
</script>`,

    `<!-- HTML -->
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
  padding: 20px;
}
.count {
  font-size: 4rem;
  font-weight: bold;
  margin: 20px 0;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle increment, decrement, and reset functionality
</script>`,

    `<!-- HTML -->
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
  padding: 20px;
}
.color-display {
  background: #f1f5f8;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}
.color-text {
  font-size: 2rem;
  font-weight: bold;
}
.btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #333;
  color: white;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Generate random colors and update the display
</script>`,

    `<!-- HTML -->
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
  padding: 20px;
}
.key-display {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  margin: 20px 0;
}
.key {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
}
.key-info {
  font-size: 1.2rem;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Listen for keydown events and display key information
</script>`,

    `<!-- HTML -->
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.faq-item {
  border: 1px solid #ddd;
  margin-bottom: 10px;
  border-radius: 5px;
}
.faq-question {
  padding: 15px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: bold;
}
.faq-answer {
  padding: 15px;
  display: none;
}
.faq-answer.active {
  display: block;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle accordion expand/collapse functionality
</script>`,

    `<!-- HTML -->
<div class="container">
  <button class="btn" id="openModal">Open Modal</button>
  
  <div class="modal" id="modal">
    <div class="modal-content">
      <span class="close" id="closeModal">&times;</span>
      <h2>Modal Title</h2>
      <p>This is the modal content. You can put any content here.</p>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.container {
  text-align: center;
  padding: 20px;
}
.btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #007bff;
  color: white;
}
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
}
.modal-content {
  background: white;
  margin: 15% auto;
  padding: 20px;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
  position: relative;
}
.close {
  position: absolute;
  right: 20px;
  top: 10px;
  font-size: 2rem;
  cursor: pointer;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle modal open/close functionality
</script>`,

    `<!-- HTML -->
<div class="container">
  <div class="slider">
    <div class="slide active">
      <img src="https://via.placeholder.com/400x300/ff6b6b/white?text=Image+1" alt="Image 1">
    </div>
    <div class="slide">
      <img src="https://via.placeholder.com/400x300/4ecdc4/white?text=Image+2" alt="Image 2">
    </div>
    <div class="slide">
      <img src="https://via.placeholder.com/400x300/45b7d1/white?text=Image+3" alt="Image 3">
    </div>
    
    <button class="slider-btn prev">❮</button>
    <button class="slider-btn next">❯</button>
    
    <div class="dots">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
.slider {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}
.slide {
  display: none;
}
.slide.active {
  display: block;
}
.slide img {
  width: 100%;
  height: auto;
}
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 1.2rem;
}
.prev { left: 10px; }
.next { right: 10px; }
.dots {
  text-align: center;
  margin-top: 10px;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
  margin: 0 5px;
  cursor: pointer;
}
.dot.active {
  background: #333;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle slider navigation and auto-play
</script>`,

    `<!-- HTML -->
<div class="container">
  <div class="theme-toggle">
    <button id="themeBtn" class="theme-btn">
      <span class="light-icon">☀️</span>
      <span class="dark-icon">🌙</span>
    </button>
  </div>
  
  <div class="content">
    <h1>Dark/Light Mode Toggle</h1>
    <p>This is some sample content. Click the theme toggle button to switch between light and dark modes.</p>
    <div class="card">
      <h3>Sample Card</h3>
      <p>This card will also change with the theme.</p>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --card-bg: #f8f9fa;
  --border-color: #dee2e6;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --card-bg: #2d2d2d;
  --border-color: #404040;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.theme-toggle {
  text-align: right;
  margin-bottom: 20px;
}

.theme-btn {
  background: none;
  border: 2px solid var(--border-color);
  border-radius: 50px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1.2rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle theme toggle and localStorage persistence
</script>`,

    `<!-- HTML -->
<div class="container">
  <h1>To-Do List</h1>
  
  <div class="todo-input">
    <input type="text" id="todoInput" placeholder="Add a new task...">
    <button id="addBtn">Add</button>
  </div>
  
  <div class="todo-filters">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="active">Active</button>
    <button class="filter-btn" data-filter="completed">Completed</button>
  </div>
  
  <ul id="todoList" class="todo-list">
    <!-- Todo items will be added here -->
  </ul>
  
  <div class="todo-stats">
    <span id="itemsLeft">0 items left</span>
    <button id="clearCompleted">Clear completed</button>
  </div>
</div>

<!-- CSS -->
<style>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.todo-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.todo-input button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.todo-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 5px 15px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.filter-btn.active {
  background: #007bff;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-item.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle todo CRUD operations and localStorage
</script>`,

    `<!-- HTML -->
<div class="container">
  <div class="calculator">
    <div class="display">
      <div class="previous-operand" id="previousOperand"></div>
      <div class="current-operand" id="currentOperand">0</div>
    </div>
    
    <div class="buttons">
      <button class="btn clear" data-action="clear">AC</button>
      <button class="btn operator" data-action="delete">DEL</button>
      <button class="btn operator" data-action="÷">÷</button>
      <button class="btn number" data-number="7">7</button>
      <button class="btn number" data-number="8">8</button>
      <button class="btn number" data-number="9">9</button>
      <button class="btn operator" data-action="×">×</button>
      <button class="btn number" data-number="4">4</button>
      <button class="btn number" data-number="5">5</button>
      <button class="btn number" data-number="6">6</button>
      <button class="btn operator" data-action="-">-</button>
      <button class="btn number" data-number="1">1</button>
      <button class="btn number" data-number="2">2</button>
      <button class="btn number" data-number="3">3</button>
      <button class="btn operator" data-action="+">+</button>
      <button class="btn number zero" data-number="0">0</button>
      <button class="btn number" data-number=".">.</button>
      <button class="btn equals" data-action="=">=</button>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f0f0;
}

.calculator {
  background: #333;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.display {
  background: #444;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: right;
  color: white;
}

.previous-operand {
  font-size: 1.2rem;
  color: #aaa;
  min-height: 1.5rem;
}

.current-operand {
  font-size: 2.5rem;
  font-weight: bold;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  padding: 20px;
  font-size: 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #666;
  color: white;
}

.btn:hover {
  background: #777;
}

.btn.operator {
  background: #ff9500;
}

.btn.equals {
  background: #ff9500;
}

.btn.clear {
  background: #ff3b30;
}

.btn.zero {
  grid-column: span 2;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Handle calculator operations and display updates
</script>`
  ];
  
  // Return starter code for the specific day, or a generic one if not found
  return starterCodes[day - 1] || `<!-- HTML -->
<div class="container">
  <h1>Day ${day} Project</h1>
  <p>Add your HTML structure here</p>
</div>

<!-- CSS -->
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>

<!-- JavaScript -->
<script>
// Add your JavaScript code here
// Implement the functionality for Day ${day}
</script>`;
}

function getHints(day) {
  const hints = [
    'Use setInterval with 1000ms delay to update every second. Use Date object methods like getHours(), getMinutes(), getSeconds() to get current time.',
    'Use event listeners for button clicks. Store the count in a variable and update the display on each button click.',
    'Create an array of color names and use Math.random() to select random colors. Use document.body.style.backgroundColor to change background.',
    'Listen for keydown events on the document. Use event.key and event.keyCode to get key information.',
    'Use classList.toggle() to add/remove active class. Only show one answer at a time by hiding others.',
    'Use display: none/block or visibility to show/hide modal. Add event listener for clicking outside modal.',
    'Use setInterval for auto-play. Track current slide index and handle edge cases for first/last slide.',
    'Use localStorage.setItem() and localStorage.getItem() to persist theme preference. Use CSS custom properties for colors.',
    'Store todos array in localStorage using JSON.stringify() and JSON.parse(). Use filter() to show different views.',
    'Use eval() function carefully or implement your own calculation logic. Handle decimal points and clear functionality.',
    'Calculate tip as (bill * percentage) / 100. Update calculations in real-time as user types.',
    'BMI formula: weight (kg) / (height (m))². Use conditional statements to determine BMI category.',
    'Use setInterval to update countdown. Calculate time difference between target and current time.',
    'Store questions in an array of objects. Track current question index and user score.',
    'Use fetch() to call weather API. Handle async/await for API responses.',
    'Use GitHub API endpoints like /users/{username} and /users/{username}/repos.',
    'Use Unsplash API with search endpoint. Implement infinite scroll with IntersectionObserver.',
    'Use Audio API or preload audio files. Map keyboard events to specific sounds.',
    'Use contenteditable for rich text. Store notes as objects with id, content, and timestamp.',
    'Use Math.random() and string manipulation. Include character sets for different options.',
    'Track start time and calculate WPM: (words typed / 5) / (time elapsed / 60).',
    'Create card objects with id, value, and matched property. Use setTimeout for card flip animations.',
    'Use exchange rate API. Format numbers with toLocaleString() for currency display.',
    'Use IntersectionObserver to detect when user reaches bottom. Load more content dynamically.',
    'Use Firebase Realtime Database or Firestore. Handle real-time updates with onSnapshot().',
    'Use TMDB API search endpoint. Implement debouncing for search input.',
    'Use HTML5 drag and drop API. Handle dragstart, dragover, and drop events.',
    'Store cart items in array. Calculate totals and handle quantity updates.',
    'Use SpeechRecognition and SpeechSynthesis APIs. Handle speech events and commands.',
    'Use Blob and File APIs for download. Generate dynamic content from JSON data.',
    'Combine all learned concepts: DOM manipulation, APIs, localStorage, event handling, and more.'
  ];
  return hints[day - 1] || `Hint for day ${day}: Think about the best approach and break down the problem into smaller steps.`;
}

function getTags(day) {
  const tagSets = [
    ['setInterval', 'Date', 'DOM'],
    ['events', 'functions', 'state'],
    ['arrays', 'random', 'DOM'],
    ['keyboard', 'events', 'DOM'],
    ['conditional', 'toggling', 'classes'],
    ['modal', 'overlay', 'events'],
    ['arrays', 'intervals', 'DOM'],
    ['localStorage', 'theme', 'CSS'],
    ['arrays', 'CRUD', 'localStorage'],
    ['operators', 'conditionals', 'eval'],
    ['forms', 'math', 'real-time'],
    ['validation', 'conditionals', 'UI'],
    ['timers', 'math', 'intervals'],
    ['arrays', 'dynamic', 'scoring'],
    ['fetch', 'async', 'APIs'],
    ['REST', 'JSON', 'DOM'],
    ['API', 'search', 'infinite-scroll'],
    ['audio', 'keyboard', 'events'],
    ['localStorage', 'CRUD', 'rich-text'],
    ['loops', 'strings', 'clipboard'],
    ['timers', 'matching', 'tracking'],
    ['logic', 'state', 'DOM'],
    ['API', 'formatting', 'real-time'],
    ['IntersectionObserver', 'pagination', 'API'],
    ['Firebase', 'async', 'real-time'],
    ['API', 'debounce', 'async'],
    ['drag-drop', 'state', 'DOM'],
    ['cart', 'quantity', 'localStorage'],
    ['Speech', 'API', 'commands'],
    ['dynamic', 'Blob', 'File'],
    ['comprehensive', 'full-stack', 'integration']
  ];
  return tagSets[day - 1] || ['javascript'];
}

function getEstimatedTime(day) {
  if (day <= 10) return 30;
  if (day <= 20) return 60;
  if (day <= 30) return 90;
  return 120;
} 