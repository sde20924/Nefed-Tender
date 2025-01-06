import Head from "next/head";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/tailwind.css";
import "../styles/globals.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
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
        <PersistGate loading={null} persistor={persistor}>
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
        </PersistGate>
      </Provider>
    </>
  );
};

export default MyApp;
