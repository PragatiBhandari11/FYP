import { useState } from "react";
import Signup from "./Components/Signup.jsx";
import Login from "./Components/Login.jsx";


function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ padding: 20 }}>
      <h1>AgroConnect</h1>

      <div>
        <button onClick={() => setShowLogin(true)}>Login</button>
        <button onClick={() => setShowLogin(false)}>Signup</button>
      </div>

      {showLogin ? <Login /> : <Signup />}
    </div>
  );
}

export default App;
