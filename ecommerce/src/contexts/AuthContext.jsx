import { createContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const AuthContext = createContext({
  user: null,
  updateUser: () => {},
  deleteUser: () => {},
  setUser: () => {},
  isAuthenticated: () => false,
  isLoading: true,
  renewAccessToken: () => {},
  scheduleTokenRenewal: () => {},
  logout: () => {},
  cartCount: 0,
  setCartCount: () => {},
  reloadCartCount: false,
  setReloadCartCount: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, setItem } = useLocalStorage("user");
  const [cartCount, setCartCount] = useState(0);
  const [reloadCartCount, setReloadCartCount] = useState(false);

  const logout = async () => {
    try {
      // Call the backend logout API to clear the refresh token from the database and cookies
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userId: user._id }),
        }
      );

      if (response.ok) {
        // If the logout API is successful, clear the user state and localStorage
        setUser(null);
        setItem(null);
        setIsLoading(false);
        setCartCount(0);
      } else {
        console.error("Failed to log out on the server.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  //function to renew access token
  const renewAccessToken = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/token/get-access-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        await logout(); // Log the user out if token renewal fails
        return;
      }
      //if renew successfully
      const data = await response.json();

      updateUser(data.user);
    } catch (error) {
      console.error("Error renewing access token:", error);
      await logout(); // Log the user out if an error occurs
    }
  };

  //function to set schedule for access token renewal
  const scheduleTokenRenewal = (expiresAt) => {
    const currentTime = Date.now();
    const tokenExpiresAt = expiresAt || user?.token_expired_at;

    if (tokenExpiresAt) {
      const timeToRenew = tokenExpiresAt - currentTime - 5 * 60 * 1000;
      if (timeToRenew > 0) {
        setTimeout(() => {
          renewAccessToken();
        }, timeToRenew);
      } else {
        renewAccessToken();
      }
    }
  };

  useEffect(() => {
    const storedUser = getItem(); // Get user from localStorage
    if (storedUser) {
      setUser(storedUser);
      scheduleTokenRenewal(storedUser.token_expired_at);
    }
    setIsLoading(false);
  }, [getItem]);

  const updateUser = (user) => {
    setUser(user);
    setItem(user);
    scheduleTokenRenewal(user.token_expired_at); // Schedule token renewal when the user logs in or update user info
    setReloadCartCount(true);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  useEffect(() => {
    const getCartDetail = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/cart/get-cart-detail`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        if (response.ok) {
          const cartDetail = data.cart_detail.cart_items || [];

          const cartCount = cartDetail.reduce(
            (acc, item) => acc + item.adding_quantity,
            0
          );
          setCartCount(cartCount);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getCartDetail();
  }, [reloadCartCount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        logout,
        setUser,
        isAuthenticated,
        isLoading,
        renewAccessToken,
        scheduleTokenRenewal,
        cartCount,
        setCartCount,
        reloadCartCount,
        setReloadCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
