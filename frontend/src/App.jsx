import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import Questionnaire from "./components/Questionnaire";
import Recommendations from "./components/Recommendations";
import Navbar from "./components/Navbar";
import GiftFinder from "./pages/GiftFinder"; // ✅ Make sure it's imported
import "./styles/App.css";


const App = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUser(token || null);
  }, [location]);

  return (
    <div className="app-container">
      {user && <Navbar setUser={setUser} />}

      <div className="content-container">
        <Routes>
          {!user ? (
            <>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Questionnaire />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/gift-finder" element={<GiftFinder />} /> {/* ✅ Added this */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default App;
