import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";

const Map = ({ placeName }) => {
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
      loadMarker();
    });
  }, []);

  let loadMarker = async () => {
    googleMap = new window.google.maps.Map(googleMapRef.current, {
      zoom: 14,
      center: {
        lat: 38.53828240712879,
        lng: -121.76172941812959,
      },
      disableDefaultUI: true,
    });
    let coordinates = await getLocation("YOUNG 198");
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
    }
  };

  const createGoogleMap = (coordinates) => {
    googleMap = new window.google.maps.Map(googleMapRef.current, {
      zoom: 16,
      center: {
        lat: coordinates.lat(),
        lng: coordinates.lng(),
      },
      disableDefaultUI: true,
    });
  };

  const getLatLng = () => {
    let lat, lng, placeId;
    new window.google.maps.Geocoder().geocode(
      { address: `${placeName}` },
      function (results, status) {
        if (status === window.google.maps.GeocoderStatus.OK) {
          placeId = results[0].place_id;
          createGoogleMap(results[0].geometry.location);
          lat = results[0].geometry.location.lat();
          lng = results[0].geometry.location.lng();
          new window.google.maps.Marker({
            position: { lat, lng },
            map: googleMap,
            animation: window.google.maps.Animation.DROP,
            title: `${placeName}`,
          });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      }
    );
  };
  return (
    <div
      id="google-map"
      ref={googleMapRef}
      style={{ width: "400px", height: "300px" }}
    />
  );
};

export default Map;
