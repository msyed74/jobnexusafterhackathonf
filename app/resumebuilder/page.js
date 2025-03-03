"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";  // Ensure useRouter is properly imported
import { db, storage } from "../../lib/firebase"; // Ensure Firebase is configured
import { collection, addDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const ResumeBuilder = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    experience: [{ company: "", role: "", duration: "" }],
    education: [{ institution: "", degree: "", year: "" }],
    skills: "",
  });

  const router = useRouter();  // Fix: Declare router using useRouter hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExperienceChange = (index, e) => {
    const newExperience = [...formData.experience];
    newExperience[index][e.target.name] = e.target.value;
    setFormData({ ...formData, experience: newExperience });
  };

  const handleEducationChange = (index, e) => {
    const newEducation = [...formData.education];
    newEducation[index][e.target.name] = e.target.value;
    setFormData({ ...formData, education: newEducation });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: "", role: "", duration: "" }],
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: "", degree: "", year: "" }],
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(collection(db, "resumes"), formData);
      alert("Resume saved successfully!");
      router.push("/");  // Ensure to use the router to navigate after submission
    } catch (error) {
      console.error("Error saving resume: ", error);
    }
  };
  

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text(`Resume - ${formData.fullName}`, 10, 10);
    doc.text(`Email: ${formData.email}`, 10, 20);
    doc.text(`Phone: ${formData.phone}`, 10, 30);
    doc.text(`Address: ${formData.address}`, 10, 40);
    doc.text("Experience:", 10, 50);
    formData.experience.forEach((exp, i) => {
      doc.text(`${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})`, 10, 60 + i * 10);
    });
    doc.save("resume.pdf");
  };

  return (
    <>
      <Navbar />
      <div className="p-10 mt-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Resume Builder</h1>

        <div className="grid grid-cols-2 gap-6 bg-gray-100 p-6 rounded-lg shadow-md">
          {/* ✅ Personal Information Step */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
              <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded mb-2" />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded mb-2" />
              <input type="text" name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 border rounded mb-2" />
              <input type="text" name="address" placeholder="Address" onChange={handleChange} className="w-full p-2 border rounded mb-2" />
            </div>
          )}

          {/* ✅ Experience Step */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
              {formData.experience.map((exp, index) => (
                <div key={index} className="border p-2 mb-2 rounded">
                  <input type="text" name="company" placeholder="Company" onChange={(e) => handleExperienceChange(index, e)} className="w-full p-2 border rounded mb-2" />
                  <input type="text" name="role" placeholder="Role" onChange={(e) => handleExperienceChange(index, e)} className="w-full p-2 border rounded mb-2" />
                  <input type="text" name="duration" placeholder="Duration" onChange={(e) => handleExperienceChange(index, e)} className="w-full p-2 border rounded mb-2" />
                </div>
              ))}
              <button onClick={addExperience} className="bg-blue-500 text-white px-4 py-2 rounded">Add Experience</button>
            </div>
          )}

          {/* ✅ Education Step */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Education</h2>
              {formData.education.map((edu, index) => (
                <div key={index} className="border p-2 mb-2 rounded">
                  <input type="text" name="institution" placeholder="Institution" onChange={(e) => handleEducationChange(index, e)} className="w-full p-2 border rounded mb-2" />
                  <input type="text" name="degree" placeholder="Degree" onChange={(e) => handleEducationChange(index, e)} className="w-full p-2 border rounded mb-2" />
                  <input type="text" name="year" placeholder="Year" onChange={(e) => handleEducationChange(index, e)} className="w-full p-2 border rounded mb-2" />
                </div>
              ))}
              <button onClick={addEducation} className="bg-blue-500 text-white px-4 py-2 rounded">Add Education</button>
            </div>
          )}

          {/* ✅ Skills Step */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Skills</h2>
              <input type="text" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="w-full p-2 border rounded mb-2" />
            </div>
          )}

          {/* ✅ Preview */}
          {step === 5 && (
            <div className="border p-4 rounded bg-white">
              <h2 className="text-2xl font-bold">{formData.fullName}</h2>
              <p className="text-gray-600">{formData.email} | {formData.phone}</p>
              <p className="text-gray-600">{formData.address}</p>

              <h3 className="font-semibold mt-4">Experience</h3>
              {formData.experience.map((exp, index) => (
                <p key={index}><strong>{exp.role}</strong> at {exp.company} ({exp.duration})</p>
              ))}

              <h3 className="font-semibold mt-4">Education</h3>
              {formData.education.map((edu, index) => (
                <p key={index}><strong>{edu.degree}</strong>, {edu.institution} ({edu.year})</p>
              ))}

              <h3 className="font-semibold mt-4">Skills</h3>
              <p>{formData.skills}</p>
            </div>
          )}
        </div>

        {/* ✅ Navigation Buttons */}
        <div className="flex  justify-between mt-6">
          {step > 1 && (
            <button onClick={handleBack} className="bg-yellow-500 text-black px-4 py-2 rounded-lg">
              Back
            </button>
          )}
          {step < 5 ? (
            <button onClick={handleNext} className="bg-yellow-600 text-black px-4 py-2 rounded-lg">
              Next
            </button>
          ) : (
            <>
              <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded">Download PDF</button>
              <button onClick={handleSubmit} className="bg-yellow-500 text-black px-4 py-2 rounded-lg">Save Resume</button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;
