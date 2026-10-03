// // Get references to HTML elements
// const pointerImage = document.getElementById('pointer-image');
// const customCursor = document.getElementById('custom-cursor');

// let imageData = []; // This will be filled with data from the JSON file
// let mouseMoveTimeout;

// // --- 1. Main Function to Load Data and Start the App ---
// async function initializeApp() {
//     try {
//         const response = await fetch('../coordinates.json');
//         if (!response.ok) {
//             throw new Error(`Network response was not ok. Status: ${response.status}`);
//         }
//         const jsonData = await response.json();

//         // Convert the loaded JSON object into the array format we need
//         imageData = Object.entries(jsonData).map(([filename, coords]) => {
//             return {
//                 src: `img/blessy/${filename}`, // Prepends the folder path
//                 point: { x: coords.x, y: coords.y }
//             };
//         });
        
//         console.log(`Successfully loaded and processed ${imageData.length} images.`);

//         // The data is ready, so now we can start listening for mouse movements
//         document.addEventListener('mousemove', onMouseMove);

//     } catch (error) {
//         console.error('Error fetching or processing coordinates.json:', error);
//         document.querySelector('.container').innerHTML = `
//             <div class="error-message">
//                 <strong>Error:</strong> Could not load <code>coordinates.json</code>.
//                 <br>Please make sure the file exists and is in the correct folder as this HTML file.
//             </div>`;
//     }
// }

// // --- 2. Mouse Move Handler (Debounced) ---
// function onMouseMove(event) {
//     customCursor.style.left = `${event.clientX}px`;
//     customCursor.style.top = `${event.clientY}px`;
//     pointerImage.style.opacity = '0';
//     clearTimeout(mouseMoveTimeout);
//     mouseMoveTimeout = setTimeout(() => {
//         findAndShowImage(event.clientX, event.clientY);
//     }, 200);
// }

// // --- 3. Function to Find and Display the Best Image (UPDATED LOGIC) ---
// function findAndShowImage(cursorX, cursorY) {
//     if (imageData.length === 0) return;

//     // Find the center of the screen
//     const screenCenterX = window.innerWidth / 2;
//     const screenCenterY = window.innerHeight / 2;

//     // Calculate the angle of the cursor relative to the center
//     const cursorAngle = Math.atan2(cursorY - screenCenterY, cursorX - screenCenterX);

//     let bestMatch = null;
//     let minAngleDifference = Infinity;

//     for (const image of imageData) {
//         // Calculate the angle of the point within the image
//         // This represents the direction the image is "pointing"
//         const imageAngle = Math.atan2(image.point.y, image.point.x);

//         // Calculate the difference between the cursor's angle and the image's angle
//         let angleDifference = Math.abs(cursorAngle - imageAngle);

//         // Adjust for wraparound (e.g., the difference between -179° and 179° is 2°, not 358°)
//         if (angleDifference > Math.PI) {
//             angleDifference = (2 * Math.PI) - angleDifference;
//         }

//         if (angleDifference < minAngleDifference) {
//             minAngleDifference = angleDifference;
//             bestMatch = image;
//         }
//     }
    
//     if (bestMatch) {
//         pointerImage.src = bestMatch.src;
//         pointerImage.style.opacity = '1';
//     }
// }

// // --- 4. Start Everything ---
// initializeApp();