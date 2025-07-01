import axios from 'axios';
import { useTransition } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const RejectionReasonModal = ({ show, hide }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({});

    const [isLoading, startTransition] = useTransition();

    const handleClose = () => {
        reset();
        hide();
    };

    const onSubmit = (values) => {
        values['document_enc_id'] = show;
        startTransition(async () => {
            await axios
                .post(`${import.meta.env.VITE_API_BASE_PATH}update-rejection-reason`, values, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === 200) {
                        toast.success('Rejection reason updated successfully');
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

    return (
        <Modal show={show} onHide={handleClose} size="md" centered>
            <Modal.Header>Rejection Reason</Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            placeholder="Enter profile name"
                            {...register('reason', { required: 'This field is required' })}
                            isInvalid={!!errors.reason}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.reason?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn-secondary" onClick={() => handleClose()}>
                        Cancel
                    </button>
                    {isLoading ? (
                        <button type="button" className="btn-red" disabled={true}>
                            <img src="/images/loader.svg" alt={import.meta.env.VITE_APP_NAME} />
                        </button>
                    ) : (
                        <button type="submit" className="btn-red">
                            Save
                        </button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default RejectionReasonModal;
