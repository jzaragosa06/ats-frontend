import React, { useState, useEffect } from 'react';
import { FaAddressCard, FaEnvelope, FaPen, FaPhone, FaUser } from 'react-icons/fa';
import useUserStore from '../../context/userStore';
import api from '../../api/axios';
import Loader from '../../assets/Loader';
import Toast from '../../assets/Toast';
import { FaCakeCandles, FaFileLines } from 'react-icons/fa6';

const statuses = [
  "Test Sent",
  "Interview Schedule Sent",
  "First Interview",
  "Second Interview",
  "Third Interview",
  "Fourth Interview",
  "Follow Up Interview",
  "Job Offer Accepted",
  "Withdrew Application",
  "Blacklisted",
  "Not Fit",
];

const statusMapping = {
  "NONE": "",
  "TEST_SENT": "Test Sent",
  "INTERVIEW_SCHEDULE_SENT": "Interview Schedule Sent",
  "FIRST_INTERVIEW": "First Interview",
  "SECOND_INTERVIEW": "Second Interview",
  "THIRD_INTERVIEW": "Third Interview",
  "FOURTH_INTERVIEW": "Fourth Interview",
  "FOLLOW_UP_INTERVIEW": "Follow Up Interview",
  "FOR_JOB_OFFER": "Job Offer Accepted",
  "JOB_OFFER_REJECTED": "Job Offer Rejected",
  "JOB_OFFER_ACCEPTED": "Job Offer Accepted",
  "WITHDREW_APPLICATION": "Withdrew Application",
  "BLACKLISTED": "Blacklisted",
  "NOT_FIT": "Not Fit",
};

function ApplicantDetails({ applicant, onTabChange, activeTab }) {
  const [applicantInfo, setApplicantInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [toasts, setToasts] = useState([]);
  const { user } = useUserStore();

  // Reset state when applicant changes
  useEffect(() => {
    setLoading(true);
    setApplicantInfo({});
    setStatus('');

    if (applicant && applicant.applicant_id) {
      console.log("Fetching applicant data for ID:", applicant.applicant_id);
      api.get(`/applicants/${applicant.applicant_id}`)
        .then(({ data }) => {
          if (data && data.length > 0) {
            console.log("Fetched applicant data:", data);
            setApplicantInfo(data[0]);
            setStatus(statusMapping[data[0].status] || '');
          } else {
            console.error("No applicant data returned");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching applicant data:", error);
          setLoading(false);
        });
    } else {
      // If no applicant is selected, exit loading state
      setLoading(false);
    }
  }, [applicant]); // Only depend on the applicant prop

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const previousStatus = status; // Store previous status
    const previousBackendStatus = applicantInfo.status; // Store previous backend status

    setStatus(newStatus);

    // Update the applicant status in the backend
    if (applicant && applicant.applicant_id) {
      const backendStatus = Object.keys(statusMapping).find(key => statusMapping[key] === newStatus);
      let data = {
        "progress_id": applicantInfo.progress_id,
        "status": backendStatus
      };
      try {
        await api.put(`/applicant/update/status`, data);
        setApplicantInfo(prevInfo => ({ ...prevInfo, status: backendStatus }));
        console.log("Status updated successfully");

        // Add toast message with previous status information
        setToasts([...toasts, {
          id: Date.now(),
          applicant: applicantInfo,
          status: newStatus,
          previousStatus: previousStatus,
          previousBackendStatus: previousBackendStatus
        }]);
      } catch (error) {
        console.error("Error updating status:", error);
        // Revert status on error
        setStatus(statusMapping[applicantInfo.status]);
      }
    }
  };

  const undoStatusUpdate = async (toast) => {
    // Use the previous status stored in the toast object
    const backendStatus = toast.previousBackendStatus;

    let data = {
      "progress_id": applicantInfo.progress_id,
      "status": backendStatus
    };

    try {
      await api.put(`/applicant/update/status`, data);
      setApplicantInfo(prevInfo => ({ ...prevInfo, status: backendStatus }));
      setStatus(toast.previousStatus);
      setToasts(toasts.filter(t => t.id !== toast.id));
      console.log("Status reverted successfully");
    } catch (error) {
      console.error("Error reverting status:", error);
    }
  };

  const removeToast = (id) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  if (loading) {
    return <Loader />;
  }

  // If no applicant is selected or data couldn't be fetched
  if (!applicant || !applicantInfo.first_name) {
    return (
      <div className="border rounded-lg mx-auto text-center">
        <p className="text-gray-500">Select an applicant to view details</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-light bg-white rounded-xl mx-auto flex flex-col lg:flex-row overflow-hidden body-regular">

      {/* Left side */}
      <div className='p-5 pl-8 w-full lg:w-[350px] text-gray-dark h-full'>
        <h2 className="display">
          {`${applicantInfo.first_name || ''} ${applicantInfo.middle_name || ''} ${applicantInfo.last_name || ''}`}
        </h2>
        <div className="pl-5 flex flex-col flex-grow">
          <div className="mt-2 flex items-center flex-shrink-0">
            <FaUser className="mr-2 h-4 w-4" />
            {applicantInfo.gender || 'Not specified'}
          </div>
          <div className="mt-1 flex items-center">
            <FaCakeCandles className="mr-2 h-4 w-4" />
            {applicantInfo.birth_date ? new Date(applicantInfo.birth_date).toLocaleDateString() : 'No birth date'}
          </div>
          {applicantInfo.email_1 ? <div className="mt-1 flex items-center">
            <FaEnvelope className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicantInfo.email_1}
          </div> : null}
          {applicantInfo.email_2 ? <div className="mt-1 flex items-center">
            <FaEnvelope className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicantInfo.email_2}
          </div> : null}
          {applicantInfo.email_3 ? <div className="mt-1 flex items-center">
            <FaEnvelope className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicantInfo.email_3}
          </div> : null}
          {applicantInfo.mobile_number_1 ? <div className="mt-1 flex items-center">
            <FaPhone className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicantInfo.mobile_number_1}
          </div> : null}
          {applicantInfo.mobile_number_2 ? <div className="mt-1 flex items-center">
            <FaPhone className="mr-2 h-4 w-4 flex-shrink-0" />
            {applicantInfo.mobile_number_2}
          </div> : null}
          <div className="mt-1 flex items-center">
            <FaFileLines className="mr-2 h-4 w-4" />
            <a
              href={applicantInfo.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline block mt-1 cursor-pointer"
            >
              Test Result
            </a>
          </div>
          <div className="mt-1 flex items-center">
            <FaAddressCard className="mr-2 h-4 w-4" />
            <a
              href={applicantInfo.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline block mt-1 cursor-pointer"
            >
              Applicant's Resume
            </a>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="py-5 px-7 flex-1 flex flex-col lg:border-l border-gray-light">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="headline">Applicant Details</h2>
            <div className="flex items-center">
              <select
                className="border body-regular border-gray-light h-8 rounded-md cursor-pointer"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="" disabled>Select status</option>
                {statuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
              <button
                onClick={() => console.log("Edit button clicked")}
                className="ml-2 p-2.5 rounded-full bg-teal hover:bg-teal/70 cursor-pointer "
              >
                <FaPen className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pl-5 flex-grow">
            <div className="text-teal">Discovered FutSuite at</div>
            <div className="col-span-2">{applicantInfo.discovered_at || 'Not specified'}</div>
            <div className="text-teal">Applied for</div>
            <div className="col-span-2">{applicantInfo.job_title || 'Not specified'}</div>
            <div className="text-teal">Applied on</div>
            <div className="col-span-2">
              {applicantInfo.applicant_created_at
                ? new Date(applicantInfo.applicant_created_at).toLocaleDateString()
                : 'Not specified'}
            </div>
            <div className="text-teal">Applied from</div>
            <div className="col-span-2">{applicantInfo.applied_source || 'Not specified'}</div>
          </div>

          {/* Tabs */}
          <div className="mt-auto pt-5 flex justify-end">
            <div className="flex gap-2 bg-teal-soft p-1 rounded-md">
              {user.feature_names["60c8341f-fa4b-11ef-a725-0af0d960a833"] === "Interview Notes" && (
                <button
                  className={`px-4 py-1 rounded-md ${activeTab === 'discussion'
                    ? 'bg-[#008080] text-white'
                    : 'text-teal hover:bg-teal-600/20 hover:text-teal-700 cursor-pointer'
                    }`}
                  onClick={() => onTabChange('discussion')}
                >
                  Discussion
                </button>
              )}
              {user.feature_names["60c834d5-fa4b-11ef-a725-0af0d960a833"] === "Send Email" && (
                <button
                  className={`px-4 py-1 rounded-md ${activeTab === 'sendMail'
                    ? 'bg-[#008080] text-white'
                    : 'text-teal hover:bg-teal-600/20 hover:text-teal-700 cursor-pointer'
                    }`}
                  onClick={() => onTabChange('sendMail')}
                >
                  Send Email
                </button>
              )}
            </div>
          </div>
        </div>

        {toasts.length > 0 && (
          <Toast toasts={toasts} onUndo={undoStatusUpdate} onDismiss={removeToast} />
        )}
      </div>




      {/* Toast Messages */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            undoStatusUpdate={undoStatusUpdate}
            removeToast={removeToast}
          />
        ))}
      </div>
    </div>
  );
}

export default ApplicantDetails;
