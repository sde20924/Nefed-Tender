import Head from "next/head";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/tailwind.css";
import "../styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles

const MyApp = ({ Component, pageProps }) => {
  const Layout = Component.layout || (({ children }) => <>{children}</>);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Vi Exports - eAuction Tender Management System</title>
      </Head>
      <Provider store={store}>
        <Layout>
          <Component {...pageProps} />
          {/* Add ToastContainer globally */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Layout>
      </Provider>
    </>
  );
};

export default MyApp;
