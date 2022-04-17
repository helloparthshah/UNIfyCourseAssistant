import React, { useState, useEffect } from "react";
import Login from "./login";
import "../styles/Header.css";
function Header() {
  return (
    <div className="header">
      <h1>UCDavis Course Helper</h1>
      <Login />
    </div>
  );
}

export default Header;
