import React, { useContext, useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Container, Row, Col } from 'react-bootstrap';
import CreateUserModal from '../components/CreateUserModal';
import { AdminDashboardContext } from '../context/AdminDashboardState';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserDetailSidebar from '../components/UserDetailSidebar';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import ReactPaginate from 'react-paginate';

const Users = () => {
    const { getUsers, allUsers } = useContext(AdminDashboardContext);
    const [showModal, setShowModal] = useState(false);
    const [updateUser, setUpdateUser] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const effectRan = useRef(false);

    const openSidebar = (id) => {
        setShowSidebar(id);
    };
    // Table columns definition
    const columns = [
        {
            name: 'Username',
            selector: (row) => row.username,
            sortable: true,
            cell: (row) => (
                <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        openSidebar(row.user_id);
                    }}
                >
                    {row.username}
                </span>
            ),
        },
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row) => row.email,
            sortable: true,
        },
        {
            name: 'Phone',
            selector: (row) => row.phone,
            sortable: true,
        },
        {
            name: 'Profile',
            selector: (row) => row.profile_name,
            sortable: true,
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
                        onClick={() => handleDelete(row.user_id)}
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    const handleEdit = (row) => {
        setUpdateUser(row);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete')) {
            return false;
        }
        await axios
            .post(
                `${import.meta.env.VITE_API_BASE_PATH}delete-user`,
                { user_enc_id: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            .then((response) => {
                if (response.data.status === 200) {
                    toast.success('User Deleted Successfully');
                    getUsers({ page: currentPage, limit: rowsPerPage });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    // ** Function to handle Pagination and get data
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
        getUsers({ page: page.selected + 1, limit: rowsPerPage });
    };

    // ** Function to handle per page
    const handlePerPage = (e) => {
        getUsers({ page: currentPage, limit: e.target.value });
        setRowsPerPage(parseInt(e.target.value));
    };
    const CustomPagination = () => {
        let totalPageCount = parseInt(allUsers?.total) / rowsPerPage;
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
            getUsers({ page: 1, limit: rowsPerPage });
            effectRan.current = true;
        }
    }, []);

    return (
        <div>
            <Container className="py-4">
                <Row className="mb-3 align-items-center">
                    <Col>
                        <h4 className="fw-bold">User Management</h4>
                    </Col>
                    <Col className="text-end">
                        <button className="btn-red" onClick={() => setShowModal(true)}>
                            Create User
                        </button>
                    </Col>
                </Row>
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
                        data={allUsers?.data ? allUsers.data : ''}
                        responsive
                        highlightOnHover
                        striped
                        pagination
                        paginationServer
                        paginationComponent={CustomPagination}
                        customStyles={{
                            headCells: {
                                style: {
                                    fontWeight: '600',
                                    backgroundColor: '#f8f9fa',
                                },
                            },
                        }}
                    />
                </Row>
            </Container>

            <CreateUserModal
                show={showModal}
                updateUser={updateUser}
                setUpdateUser={setUpdateUser}
                handleClose={() => setShowModal(false)}
                callback={() => getUsers({ page: currentPage, limit: rowsPerPage })}
            />
            <UserDetailSidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} pageType="sidebar"/>
        </div>
    );
};

export default Users;
