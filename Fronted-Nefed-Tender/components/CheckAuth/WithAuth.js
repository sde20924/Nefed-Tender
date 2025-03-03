import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Change initial state to null to handle loading state
    const router = useRouter();

    useEffect(() => {
      const checkAuth = () => {
        const token = localStorage.getItem("token");
        const loginAs = localStorage.getItem("login_as");
        if (token) {
          setIsAuthenticated(true);
        } else {
          let redirectPath = "/auth/buyer-login"; // Default to buyer-login
          if (loginAs === "seller") redirectPath = "/auth/seller-login";
          else if (loginAs === "manager") redirectPath = "/auth/manager-login";
          router.push(redirectPath); 
        }
      };

      checkAuth();
    }, [router]);

    if (isAuthenticated === null) {
      return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    if (!isAuthenticated) {
      return null; // Optionally, you can return a redirect component or something similar
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
