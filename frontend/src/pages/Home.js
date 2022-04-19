import React, { useState, useEffect } from "react";
import axios from "axios";
import AddClass from "../components/AddClass";
import ViewClasses from "../components/ViewClasses";
import Login from "../components/login";
import "../styles/rate.css";
import { useCookies } from "react-cookie";
import Header from "../components/Header";
import Rating from "../components/rating";
import Calendar from "../components/Calendar";
import SearchClass from "../components/SearchClass";
import Recommend from "../components/Recommend";
import Map from "../components/Map";
import "../styles/Home.css";
function Home() {
  const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"]);
  const [user_id, setUser_id] = useState("");
  const [username, setUsername] = useState("");
  const [professor, setProfessor] = useState("");

  useEffect(() => {
    // setUser_id("279174239972491276");
    // get user_id from cookie
    if (cookies.user_id) {
      setUser_id(cookies.user_id);
    }
    if (cookies.username) {
      setUsername(cookies.username);
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
                console.log(data.username);
                if (data.id) {
                  // set cookie and set time to expire in 1 week
                  setCookie("user_id", data.id, { path: "/", maxAge: 604800 });
                  //   window.location.href = "/";
                }
                if (data.username) {
                  setCookie("username", data.username, {
                    path: "/",
                    maxAge: 604800,
                  });
                }
                window.location.href = "/";
              });
          });
      }
    }
  }, [user_id, setCookie]);

  let test = (e) => {
    let row = e.target.parentNode;
    // get professor name from tr
    let prof = row.children[3].innerText;
    setProfessor(prof);
  };
  return (
    <>
      <Header />
      <div className="container">
        <div className="row-add">
          <SearchClass user_id={user_id} username={username} onClick={test} />
          <Rating prof={professor} />
        </div>
        <div className="row-add">
          <AddClass user_id={user_id} username={username} />
          <ViewClasses user_id={user_id} onClick={test} />
        </div>
        <div className="row-add">
          <Recommend user_id={user_id} />
          <Map user_id={user_id} />
        </div>
        <Calendar user_id={user_id} />
      </div>
    </>
  );
}

export default Home;
