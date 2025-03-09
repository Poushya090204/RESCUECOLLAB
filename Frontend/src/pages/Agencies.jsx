import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAgencies } from "../redux/Actions/agencyAction";
import AgencyComponent from "../components/AgencyComponent";
import * as geolib from "geolib";
import { getAccountInfo } from "../redux/Actions/profileAction";
import { FiSearch } from "react-icons/fi";

const Agencies = () => {
  const agencies = useSelector((state) => state.agencies);
  const agencyInfo = useSelector((state) => state.profile.accountInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllAgencies());
    dispatch(getAccountInfo());
  }, [dispatch]);

  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistanceRange, setSelectedDistanceRange] = useState("");
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  const temp = agencies?.allAgencies?.agency || [];

  const filterAgenciesByExpertise = (expertise) => {
    if (!temp.length) return;

    if (expertise === "") {
      setFilteredAgencies(
        searchQuery
          ? temp.filter(
              (agency) =>
                agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agency.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : temp
      );
    } else {
      setFilteredAgencies(
        temp.filter((agency) => agency.expertise.includes(expertise))
      );
    }
  };

  useEffect(() => {
    filterAgenciesByExpertise(selectedExpertise);
  }, [selectedExpertise, searchQuery, temp]);

  useEffect(() => {
    if (!selectedDistanceRange || !agencyInfo?.location?.coordinates) return;

    const distances = {
      within10km: 10000,
      within50km: 50000,
      within100km: 100000,
      within200km: 200000,
    };

    const yourAgencyCoordinates = {
      latitude: agencyInfo.location.coordinates[1],
      longitude: agencyInfo.location.coordinates[0],
    };

    if (selectedDistanceRange === ">200km") {
      setFilteredAgencies(
        temp.filter((agency) => {
          const agencyCoordinates = {
            latitude: agency.location.coordinates[1],
            longitude: agency.location.coordinates[0],
          };
          return geolib.getDistance(agencyCoordinates, yourAgencyCoordinates) >
            distances["within200km"];
        })
      );
    } else {
      setFilteredAgencies(
        temp.filter((agency) => {
          const agencyCoordinates = {
            latitude: agency.location.coordinates[1],
            longitude: agency.location.coordinates[0],
          };
          return geolib.getDistance(agencyCoordinates, yourAgencyCoordinates) <=
            distances[selectedDistanceRange];
        })
      );
    }
  }, [selectedDistanceRange, temp, agencyInfo]);

  useEffect(() => {
    if (!selectedState) return;

    setFilteredAgencies(
      temp.filter((agency) =>
        agency.contact.address.state
          .toLowerCase()
          .includes(selectedState.toLowerCase())
      )
    );
  }, [selectedState, temp]);

  if (agencies.loading || !agencyInfo) {
    return (
      <div className="spinner w-full flex items-center justify-center"></div>
    );
  }

  const allExpertise = temp.flatMap((agency) => agency.expertise);
  const uniqueExpertise = [...new Set(allExpertise)];

  return (
    <div className="w-full bg-gray-100 flex items-center gap-y-20 justify-center">
      <div className="w-full flex flex-col items-center gap-y-6 justify-center">
        <div className="text-indigo-600 font-sans mt-6 text-4xl md:text-5xl font-bold">
          All Agencies List
        </div>

        {/* Filters and search */}
        <div className="w-11/12 flex flex-col items-center justify-center">
          <div className="w-full md:w-8/12 relative">
            <label className="block text-indigo-600 font-bold mb-2">
              Search:
            </label>
            <input
              type="text"
              placeholder="Search agencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full bg-white border border-gray-400 px-4 py-2 rounded shadow focus:outline-none"
            />
          </div>

          <div className="flex w-8/12 md:flex-row sm:flex-col gap-x-12 mt-4 items-center justify-between">
            {/* Expertise Filter */}
            <div className="w-full">
              <label className="block text-indigo-600 font-bold mb-2">
                Filter by Expertise:
              </label>
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="block w-full bg-white border border-gray-400 px-4 py-2 rounded shadow focus:outline-none"
              >
                <option value="">All</option>
                {uniqueExpertise.map((expertise) => (
                  <option key={expertise} value={expertise}>
                    {expertise}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div className="w-full">
              <label className="block text-indigo-600 font-bold mb-2">
                Filter by Distance:
              </label>
              <select
                value={selectedDistanceRange}
                onChange={(e) => setSelectedDistanceRange(e.target.value)}
                className="block w-full bg-white border border-gray-400 px-4 py-2 rounded shadow focus:outline-none"
              >
                <option value="">Select Distance Range</option>
                <option value="within10km">Within 10km</option>
                <option value="within50km">Within 50km</option>
                <option value="within100km">Within 100km</option>
                <option value="within200km">Within 200km</option>
                <option value=">200km">Greater than 200km</option>
              </select>
            </div>

            {/* State Filter */}
            <div className="w-full">
              <label className="block text-indigo-600 font-bold mb-2">
                State:
              </label>
              <select
                onChange={(e) => setSelectedState(e.target.value)}
                className="block w-full bg-white border border-gray-400 px-4 py-2 rounded shadow focus:outline-none"
              >
                <option value="">All</option>
                {[
                  "Andhra Pradesh",
                  "Bihar",
                  "Delhi",
                  "Gujarat",
                  "Karnataka",
                  "Maharashtra",
                  "Tamil Nadu",
                  "Uttar Pradesh",
                  "West Bengal",
                ].map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agencies List */}
        <div className="w-full">
          {filteredAgencies.map((agency) => (
            <AgencyComponent key={agency._id} agency={agency} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Agencies;
