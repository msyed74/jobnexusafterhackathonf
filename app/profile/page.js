"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import PropTypes from "prop-types";
import { db } from "../../lib/firebase"; // Import Firestore
import { doc, getDoc, setDoc } from "firebase/firestore";

const Profile = ({ setShowProfile, onEdit }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    experience: [],
    education: [],
  });

  useEffect(() => {
    const auth = getAuth();
    
    // Track user authentication status
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchResume(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const fetchResume = async (userId) => {
    if (!userId) return;

    try {
      const docRef = doc(db, "resumes", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResumeData(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: "New Display Name",
          // Optionally update the photo URL
          // photoURL: "https://example.com/new-profile-photo.jpg"
        });
        await user.reload();
        setUser(getAuth().currentUser); // Refresh user state
        console.log("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      console.log("No user is signed in.");
    }
  };

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    if (!user?.uid) return;

    try {
      await setDoc(doc(db, "resumes", user.uid), resumeData);
      alert("Resume updated successfully!");
    } catch (error) {
      console.error("Error updating resume:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-overlay" onClick={() => setShowProfile(false)}>
      <div className="profile-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={() => setShowProfile(false)}>
          ✖
        </button>

        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
          <h2 className="text-xl font-semibold mb-4">Resume Profile</h2>

          <input
            type="text"
            name="name"
            value={resumeData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded mb-2"
          />

          <input
            type="email"
            name="email"
            value={resumeData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded mb-2"
          />

          <button onClick={handleSave} className="mt-4 bg-blue-600 text-white p-2 rounded">
            Save Resume
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center">Profile</h1>
        <div className="mt-4">
          <p className="text-lg">
            <strong>Name:</strong> {user ? user.displayName || "N/A" : "Loading..."}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {user ? user.email : "Loading..."}
          </p>
          <p className="text-lg">
            <strong>Phone:</strong> {user ? user.phoneNumber || "N/A" : "Loading..."}
          </p>
        </div>

        <button className="edit-button" onClick={handleUpdateProfile}>
          Update Profile
        </button>
        <button className="edit-button" onClick={handleEdit}>
          Edit Profile
        </button>

        <div className="profile-content">
          {isEditing ? (
            <>
              <h2>Edit Profile</h2>
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <h1>Profile</h1>
              <button onClick={handleEdit}>Edit Profile</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {
  setShowProfile: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
};

export default Profile;
