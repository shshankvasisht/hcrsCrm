import { createContext, useReducer } from "react";
import AdminDashboardReducer from "../reducers/AdminDashboardReducer";
import { toast } from "react-toastify";
import axios from "axios";

export const AdminDashboardContext = createContext({});

export const AdminDashboardProvider = ({children}) => {
    const [state, dispatch] = useReducer(AdminDashboardReducer, {});
    
    const getDocuments = async (filters = null) => {
        await axios
            .post(`${import.meta.env.VITE_API_BASE_PATH}get-documents`, filters, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((response) => {
                if (response.data.status === 200) {
                    dispatch({
                        type: "GET_DOCUMENTS",
                        payload: response.data
                    });
                }else{
                   dispatch({
                        type: "GET_DOCUMENTS",
                        payload: []
                    });
                }
            }).catch(error => {
                toast.error(`Some error occured while fetching documents ${error}`)
            });
    };

    const getProfiles = async (filters = null) => {
        await axios.post(`${import.meta.env.VITE_API_BASE_PATH}get-profiles`, filters, {
             headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        }) 
        .then((response) => {
            if (response.data.status === 200) {
                dispatch({
                    type: "GET_PROFILES",
                    payload: response.data
                });
            }else{
                dispatch({
                    type: "GET_PROFILES",
                    payload: []
                });
            }
        }).catch(error => {
            toast.error(`Some error occured while fetching profiles ${error}`)
        });
    }

    const getUsers = async (filters = null) => {
        await axios.post(`${import.meta.env.VITE_API_BASE_PATH}get-users`, filters, {
            headers: {
                 Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        }).then((response) => {
            if(response.data.status === 200) {
                dispatch({
                    type: "GET_USERS",
                    payload: response.data
                });
            }else {
                dispatch({
                    type: "GET_USERS",
                    payload: []
                });
            }
        }).catch(error => {
            toast.error(`Some error occured while fetching users ${error}`)
        })
    }

    return(
        <AdminDashboardContext.Provider
            value={{
                documents: state.documents,
                profiles: state.profiles,
                allUsers: state.allUsers,
                getDocuments,
                getProfiles,
                getUsers,
            }}
        >
            {children}
        </AdminDashboardContext.Provider>
    )
}