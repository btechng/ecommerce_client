import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CVBuilder() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    education: "",
    experience: "",
    skills: "",
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    if (!cvRef.current) return;
    html2canvas(cvRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${formData.name.replace(" ", "_")}_CV.pdf`);
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🎓 CV Builder</h1>

      {/* Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          name="name"
          placeholder="Full Name"
          className="border p-2"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          className="border p-2"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          className="border p-2"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          className="border p-2"
          value={formData.address}
          onChange={handleChange}
        />
        <textarea
          name="summary"
          placeholder="Professional Summary"
          className="border p-2 md:col-span-2"
          rows={2}
          value={formData.summary}
          onChange={handleChange}
        />
        <textarea
          name="education"
          placeholder="Education"
          className="border p-2 md:col-span-2"
          rows={3}
          value={formData.education}
          onChange={handleChange}
        />
        <textarea
          name="experience"
          placeholder="Work Experience"
          className="border p-2 md:col-span-2"
          rows={3}
          value={formData.experience}
          onChange={handleChange}
        />
        <textarea
          name="skills"
          placeholder="Skills (comma-separated)"
          className="border p-2 md:col-span-2"
          rows={2}
          value={formData.skills}
          onChange={handleChange}
        />
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="border p-2 w-full"
          />
        </div>
      </div>

      <button
        onClick={generatePDF}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download CV as PDF
      </button>

      {/* CV Preview Styled */}
      <div
        ref={cvRef}
        className="bg-white shadow-md rounded p-6 border text-sm font-sans max-w-4xl mx-auto"
        style={{ fontFamily: "Arial, sans-serif", color: "#222" }}
      >
        {/* Header with image */}
        <div className="flex items-center border-b pb-4 mb-4 gap-4">
          {photo && (
            <img
              src={photo}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide">
              {formData.name}
            </h2>
            <p>
              {formData.email} | {formData.phone}
            </p>
            <p>{formData.address}</p>
          </div>
        </div>

        {formData.summary && (
          <section className="mb-4">
            <h3 className="font-semibold border-b text-gray-700 mb-1">
              Professional Summary
            </h3>
            <p className="text-gray-800 whitespace-pre-line">
              {formData.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {formData.experience && (
              <section className="mb-4">
                <h3 className="font-semibold border-b text-gray-700 mb-1">
                  Work Experience
                </h3>
                <p className="text-gray-800 whitespace-pre-line">
                  {formData.experience}
                </p>
              </section>
            )}

            {formData.education && (
              <section className="mb-4">
                <h3 className="font-semibold border-b text-gray-700 mb-1">
                  Education
                </h3>
                <p className="text-gray-800 whitespace-pre-line">
                  {formData.education}
                </p>
              </section>
            )}
          </div>

          <div>
            {formData.skills && (
              <section className="mb-4">
                <h3 className="font-semibold border-b text-gray-700 mb-1">
                  Skills
                </h3>
                <ul className="list-disc list-inside text-gray-800">
                  {formData.skills.split(",").map((skill, idx) => (
                    <li key={idx}>{skill.trim()}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
