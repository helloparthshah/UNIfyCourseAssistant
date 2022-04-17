import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { ProgressBar, Form, FormControl, Button } from "react-bootstrap";
function Rating(props) {
  const [rate, setRate] = useState(0);
  const [diff, setDiff] = useState(0);
  const [takeagain, setTake] = useState(0);
  const [numRateing, setNum] = useState(0);

  const [prof, setProf] = useState("");

  useEffect(() => {
    setProf(props.prof);
  }, [props.prof]);

  useEffect(() => {
    console.log(prof);
    if (prof)
      axios
        .post("/api/professor", {
          professor: prof,
        })
        .then((res) => {
          console.log(res.data);
          setProf(res.data.name);
          setRate(res.data.rating * 20.0);
          setDiff(res.data.difficulty * 20.0);
          setTake(res.data.would_take_again);
          setNum(res.data.num_ratings);
          // console.log(res.data.would_take_again);
        });
  }, [prof]);

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
