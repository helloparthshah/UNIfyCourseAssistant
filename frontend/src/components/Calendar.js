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
        // display as a file to download
        setCalendar(res.data);
      });
  }, [props.user_id]);

  let downloadCalendar = () => {
    //   download calendar as ics file
    const blob = new Blob([calendar], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calendar.ics";
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <h1>Calendar</h1>
      <Button onClick={downloadCalendar}>Download</Button>
    </div>
  );
}

export default Calendar;
