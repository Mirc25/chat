import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa los estilos CSS globales (Tailwind CSS)
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Importa el registro del Service Worker
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si quieres que tu aplicación funcione offline y cargue más rápido,
// puedes cambiar unregister() a register() a continuación.
// Ten en cuenta que esto viene con algunas trampas.
// Aprende más sobre Service Workers: https://cra.link/PWA
serviceWorkerRegistration.register(); // Cambiado a register() para habilitar PWA

// Si quieres empezar a medir el rendimiento en tu aplicación, pasa una función
// para registrar resultados (por ejemplo, reportWebVitals(console.log))
// o envíalos a un punto final de análisis.
// Aprende más: https://bit.ly/CRA-vitals
reportWebVitals();