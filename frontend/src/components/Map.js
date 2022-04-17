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
      zoom: 14,
      center: {
        lat: 38.53828240712879,
        lng: -121.76172941812959,
      },
      disableDefaultUI: true,
    });
    courses.forEach((course) => {
      console.log("Course:", course);
      let coordinates = JSON.parse(course.coordinates);
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
      style={{ width: "400px", height: "300px" }}
    />
  );
}

export default Map;
