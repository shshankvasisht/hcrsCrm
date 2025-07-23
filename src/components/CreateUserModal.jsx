import axios from 'axios';
import { useContext, useEffect, useRef, useState, useTransition } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { AdminDashboardContext } from '../context/AdminDashboardState';
import { toast } from 'react-toastify';

const CreateUserModal = ({ show, handleClose, setUpdateUser, updateUser, callback }) => {
    const { getProfiles, profiles } = useContext(AdminDashboardContext);
    const [isLoading, startTransition] = useTransition();
    const [usernameExists, setUsernameExists] = useState(false);
    const effectRan = useRef(false);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        clearErrors,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            status: true,
        },
    });

    const status = watch('status');
    const checkUsername = async (value) => {
        await axios
            .post(
                `${import.meta.env.VITE_API_BASE_PATH}check-username`,
                { username: value },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            .then((response) => {
                if (response.data.status === 200) {
                    setError('username', {
                        type: 'custom',
                        message: 'Username already exists',
                    });
                    setUsernameExists(true);
                } else {
                    clearErrors('username');
                    setUsernameExists(false);
                }
            });
    };

    const onSubmit = (data) => {
        if (usernameExists && !updateUser) {
            toast.error('Username Exists');
            return false;
        }

        if (updateUser) {
            data.user_enc_id = updateUser.user_id;
        }

        startTransition(async () => {
            await axios
                .post(
                    `${import.meta.env.VITE_API_BASE_PATH}${
                        updateUser ? 'update-user' : 'create-user'
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
                        toast.success('User Created Successfully');
                        callback();
                        reset();
                        handleClose(); // Close modal
                    } else {
                        toast.error('Some error occured');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    };

    const onHide = () => {
        reset();
        setUpdateUser('');
        handleClose();
    };

    useEffect(() => {
        if (updateUser) {
            setValue('fullName', updateUser.name ? updateUser.name : '');
            setValue('phone', updateUser.phone ? updateUser.phone : '');
            setValue('email', updateUser.email ? updateUser.email : '');
            setValue('username', updateUser.username ? updateUser.username : '');
            setValue('profile', updateUser.profile_enc_id ? updateUser.profile_enc_id : '');
            setValue('status', updateUser.status === '0' ? true : false);
        }
    }, [updateUser]);

    useEffect(() => {
        if (!effectRan.current) {
            getProfiles({ type: 'users' });
            effectRan.current = true;
        }
    }, []);

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{updateUser ? 'Update' : 'Create New'} User</Modal.Title>
            </Modal.Header>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    {...register('fullName', { required: 'Full name is required' })}
                                    type="text"
                                    placeholder="Enter full name"
                                    isInvalid={!!errors.fullName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.fullName?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    {...register('phone', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Enter a valid 10-digit phone number',
                                        },
                                    })}
                                    type="tel"
                                    placeholder="Enter phone"
                                    isInvalid={!!errors.phone}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.phone?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^\S+@\S+\.\S+$/,
                                            message: 'Invalid email format',
                                        },
                                    })}
                                    type="email"
                                    placeholder="Enter email"
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    {...register('username', { required: 'Username is required' })}
                                    type="text"
                                    placeholder="Enter username"
                                    onBlur={(e) => checkUsername(e.target.value)}
                                    disabled={updateUser ? true : false}
                                    isInvalid={!!errors.username}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.username?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    {...register('password', {
                                        required: updateUser ? false : 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
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
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Profile</Form.Label>
                                <Form.Select
                                    {...register('profile', {
                                        required: 'Profile is required',
                                    })}
                                    isInvalid={!!errors.profile}
                                >
                                    <option value="">Select Profile</option>
                                    {profiles?.data?.length
                                        ? profiles.data.map((value, index) => {
                                              return (
                                                  <option
                                                      key={`profile-${index}`}
                                                      value={value.profile_enc_id}
                                                  >
                                                      {value.name}
                                                  </option>
                                              );
                                          })
                                        : ''}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.profile?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        {updateUser ? (
                            <div className="col-md-6">
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
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className="btn-secondary" onClick={() => onHide()}>
                        Cancel
                    </button>
                    {isLoading ? (
                        <button type="button" className="btn-red" disabled={true}>
                            <img src="/images/loader.svg" alt={import.meta.env.VITE_APP_NAME} />
                        </button>
                    ) : (
                        <button type="submit" className="btn-red">
                            {updateUser ? 'Update' : 'Create'}
                        </button>
                    )}
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default CreateUserModal;
