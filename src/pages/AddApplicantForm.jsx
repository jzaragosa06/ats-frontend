import React, { useState } from 'react';
import { FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import ConfirmationModal from '../components/Modals/ConfirmationModal';

const formSchema = {
  firstName: '',
  middleName: '',
  lastName: '',
  birthdate: '',
  gender: '',
  email: '',
  phone: '',
  cvLink: '',
  position: '',
  source: '',
  referrer: '',
  testResult: '',
};

const duplicates = [
  {
    name: "Juniper Wright Williams",
    dateApplied: "October 24, 2024",
    positionApplied: "Business Operations Associate",
    applicationStatus: "Business Operations Associate",
    emailAddress: "junkyblue@gmail.com",
    similarities: ["First Name", "Last Name", "Email Address"],
  },
  {
    name: "Saturnino Paterno",
    dateApplied: "October 24, 2023",
    positionApplied: "Software Engineer",
    applicationStatus: "Business Operations Associate",
    emailAddress: "satkyblue@gmail.com",
    similarities: ["Email Address"],
  },
];

function AddApplicantForm({ onClose }) {
  const [formData, setFormData] = useState(formSchema);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Close the form after submission
    onClose();
  };

  const handleCancel = () => {
    setShowConfirmationModal(true);
  };

  const confirmCancel = () => {
    setShowConfirmationModal(false);
    onClose();
  };

  const closeModal = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 p-4">
          <h1 className="text-xl font-semibold">Add New Applicant</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-medium">Applicant Name</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="middleName"
                      placeholder="Middle Name"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col">
                  <label>Birthdate</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <FaCalendarAlt className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label>Gender</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                      />
                      <span>Male</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                      />
                      <span>Female</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleChange}
                      />
                      <span>Other</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label>Date Applied</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateApplied"
                      value={formData.dateApplied}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <FaCalendarAlt className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="(XXX) XXX-XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label>CV Link</label>
                <input
                  type="url"
                  name="cvLink"
                  placeholder="cv.link@drive.com"
                  value={formData.cvLink}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label>Position Applied</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Option</option>
                  <option value="engineer">Software Engineer</option>
                  <option value="designer">UI Designer</option>
                  <option value="manager">Product Manager</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label>Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Option</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>

                <div>
                  <label>Referrer</label>
                  <select
                    name="referrer"
                    value={formData.referrer}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Option</option>
                    <option value="john">John Doe</option>
                    <option value="jane">Jane Smith</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Test Result</label>
                <input
                  type="url"
                  name="testResult"
                  placeholder="https://testresults.com"
                  value={formData.testResult}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-teal-600/10 text-teal-600 hover:bg-teal-600/20 hover:text-teal-700"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#008080] text-white hover:bg-teal-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-96 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Possible Duplicates ({duplicates.length})</h2>
            </div>
            <div className="space-y-4">
              {duplicates.map((duplicate, index) => (
                <div key={index} className="border p-4 space-y-2">
                  <h3 className="font-medium">{duplicate.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Date Applied: {duplicate.dateApplied}</p>
                    <p>Position Applied: {duplicate.positionApplied}</p>
                    <p>Application Status: {duplicate.applicationStatus}</p>
                    <p>Email Address: {duplicate.emailAddress}</p>
                  </div>
                  <div className="space-y-1 pt-2">
                    {duplicate.similarities.map((similarity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
                        <FaExclamationTriangle className="h-4 w-4" />
                        <span>Similarity in {similarity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showConfirmationModal && (
          <ConfirmationModal
            message="Are you sure you want to leave this page? Unsaved changes will be lost."
            onConfirm={confirmCancel}
            onCancel={closeModal}
          />
        )}
      </div>
    </div>
  );
}

export default AddApplicantForm;