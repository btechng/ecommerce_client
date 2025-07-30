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
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Professional CV Builder
      </h1>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-8">
        {["name", "email", "phone", "address"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="border p-2 rounded"
            value={(formData as any)[field]}
            onChange={handleChange}
          />
        ))}
        <textarea
          name="summary"
          placeholder="Professional Summary"
          className="border p-2 rounded md:col-span-2"
          rows={3}
          value={formData.summary}
          onChange={handleChange}
        />
        <textarea
          name="education"
          placeholder="Education"
          className="border p-2 rounded md:col-span-2"
          rows={3}
          value={formData.education}
          onChange={handleChange}
        />
        <textarea
          name="experience"
          placeholder="Work Experience"
          className="border p-2 rounded md:col-span-2"
          rows={3}
          value={formData.experience}
          onChange={handleChange}
        />
        <textarea
          name="skills"
          placeholder="Skills (comma-separated)"
          className="border p-2 rounded md:col-span-2"
          rows={2}
          value={formData.skills}
          onChange={handleChange}
        />
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium text-gray-700">
            Upload Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="border p-2 w-full rounded"
          />
        </div>
      </div>

      <button
        onClick={generatePDF}
        className="mb-6 bg-blue-700 hover:bg-blue-800 transition text-white px-6 py-2 rounded shadow"
      >
        📄 Download CV as PDF
      </button>

      {/* CV Preview */}
      <div
        ref={cvRef}
        className="bg-white shadow-lg rounded-lg p-8 mx-auto text-gray-900 max-w-4xl"
        style={{ fontFamily: "'Segoe UI', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center border-b pb-4 mb-6 gap-6">
          {photo && (
            <img
              src={photo}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full border"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold uppercase">{formData.name}</h2>
            <p className="text-sm text-gray-700">
              {formData.email} | {formData.phone}
            </p>
            <p className="text-sm text-gray-700">{formData.address}</p>
          </div>
        </div>

        {formData.summary && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold border-b pb-1 mb-2 text-blue-700">
              Professional Summary
            </h3>
            <p className="whitespace-pre-line text-sm">{formData.summary}</p>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {formData.experience && (
              <section className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-1 mb-2 text-blue-700">
                  Work Experience
                </h3>
                <p className="whitespace-pre-line text-sm">
                  {formData.experience}
                </p>
              </section>
            )}
            {formData.education && (
              <section className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-1 mb-2 text-blue-700">
                  Education
                </h3>
                <p className="whitespace-pre-line text-sm">
                  {formData.education}
                </p>
              </section>
            )}
          </div>

          {formData.skills && (
            <div>
              <h3 className="text-lg font-semibold border-b pb-1 mb-2 text-blue-700">
                Skills
              </h3>
              <ul className="list-disc list-inside text-sm">
                {formData.skills.split(",").map((skill, idx) => (
                  <li key={idx}>{skill.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
