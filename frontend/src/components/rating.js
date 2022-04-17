import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { ProgressBar, Form, FormControl, Button } from "react-bootstrap";
function Rating() {
  const [progress, setProgress] = useState("");
  const [prof, setProf] = useState("");
  const courseName = "ECS150";
  useEffect(() => {
    axios
      .post("/api/course", {
        course: courseName,
      })
      .then((res) => {
        const professors = res.data[0].instructor;
        setProf(professors);
        console.log(prof);
      });
    axios
      .post("/api/professor", {
        professor: prof,
      })
      .then((res) => {
        console.log(res.data);
      });
  }, [prof, progress]);

  return (
    <div className="rate">
      <h3>{prof}</h3>
      <ProgressBar now={progress} />
    </div>
  );
}

export default Rating;
