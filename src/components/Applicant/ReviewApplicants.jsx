import { useEffect } from "react"
import { FaExclamationTriangle, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa"

function ReviewApplicants({ applicants, currentIndex, onNext, onPrevious, onAccept, onReject, onClose }) {
  const close = () => {
    onClose()
  }

  useEffect(() => {
    if (!applicants || applicants.length === 0) {
      onClose()
    }
  }, [applicants, onClose])

  if (!applicants || applicants.length === 0) {
    return null
  }

  const { applicant, possibleDuplicates } = applicants[currentIndex]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-lg overflow-auto max-h-[90vh] relative">
        <button
          type="button"
          className="absolute top-4 right-4 text-[#66b2b2] hover:text-[#008080] transition-colors"
          onClick={close}
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-[#008080] border-b border-[#d9ebeb] pb-3">
          Review Applicant ({currentIndex + 1} of {applicants.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Applicant Details */}
          <div className="bg-[#d9ebeb]/30 rounded-lg p-5 border border-[#d9ebeb] overflow-auto shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-[#008080]">
              {applicant.first_name} {applicant.last_name}
            </h3>

            <div className="space-y-4">
              <div className="bg-white p-3 rounded-md">
                <p className="font-medium text-[#008080]">Birth Date:</p>
                <p className="text-gray-700">{applicant.birth_date || "Not specified"}</p>
              </div>

              <div className="bg-white p-3 rounded-md">
                <p className="font-medium text-[#008080]">Date Applied:</p>
                <p className="text-gray-700">{applicant.discovered_at || "Not specified"}</p>
              </div>

              <div className="bg-white p-3 rounded-md">
                <p className="font-medium text-[#008080]">Position Applied:</p>
                <p className="text-gray-700">{applicant.position_name || "Software Engineer"}</p>
              </div>

              <div className="bg-white p-3 rounded-md">
                <p className="font-medium text-[#008080]">Application Status:</p>
                <p className="text-gray-700">{applicant.status || "Business Operations Associate"}</p>
              </div>

              <div className="bg-white p-3 rounded-md">
                <p className="font-medium text-[#008080]">Email Address:</p>
                <p className="text-gray-700">{applicant.email || applicant.email_1 || "Not specified"}</p>
              </div>

              <div className="bg-white p-3 rounded-md">
                <p className="font-medium text-[#008080]">Phone Number:</p>
                <p className="text-gray-700">{applicant.contactNo || applicant.mobile_number_1 || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Possible Duplicates */}
          <div className="bg-[#d9ebeb]/30 rounded-lg p-5 border border-[#d9ebeb] overflow-auto max-h-[50vh] shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-[#008080]">Possible Duplicates</h3>
            {possibleDuplicates && possibleDuplicates.length > 0 ? (
              <div className="space-y-4">
                {possibleDuplicates.map((duplicate, index) => (
                  <div
                    key={index}
                    className="border border-[#66b2b2] p-4 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-bold text-[#008080] border-b border-[#d9ebeb] pb-2 mb-2">
                      Possible Duplicate {index + 1}
                    </h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium text-[#008080]">Name:</span> {duplicate.applicantFromDb.first_name}{" "}
                        {duplicate.applicantFromDb.last_name}
                      </p>
                      <p>
                        <span className="font-medium text-[#008080]">Email:</span> {duplicate.applicantFromDb.email_1}
                      </p>
                      <p>
                        <span className="font-medium text-[#008080]">Phone:</span>{" "}
                        {duplicate.applicantFromDb.mobile_number_1}
                      </p>
                      <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-md mt-2">
                        <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Similarities:</span> {duplicate.similarity.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-4 rounded-md text-center">
                <p className="text-gray-500">No possible duplicates found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation and Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-[#d9ebeb]">
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <button
              type="button"
              className="p-2 rounded-full text-[#008080] hover:bg-[#d9ebeb] disabled:text-gray-300 disabled:hover:bg-transparent"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous applicant"
            >
              <FaChevronLeft size={18} />
            </button>
            <span className="text-[#008080] font-medium">
              {currentIndex + 1} of {applicants.length}
            </span>
            <button
              type="button"
              className="p-2 rounded-full text-[#008080] hover:bg-[#d9ebeb] disabled:text-gray-300 disabled:hover:bg-transparent"
              onClick={onNext}
              disabled={currentIndex === applicants.length - 1}
              aria-label="Next applicant"
            >
              <FaChevronRight size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-2 rounded-md border border-[#008080] text-[#008080] hover:bg-[#d9ebeb] font-medium min-w-[120px] transition-colors"
              onClick={() => onReject(currentIndex)}
            >
              Reject
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-md bg-[#008080] text-white hover:bg-[#006666] font-medium min-w-[120px] transition-colors"
              onClick={() => onAccept(currentIndex)}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewApplicants