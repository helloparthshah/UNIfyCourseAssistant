import React, { useState, useEffect } from "react";
import axios from "axios";

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
      <h1>Recommend</h1>
      {/* list user_ids */}
      <ul>
        {recommendations.length > 0 ? (
          recommendations.map((recommendation) => {
            return (
              <li key={recommendation.user_id}>
                {recommendation.user_id} {recommendation.name}{" "}
                {recommendation.n_sim_courses}
              </li>
            );
          })
        ) : (
          <></>
        )}
      </ul>
    </div>
  );
}
export default Recommend;
