import { useContext, useEffect, useRef, useState, useTransition } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { AdminDashboardContext } from '../context/AdminDashboardState';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateProfileModal = ({ show, handleClose, profileEdit, setProfileEdit, callback }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm({
        defaultValues: {
            name: '',
            status: true,
            documents: [],
        },
    });
    const { getDocuments, documents } = useContext(AdminDashboardContext);
    const [isLoading, startTransition] = useTransition();
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const effectRan = useRef(false);

    const closeModal = () => {
        setProfileEdit("");
        setSelectedDocuments([]);
        reset();
        handleClose();
    }
    const onSubmit = (data) => {
        const finalData = {
            ...data,
            documents: selectedDocuments,
        };

        if(profileEdit){
            finalData.profile_enc_id = profileEdit.profile_enc_id;
        }

        startTransition(async () => {
            await axios
                .post(`${import.meta.env.VITE_API_BASE_PATH}${profileEdit ? "update-profile" : "create-profile"}`, finalData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === 200) {
                        toast.success(response.data.message);
                        reset();
                        callback();
                        setProfileEdit("");
                        setSelectedDocuments([]);
                        handleClose();
                    } else {
                        toast.error('Some error occured');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    };
    const status = watch('status');
    const selectedDocs = watch('documents', []);

    useEffect(() => {
        if(profileEdit){
            setValue('name', profileEdit.name)
            setValue('status', profileEdit.status === "Active" ? true : false)
            let sds = []
            if(profileEdit.documents && profileEdit.documents.length){
                profileEdit.documents.map(value => sds.push(value.document_enc_id));
            }

            setSelectedDocuments(sds)
        }
    }, [profileEdit]);

    useEffect(() => {
       setSelectedDocuments(selectedDocs);
    }, [selectedDocs]);

    useEffect(() => {
        if(!effectRan.current){
            getDocuments({type: 'profilePage'});
            effectRan.current = true;
        }
    }, []);
    return (
        <Modal show={show} onHide={closeModal} size="lg" centered>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title> {profileEdit ? "Update" : "Create" } Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            placeholder="Enter profile name"
                            {...register('name', { required: 'Name is required' })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Check
                            type="switch"
                            label={status ? 'Active' : 'Inactive'}
                            {...register('status')}
                            checked={status}
                            onChange={(e) => setValue('status', e.target.checked)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Documents</Form.Label>
                        <div className="d-flex">
                            {documents?.data ? documents.data.map((doc) => (
                                <Form.Check
                                    key={doc.document_enc_id}
                                    type="checkbox"
                                    label={doc.name}
                                    value={doc.document_enc_id}
                                    {...register('documents', {
                                        required: 'This field is required'
                                    })}
                                    checked={selectedDocuments?.includes(doc.document_enc_id)}
                                    className="me-4"
                                />
                            )) : ""}
                        </div>
                        {errors.documents && (
                            <div className="text-danger" style={{ fontSize: '0.875rem' }}>
                                {errors.documents.message}
                            </div>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    {isLoading ? (
                        <button type="button" className="btn-red" disabled={true}>
                            <img src="/images/loader.svg" alt={import.meta.env.VITE_APP_NAME} />
                        </button>
                    ) : (
                        <button type="submit" className="btn-red">
                            {profileEdit ? "Update" : "Create" }
                        </button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateProfileModal;
