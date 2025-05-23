import React, { useState, useRef, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import { IoMdClose } from "react-icons/io";
import { FiDownload } from "react-icons/fi";
import MessageBox from "./MessageBox";
import moment from "moment";
import api from "../services/api";
import useUserStore from "../context/userStore";
import { jsPDF } from "jspdf";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3CenterLeftIcon,
  Bars3BottomRightIcon,
} from "@heroicons/react/24/outline";
import convertToSlack from "../utils/convertToSlack";

const InterviewNotes = ({ interview, applicant, fetchDiscussionInterview }) => {
  const [noteBody, setNoteBody] = useState("");
  const { user } = useUserStore();
  const dropdownRef = useRef(null);
  const notesContainerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfDocument, setPdfDocument] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (notesContainerRef.current) {
      notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
    }
  }, [interview.interview_notes]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      BulletList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class: 'body-regular border border-gray-light rounded-lg min-h-20 max-h-[300px] p-5 mx-auto focus:outline-none overflow-y-auto',
      },
    },
    content: noteBody,
    onUpdate: ({ editor }) => {
      setNoteBody(editor.getHTML());
    },
  });

  useEffect(() => {
    if (showPreviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPreviewModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!showPreviewModal && pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }, [showPreviewModal]);

  const handleSubmit = () => {
    const slackFormattedMessage = convertToSlack(noteBody);
    const data = {
      applicant_id: applicant.applicant_id,
      interview_id: interview.interview_id,
      interviewer_id: user.user_id,
      note_type: "FIRST INTERVIEW",
      note_body: noteBody,
      noted_by: user.user_id,
      slack_message: slackFormattedMessage,
    };

    setIsAddingNote(true);
    api.post('/interview/note', data)
      .then((response) => {
        setNoteBody("");
        editor?.commands.clearContent();
        fetchDiscussionInterview();
      })
      .catch((error) => {
        console.log(error.message);
      })
      .finally(() => {
        setIsAddingNote(false);
      });
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[�]+/g, "")
      .replace(/\?\?\?\?þ/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const generatePDF = (interviews, applicantInfo, autoSave = true) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm"
      });

      const primaryFont = "helvetica";
      doc.setFont(primaryFont);

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      const lineHeight = 6;
      const paragraphSpacing = 5;

      const splitTextToSize = (text, maxWidth) => {
        const cleaned = cleanText(text);
        const words = cleaned.split(/\s+/);
        const lines = [];
        let currentLine = words[0] || "";

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const testWidth = doc.getTextWidth(testLine);

          if (testWidth < maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      // Header Section
      doc.setFontSize(22);
      doc.setFont(primaryFont, "bold");
      doc.setTextColor(0, 0, 0);

      const fullName = `${applicantInfo.first_name || ""} ${applicantInfo.middle_name ? applicantInfo.middle_name + " " : ""}${applicantInfo.last_name || ""}`.trim();
      doc.text(cleanText(fullName), margin, margin);

      doc.setFontSize(14);
      doc.setFont(primaryFont, "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Interview Feedback Report", margin, margin + 7);

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 11, pageWidth - margin, margin + 11);

      let currentY = margin + 16;

      // Filter valid interviews
      const validInterviews = interviews.filter(interview => {
        const validNotes = interview.interview_notes?.filter(note =>
          note?.note_id && 
          note?.note_type !== "DISCUSSION" && 
          note?.note_body
        ) || [];
        return validNotes.length > 0;
      });

      const addTextWithFormatting = (text, x, y, options = {}) => {
        const {
          bold = false,
          italic = false,
          underline = false,
          indent = 0,
          fontSize = 11
        } = options;

        doc.setFontSize(fontSize);
        
        if (bold && italic) {
          doc.setFont(primaryFont, 'bolditalic');
        } else if (bold) {
          doc.setFont(primaryFont, 'bold');
        } else if (italic) {
          doc.setFont(primaryFont, 'italic');
        } else {
          doc.setFont(primaryFont, 'normal');
        }

        const lines = splitTextToSize(text, contentWidth - indent);
        
        lines.forEach(line => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          
          doc.text(line, x + indent, y);
          
          if (underline) {
            const textWidth = doc.getTextWidth(line);
            doc.setDrawColor(0, 0, 0);
            doc.line(x + indent, y + 1.5, x + indent + textWidth, y + 1.5);
          }
          
          y += lineHeight;
        });

        doc.setFont(primaryFont, 'normal');
        return y;
      };

      // Process interviews
      validInterviews.forEach((interview, index) => {
        if (index > 0) {
          currentY += paragraphSpacing;
        }

        const validNotes = interview.interview_notes?.filter(note =>
          note?.note_id &&
          note?.note_type !== "DISCUSSION" &&
          note?.note_body &&
          cleanText(note.note_body)
        ) || [];

        if (validNotes.length === 0) return;

        const interviewerName = interview.interviewer_first_name
          ? `${interview.interviewer_first_name} ${interview.interviewer_last_name || ""}`.trim()
          : "Interviewer";

        // Add interview header
        if (currentY + 20 > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }

        currentY = addTextWithFormatting(
          `${cleanText(interviewerName)}'s Feedback`,
          margin,
          currentY,
          { bold: true, fontSize: 16 }
        );

        const interviewDate = interview.interview_date || interview.date_of_interview;
        if (interviewDate) {
          const formattedDate = moment(interviewDate).format("MMMM D, YYYY");
          doc.setFontSize(11);
          doc.setFont(primaryFont, "italic");
          doc.setTextColor(120, 120, 120);
          doc.text(formattedDate, pageWidth - margin, currentY - lineHeight, { align: "right" });
        }

        currentY += 2;

        // Process notes
        validNotes.forEach((note, noteIndex) => {
          if (currentY + 20 > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }

          // Add note title if exists
          if (note.note_title) {
            currentY = addTextWithFormatting(
              `• ${cleanText(note.note_title)}:`,
              margin,
              currentY,
              { bold: true, fontSize: 13 }
            );
          }

          // Process note content
          const htmlContent = note.note_body;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;

          // Extract text content
          const textContent = [];
          const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              textContent.push(cleanText(node.textContent));
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const tagName = node.tagName.toLowerCase();
              if (['ul', 'ol'].includes(tagName)) {
                textContent.push('\n');
                Array.from(node.children).forEach((li, i) => {
                  textContent.push(`• ${cleanText(li.textContent)}\n`);
                });
              } else if (tagName === 'li') {
                textContent.push(`• ${cleanText(node.textContent)}\n`);
              } else if (tagName === 'br') {
                textContent.push('\n');
              } else {
                textContent.push(cleanText(node.textContent));
              }
            }
          };

          Array.from(tempDiv.childNodes).forEach(processNode);
          const finalText = textContent.join(' ').replace(/\s+/g, ' ').trim();

          currentY = addTextWithFormatting(
            finalText,
            margin,
            currentY,
            { fontSize: 11 }
          );

          // Add spacing between notes
          if (noteIndex < validNotes.length - 1) {
            currentY += (paragraphSpacing / 2);
          }
        });
      });

      if (validInterviews.length === 0) {
        currentY = addTextWithFormatting(
          "No feedback records available",
          margin,
          currentY,
          { fontSize: 13 }
        );
      }

      const fileName = `${fullName.replace(/\s+/g, "_")}_Interview_Report_${moment().format("YYYYMMDD")}.pdf`;

      if (autoSave) {
        doc.save(fileName);
      }

      return { pdfDoc: doc, fileName };
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check console for details.");
      return { pdfDoc: null, fileName: "" };
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(`/interview/export/${applicant.applicant_id}/${applicant.tracking_id}`);
      const { formattedResults, applicant: applicantData } = response.data;

      if (!applicantData || !Array.isArray(applicantData) || applicantData.length === 0) {
        throw new Error("No valid applicant data returned from the server");
      }

      if (!formattedResults || !Array.isArray(formattedResults)) {
        throw new Error("No valid interview data returned from the server");
      }

      const { pdfDoc, fileName } = generatePDF(formattedResults, applicantData[0], false);
      setPdfDocument(pdfDoc);
      setPdfFileName(fileName);

      const blob = pdfDoc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error exporting interview:", error);
      alert(`Failed to export interview: ${error.message}`);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDocument) {
      pdfDocument.save(pdfFileName);
    }
  };

  return (
    <div className="border border-gray-light rounded-lg bg-white">
      {/* Box Label */}
      <div className="flex border-b border-gray-light text-gray-dark">
        <div className="flex-1 p-3 pl-5 border-r border-gray-light">
          <p className="display">Interview Notes And Feedback</p>
        </div>
        <div className="flex-1 py-3 px-5 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-gray-dark body-regular">Interviewer</p>
            <p className="text-gray-800 border border-gray-300 rounded-md px-2">{interview.interviewer_first_name}</p>
          </div>
          <div className="flex items-center">
            <p className="text-gray-dark body-regular">Date</p>
            <input type="date" className="border border-gray-light body-regular rounded-sm ml-2 p-1" value={moment(interview.date_of_interview).format("YYYY-MM-DD")} readOnly />
          </div>
        </div>
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button className="flex items-center rounded-md bg-white p-1 m-3 text-sm text-teal hover:bg-gray-light cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}>
            <SlOptionsVertical className="h-4 w-4 text-teal" />
          </button>
          {isOpen && (
            <div className="absolute right-2 z-10 mt-2 w-min origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden cursor-pointer">
              <button
                className="block text-center w-full body-regular px-2 py-2 text-gray-dark hover:bg-gray-100"
                onClick={() => alert('Edit Interview')}
              >
                Edit
              </button>
              <button
                className="block text-center w-full body-regular px-2 py-2 text-gray-dark hover:bg-gray-100"
                onClick={() => alert('Delete Interview')}
              >
                Delete
              </button>
              <button
                className="block text-center w-full body-regular px-2 py-2 text-gray-dark hover:bg-gray-100"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        {/* Messages */}
        <div
          ref={notesContainerRef}
          className="max-h-100 min-h-60 overflow-y-auto rounded-lg py-2 px-4">
          {interview.interview_notes.map((note) =>
          (<MessageBox
            key={note.note_id}
            sender={note.noted_by}
            date={moment(note.noted_at).format("LLL")}
            message={note.note_body} />)
          )}
        </div>

        {/* Message input */}
        <div className="items-center">
          <div className="border-t border-gray-200 rounded-b-lg p-2">
            <div className="mb-2 flex gap-3 rounded-lg" >
              <BoldIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive("bold") ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <ItalicIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive("italic") ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              />
              <UnderlineIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive("underline") ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              />
              <ListBulletIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive("bulletList") ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              />
              <Bars3BottomLeftIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive({ textAlign: "left" }) ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              />
              <Bars3CenterLeftIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive({ textAlign: "center" }) ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              />
              <Bars3BottomRightIcon
                className={`h-6 w-6 cursor-pointer ${editor?.isActive({ textAlign: "right" }) ? "text-teal-600" : "text-gray-600"}`}
                onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              />
            </div>
            <div className="relative">
              <EditorContent
                editor={editor}
                className="
                  [&_ul]:list-disc [&_ul]:pl-6
                  [&_ol]:list-decimal [&_ol]:pl-6
                  [&_em]:font-inherit
                  [&_strong]:font-avenir-black
                  [&_strong_em]:font-inherit
                  [&_em_strong]:font-inherit
                "
              />
              <div className="absolute bottom-0 right-0 ">
                <button
                  onClick={handleSubmit}
                  disabled={isAddingNote}
                  className="rounded-xl text-teal p-2 m-1 hover:text-teal-soft cursor-pointer flex items-center"
                >
                  {isAddingNote ? (
                    <div className="h-5 w-5 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IoMdSend className="size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          style={{ overflow: 'hidden' }}>
          <div className="bg-white rounded-lg shadow-xl w-4/5 h-5/6 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-light">
              <h2 className="text-xl font-semibold text-gray-800">PDF Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoMdClose className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              {pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-full border border-gray-light rounded"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">Loading preview...</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-light flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-dark flex items-center"
              >
                <FiDownload className="mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewNotes;