

(function() {

// Define preset background colors and pick one randomly
const backgroundOptions = ['#FF8F00', '#D32F2F', '#388E3C', '#1976D2', '#7B1FA2'];
const selectedBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];

  
  
  var css = `
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      overflow: hidden;
      background-color: ${selectedBackground};
      color: #fff;
    }

    /* Sidebar (Desktop Default) */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 220px;
      bottom: 0;
      background: ${selectedBackground};
      padding: 10px;
      box-sizing: border-box;
      color: #fff;
      z-index: 1000;
    }

    .sidebar .logo {
      display: block;
      margin: 0 auto 10px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    .sidebar h2 {
      font-size: 20px;
      margin: 0 0 10px;
      text-align: center;
    }

    /* Show buttons container on desktop */
    .menu-items {
      display: block;
    }

    .sidebar button {
      display: block;
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      background: #ef6300;
      color: #fff;
      cursor: pointer;
      border-radius: 4px;
    }

    .sidebar button:hover {
      background: #d75c00;
    }

    /* Main Content Area (Desktop) */
    .main {
      margin-left: 240px;
      padding: 10px;
      height: 100vh;
      overflow-y: auto;
      box-sizing: border-box;
      display: grid;
      grid-gap: 10px;
    }

    /* Desktop Grid Layouts */
    .grid-1 { display: grid; grid-template-columns: 1fr; grid-auto-rows: 100vh; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: 100vh; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 100vh; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 100vh; }
    .grid-20 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: 250px;
      height: 100vh;
      overflow-y: auto;
      align-content: start;
    }

    /* Screen Styling (Desktop) */
    .screen {
      display: flex;
      flex-direction: column;
      background: #2c2c2c;
      border: 1px solid #444;
      padding: 10px;
      box-sizing: border-box;
      border-radius: 4px;
    }

    .screen select {
      width: 100%;
      padding: 8px;
      margin-bottom: 8px;
      font-size: 16px;
      background: #006a7f;
      color: #fff;
      border: none;
      border-radius: 4px;
    }

    .screen iframe {
      flex-grow: 1;
      width: 100%;
      border: none;
    }

    /* MOBILE-SPECIFIC STYLES */
    @media only screen and (max-width: 768px) {
      /* Convert sidebar into a top header */
      .sidebar {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        top: 0;
        left: 0;
        padding: 5px 10px;
        z-index: 1000;
      }
      
      .sidebar .logo {
        width: 40px;
        height: 40px;
        margin: 0;
      }
      
      .sidebar h2 {
        font-size: 16px;
        margin: 0;
        flex-grow: 1;
        text-align: center;
      }
      
      /* Hamburger icon visible on mobile */
      .sidebar .menu-toggle {
        font-size: 24px;
        cursor: pointer;
        user-select: none;
      }
      
      /* Dropdown menu (hidden by default) */
      .sidebar .menu-items {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 50px;
        left: 0;
        width: 100%;
        background: #1e1e1e;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
      }
      
      /* Mobile button styling */
      .sidebar .menu-items button {
        width: 100%;
        margin: 0;
        padding: 5px;
        font-size: 12px;
        border-bottom: 1px solid #333;
      }
      
      /* Show dropdown when active */
      .sidebar.active .menu-items {
        display: flex;
      }
      
      /* Adjust main content to start below the header */
      .main {
        margin: 0;
        margin-top: 60px;
        display: block;
        overflow-y: auto;
        height: calc(100vh - 60px);
        padding: 5px;
      }
      
      /* Adjust screens for mobile */
      .screen {
        width: 100%;
        height: 700px;
        margin-bottom: 10px;
        padding: 5px;
        display: flex;
        flex-direction: column;
      }
      
      .screen select {
        width: 100%;
        padding: 6px;
        margin-bottom: 6px;
        font-size: 14px;
      }
    }

    /* Hide hamburger and show full menu on larger screens */
    @media only screen and (min-width: 769px) {
      .menu-toggle {
        display: none;
      }
      .menu-items {
        display: block;
        position: static;
        box-shadow: none;
      }
    }
    
    /* Navigation buttons for mobile scrolling */
    .nav-button {
      position: fixed;
      right: 20px;
      z-index: 2000;
      background: #ef6300;
      border: none;
      color: #fff;
      width: 50px;
      height: 50px;
      font-size: 24px;
      border-radius: 50%;
      opacity: 0.8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #scroll-up {
      bottom: 80px;
    }
    #scroll-down {
      bottom: 20px;
    }
    
    @media only screen and (max-width: 768px) {
      body {
        overflow-y: auto;
      }
    }
  `;
  
  var style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  // Toggle dropdown menu on mobile when hamburger is clicked
  document.addEventListener('DOMContentLoaded', function() {
    var sidebar = document.querySelector('.sidebar');
    var toggle = document.querySelector('.menu-toggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
      });
    }
  });
})();
