import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { Form, FormControl, Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
function Login() {
  const [cookies, setCookie, removeCookie] = useCookies(["user_id"]);

  useEffect(() => {
    console.log(cookies);
    if (cookies.user_id) {
      document.getElementById("discord-login").innerHTML = "Logout";
    }
  }, [cookies]);

  let disc_redirect = () => {
    if (cookies.user_id) {
      removeCookie("user_id");
      document.getElementById("discord-login").innerHTML = "Login";
      window.location.reload();
    } else {
      window.location.href =
        "https://discord.com/api/oauth2/authorize?client_id=964993808888643614&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify";
    }
  };
  return (
    <div className="add-login">
      <Button
        id="discord-login"
        variant="primary"
        onClick={(e) => {
          disc_redirect();
        }}
      >
        Login with Discord
      </Button>
    </div>
  );
}

export default Login;
