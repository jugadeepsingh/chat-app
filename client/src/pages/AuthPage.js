import React, { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  return isLogin
    ? <Login onSwitch={() => setIsLogin(false)} />
    : <Register onSwitch={() => setIsLogin(true)} />;
};

export default AuthPage;
