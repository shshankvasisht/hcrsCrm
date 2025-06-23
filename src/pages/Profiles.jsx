import { useContext, useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import CreateProfileModal from '../components/CreateProfileModal';
import { AdminDashboardContext } from '../context/AdminDashboardState';
import axios from 'axios';
import { Col, Row } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const Profiles = () => {
    const { getProfiles, profiles } = useContext(AdminDashboardContext);
    const [show, setShow] = useState(false);
    const [profileEdit, setProfileEdit] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleEdit = (row) => {
        setProfileEdit(row);
        setShow(true);
    };

    const deleteProfile = async (id) => {
        if (!window.confirm('Are you sure you want to delete')) {
            return false;
        }

        await axios
            .post(
                `${import.meta.env.VITE_API_BASE_PATH}delete-profile`,
                { profile_enc_id: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            .then((response) => {
                if (response.data.status === 200) {
                    getProfiles();
                }
            });
    };

    const effectRan = useRef(false);
    const columns = [
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Documents',
            cell: (row) => (
                <ul className="my-2">
                    {row.documents
                        ? row.documents.map((value, index) => {
                              return <li key={`doc-${index}`}>{value.name}</li>;
                          })
                        : ''}
                </ul>
            ),
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            cell: (row) => (
                <span
                    className={`badge ${
                        row.status === 'Active' ? 'bg-success' : 'bg-warning text-dark'
                    }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="d-flex gap-2">
                    <button className="icon-btn" size="sm" onClick={() => handleEdit(row)}>
                        <FaEdit />
                    </button>
                    <button
                        className="icon-btn"
                        size="sm"
                        onClick={() => deleteProfile(row.profile_enc_id)}
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];
    // ** Function to handle Pagination and get data
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
        getProfiles({ page: page.selected + 1, limit: rowsPerPage });
    };

    // ** Function to handle per page
    const handlePerPage = (e) => {
        getProfiles({ page: currentPage, limit: e.target.value });
        setRowsPerPage(parseInt(e.target.value));
    };
    const CustomPagination = () => {
        let totalPageCount = parseInt(profiles?.total) / rowsPerPage;
        if (!Number.isInteger(totalPageCount)) {
            totalPageCount = totalPageCount + 1;
            totalPageCount = parseInt(totalPageCount);
        }
        return (
            <ReactPaginate
                previousLabel={<MdArrowBackIos />}
                nextLabel={<MdArrowForwardIos />}
                breakLabel="..."
                pageCount={totalPageCount || 1}
                marginPagesDisplayed={2}
                pageRangeDisplayed={2}
                activeClassName="active"
                forcePage={currentPage !== 0 ? currentPage - 1 : 0}
                onPageChange={(page) => handlePagination(page)}
                pageClassName={'page-item'}
                nextLinkClassName={'page-link'}
                nextClassName={'page-item next'}
                previousClassName={'page-item prev'}
                previousLinkClassName={'page-link'}
                pageLinkClassName={'page-link'}
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName={
                    'pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
                }
            />
        );
    };

    useEffect(() => {
        if (!effectRan.current) {
            getProfiles({page: 1, limit: rowsPerPage});
            effectRan.current = true;
        }
    }, []);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Profiles</h4>
                <button className="btn-red" onClick={() => setShow(true)}>
                    Create Profile
                </button>
            </div>
            <Row className="mx-0 mt-1 mb-3">
                <Col sm="9">
                    <div className="d-flex align-items-center justify-content-start mb-3">
                        <label htmlFor="sort-select">Show</label>
                        <select
                            className="dataTable-select form-select loan_acc_select"
                            style={{
                                width: '65px',
                                padding: '2px 8px',
                                margin: '0px 10px',
                            }}
                            id="sort-select"
                            value={rowsPerPage}
                            onChange={(e) => handlePerPage(e)}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={75}>75</option>
                            <option value={100}>100</option>
                        </select>
                        <label htmlFor="sort-select">Results</label>
                    </div>
                </Col>
                <DataTable
                    columns={columns}
                    data={profiles?.data ? profiles.data : []}
                    highlightOnHover
                    responsive
                    pagination
                    paginationServer
                    paginationComponent={CustomPagination}
                />
            </Row>

            <CreateProfileModal
                show={show}
                handleClose={() => setShow(false)}
                profileEdit={profileEdit}
                setProfileEdit={setProfileEdit}
                callback={() => getProfiles()}
            />
        </div>
    );
};

export default Profiles;
