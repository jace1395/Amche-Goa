import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [hideNav, setHideNav] = useState(false);

    return (
        <UIContext.Provider value={{ hideNav, setHideNav }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        return { hideNav: false, setHideNav: () => { } };
    }
    return context;
};
