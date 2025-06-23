const AdminDashboardReducer = (state, action) => {
    switch (action.type) {
        case "GET_DOCUMENTS":
            return{
                ...state,
                documents: action.payload
            }
        case "GET_PROFILES":
            return{
                ...state,
                profiles: action.payload
            }
        case "GET_USERS":
            return{
                ...state,
                allUsers: action.payload
            }
        default:
            return state;
        
    };
}

export default AdminDashboardReducer;