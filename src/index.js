
import React from 'react';
import { createRoot } from 'react-dom/client';

import './sass/styles.scss';
import './sass/customstyles.scss';
// eslint-disable-next-line
import './js/vendors';

import {App} from './App';
// import reportWebVitals from './reportWebVitals';

const createdRoot = createRoot( document.getElementById('root') );

createdRoot.render(
  <React.StrictMode>
     <App /> 
  </React.StrictMode> 
);
// reportWebVitals(console.log);
