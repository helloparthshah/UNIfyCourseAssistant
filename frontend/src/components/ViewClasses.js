import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewClasses.css";
import { Table, Button } from "react-bootstrap";

function ViewClasses(props) {
  // const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"]);
  const [courses, setData] = useState([]);
  const [user_id, setUser_id] = useState("");

  useEffect(() => {
    console.log(props.user_id);
    // setUser_id("279174239972491276");
    // get user_id from cookie
    if (props.user_id) {
      setUser_id(props.user_id);
    }
  }, [props.user_id]);
  useEffect(() => {
    if (user_id && user_id !== "") {
      console.log(user_id);
      axios
        .post("https://unify.onrender.com/api/view", {
          user_id: user_id,
        })
        .then((res) => {
          console.log(res.data);
          if (!res.data.err) setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user_id]);

  return (
    <div className="view-class">
      <Table striped bordered hover onClick={props.onClick}>
        {/* crn, time, name, location, section, title, ge, instructor, units, discussion */}
        <thead>
          <tr>
            <th>CRN</th>
            <th>Title</th>
            <th>Section</th>
            <th>Professor</th>
            <th>Units</th>
            <th>Time</th>
            <th>Location</th>
            <th>Discussion</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => {
              return (
                <tr key={course.crn}>
                  <td>{course.crn}</td>
                  <td>{course.title}</td>
                  <td>{course.section}</td>
                  <td>{course.instructor}</td>
                  <td>{course.units}</td>
                  <td>{course.time}</td>
                  <td>{course.location}</td>
                  <td>{course.discussion}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default ViewClasses;
