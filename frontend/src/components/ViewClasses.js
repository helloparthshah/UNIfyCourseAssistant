import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewClasses.css";
import { Form, FormControl, Button } from "react-bootstrap";

function ViewClasses() {
  const [courses, setData] = useState([]);
  const [user_id, setUser_id] = useState("");
  useEffect(() => {
    setUser_id(localStorage.getItem("user_id"));
  }, []);
  useEffect(() => {
    if (user_id)
      axios
        .post("/api/view", {
          user_id: user_id,
        })
        .then((res) => {
          console.log(res.data);
          // add courses to courses as divs
          setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
  }, [user_id]);

  return (
    <div className="view-class">
      {courses.map((course) => {
        return (
          <div key={course.crn} className="course-div">
            <div className="course-name">{course.title}</div>
            <div className="course-section">{course.section}</div>
          </div>
        );
      })}
    </div>
  );
}

export default ViewClasses;
