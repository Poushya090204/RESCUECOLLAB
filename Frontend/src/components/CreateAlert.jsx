import React, { useEffect, useState } from "react";
import apiConnector from "../services/apiConnector";
import { alertEndPoints } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getAllAgencies } from "../redux/Actions/agencyAction";

const AddAlert = () => {
  const agencies = useSelector((state) => state.agencies?.allAgencies?.agency || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [recipientAgency, setRecipientAgency] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllAgencies());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newAlert = { recipientAgency, severity, description };
    console.log("New Alert Data:", newAlert);

    try {
      await apiConnector({
        method: "POST",
        url: alertEndPoints.CREATE_ALERT_API,
        data: newAlert,
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Alert created successfully");
      navigate("/alert");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating alert");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen">
      <div className="w-11/12 p-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Create a New Alert</h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Recipient Agency */}
          <div>
            <label htmlFor="recipientAgency" className="sr-only">Recipient Agency</label>
            <select
              id="recipientAgency"
              name="recipientAgency"
              required
              className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={recipientAgency}
              onChange={(e) => setRecipientAgency(e.target.value)}
            >
              <option value="">Select Recipient Agency</option>
              {agencies.map((agency) => (
                <option key={agency._id} value={agency._id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label htmlFor="severity" className="sr-only">Severity</label>
            <input
              id="severity"
              name="severity"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Severity (High / Low)"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="sr-only">Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div>
            {!loading ? (
              <button
                type="submit"
                className="w-full py-2 px-4 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-all duration-200"
              >
                Send Alert
              </button>
            ) : (
              <div className="w-full flex items-center justify-center">Loading...</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlert;
