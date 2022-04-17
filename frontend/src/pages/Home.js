import React, { useState, useEffect } from "react";
import axios from "axios";
import AddClass from "../components/AddClass";
import ViewClasses from "../components/ViewClasses";
import Login from "../components/login";
import { useCookies } from "react-cookie";
import Header from "../components/Header";
function Home() {
  const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"]);
  const [user_id, setUser_id] = useState("");
  useEffect(() => {
    // setUser_id("279174239972491276");
    // get user_id from cookie
    if (cookies.user_id) {
      setUser_id(cookies.user_id);
    }
  }, [cookies]);
  useEffect(() => {
    // check if cookie exists
    if (user_id && user_id !== "") {
      console.log(user_id);
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    } else {
      // extract code from url
      const code = window.location.href.split("?code=")[1];
      console.log(code);
      if (code) {
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
                if (data.id) {
                  // set cookie and set time to expire in 1 week
                  setCookie("user_id", data.id, { path: "/", maxAge: 604800 });
                  window.location.href = "/";
                }
              });
          });
      }
    }
  }, [user_id, setCookie]);
  return (
    <>
      <Header />
      <AddClass user_id={user_id} />
      <ViewClasses user_id={user_id} />
    </>
  );
}

export default Home;
