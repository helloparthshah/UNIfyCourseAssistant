import React, { useState, useEffect } from "react";
import Login from "./login";
import "../styles/Header.css";
function Header() {
  return (
    <div className="header">
      <div className="title">
        <img
          id="logo"
          src="https://www.mondaviarts.org/sites/default/files/images/article/gary-may-trek-cropped.jpg"
          alt="logo"
        />
        <h1>UCDavis Course Helper</h1>
      </div>
      <Login />
    </div>
  );
}

export default Header;
