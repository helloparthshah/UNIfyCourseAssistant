import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { DayPilotCalendar, DayPilot } from "daypilot-pro-react";

function Calendar(props) {
  const [user_id, setUser_id] = useState("");
  const [calendar, setCalendar] = useState([]);
  const [events, setEvents] = useState([]);
  const config = {
    viewType: "Week",
    // startdate is the monday of the current week
    startDate: new DayPilot.Date().firstDayOfWeek().addDays(-1),
    // startDate: "2022-04-11",
    timeRangeSelectedHandling: "Disabled",
    eventDeleteHandling: "Disabled",
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    eventClickHandling: "Disabled",
    eventHoverHandling: "Disabled",
    showCurrentTime: true,
    durationBarVisible: false,
    headerDateFormat: "dddd",
    weekStarts: 1,
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
        console.log(res.data);
        setEvents(res.data);
        // set config events to res.data
        /* setConfig({
          ...config,
          events: res.data,
        }); */
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
  return (
    <div className="calendar">
      <h1>Calendar</h1>
      <div className="cal">
        <DayPilotCalendar {...config} events={events} />
      </div>
      <Button onClick={downloadCalendar}>Export</Button>
    </div>
  );
}

export default Calendar;
