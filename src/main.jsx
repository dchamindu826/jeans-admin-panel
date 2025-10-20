// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // App.jsx eka import karanna
import { createGlobalStyle } from 'styled-components';

// Podu CSS (Nil/Sudu theme ekaṭa galapenna)
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #F0F8FF; // Lā Nil (AliceBlue) background
    color: #333; // Tada Alu akuru
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);