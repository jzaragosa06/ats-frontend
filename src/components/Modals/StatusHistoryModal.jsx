import { useEffect, useRef, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { formatStatusForDisplay } from "../../utils/formatStatus";
import { FaTimes } from "react-icons/fa";
import { PiWarningFill } from "react-icons/pi";
import { updateStatusHistory, deleteStatusHistory } from "../../services/statusService";
import DropDownOption from "../DropDownOption";
import ConfirmationModal from "./ConfirmationModal";
import useUserStore from "../../context/userStore";
import { formatEnumForDisplay } from "../../utils/formatEnum";

export default function StatusHistoryModal({
    show,
    toggle,
    statuses,
    statusHistory,
    skippedStatusesByHistory,
    hoverIndex,
    handleRowMouseEnter,
    handleRowMouseLeave,
    currentSkippedStatuses,
    skippedStatusPosition,
    refreshStatusHistory
}) {
    if (!show) return null;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [deleteRecord, setDeleteRecord] = useState(null);
    const scrollRef = useRef();
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useUserStore();

    // Function to handle the confirmation action
    const handleConfirmDelete = async () => {
        try {
            setIsSaving(true);
            await deleteStatusHistory(deleteRecord, user.user_id);
            await refreshStatusHistory();

            setIsSaving(false);

        } catch (err) {
            setIsSaving(false);
            alert("Failed to save changes. Please try again.");
            console.error("Failed to update status history", err);
        } finally {
            await refreshStatusHistory();
            setIsDeleteModalOpen(false);
            setDeleteRecord(null);
            toggle();
        }

    };

    const handleCancelDelete = () => {
        alert("Action Canceled!");
        setIsDeleteModalOpen(false);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [statusHistory]);

    const handleSaveEdit = async () => {
        try {
            setIsSaving(true);
            await updateStatusHistory(editRecord, user.user_id);
            await refreshStatusHistory();

            setIsSaving(false);


        } catch (err) {
            setIsSaving(false);
            alert("Failed to save changes. Please try again.");
            console.error("Failed to update status history", err);
        } finally {
            await refreshStatusHistory();
            setIsEditModalOpen(false);
            setEditRecord(null);
            toggle();
        }
    };



    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="status-history-modal bg-white p-6 rounded-lg shadow-lg min-w-[23vw] max-w-[90vw] max-h-[60vh] flex flex-col ">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-teal">Status History</h3>
                    <button
                        onClick={toggle}
                        className="p-1 rounded-full hover:bg-gray-200 cursor-pointer items-center flex justify-center"
                    >
                        <FaTimes className="text-gray-600" size={20} />
                    </button>
                </div>

                <div ref={scrollRef} className="relative overflow-y-auto p-2">
                    {statusHistory.map((record, index) => (
                        (!record.deleted) ?
                            <div
                                key={index}
                                className="mb-3 relative group"
                                onMouseEnter={(e) => handleRowMouseEnter(index, e)}
                                onMouseLeave={handleRowMouseLeave}
                            >
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-light  hover:bg-gray-100">
                                    <div className="text-sm text-gray-500 flex items-center justify-between">
                                        <div className="flex items-center body-tiny">
                                            {record.change_date === "N/A"
                                                ? "N/A"
                                                : record.changed_at
                                                    ? formatDate(record.changed_at)
                                                    : "N/A"}

                                            {skippedStatusesByHistory[index] && (
                                                <span className="ml-1  text-amber-500 flex items-center">
                                                    <PiWarningFill className="inline-block mr-1 size-4" />
                                                </span>
                                            )}
                                        </div>
                                        <DropDownOption onEdit={() => {
                                            setEditRecord(record);
                                            setIsEditModalOpen(true);
                                        }}
                                            onDelete={() => {
                                                setDeleteRecord(record);
                                                setIsDeleteModalOpen(true);
                                            }} />

                                    </div>
                                    <div className="flex text-sm">
                                        <span className="font-semibold text-gray-700">
                                            {formatStatusForDisplay(record.status)}
                                        </span>
                                        {/* <FaArrowRight className="mx-2 mt-1 items-center text-gray-400" />
                                    <span className="font-semibold text-gray-700 flex items-center">
                                        {formatStatusForDisplay(record.new_status)}
                                    </span> */}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                                        <div>Changed by: <span className=" text-gray-700">{record.user_name || record.changed_by}</span></div>
                                        <div className={`${record.edited ? "block" : "hidden"}`}>(edited)</div>
                                    </div>

                                </div>
                            </div>
                            : ""
                    ))}
                </div>
            </div>

            {
                hoverIndex !== null && currentSkippedStatuses.length > 0 && (
                    <div
                        className="fixed bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-60"
                        style={{
                            left: `${skippedStatusPosition.left}px`,
                            maxWidth: "300px"
                        }}
                    >
                        <div className="font-medium text-amber-600 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Skipped Statuses
                        </div>
                        <ul className="list-disc pl-5 text-gray-700">
                            {currentSkippedStatuses.map((status, i) => (
                                <li key={i} className="py-1">{formatStatusForDisplay(status)}</li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {isEditModalOpen && editRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg relative">
                        <h2 className="text-lg font-semibold mb-4">Edit Changed At</h2>

                        <div className="space-y-4">
                            <div className="">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="w-full mt-1 border rounded border-gray-light px-3 py-2 text-sm"
                                    value={editRecord.status}
                                    onChange={(e) =>
                                        setEditRecord({ ...editRecord, status: e.target.value })
                                    }
                                >
                                    <option value="" disabled>Select status</option>
                                    {statuses.map((statusOption) => (
                                        <option key={statusOption} value={statusOption}>
                                            {formatEnumForDisplay(statusOption)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Changed At</label>
                                <input
                                    type="datetime-local"
                                    className="w-full mt-1 border rounded border-gray-light cursor-pointer px-3 py-2 text-sm"
                                    value={editRecord.changed_at}
                                    onChange={(e) =>
                                        setEditRecord({ ...editRecord, changed_at: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSaving}
                                onClick={() => handleSaveEdit()}
                                className={`px-4 py-2 rounded text-sm ${isSaving ? 'bg-teal/70' : 'bg-teal'} text-white`}
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <ConfirmationModal
                    title="Delete Confirmation"
                    message="Are you sure you want to delete this history?"
                    confirmText="Yes, Confirm"
                    cancelText="No, Cancel"
                    isSaving={isSaving}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}


        </div >
    );
}
