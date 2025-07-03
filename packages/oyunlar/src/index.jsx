import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TombalaOyunEkrani from './pages/TombalaOyunEkrani';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/oyun/Tombala/:lobiId" element={<TombalaOyunEkrani />} />
        <Route path="/" element={<TombalaOyunEkrani />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 