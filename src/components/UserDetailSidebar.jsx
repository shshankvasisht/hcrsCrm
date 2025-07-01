import { AiFillCloseCircle } from 'react-icons/ai';
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { FaCheck, FaPlus } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { FaTrash } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import RejectionReasonModal from './RejectionReasonModal';

const UserDetailSidebar = ({ showSidebar, setShowSidebar, pageType = null }) => {
    const [userDetails, setUserDetails] = useState('');
    const [uploadedDocuments, setUploadedDocuments] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState('');
    const params = useParams();
    const hideSideBar = () => {
        setShowSidebar(false);
    };

    const getUserDetails = async (id) => {
        await axios
            .post(
                `${import.meta.env.VITE_API_BASE_PATH}get-user-details`,
                { user_enc_id: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            .then((response) => {
                if (response.data.status === 200) {
                    setUserDetails(response.data.user[0]);
                } else {
                    setUserDetails('');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getUploadedDocuments = async (id) => {
        await axios
            .post(
                `${import.meta.env.VITE_API_BASE_PATH}get-user-uploaded-documents`,
                { user_enc_id: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            .then((response) => {
                if (response.data.status === 200) {
                    setUploadedDocuments(response.data.documents);
                } else {
                    setUploadedDocuments('');
                }
            })
            .catch((error) => {
                toast.error('Some error occued');
                console.log(error);
            });
    };

    const uploadDocument = (e, assigned_document_enc_id, filename) => {
        const file = e.target.files[0];
        if (!file) return;

        const randomString = Math.random().toString(36).substring(2, 8);
        const sanitizedName = filename.replace(/\s+/g, '_').toLowerCase();
        const docName = `${userDetails.username}_${sanitizedName}_${randomString}.pdf`;

        // Supported file types
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const pdfType = 'application/pdf';
        const wordTypes = [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        const isImage = imageTypes.includes(file.type);
        const isPdf = file.type === pdfType;
        const isWord = wordTypes.includes(file.type);

        // Validate file type
        if (!isImage && !isPdf && !isWord) {
            toast.error('Unsupported file type. Please upload an image, PDF, or Word document.');
            return;
        }

        const formData = new FormData();
        if (isImage) {
            // Handle image files (convert to PDF with compression)
            const reader = new FileReader();

            reader.onload = async (event) => {
                const imgData = event.target.result;
                const img = new Image();
                img.src = imgData;

                img.onload = async () => {
                    // Compress using canvas
                    const canvas = document.createElement('canvas');
                    const maxWidth = 800;
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const compressedImage = canvas.toDataURL('image/jpeg', 0.7); // 70% quality

                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                    });

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const margin = 10;
                    const contentWidth = pdfWidth - 2 * margin;
                    const contentHeight = canvas.height * (contentWidth / canvas.width);

                    pdf.addImage(
                        compressedImage,
                        'JPEG',
                        margin,
                        margin,
                        contentWidth,
                        contentHeight
                    );
                    const pdfBlob = pdf.output('blob');

                    formData.append('file', pdfBlob, `${docName}.pdf`);
                    formData.append('assigned_document_enc_id', assigned_document_enc_id);

                    await uploadFile(formData);
                };
            };

            reader.readAsDataURL(file);
        } else if (isPdf || isWord) {
            // Handle PDF and Word files (upload directly)
            const fileExtension = isPdf ? '.pdf' : '.docx';
            formData.append('file', file, `${docName}${fileExtension}`);
            formData.append('assigned_document_enc_id', assigned_document_enc_id);

            uploadFile(formData);
        }

        async function uploadFile(formData) {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_PATH}upload-user-document`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.data.status === 200) {
                    toast.success('Document uploaded successfully');
                    getUserDetails(showSidebar ? showSidebar : params.id);
                    getUploadedDocuments(showSidebar ? showSidebar : params.id);
                } else {
                    toast.error('Some error occurred');
                }
            } catch (err) {
                console.error('Upload error:', err);
                toast.error('Upload failed');
            }
        }
    };

    const handleStatus = async (status, assigned_document_enc_id, reason = null) => {
        let data = {
            assigned_document_enc_id: assigned_document_enc_id,
            status: status,
            reason: reason,
        };
        await axios
            .post(`${import.meta.env.VITE_API_BASE_PATH}update-document-status`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((response) => {
                if (response.data.status === 200) {
                    toast.success('Document status updates');
                    getUserDetails(showSidebar ? showSidebar : params.id);
                    getUploadedDocuments(showSidebar ? showSidebar : params.id);
                } else {
                    toast.error('Some error occured');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const removeDocument = async (assigned_document_enc_id) => {
        await axios
            .post(
                `${import.meta.env.VITE_API_BASE_PATH}remove-user-document`,
                { assigned_document_enc_id: assigned_document_enc_id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            .then((response) => {
                if (response.data.status === 200) {
                    toast.success('Document status updates');
                    getUserDetails(showSidebar ? showSidebar : params.id);
                    getUploadedDocuments(showSidebar ? showSidebar : params.id);
                } else {
                    toast.error('Some error occured');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        if (showSidebar || params.id) {
            getUserDetails(showSidebar ? showSidebar : params.id);
            getUploadedDocuments(showSidebar ? showSidebar : params.id);
        }
    }, [showSidebar, params]);

    return (
        <div>
            {pageType ? (
                <div className={`backdrop-blur ${showSidebar ? 'backdrop-blur-block' : ''}`}></div>
            ) : (
                ''
            )}
            <div
                className={`${
                    pageType
                        ? `expend-detail ${showSidebar === false ? 'expend-detail-close' : ''}`
                        : ''
                }`}
            >
                {pageType ? (
                    <div className="closeIcon">
                        <AiFillCloseCircle size={20} onClick={() => hideSideBar()} />
                    </div>
                ) : (
                    ''
                )}
                <PerfectScrollbar>
                    <div className="expend-data expand-data-details">
                        <div className="row mb-4">
                            <h5 className="mb-3">Basic Deatils</h5>
                            <div className="col-md-4 mb-2">
                                <p className="d-flex flex-wrap align-items-center ht-40 text-capitalize">
                                    <span className="me-1">Name:</span>
                                    <span className="mb-0 ms-1 text-black fw-bold">
                                        {/* <span className="me-1 color-black"></span> */}
                                        {userDetails?.name || '-'}
                                    </span>
                                </p>
                            </div>
                            <div className="col-md-4 mb-2">
                                <p className="d-flex flex-wrap align-items-center ht-40 text-capitalize">
                                    <span className="me-1">Phone:</span>
                                    <span className="mb-0 ms-1 text-black fw-bold">
                                        {/* <span className="me-1 color-black"></span> */}
                                        {userDetails?.phone || '-'}
                                    </span>
                                </p>
                            </div>
                            <div className="col-md-4 mb-2">
                                <p className="d-flex flex-wrap align-items-center ht-40 text-capitalize">
                                    <span className="me-1">Profile:</span>
                                    <span className="mb-0 ms-1 text-black fw-bold">
                                        {/* <span className="me-1 color-black"></span> */}
                                        {userDetails?.profile_name || '-'}
                                    </span>
                                </p>
                            </div>
                            <div className="col-md-4 mb-2">
                                <p className="d-flex flex-wrap align-items-center ht-40">
                                    <span className="me-1">Email:</span>
                                    <span className="mb-0 ms-1 text-black fw-bold">
                                        {/* <span className="me-1 color-black"></span> */}
                                        {userDetails?.email || '-'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <h5 className="mb-3">Documents</h5>
                            {userDetails.documents && userDetails.documents.length
                                ? userDetails.documents.map((value, index) => {
                                      return (
                                          <div className="col-md-4" key={`doc-${index}`}>
                                              <div className="status-card">
                                                  <span
                                                      className={`status-badge  ${
                                                          value.is_uploaded === '0'
                                                              ? 'bg-warning'
                                                              : value.is_uploaded === '1'
                                                              ? 'bg-info'
                                                              : value.is_uploaded === '2'
                                                              ? 'bg-success'
                                                              : 'bg-danger'
                                                      }`}
                                                  >
                                                      {value.is_uploaded === '0'
                                                          ? 'Pending'
                                                          : value.is_uploaded === '1'
                                                          ? 'Uploaded'
                                                          : value.is_uploaded === '2'
                                                          ? 'Approved'
                                                          : 'Rejected'}
                                                  </span>

                                                  <div className="content">
                                                      <div className="label">{value.document_name}</div>
                                                      <label
                                                          className="add-btn"
                                                          htmlFor={`doc-${index}`}
                                                      >
                                                          <FaPlus color="#fff" fontSize={'16'} />
                                                      </label>
                                                      <input
                                                          id={`doc-${index}`}
                                                          type="file"
                                                          min={1}
                                                          accept=".png, .jpg, .jpeg, .pdf, .xls, .xlsx, .doc, .docx"
                                                          placeholder="Choose File"
                                                          className="form-control d-none"
                                                          onChange={(e) =>
                                                              uploadDocument(
                                                                  e,
                                                                  value.assigned_document_enc_id,
                                                                  value.document_name
                                                              )
                                                          }
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })
                                : ''}
                        </div>

                        <div className="row mb-5">
                            <h5 className="mb-3">Uploaded Documents</h5>
                            {uploadedDocuments && uploadedDocuments.length
                                ? uploadedDocuments.map((value, index) => {
                                      return (
                                          <div className="col-md-3" key={`user_doc_${index}`}>
                                              <a
                                                  href={value.document_location}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="documentView"
                                              >
                                                  <span
                                                      className={`status-badge  ${
                                                          value.is_uploaded === '2'
                                                              ? 'bg-success'
                                                              : value.is_uploaded === '3'
                                                              ? 'bg-danger'
                                                              : ''
                                                      }`}
                                                  >
                                                      {value.is_uploaded === '2'
                                                          ? 'Approved'
                                                          : value.is_uploaded === '3'
                                                          ? 'Rejected'
                                                          : ''}
                                                  </span>
                                                  <img src="/images/pdf.svg" />
                                                  <p>{value.document_name}</p>
                                              </a>
                                              <div className="d-flex gap-2 justify-content-center">
                                                  {value.is_uploaded === '1' ? (
                                                      <>
                                                          <button
                                                              className="icon-btn"
                                                              size="sm"
                                                              onClick={() =>
                                                                  handleStatus(
                                                                      '2',
                                                                      value.assigned_document_enc_id
                                                                  )
                                                              }
                                                          >
                                                              <FaCheck />
                                                          </button>
                                                          <button
                                                              className="icon-btn"
                                                              size="sm"
                                                              onClick={() => {
                                                                  setShowRejectionModal(
                                                                      value.assigned_document_enc_id
                                                                  );
                                                                handleStatus(
                                                                      '3',
                                                                      value.assigned_document_enc_id
                                                                  );
                                                              }}
                                                          >
                                                              <MdClose />
                                                          </button>
                                                      </>
                                                  ) : value.is_uploaded === '3' ? (
                                                      <button
                                                          className="icon-btn"
                                                          size="sm"
                                                          onClick={() =>
                                                              removeDocument(
                                                                  value.assigned_document_enc_id
                                                              )
                                                          }
                                                      >
                                                          <FaTrash />
                                                      </button>
                                                  ) : (
                                                      ''
                                                  )}
                                              </div>
                                          </div>
                                      );
                                  })
                                : ''}
                        </div>
                    </div>
                </PerfectScrollbar>
            </div>
            <RejectionReasonModal show={showRejectionModal} hide={() => setShowRejectionModal(false)} />
        </div>
    );
};

export default UserDetailSidebar;
