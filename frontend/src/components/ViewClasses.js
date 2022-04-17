import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewClasses.css";
import { useCookies } from "react-cookie";

function ViewClasses(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"]);
  const [courses, setData] = useState([]);
  const [user_id, setUser_id] = useState("");
  useEffect(() => {
    console.log(props.user_id);
    // setUser_id("279174239972491276");
    // get user_id from cookie
    if (cookies.user_id) {
      setUser_id(cookies.user_id);
    }
  }, [cookies]);
  useEffect(() => {
    if (user_id && user_id !== "") {
      console.log(user_id);
      axios
        .post("/api/view", {
          user_id: user_id,
        })
        .then((res) => {
          console.log(res.data);
          if (!res.data.err) setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user_id]);

  return (
    <div className="view-class">
      {courses.length > 0 ? (
        courses.map((course) => {
          return (
            <div key={course.crn} className="course-div">
              <div className="course-name">{course.title}</div>
              <div className="course-section">{course.section}</div>
            </div>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
}

export default ViewClasses;
