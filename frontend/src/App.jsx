import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Import the HomePage component
import HomePage from "./pages/HomePage/HomePage.jsx";

const App = () => {
  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="logo">
            <h1 className="logo-text">
              <span className="logo-part-one">Call Sign</span>
              <span className="logo-part-two">Subscription API</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
