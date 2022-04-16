import React, { useState, useEffect } from "react";
import axios from "axios";
import AddClass from "../components/AddClass";
import ViewClasses from "../components/ViewClasses";
import Login from "../components/login";

function Home() {
  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      return;
    }
    // extract code from url
    const code = window.location.href.split("?code=")[1];
    console.log(code);
    // use code to get /oauth2/@me from discord
    const params = new URLSearchParams();
    params.append("client_id", "964993808888643614");
    params.append("client_secret", "DTD56L93rPr7cH0_i7itdEDluDLNI8I0");
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000");
    params.append("scope", "identify");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    };
    fetch("https://discord.com/api/oauth2/token", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // use access_token to get user_id from discord
        fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            localStorage.setItem("user_id", data.id);
          });
      });
  }, []);
  return (
    <>
      <AddClass />
      <ViewClasses />
      <Login />
    </>
  );
}

export default Home;
