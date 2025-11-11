import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { setCredentials } from "../store/authSlice";
import api from "../data/api"; // Your customer-facing api helper
import toast from "react-hot-toast";

import "./NatureLogin.css"; // This import will now work

// Import the images
import bg from "../Nature login form/bg.jpg";
import girl from "../Nature login form/girl.png";
import trees from "../Nature login form/trees.png";
import leaf01 from "../Nature login form/leaf_01.png";
import leaf02 from "../Nature login form/leaf_02.png";
import leaf03 from "../Nature login form/leaf_03.png";
import leaf04 from "../Nature login form/leaf_04.png"; // <-- This line is now fixed

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get location info

  // Get the 'from' path, defaulting to homepage
  const from = location.state?.from?.pathname || "/";

  // The useEffect that checked for isAuthenticated is REMOVED
  // GuestRoute.jsx now handles this.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use your api helper
      const res = await api.post("/users/login", { email, password });

      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.name}!`);

      // Navigate to the 'from' path
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
    setLoading(false);
  };

  return (
    <section className="login-section">
      <div className="leaves">
        <div className="set">
          <div>
            <img src={leaf01} alt="leaf" />
          </div>
          <div>
            <img src={leaf02} alt="leaf" />
          </div>
          <div>
            <img src={leaf03} alt="leaf" />
          </div>
          <div>
            <img src={leaf04} alt="leaf" />
          </div>
          <div>
            <img src={leaf01} alt="leaf" />
          </div>
          <div>
            <img src={leaf02} alt="leaf" />
          </div>
          <div>
            <img src={leaf03} alt="leaf" />
          </div>
          <div>
            <img src={leaf04} alt="leaf" />
          </div>
        </div>
      </div>
      <img src={bg} className="bg" alt="background" />
      <img src={girl} className="girl" alt="girl cycling" />
      <img src={trees} className="trees" alt="trees" />

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <div className="inputBox">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="inputBox">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="inputBox">
          <input
            type="submit"
            value={loading ? "Logging in..." : "Login"}
            id="btn"
            disabled={loading}
          />
        </div>
        <div className="group">
          <Link to="/forgot-password">Forget Password</Link>
          <Link to="/register">Signup</Link>
        </div>
      </form>
    </section>
  );
};

export default Login;
