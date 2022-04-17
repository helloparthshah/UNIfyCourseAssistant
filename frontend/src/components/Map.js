import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";

function Map(props) {
  let getLocation = async (query) => {
    //   returns the coordinates of the place
    let res = await axios.post("/api/location", {
        query,
      }),
      location = res.data;
    return location;
  };
  /* let coordinates = {};
    axios
      .post("/api/location", {
        query: query,
      })
      .then((res) => {
        console.log(res.data);
        coordinates = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    return coordinates;
  }; */
  const googleMapRef = useRef();
  let googleMap;
  useEffect(() => {
    const googleMapScript = document.createElement("script");
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    window.document.body.appendChild(googleMapScript);
    googleMapScript.addEventListener("load", () => {
      //   getLatLng();
      loadMarkers();
    });
  }, []);

  let loadMarkers = async () => {
    googleMap = new window.google.maps.Map(googleMapRef.current, {
      zoom: 14,
      center: {
        lat: 38.53828240712879,
        lng: -121.76172941812959,
      },
      disableDefaultUI: true,
    });
    axios
      .post("/api/view", {
        user_id: props.user_id,
      })
      .then((res) => {
        console.log(res.data);
        res.data.forEach((course) => {
          console.log(course);
          if (course.location) {
            getLocation(course.location).then((coordinates) => {
              console.log(res);
              new window.google.maps.Marker({
                position: coordinates,
                map: googleMap,
                title: course.location,
              });
            });
          }
        });
        /* for (let c in res.data) {
          console.log(res.data[c]);
          if (res.data[c].location) {
            getLocation(res.data[c].location).then((coordinates) => {
              console.log(res);
              new window.google.maps.Marker({
                position: coordinates,
                map: googleMap,
                title: res.data[c].location,
              });
            });
          }
        } */
      });
    /* await getLocation("YOUNG 198");
    console.log("Coordinates", coordinates);
    let lat = coordinates.lat;
    let lng = coordinates.lng;
    try {
      new window.google.maps.Marker({
        position: { lat, lng },
        map: googleMap,
        title: "YOUNG 198",
        animation: window.google.maps.Animation.DROP,
      });
    } catch (err) {
      console.log(err);
    } */
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
