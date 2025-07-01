import axios from 'axios';
import { useTransition } from 'react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({});
    const [isLoading, startTransition] = useTransition();
    const params = useParams();
    // Watch the password field to compare
    const password = watch('password');

    const handleUpdatePassword = (values) => {
        values["username"]= params.username;
        startTransition(async () => {
            await axios
                .post(`${import.meta.env.VITE_API_BASE_PATH}update-password`, values)
                .then((response) => {
                    if (response.data.status === 200) {
                        toast.success('Password updated successfully');
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
        <div className="login-page-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <div className="login-card-wrapper">
                            <Card className="login-card">
                                <Card.Body>
                                    {/* Branding */}
                                    <div className="text-center mb-4">
                                        <img
                                            src="/images/hcrs-logo-big.png"
                                            alt="logo"
                                            className="mb-2 login-logo"
                                            style={{ width: '120px' }}
                                        />
                                    </div>

                                    <Form onSubmit={handleSubmit(handleUpdatePassword)}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                {...register('password', {
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 6,
                                                        message:
                                                            'Password must be at least 6 characters',
                                                    },
                                                })}
                                                type="password"
                                                placeholder="Enter password"
                                                isInvalid={!!errors.password}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="formEmail">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                {...register('confirm_password', {
                                                    required: 'Confirm Password is required',
                                                    validate: (value) =>
                                                        value === password ||
                                                        'Passwords do not match',
                                                })}
                                                type="password"
                                                placeholder="Enter password"
                                                isInvalid={!!errors.confirm_password}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.confirm_password?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <div className="d-grid">
                                            {isLoading ? (
                                                <button
                                                    type="button"
                                                    className="btn-red rounded-3"
                                                    disabled={true}
                                                >
                                                    <img
                                                        src="/images/loader.svg"
                                                        alt={import.meta.env.VITE_APP_NAME}
                                                    />
                                                </button>
                                            ) : (
                                                <button type="submit" className="btn-red rounded-3">
                                                    Submit
                                                </button>
                                            )}
                                        </div>
                                    </Form>

                                    <div className="text-center mt-3">
                                        <Link
                                            to="/"
                                            className="text-decoration-none text-muted small"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ResetPassword;
