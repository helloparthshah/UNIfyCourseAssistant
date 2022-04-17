import React, { useState, useEffect } from "react";
import Login from "./login";
import "../styles/Header.css";
function Header() {
  return (
    <div className="header">
      <Login />
    </div>
  );
}

export default Header;
