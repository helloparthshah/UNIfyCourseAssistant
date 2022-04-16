import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { ProgressBar, Form, FormControl, Button } from "react-bootstrap";
function Rating() {
  const progress = 50;
  const courseName = "ECS150";
  const professors;
  
  axios
    .post("/api/course", {
      course: courseName,
    })
    .then((res) => {
        professors = res.data.instructor
      console.log(professors);
    });
  return (
    <div className="rate">
      <h3>Simple Progress Bar</h3>
      <ProgressBar now={progress} />
    </div>
  );
}

export default Rating;
