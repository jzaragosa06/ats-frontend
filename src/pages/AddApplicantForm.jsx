"use client"

import { useState, useEffect } from "react"
import {
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaBriefcase,
  FaLink,
  FaUserFriends,
  FaMinus,
  FaPlus,
} from "react-icons/fa"
import Cookies from "js-cookie"
import useUserStore from "../context/userStore"
import api from "../api/axios"
import ConfirmationModal from "../components/Modals/ConfirmationModal"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const formSchema = {
  firstName: "",
  middleName: "",
  lastName: "",
  birthdate: "",
  gender: "",
  email: "",
  phone: "",
  cvLink: "",
  position: "",
  source: "",
  referrer: "",
  testResult: "",
  dateApplied: "",
  additionalEmails: ["", ""],
  additionalPhones: [""],
}

function AddApplicantForm({ onClose, initialData, onEditSuccess }) {
  const [formData, setFormData] = useState(formSchema)
  const [positions, setPositions] = useState([])
  const [users, setUsers] = useState([])
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [duplicates, setDuplicates] = useState([])
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const user = useUserStore((state) => state.user)
  const [modalType, setModalType] = useState(null) // 'submit' or 'cancel'



  // Determine if we're editing or adding based on initialData
  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      const mappedData = {
        firstName: initialData.first_name || "",
        middleName: initialData.middle_name || "",
        lastName: initialData.last_name || "",
        birthdate: initialData.birth_date ? new Date(initialData.birth_date).toISOString().split("T")[0] : "",
        gender: initialData.gender || "",
        email: initialData.email_1 || "",
        phone: initialData.mobile_number_1 || "",
        cvLink: initialData.cv_link || "",
        position: initialData.job_id || "",
        source: initialData.discovered_at || "",
        referrer: initialData.referrer || "",
        testResult: initialData.test_result || "",
        dateApplied: initialData.tracking_created_at
          ? new Date(initialData.tracking_created_at).toISOString().split("T")[0]
          : "",
        additionalEmails: [initialData.email_2 || "", initialData.email_3 || ""],
        additionalPhones: [initialData.mobile_number_2 || ""],
      }
      setFormData(mappedData)
    }
  }, [initialData])

  useEffect(() => {
    if (formData.firstName || formData.lastName || formData.email || formData.phone) {
      checkForDuplicates()
    }
  }, [formData.firstName, formData.lastName, formData.email, formData.phone])

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await api.get("/company/positions")
        setPositions(response.data.positions)
      } catch (error) {
        console.error("Error fetching positions:", error)
      }
    }
    const fetchUsers = async () => {
      try {
        const token = Cookies.get("token")
        const response = await api.get("/user/user-accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUsers(response.data.userAccounts)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    fetchPositions()
    fetchUsers()
  }, [])

  const checkForDuplicates = async () => {
    const payload = {
      applicant: JSON.stringify({
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        birth_date: formData.birthdate,
        gender: formData.gender,
        email_1: formData.email,
        mobile_number_1: formData.phone,
        cv_link: formData.cvLink,
        discovered_at: formData.source,
        referrer_id: formData.referrer,
        created_by: user.user_id,
        updated_by: user.user_id,
        company_id: "company_id",
        position_id: formData.position,
        test_result: formData.testResult,
        date_applied: formData.dateApplied,
      }),
    }

    try {
      const duplicateCheckResponse = await api.post("/applicants/add/check-duplicates", payload)

      console.log("Duplicate check response:", duplicateCheckResponse.data)
      if (duplicateCheckResponse.data.isDuplicate) {
        setDuplicates(duplicateCheckResponse.data.possibleDuplicates)
      } else {
        setDuplicates([])
      }
    } catch (error) {
      console.error("Error checking for duplicates:", error)
    }
  }
  const handleAddEmail = () => {
    // Check if we already have empty fields that aren't displayed
    const visibleEmails = formData.additionalEmails.filter((email) => email !== "").length
    const totalEmails = formData.additionalEmails.length

    if (visibleEmails < totalEmails) {
      // If we have hidden empty fields, just make one visible by adding a space
      const newEmails = [...formData.additionalEmails]
      for (let i = 0; i < newEmails.length; i++) {
        if (newEmails[i] === "") {
          newEmails[i] = " " // Add a space to make it visible
          break
        }
      }
      setFormData((prev) => ({
        ...prev,
        additionalEmails: newEmails,
      }))
    } else if (totalEmails < 2) {
      // If we have less than 2 total fields, add a new one
      setFormData((prev) => ({
        ...prev,
        additionalEmails: [...prev.additionalEmails, " "],
      }))
    }
  }

  const handleRemoveEmail = (index) => {
    setFormData((prev) => {
      const newEmails = prev.additionalEmails.filter((_, i) => i !== index)
      return { ...prev, additionalEmails: newEmails }
    })
  }

  const handleAddPhone = () => {
    // Check if we already have empty fields that aren't displayed
    const visiblePhones = formData.additionalPhones.filter((phone) => phone !== "").length
    const totalPhones = formData.additionalPhones.length

    if (visiblePhones < totalPhones) {
      // If we have hidden empty fields, just make one visible by adding a space
      const newPhones = [...formData.additionalPhones]
      for (let i = 0; i < newPhones.length; i++) {
        if (newPhones[i] === "") {
          newPhones[i] = " " // Add a space to make it visible
          break
        }
      }
      setFormData((prev) => ({
        ...prev,
        additionalPhones: newPhones,
      }))
    } else if (totalPhones < 1) {
      // If we have less than 1 total field, add a new one
      setFormData((prev) => ({
        ...prev,
        additionalPhones: [...prev.additionalPhones, " "],
      }))
    }
  }

  const handleRemovePhone = (index) => {
    setFormData((prev) => {
      const newPhones = prev.additionalPhones.filter((_, i) => i !== index)
      return { ...prev, additionalPhones: newPhones }
    })
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("additionalEmail")) {
      const index = Number.parseInt(name.split("_")[1], 10)
      setFormData((prev) => {
        const newEmails = [...prev.additionalEmails]
        newEmails[index] = value
        return { ...prev, additionalEmails: newEmails }
      })
    } else if (name.startsWith("additionalPhone")) {
      const index = Number.parseInt(name.split("_")[1], 10)
      setFormData((prev) => {
        const newPhones = [...prev.additionalPhones]
        newPhones[index] = value
        return { ...prev, additionalPhones: newPhones }
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }
  const handleBlur = () => {
    checkForDuplicates()
  }

  // Modify handleSubmit
  const handleSubmit = async (e) => {
  e.preventDefault()
    setPendingSubmit(true)
    setModalType('submit')
    setShowConfirmationModal(true)
  }

  const confirmSubmit = async () => {
    setShowConfirmationModal(false)
    const payload = {
      applicant: JSON.stringify({
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        birth_date: formData.birthdate,
        gender: formData.gender,
        email_1: formData.email,
        mobile_number_1: formData.phone,
        cv_link: formData.cvLink,
        discovered_at: formData.source,
        referrer_id: formData.referrer,
        created_by: user.user_id,
        updated_by: user.user_id,
        company_id: "company_id",
        position_id: formData.position,
        test_result: formData.testResult,
        date_applied: formData.dateApplied,
        email_2: formData.additionalEmails[0] || null,
        email_3: formData.additionalEmails[1] || null,
        mobile_number_2: formData.additionalPhones[0] || null,
        ...(initialData && { applicant_id: initialData.applicant_id }),
      }),
    }

    console.log("Payload:", payload)

    try {
      let response
      if (isEditing) {
        response = await api.put(`${API_BASE_URL}/applicant/edit`, payload)
      } else {
        response = await api.post(`${API_BASE_URL}/applicants/add`, payload)
      }
      if (isEditing && onEditSuccess) {
        onEditSuccess()
      }
      onClose()
    } catch (error) {
      console.error("Error submitting applicant:", error)
    }
  }

  const handleCancel = () => {
    setModalType('cancel')
    setShowConfirmationModal(true)
  }

  const confirmCancel = () => {
    setShowConfirmationModal(false)
    onClose()
  }

  const closeModal = () => {
    setShowConfirmationModal(false)
    setPendingSubmit(false)
  }

  return (
    <>
      <div className="bg-white">
        <div className="min-h-screen p-8">
          <div className="flex justify-between items-center mb-6 p-4">
            <h1 className="display text-gray-dark">
              {isEditing ? "Edit Applicant" : "Add New Applicant"}
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-5 ">

                {/* name */}
                <div className="space-y-4 body-regular">
                  <h3 className="body-bold text-gray-dark flex items-center gap-2 mb-2">
                    Applicant Name
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">

                    <div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full p-2 border border-gray-light rounded-md focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="middleName"
                        placeholder="Middle Name"
                        value={formData.middleName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full p-2 border border-gray-light rounded-md focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full p-2 border border-gray-light rounded-md focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* bday and sex */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="mb-2 text-gray-dark body-bold">Birthdate</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full p-2 border border-gray-light rounded-md focus:outline-none body-regular"
                      />
                      {/* <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-dark" /> */}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="mb-2 text-gray-dark body-bold">Sex</label>
                    <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 p-3">
                      <label className="flex items-center space-x-2 cursor-pointer body-regular">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === "Male"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="accent-teal"
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer body-regular">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === "Female"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="accent-teal"
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>


                </div>

                {/* contact */}
                <div className="space-y-4">
                  <label className="body-bold text-gray-dark flex gap-2 mb-2">Contact Information</label>

                  {/* Two-column layout for contact form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <div className="relative flex-1">
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full p-2 border border-gray-light rounded-md focus:outline-none pl-10 body-regular"
                          />
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-dark" />
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={handleAddEmail}
                            className="p-2 border border-gray-light rounded-md bg-white hover:bg-gray-light transition-all cursor-pointer"
                          >
                            <FaPlus className="h-3 w-3 text-gray-dark" />
                          </button>
                        </div>
                      </div>

                      {formData.additionalEmails.map(
                        (email, index) =>
                          email !== "" && (
                            <div key={`email-${index}`} className="flex gap-2 items-start">
                              <div className="relative flex-1">
                                <input
                                  type="email"
                                  name={`additionalEmail_${index}`}
                                  placeholder={`Additional Email ${index + 1}`}
                                  value={email === " " ? "" : email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="w-full p-2 border border-gray-light rounded-md focus:outline-none pl-10 body-regular"
                                />
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-dark" />
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmail(index)}
                                  className="p-2 border border-gray-light rounded-md bg-white hover:bg-gray-light transition-all cursor-pointer"
                                >
                                  <FaMinus className="h-3 w-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          )
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            name="phone"
                            placeholder="09XXXXXXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full p-2 border border-gray-light rounded-md focus:outline-none pl-10 body-regular"
                          />
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-dark" />
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={handleAddPhone}
                            className="p-2 border border-gray-light rounded-md bg-white hover:bg-gray-light transition-all cursor-pointer"
                          >
                            <FaPlus className="h-3 w-3 text-gray-dark" />
                          </button>
                        </div>
                      </div>

                      {formData.additionalPhones.map(
                        (phone, index) =>
                          phone !== "" && (
                            <div key={`phone-${index}`} className="flex gap-2 items-start">
                              <div className="relative flex-1">
                                <input
                                  type="tel"
                                  name={`additionalPhone_${index}`}
                                  placeholder={`Additional Phone ${index + 1}`}
                                  value={phone === " " ? "" : phone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="w-full p-2 border border-gray-light rounded-md focus:outline-none pl-10 body-regular"
                                />
                                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-dark" />
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhone(index)}
                                  className="p-2 border border-gray-light rounded-md bg-white hover:bg-gray-light transition-all cursor-pointer"
                                >
                                  <FaMinus className="h-3 w-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                </div>

                {/* position and date applied */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="mb-2 text-gray-dark body-bold flex items-center gap-2">
                      Position Applied
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full p-2 border border-gray-light rounded-md focus:outline-none body-regular"
                    >
                      <option value="" disabled>Select Option</option>
                      {positions.map((position) => (
                        <option key={position.job_id} value={position.job_id}>
                          {position.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-2 text-gray-dark body-bold">Date Applied</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateApplied"
                        value={formData.dateApplied}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full p-2 border border-gray-light rounded-md body-regular focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* source and referrer */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 text-gray-dark body-bold flex items-center gap-2">
                      Source
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full p-2 border border-gray-light rounded-md focus:outline-none body-regular"
                    >
                      <option value="" disabled >Select Option</option>
                      <option value="Referral">Referral</option>
                      <option value="Website">Website</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Podcast">Podcast</option>
                      <option value="Career Fair (Startup Caravan, University Visit)">
                        Career Fair (Startup Caravan, University Visit)
                      </option>
                    </select>
                  </div>

                  {formData.source === "Referral" && (
                    <div>
                      <label className="mb-2 text-gray-dark body-bold flex items-center gap-2 ">Referrer</label>
                      <select
                        name="referrer"
                        value={formData.referrer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full p-2 border border-gray-light rounded-md focus:outline-none body-regular"
                      >
                        <option value="" disabled>Select Option</option>
                        {users.map((user) => (
                          <option key={user.user_id} value={user.user_id}>
                            {`${user.first_name} ${user.middle_name} ${user.last_name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* cv link */}
                <div>
                  <label className="mb-2 text-gray-dark body-bold flex items-center gap-2">
                    CV Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="cvLink"
                      placeholder="cv.link@drive.com"
                      value={formData.cvLink}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full p-2 border border-gray-light rounded-md focus:outline-none pl-10 body-regular"
                    />
                    <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-dark" />
                  </div>
                </div>

                {/* test result */}
                <div>
                  <label className="mb-2 text-gray-dark body-bold flex items-center gap-2">
                    Test Result
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="testResult"
                      placeholder="https://testresults.com"
                      value={formData.testResult}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full p-2 border body-regular border-gray-light rounded-md focus:outline-none pl-10"
                    />
                    <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-dark" />
                  </div>
                </div>

                {/* buttons */}
                <div className="flex body-regular justify-end gap-4">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-white text-teal border border-teal hover:bg-teal-soft cursor-pointer"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-3 py-2 rounded-md bg-teal text-white hover:bg-teal/75 cursor-pointer"
                  >
                    {isEditing ? "Update Applicant" : "Add Applicant"}
                  </button>
                </div>
              </form>
            </div>

            <div className="w-full lg:w-90 p-4 bg-white rounded-lg border border-gray-light">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-light">
                <h2 className="headline text-gray-dark flex items-center gap-2">
                  <FaExclamationTriangle className={duplicates.length > 0 ? "text-yellow-600" : "text-gray-dark"} />
                  Possible Duplicates ({duplicates.length})
                </h2>
              </div>
              {duplicates.length > 0 ? (
                <div className="space-y-4 max-h-200 overflow-auto">
                  {duplicates.slice(0, 3).map((duplicate, index) => (
                    <div
                      key={index}
                      className="border border-gray-light rounded-lg p-4 space-y-2 hover"
                    >
                      {duplicate.applicantFromDb && (
                        <>
                          <h3 className="body-bold text-gray-dark">
                            {duplicate.applicantFromDb.first_name} {duplicate.applicantFromDb.last_name}
                          </h3>
                          <div className="space-y-1 body-regular text-gray-600 ">
                            <p>Date Applied: {new Date(duplicate.applicantFromDb.date_created).toLocaleDateString()}</p>
                            <p>Email Address: {duplicate.applicantFromDb.email_1}</p>
                            {duplicate.applicantFromDb.email_2 && (
                              <p>Second Email Address: {duplicate.applicantFromDb.email_2}</p>
                            )}
                            {duplicate.applicantFromDb.email_3 && (
                              <p>Third Email Address: {duplicate.applicantFromDb.email_3}</p>
                            )}
                            <p>Mobile Number: {duplicate.applicantFromDb.mobile_number_1}</p>
                            {duplicate.applicantFromDb.mobile_number_2 && (
                              <p>Second Mobile Number: {duplicate.applicantFromDb.mobile_number_2}</p>
                            )}
                            <p>Gender: {duplicate.applicantFromDb.gender}</p>
                          </div>
                          <div className="space-y-1 pt-2">
                            {duplicate.similarity.map((similarity, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 body-regular text-yellow-600 bg-yellow-50 p-2 rounded-md"
                              >
                                <FaExclamationTriangle className="h-4 w-4" />
                                <span>Similarity in {similarity}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <FaUserAlt className="h-12 w-12 text-[#66b2b2] mb-4" />
                  <p>No duplicates found</p>
                </div>
              )}
            </div>
          </div>

          {showConfirmationModal && (
            <ConfirmationModal
              title={modalType === 'submit' ? "Confirm Submission" : "Cancel Form"}
              message={
                modalType === 'submit'
                  ? "Are you sure you want to submit this form?"
                  : "Are you sure you want to cancel? All unsaved changes will be lost."
              }
              confirmText={modalType === 'submit' ? "Submit" : "Yes, Cancel"}
              cancelText={modalType === 'submit' ? "Cancel" : "No, Continue Editing"}
              onConfirm={modalType === 'submit' ? confirmSubmit : confirmCancel}
              onCancel={closeModal}
            />
          )}

        </div>
        {showConfirmationModal && (
  <ConfirmationModal
  title={modalType === 'submit' ? "Confirm Submission" : "Cancel Form"}
  message={
    modalType === 'submit' 
      ? "Are you sure you want to submit this form?" 
      : "Are you sure you want to cancel? All unsaved changes will be lost."
  }
  confirmText={modalType === 'submit' ? "Submit" : "Confirm"}
  cancelText={modalType === 'submit' ? "Back" : "Back"}
  onConfirm={modalType === 'submit' ? confirmSubmit : confirmCancel}
  onCancel={closeModal}
/>
)}
      </div>
    </>
  )
}

export default AddApplicantForm

