import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../store/authSlice";
import api from "../data/api";
import toast from "react-hot-toast";

import "./NatureLogin.css"; // This import will now work

// Import the images
import bg from "../Nature login form/bg.jpg";
import girl from "../Nature login form/girl.png";
import trees from "../Nature login form/trees.png";
import leaf01 from "../Nature login form/leaf_01.png";
import leaf02 from "../Nature login form/leaf_02.png";
import leaf03 from "../Nature login form/leaf_03.png";
import leaf04 from "../Nature login form/leaf_04.png";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      // Only send name, email, and password
      const res = await api.post("/users/register", { name, email, password });

      dispatch(setCredentials(res.data));
      toast.success(`Welcome, ${res.data.name}!`);
      navigate("/"); // Navigate to home after successful registration
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
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
        <h2>Sign Up</h2>
        <div className="inputBox">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="inputBox">
          <input
            type="submit"
            value={loading ? "Creating Account..." : "Sign Up"}
            id="btn"
            disabled={loading}
          />
        </div>
        <div className="group">
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </section>
  );
};

export default Register;
