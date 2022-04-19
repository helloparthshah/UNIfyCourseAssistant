import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { DayPilotCalendar, DayPilot } from "daypilot-pro-react";

function Calendar(props) {
  const [user_id, setUser_id] = useState("");
  const [calendar, setCalendar] = useState([]);
  const [events, setEvents] = useState([]);
  const config = {
    viewType: "Days",
    startDate: new DayPilot.Date().firstDayOfWeek().addDays(1),
    timeRangeSelectedHandling: "Disabled",
    eventDeleteHandling: "Disabled",
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    showCurrentTime: true,
    durationBarVisible: false,
    headerDateFormat: "dddd",
    weekStarts: 1,
    days: 5,
    heightSpec: "Parent100Pct",
    height: 400,
  };

  useEffect(() => {
    setUser_id(props.user_id);
  }, [props.user_id]);

  useEffect(() => {
    axios
      .post("/api/events", {
        user_id: user_id,
      })
      .then((res) => {
        setEvents(res.data);
      });
  }, [user_id]);

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
  let dp = useRef(null);
  return (
    <div className="calendar">
      <h1>Calendar</h1>
      <div className="cal">
        <DayPilotCalendar ref={dp} {...config} events={events} />
      </div>
      <div>
        <Button onClick={downloadCalendar}>Export as Calendar</Button>
        <Button
          onClick={() => {
            dp.current.control.exportAs("svg").download();
          }}
        >
          Save as Image
        </Button>
      </div>
    </div>
  );
}

export default Calendar;
