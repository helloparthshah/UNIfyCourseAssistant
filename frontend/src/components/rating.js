import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { ProgressBar, Form, FormControl, Button } from "react-bootstrap";
function Rating() {
  const [rate, setRate] = useState(0);
  const [diff, setDiff] = useState(0);
  const [takeagain, setTake] = useState(0);
  const [numRateing, setNum] = useState(0);

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
        axios
          .post("/api/professor", {
            professor: professors,
          })
          .then((res) => {
            setRate(res.data.rating * 20.0);
            setDiff(res.data.difficulty * 20.0);
            setTake(res.data.would_take_again);
            setNum(res.data.num_ratings);
            console.log(res.data.would_take_again);
          });
      });
  }, [prof, rate, diff, takeagain, numRateing]);

  return (
    <div className="rate">
      <h2>{prof}</h2>
      <h5 className="Category">Number of Ratings: {numRateing}</h5>
      <h5 className="Category">Rating</h5>
      <ProgressBar className="rateBar" now={rate} />
      <h5 className="Category">Difficulty</h5>
      <ProgressBar className="rateBar" now={diff} />
      <h5 className="Category">Would take again</h5>
      <ProgressBar className="rateBar" now={takeagain} />
    </div>
  );
}

export default Rating;
