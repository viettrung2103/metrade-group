import { useState, useCallback, useEffect } from "react";

export const useLocalStorage = (key, initialValue = null) => {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error reading localStorage key:", key, error);
            return initialValue;
        }
    });

    // useEffect to handle dynamic key changes
    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            setValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
            console.error("Error reading localStorage key after key change:", key, error);
            setValue(initialValue);
        }
    }, []);

    // Set the item in localStorage and update state
    const setItem = useCallback((value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            setValue(value);
        } catch (error) {
            console.error("Error setting localStorage key:", key, error);
        }
    }, []);

    // Get the item from localStorage and update state
    const getItem = useCallback(() => {
        try {
            const item = localStorage.getItem(key);
            const parsedItem = item ? JSON.parse(item) : null;
            setValue(parsedItem);
            return parsedItem;
        } catch (error) {
            console.error("Error getting localStorage key:", key, error);
            return null;
        }
    }, []);

    // Remove the item from localStorage and update state
    const removeItem = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setValue(null);
        } catch (error) {
            console.error("Error removing localStorage key:", key, error);
        }
    }, []);

    return { value, setItem, getItem, removeItem };
};
