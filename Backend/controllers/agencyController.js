import axios from "axios";
import Agency from "../models/agency.js";
import Disaster from "../models/disaster.js";
import Resource from "../models/resource.js";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../helpers/bcrypt.js";

// Register Agency
export const registerAgency = async (req, res) => {
  try {
    const { name, email, password, contact, phoneNumber, expertise } = req.body;
    if (!name || !email || !password || !contact || !phoneNumber || !expertise) {
      return res.status(400).send({
        success: false,
        message: "All fields are mandatory",
      });
    }

    const existingAgency = await Agency.findOne({ email });
    if (existingAgency) {
      return res.status(400).send({
        success: false,
        message: "User is already registered, please log in",
      });
    }

    const address = `${contact.address.street}, ${contact.address.city}, ${contact.address.state}, ${contact.address.postalCode}, ${contact.address.country}`;
    const geocodingResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_API_KEY}`
    );

    const features = geocodingResponse.data.features;

    if (!features || features.length === 0) {
      return res.status(400).json({ message: "Invalid address" });
    }

    const coordinates = features[0].center;
    const swappedCoordinates = [coordinates[1], coordinates[0]];

    const hashedPassword = await hashPassword(password);
    const agency = new Agency({
      name,
      email,
      password: hashedPassword,
      contact,
      phoneNumber,
      expertise,
      location: {
        type: "Point",
        coordinates: swappedCoordinates,
      },
    });

    await agency.save();

    res.status(201).json({
      success: true,
      message: "Agency registered successfully",
      agency,
    });
  } catch (error) {
    console.error("Error registering agency:", error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: "Something went wrong", error: error.response ? error.response.data : error.message });
  }
};

// Login Agency
export const loginAgency = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = await Agency.findOne({ email });
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "This email is not registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid password or email",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).send({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Password
export const updatePassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;
    if (!oldpassword || !newpassword) {
      return res.status(400).send({ success: false, message: "All fields are mandatory" });
    }

    const agencyId = req.user._id;
    const user = await Agency.findById(agencyId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Agency not registered",
      });
    }

    const match = await comparePassword(oldpassword, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashedPassword = await hashPassword(newpassword);
    await Agency.findByIdAndUpdate(agencyId, { password: hashedPassword });

    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Update Agency
export const updateAgency = async (req, res) => {
  try {
    const { name, email, contact, phone, expertise } = req.body;
    const agency = await Agency.findById(req.user._id);

    if (!agency) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }

    const address = `${contact.address.street}, ${contact.address.city}, ${contact.address.state}, ${contact.address.postalCode}, ${contact.address.country}`;
    const geocodingResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_API_KEY}`
    );

    const features = geocodingResponse.data.features;

    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const coordinates = features[0].center;
    const swappedCoordinates = [coordinates[1], coordinates[0]];

    agency.name = name || agency.name;
    agency.email = email || agency.email;
    agency.contact = contact || agency.contact;
    agency.phone = phone || agency.phone;
    agency.expertise = expertise || agency.expertise;
    agency.location = {
      type: "Point",
      coordinates: swappedCoordinates,
    };

    const updatedAgency = await agency.save();

    res.status(200).json({ success: true, message: "Agency updated successfully", updatedAgency });
  } catch (error) {
    console.error("Error updating agency:", error.message);
    res.status(500).json({ success: false, message: "Error updating agency", error: error.message });
  }
};

// Get All Agency Locations
export const getAllAgencyLocations = async (req, res) => {
  try {
    const agencies = await Agency.find();

    const agencyLocations = agencies.map((agency) => ({
      _id: agency._id,
      name: agency.name,
      contact: agency.contact,
      location: agency.location,
    }));

    res.status(200).json({
      success: true,
      message: "All agency locations retrieved successfully",
      agencies: agencyLocations,
    });
  } catch (error) {
    console.error("Error fetching agency locations:", error.message);
    res.status(500).json({ success: false, message: "Error fetching agency locations", error: error.message });
  }
};

// Get Agency Resources and Disasters
export const getAgencyResourcesAndDisasters = async (req, res) => {
  try {
    const agencyId = req.user._id;
    const agency = await Agency.findById(agencyId).select('-password');

    if (!agency) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }

    const resources = await Resource.find({ ownerAgency: agency._id });
    const disasters = await Disaster.find({ agencies: agency._id });

    res.status(200).json({
      message: "Agency resources and disasters retrieved successfully",
      agency,
      resources,
      disasters,
    });
  } catch (error) {
    console.error("Error retrieving agency resources and disasters:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving agency resources and disasters",
      error: error.message,
    });
  }
};

// Get Agency Profile
export const agencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findById(req.user._id).select('-password');

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.status(200).json({ agency });
  } catch (error) {
    console.error("Error fetching agency profile:", error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Find Agency by ID
export const findAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const resources = await Resource.find({ ownerAgency: agency._id });
    const disasters = await Disaster.find({ agencies: agency._id });

    res.status(200).json({ agency, resources, disasters });
  } catch (error) {
    console.error("Error finding agency:", error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Find All Agencies
export const findAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find();
    if (!agencies) {
      return res.status(404).json({ message: 'No agencies found' });
    }
    res.status(200).json({ agencies });
  } catch (error) {
    console.error("Error finding all agencies:", error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
