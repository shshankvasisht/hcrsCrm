import axios from 'axios';
import { useTransition } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({});
    const [isLoading, startTransition] = useTransition();

    const handleLogin = (values) => {
        startTransition(async () => {
            await axios
                .post(`${import.meta.env.VITE_API_BASE_PATH}forgot-password`, values)
                .then((response) => {
                    if (response.data.status === 200) {
                       toast.success('Please check your registered email');
                    } else {
                        toast.error('Invaid Login Credentials');
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

                                    <Form onSubmit={handleSubmit(handleLogin)}>
                                        <Form.Group className="mb-3" controlId="formEmail">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Username"
                                                className="rounded-3"
                                                {...register('username', {
                                                    required: 'This field is required',
                                                })}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="formEmail">
                                            <Form.Label>Registered Email</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Email"
                                                className="rounded-3"
                                                {...register('email', {
                                                    required: 'This field is required',
                                                })}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name?.message}
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

export default ForgotPassword;
