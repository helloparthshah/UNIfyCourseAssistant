import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

function Calendar(props) {
  const [calendar, setCalendar] = useState([]);
  useEffect(() => {
    axios
      .post("/api/calendar", {
        user_id: props.user_id,
      })
      .then((res) => {
        console.log(res.data);
        // display as a file to download
        setCalendar(res.data);
      });
  }, [props.user_id]);

  let downloadCalendar = () => {
    //   download calendar as ics file
    var data = new File([calendar], { type: "text/plain" });

    var url = window.URL.createObjectURL(data);
  };
  return (
    <div>
      <h1>Calendar</h1>
      <Button onClick={downloadCalendar}>Download</Button>
    </div>
  );
}

export default Calendar;
