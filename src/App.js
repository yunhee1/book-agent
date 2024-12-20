import './App.css';
import './index.css';
import Chat from './pages/Chat';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from "react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        {/* <Route path="/complete" element={<Complete />} /> */}
      </Routes>
    </Router>
    // <div className="flex items-center justify-center h-screen bg-gray-200">
    //   <div className="text-4xl font-bold text-indigo-500">hi</div>
    // </div>
  );
}

export default App;
