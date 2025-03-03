"use client"
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditProfile = () => {
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    location: "",
    resume: "",
    skills: [],
    experience: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState("");

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, [auth, db]);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSkillsChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setSkills(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      let resumeURL = userData.resume;
      if (resumeFile) {
        const resumeRef = ref(storage, `resumes/${user.uid}`);
        await uploadBytes(resumeRef, resumeFile);
        resumeURL = await getDownloadURL(resumeRef);
      }
      await setDoc(doc(db, "users", user.uid), {
        displayName: userData.displayName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        location: userData.location,
        resume: resumeURL,
        skills: skills,
        experience: experience,
      });
      alert("Profile updated successfully!");
    }
  };

  return (
    <form className="bg-yellow-500 m-4 max-h-[400px] overflow-y-auto overflow-x-hidden rounded-lg  pt-6 px-4 py-4" onSubmit={handleSubmit}>
    
      <input
        type="text"
        value={userData.displayName}
        onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
        placeholder="Full Name"
        className="rounded-lg mb-2 px-2 py-2 w-full"
      />
      <input
        type="email"
        value={userData.email}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        placeholder="Email"
        className="rounded-lg mb-2 px-2 py-2 w-full"
      />
      <input
        type="text"
        value={userData.phoneNumber}
        onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
        placeholder="Phone Number"
        className="rounded-lg mb-2 px-2 py-2 w-full"
      />
      <input
        type="text"
        value={userData.location}
        onChange={(e) => setUserData({ ...userData, location: e.target.value })}
        placeholder="Location"
        className="rounded-lg mb-2 px-2 py-2 w-full"
      />
      <input type="file"
       onChange={handleFileChange}
       className="rounded-lg mb-2 px-2 py-2 w-full" />
      <select className="w-full  rounded-lg  px-2 py-2"  multiple onChange={handleSkillsChange}>
        <option value="JavaScript">JavaScript</option>
        <option value="Python">Python</option>
        <option value="AI">AI</option>
        <option value="ML">ML</option>
        {/* Add more skills as needed */}
      </select>
      <textarea
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        className="rounded-lg mb-2 px-3 mt-4 py-3 h-40 w-full "
        placeholder="Experience"
      />
      <div className="flex justify-between mt-4">
      <button 
      className="rounded-lg bg-yellow-600   text-white border-red-2px px-3 py-3 "
       type="submit">Update Profile</button>
     </div>
    </form>
  );
};

export default EditProfile;
