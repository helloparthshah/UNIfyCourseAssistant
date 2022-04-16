import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewClasses.css";
import { Form, FormControl, Button } from "react-bootstrap";

function ViewClasses() {
  const [courses, setData] = useState([]);
  useEffect(() => {
    axios
      .post("/api/view", {
        // user_id: localStorage.getItem("user_id"),
        user_id: "279174239972491276",
      })
      .then((res) => {
        console.log(res.data);
        // add courses to courses as divs
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
