import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";

function Map(props) {
  const [user_id, setUser_id] = useState("");
  const [courses, setData] = useState([]);
  const googleMapRef = useRef();
  let googleMap;

  useEffect(() => {
    setUser_id(props.user_id);
    console.log(props.user_id);
  }, [props.user_id]);

  useEffect(() => {
    if (user_id && user_id !== "") {
      console.log(user_id);
      axios
        .post("/api/view", {
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

  useEffect(() => {
    const googleMapScript = document.createElement("script");
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    window.document.body.appendChild(googleMapScript);
    googleMapScript.addEventListener("load", () => {
      //   getLatLng();
      loadMarkers();
    });
  }, [user_id, courses]);

  let loadMarkers = async () => {
    googleMap = new window.google.maps.Map(googleMapRef.current, {
      zoom: 16,
      // 38.5416056137645, -121.7514480204867
      center: { lat: 38.5416056137645, lng: -121.7514480204867 },
      disableDefaultUI: true,
    });
    courses.forEach((course) => {
      console.log("Course:", course);
      let coordinates = JSON.parse(course.coordinates);
      console.log("Coordinates:", coordinates);
      new window.google.maps.Marker({
        position: coordinates,
        map: googleMap,
        title: course.location,
        animation: window.google.maps.Animation.DROP,
      });
    });
  };

  return (
    <div
      id="google-map"
      ref={googleMapRef}
      style={{ width: "50%", height: "40vh", borderRadius: "10px" }}
    />
  );
}

export default Map;
