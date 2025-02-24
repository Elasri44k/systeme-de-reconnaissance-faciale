import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Verify from "./components/Verify";
import AccessGranted from "./components/AccessGranted";
import Register from "./components/Register";
import "./index.css"; 

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/access-granted" element={<AccessGranted />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </Router>
);

export default App;
