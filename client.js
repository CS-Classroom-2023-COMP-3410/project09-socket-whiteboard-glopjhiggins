document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');
  const colorInput = document.getElementById('color-input');
  const brushSizeInput = document.getElementById('brush-size');
  const brushSizeDisplay = document.getElementById('brush-size-display');
  const clearButton = document.getElementById('clear-button');
  const connectionStatus = document.getElementById('connection-status');
  const userCount = document.getElementById('user-count');

  let boardState = [];

  // Set canvas dimensions
  function resizeCanvas() {
    // TODO: Set the canvas width and height based on its parent element
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    // Redraw the canvas with the current board state when resized
    // TODO: Call redrawCanvas() function
    redrawCanvas();
  }

  // Initialize canvas size
  // TODO: Call resizeCanvas()
  resizeCanvas();
  
  // Handle window resize
  // TODO: Add an event listener for the 'resize' event that calls resizeCanvas
  window.addEventListener('resize', resizeCanvas);


  // Drawing variables
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Connect to Socket.IO server
  // TODO: Create a socket connection to the server at 'http://localhost:3000'
  const socket = io.connect('http://localhost:3000');

  // TODO: Set up Socket.IO event handlers
  socket.on('connect', () => {
      console.log('Connected to the server');
      connectionStatus.textContent = 'Connected to the server'; // Update connection status
      connectionStatus.style.color = 'green'; // Change text color to green
  });
  socket.on('disconnect', () => {
      console.log('Disconnected from the server');
  });
  socket.on('boardState', (state) => {
      console.log('Received board state:', state); // Log the received board state
      boardState = state; // Update the board state
      redrawCanvas(boardState); // Redraw the canvas with the received board state
  });
  socket.on('draw', (drawData) => {
      console.log('Received draw data:', drawData); // Log the received draw data
      draw(drawData); // Call the draw function with the received data
  });
  socket.on('currentUsers', (count) => { 
      console.log('Current users:', count);
      userCount.textContent = `Current Users: ${count}`; // Update user count display
  });
  socket.on('clear', () => {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      console.log('Canvas cleared');
  });

  // Canvas event handlers
  // TODO: Add event listeners for mouse events (mousedown, mousemove, mouseup, mouseout)
  canvas.addEventListener('mousedown', e => {
    // Start drawing
    startDrawing(e);
    // Capture the initial coordinates
    lastX = e.offsetX;
    lastY = e.offsetY;
    console.log(`Mouse down at (${lastX}, ${lastY})`);
  });

  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) {return};

    // Draw on the canvas
    drawLine(lastX, lastY, e.offsetX, e.offsetY, colorInput.value, brushSizeInput.value);
    lastX = e.offsetX;
    lastY = e.offsetY;
    console.log(`Mouse move at (${lastX}, ${lastY})`);
  });

  canvas.addEventListener('mouseup', e => {
    stopDrawing();
  });

  canvas.addEventListener('mouseout', e => {
    stopDrawing();
  });

  
  // Touch support (optional)
  // TODO: Add event listeners for touch events (touchstart, touchmove, touchend, touchcancel)
  
  // Clear button event handler
  // TODO: Add event listener for the clear button
  clearButton.addEventListener('click', () => {
    socket.emit('clear'); // Emit clear event to the server
  });

  // Update brush size display
  // TODO: Add event listener for brush size input changes
  colorInput.addEventListener('input', () => {
    context.strokeStyle = colorInput.value;
  });

  brushSizeInput.addEventListener('input', () => {
    brushSizeDisplay.textContent = `Brush Size: ${brushSizeInput.value}`;
  });


  // Use values when drawing
  context.strokeStyle = colorInput.value; // Color
  context.lineWidth = brushSizeInput.value; // Size


  // Drawing functions
  function startDrawing(e) {
    // TODO: Set isDrawing to true and capture initial coordinates
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
  }

  function draw(e) {
    // TODO: If not drawing, return
    // TODO: Get current coordinates
    // TODO: Emit 'draw' event to the server with drawing data
    // TODO: Update last position
    if (!isDrawing) {return;}
    const { x, y } = getCoordinates(e);
    socket.emit('draw', {
      x0: lastX,
      y0: lastY,
      x1: x,
      y1: y,
      color: colorInput.value,
      size: brushSizeInput.value
    });
    lastX = getCoordinates(e).x;
    lastY = getCoordinates(e).y;


  }

  function drawLine(x0, y0, x1, y1, color, size) {
    // TODO: Draw a line on the canvas using the provided parameters
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();
  

  }

  function stopDrawing() {
    // TODO: Set isDrawing to false
    isDrawing = false;
  }

  function clearCanvas() {
    // TODO: Emit 'clear' event to the server
    socket.emit('clear');
  }

  function redrawCanvas(boardState = []) {
    // TODO: Clear the canvas
    // TODO: Redraw all lines from the board state
    context.clearRect(0, 0, canvas.width, canvas.height);
    boardState.forEach(line => {
      drawLine(line.x0, line.y0, line.x1, line.y1, line.color, line.size);
    });

  }

  // Helper function to get coordinates from mouse or touch event
  function getCoordinates(e) {
    // TODO: Extract coordinates from the event (for both mouse and touch events)
    // HINT: For touch events, use e.touches[0] or e.changedTouches[0]
    // HINT: For mouse events, use e.offsetX and e.offsetY
    if (e.type.includes('touch')) {// Get first touch point
      const touch = e.touches[0] || e.changedTouches[0];
      // Get canvas position
      const rect = canvas.getBoundingClientRect();
      // Calculate coordinates relative to canvas
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {// Mouse event
      return {
      x: e.offsetX,
      y: e.offsetY
      };
    }
  }

  // Handle touch events
  function handleTouchStart(e) {
    // TODO: Prevent default behavior and call startDrawing
    e.preventDefault();
    // Prevent scrolling
    const coords = getCoordinates(e);
    isDrawing = true;
    lastX = coords.x;
    lastY = coords.y;
  }

  function handleTouchMove(e) {
    // TODO: Prevent default behavior and call draw
    e.preventDefault();
    // Prevent scrolling
    if (!isDrawing) return;
    const coords = getCoordinates(e);

  }
});