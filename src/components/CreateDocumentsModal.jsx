import axios from 'axios';
import { useEffect, useTransition } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const CreateDocumentModal = ({
    show,
    handleClose,
    updateDocument,
    setUpdateDocument,
    callback,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm({
        defaultValues: { status: true },
    });

    const [isLoading, startTransition] = useTransition();
    const status = watch('status');

    const onSubmit = (data) => {
        if (updateDocument) {
            data['document_enc_id'] = updateDocument.document_enc_id;
        }
        startTransition(async () => {
            await axios
                .post(
                    `${import.meta.env.VITE_API_BASE_PATH}${
                        updateDocument ? 'update-document' : 'create-document'
                    }`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                )
                .then((response) => {
                    if (response.data.status === 200) {
                        toast.success(response.data.message);
                        reset();
                        callback();
                        handleClose();
                    } else {
                        toast.error('Some error occured');
                    }
                });
        });
    };

    const closeModal = () => {
        setUpdateDocument('');
        reset();
        handleClose();
    };

    useEffect(() => {
        if (updateDocument) {
            setValue('name', updateDocument.name);
            setValue('status', updateDocument.status === 'Active' ? true : false);
        }
    }, [updateDocument]);

    // const getKey = () => {
    // axios.post(`${import.meta.env.VITE_API_BASE_PATH}get-secrect-key`).then(
    //     response => {
    //         console.log(response)
    //     }
    // )
    // }

    return (
        <Modal show={show} onHide={closeModal} size="md" centered>
            {/* <button type='button' onClick={() => getKey()}>get key</button> */}
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title>{updateDocument ? 'Update' : 'Create'} Document</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            placeholder="Enter document name"
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
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    {isLoading ? (
                        <button type="button" className="btn-red" disabled={true}>
                            <img src="/images/loader.svg" alt={import.meta.env.VITE_APP_NAME} />
                        </button>
                    ) : (
                        <button type="submit" className="btn-red">
                            {updateDocument ? 'Update' : 'Create'}
                        </button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateDocumentModal;
