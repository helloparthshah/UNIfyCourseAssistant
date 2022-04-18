import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import "../styles/Recommend.css";
function Recommend(props) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    axios
      .post("/api/recommend", {
        user_id: props.user_id,
      })
      .then((res) => {
        console.log(res.data);
        if (!res.data.err) setRecommendations(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.user_id]);

  return (
    <div className="recommend">
      <h1>People you would like</h1>
      <Table striped bordered hover>
        {/* user_id, name, percentage match */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Percentage Match</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.length > 0 ? (
            recommendations.map((recommendation) => {
              return (
                <tr
                  key={recommendation.user_id}
                  onClick={() => {
                    // redirect to discord user profile
                    window.location.href = `https://discordapp.com/users/${recommendation.user_id}`;
                  }}
                >
                  <td>{recommendation.name}</td>
                  {/* round to 2 decimals */}
                  <td>{recommendation.n_sim_courses.toFixed(2)}%</td>
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
export default Recommend;
