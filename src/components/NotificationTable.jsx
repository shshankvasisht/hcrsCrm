import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import ReactPaginate from 'react-paginate';

const NotificationTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [allNotifications, setAllNotifications] = useState('');

    const getNotifications = async (filters) => {
        await axios
            .post(`${import.meta.env.VITE_API_BASE_PATH}get-notifications`, filters, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((response) => {
                if (response.data.status === 200) {
                    setAllNotifications(response.data);
                }else{
                    setAllNotifications("");
                }
            }).catch(error => {
                console.log(error);
            });
    };

    const effectRan = useRef(false);
    const columns = [
        {
            name: 'Updates',
            sortable: true,
            cell: (row) => {
                return (
                    <a href={row.notification_link} target="_blank" className="notification-link">
                        {row.notification}
                    </a>
                );
            },
        },
    ];

    // ** Function to handle Pagination and get data
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
        getNotifications({ page: page.selected + 1, limit: rowsPerPage });
    };

    // ** Function to handle per page
    const handlePerPage = (e) => {
        getNotifications({ page: currentPage, limit: e.target.value });
        setRowsPerPage(parseInt(e.target.value));
    };
    const CustomPagination = () => {
        let totalPageCount = parseInt(allNotifications?.total) / rowsPerPage;
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
            getNotifications({ page: 1, limit: rowsPerPage });
            effectRan.current = true;
        }
    }, []);

    useEffect(() => {
        console.log(allNotifications);
    }, [allNotifications]);
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Recent Updates</h4>
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
                    data={allNotifications?.data ? allNotifications.data : []}
                    highlightOnHover
                    responsive
                    pagination
                    paginationServer
                    paginationComponent={CustomPagination}
                />
            </Row>
        </div>
    );
};

export default NotificationTable;
