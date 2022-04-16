import React, { useState, useEffect } from "react";
import axios from "axios";
function Test() {
  const [courses, setData] = useState({});

  useEffect(() => {
    axios.get("/course/ECS150").then((res) => {
      console.log(res.data);
      setData(res.data[0]);
    });
  }, []);

  return (
    <>
      <div>Test</div>
      <div>{courses.name}</div>
    </>
  );
}

export default Test;
