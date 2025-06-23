import { Children, createContext, useEffect, useState } from "react";

export const UserDashboardContext = createContext({});

export const UserDashboardProvider = ({children}) => {
     const [user, setUser] = useState(null);
      useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    return (
        <UserDashboardContext.Provider 
            value={{
                user,
                setUser,
            }}
        >
            {children}
        </UserDashboardContext.Provider>
    )
}