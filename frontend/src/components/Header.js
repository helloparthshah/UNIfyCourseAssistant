import React, { useState, useEffect } from "react";
import Login from "./login";
function Header() {
  return (
    <div className="header">
      <img src="https://i.imgur.com/Q0QZQZL.png" alt="logo" />
      <Login />
    </div>
  );
}

export default Header;
