import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAgencies } from "../actions/agencyAction"; // Correct import

const Agencies = () => {
  const dispatch = useDispatch();
  const { agencies, loading, error } = useSelector((state) => state.agency);

  useEffect(() => {
    dispatch(getAllAgencies());
  }, [dispatch]);

  return (
    <div>
      <h1>Agencies List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {agencies && agencies.map((agency) => (
          <li key={agency.id}>{agency.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Agencies;
