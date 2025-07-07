import { useContext, useEffect, useState } from 'react';
import { UserDashboardContext } from '../context/UserDashboardState';
import axios from 'axios';
import { FaCheck, FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

const UserDetail = () => {
    const { user } = useContext(UserDashboardContext);
    const [userDetails, setUserDetails] = useState('');
    const [uploadedDocuments, setUploadedDocuments] = useState('');
    const [rejectedDocuments, setRejectedDocuments] = useState('');

    const getUserDetail = async (id) => {
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
                }
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
                    setRejectedDocuments(response.data.rejected_documents);
                } else {
                    setUploadedDocuments('');
                    setRejectedDocuments('');
                }
            })
            .catch((error) => {
                toast.error('Some error occued');
                console.log(error);
            });
    };

    const uploadRejectedDocument = (e, uploaded_document_enc_id, filename) => {
        const file = e.target.files[0];
        if (!file) return;

        const randomString = Math.random().toString(36).substring(2, 8);
        const sanitizedName = filename.replace(/\s+/g, '_').toLowerCase();
        const docName = `${user.username}_${sanitizedName}_${randomString}.pdf`;

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

                pdf.addImage(compressedImage, 'JPEG', margin, margin, contentWidth, contentHeight);
                const pdfBlob = pdf.output('blob');

                const formData = new FormData();
                formData.append('file', pdfBlob, docName);
                formData.append('uploaded_document_enc_id', uploaded_document_enc_id);
                formData.append('document_name', filename);
                formData.append('user_enc_id', user.id);

                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_PATH}upload-rejected-document`,
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
                        getUserDetail(user.id);
                        getUploadedDocuments(user.id);
                    } else {
                        toast.error('Some error occurred');
                    }
                } catch (err) {
                    console.error('Upload error:', err);
                    toast.error('Upload failed');
                }
            };
        };

        reader.readAsDataURL(file);
    };

    const uploadDocument = (e, assigned_document_enc_id, filename) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();

        let completed = 0; // count how many files were processed
        const total = files.length;

        files.forEach((file) => {
            const randomString = Math.random().toString(36).substring(2, 8);
            const sanitizedName = filename.replace(/\s+/g, '_').toLowerCase();
            const docName = `${user.username}_${sanitizedName}_${randomString}.pdf`;

            const reader = new FileReader();

            reader.onload = (event) => {
                const imgData = event.target.result;
                const img = new Image();
                img.src = imgData;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 800;
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const compressedImage = canvas.toDataURL('image/jpeg', 0.7);

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

                    // Append file to the FormData
                    formData.append('files[]', pdfBlob, docName); // use [] if your backend expects array

                    completed++;

                    // After all files are processed
                    if (completed === total) {
                        // Append other metadata once
                        formData.append('assigned_document_enc_id', assigned_document_enc_id);
                        formData.append('document_name', filename);
                        formData.append('user_enc_id', user.id);

                        // Send all files together
                        axios
                            .post(
                                `${import.meta.env.VITE_API_BASE_PATH}upload-user-document`,
                                formData,
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                                        'Content-Type': 'multipart/form-data',
                                    },
                                }
                            )
                            .then((response) => {
                                if (response.data.status === 200) {
                                    toast.success('Documents uploaded successfully');
                                    getUserDetail(user.id);
                                    getUploadedDocuments(user.id);
                                } else {
                                    toast.error('Upload failed');
                                }
                            })
                            .catch((err) => {
                                console.error('Upload error:', err);
                                toast.error('Error uploading documents');
                            });
                    }
                };
            };

            reader.readAsDataURL(file);
        });
    };

    useEffect(() => {
        if (user && user.id) {
            getUserDetail(user.id);
            getUploadedDocuments(user.id);
        }
    }, [user]);

    return (
        <div className="container">
            <div className="row mb-3 mt-5">
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
                                                  : 'bg-success'
                                          }`}
                                      >
                                          {value.is_uploaded === '0' ? 'Pending' : 'Uploaded'}
                                      </span>

                                      <div className="content">
                                          <div className="label">{value.document_name}</div>
                                          <label className="add-btn" htmlFor={`doc-${index}`}>
                                              {value.is_uploaded != '1' ? (
                                                  <FaPlus color="#fff" fontSize={'16'} />
                                              ) : (
                                                  <FaCheck color="#fff" fontSize={'16'} />
                                              )}
                                          </label>
                                          {value.is_uploaded != '1' ? (
                                              <input
                                                  id={`doc-${index}`}
                                                  type="file"
                                                  multiple
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
                                          ) : (
                                              ''
                                          )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                    : ''}
            </div>
            {rejectedDocuments && rejectedDocuments.length ? (
                <div className="row mb-5">
                    <h5 className="mb-3">Rejected Documents</h5>
                    {rejectedDocuments.map((value, index) => {
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
                                        <label className="add-btn" htmlFor={`doc-${index}`}>
                                            {value.is_uploaded != '1' ? (
                                                <FaPlus color="#fff" fontSize={'16'} />
                                            ) : (
                                                <FaCheck color="#fff" fontSize={'16'} />
                                            )}
                                        </label>
                                        {value.is_uploaded != '1' ? (
                                            <input
                                                id={`doc-${index}`}
                                                type="file"
                                                multiple
                                                accept=".png, .jpg, .jpeg, .pdf, .xls, .xlsx, .doc, .docx"
                                                placeholder="Choose File"
                                                className="form-control d-none"
                                                onChange={(e) =>
                                                    uploadRejectedDocument(
                                                        e,
                                                        value.uploaded_document_enc_id,
                                                        value.document_name
                                                    )
                                                }
                                            />
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </div>

                                <div className="">
                                    <p>
                                        <b>Reason:</b> {value.rejection_reason}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                ''
            )}
            
            <div className="row pb-5">
                <h5 className="mb-3">Uploaded Documents</h5>
                {uploadedDocuments && uploadedDocuments.length
                    ? uploadedDocuments.map((value, index) => {
                          return (
                              <div className="col-md-3" key={`borrower_credit${index}`}>
                                  <a
                                      href={value.document_location}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="documentView"
                                  >
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

                                      <img src="/images/pdf.svg" />
                                      <p>{value.document_name}</p>
                                  </a>
                              </div>
                          );
                      })
                    : ''}
            </div>
        </div>
    );
};

export default UserDetail;
