import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Auth from "@/layouts/Auth";
import { useRouter } from "next/router";
import { authApi } from "@/utils/FetchApi";
Auth
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SetNewPasswordForm from "@/components/OTPVerification/SetNewPasswordForm";
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .max(16, "Password can't exceed 16 characters")
        .required("Password is required"),
});
export default function Login() {
    const [otpSec, setOtpSec] = useState(false);
    const [signInDisabled, setSignInDisabled] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loginHidden, setLoginHidden] = useState(false);
    const [dataForSetPass, setDataForSetPass] = useState({});
    const [showOtpLogin, setShowOtpLogin] = useState(false)
    const router = useRouter();
    const { slug, company_email, showOtpLogin: queryShowOtpLogin } = router.query;
    const initialValues = {
        email: "",
        password: "",
    };
    useEffect(() => {
        if (router.isReady) {
            if (company_email) {
                setEmail(decodeURIComponent(company_email));
            }
            if (queryShowOtpLogin !== undefined) {
                setShowOtpLogin(queryShowOtpLogin === "true");
            }
        }
    }, [router.isReady, company_email, queryShowOtpLogin]);
    const loginConfig = {
        "buyer-login": {
            title: "Buyer",
            apiEndpoint: "buyer/login",
            register: "auth/register/buyer",
            description:
                "Log in to explore a wide range of products from various categories, from antiques to electronics, all available forbidding. Our user-friendly interface allows you to place bids quickly, monitor your auctions, and stay updated with real-time notifications, ensuring you never miss an opportunity."
        },
        "seller-login": {
            title: "Seller",
            apiEndpoint: "seller/login",
            register: "auth/register/seller",
            description:
                "Sign in to manage your listings, track bids, and engage with a diverse audience.Our platform provides robust tools for creatingcompelling product descriptions, setting reserve prices, and analyzing market trends to help you achieve the best possible sales outcomes."
        },
        "manager-login": {
            title: "Manager",
            apiEndpoint: "manager/login",
            description:
                "As a manager, you play a crucial role in maintaining the integrity and smooth operation of the eAuction platform. Our tools are designed to provide you with the control and oversight needed to manage auctions effectively."
        }
    };
    // Selected config based on slug
    const { title, apiEndpoint, description, register } = loginConfig[slug] || {};
    const setLoginHiddenStatus = () => {
        setLoginHidden(false);
    };

    const handleSubmit = async (values) => {
        console.log("-=-=-=-=-=-=-=kdsjdksjdksjdk--=-=-=-=")
        setSignInDisabled(true);
        const data = await authApi(apiEndpoint, "POST", { ...values });
        console.log("kklkllkldata",data)
        try{
            if (!data.success) {
                if (data.errors) {
                    setSignInDisabled(false);
                    console.log("-=-=-=-=-=-=-=kdsjdksjdksjdk--=-=-=-=")
                    toast.error(data.errors[0].msg); // Use toast error
                } else if (data["is_email_verified"] !== undefined) {
                    setSignInDisabled(false);
                    toast.info(data.msg); // Use toast info
                    // If email is not verified, resend OTP
                    const otpData = await authApi("otp/resend", "POST", {
                        email: values.email,
                    });
                    if (otpData.success) {
                        setEmail(values.email);
                        setTimeout(() => {
                            setSignInDisabled(true);
                        }, 200);
                        setOtpSec(true); // Show OTP section for verification
                        toast.info("Please verify your email with the OTP sent."); // Inform user to verify OTP
                    } else {
                        setSignInDisabled(false);
                        toast.error(otpData.msg); // Use toast error
                    }
                } else if (data["temp_pass_verified"] !== undefined) {
                    setDataForSetPass({
                        ...dataForsetPass,
                        email: values.email,
                        temp_password: values.password,
                        user_type: "seller",
                    });
                    setSignInDisabled(false);
                    toast.info(data.msg); // Use toast info
                    setLoginHidden(true);
                } else {
                    setSignInDisabled(false);
                    toast.error(data.msg); // Use toast error
                }
            }
            if (data.success) {
                localStorage.setItem("token", data.token);
                document.cookie = `token=${data.token}; path=/; secure; samesite=strict;`;
                if (data.data?.status === "not_verified") {
                    localStorage.setItem("openModal", 1);
                }
                localStorage.setItem("data", JSON.stringify(data));
                localStorage.setItem("login_as", data?.login_as);
                toast.success(data.msg);
                router.push("/dashboard");
            }
        }catch(e){
           console.log(e);
        }
    };
    const verifyOtp = async () => {
        setSignInDisabled(true);
        const otpData = await authApi("otp/verify", "POST", {
            email,
            otp,
        });
        if (otpData.success) {
            setSignInDisabled(false);
            toast.success(otpData.msg);
            setOtpSec(false);
        } else {
            setSignInDisabled(false);
            toast.error(otpData.msg);
        }
    };
    return (
        <>
            <div className="container mx-auto px-4 h-full">
                <div
                    style={{ gap: "24px" }}
                    className="flex justify-between flex-wrap lg:flex-nowrap h-full"
                >
                    <div className="lg:w-4/12 px-4 order-1">
                        <h1 style={{ fontSize: "32px", color: "orangered" }}>
                            Welcome to <span style={{ color: "green" }}>{title}</span> Login
                        </h1>
                        {slug === "manager-login" && (
                            <h1 style={{ fontSize: "32px", color: "orangered" }}>
                                Welcome to the eAuction Login Portal{" "}
                                <span style={{ color: "green" }}>{title}</span>
                            </h1>
                        )}

                        <p style={{ fontSize: "18px", color: "white", marginTop: "16px" }}>
                            {description}
                        </p>
                    </div>
                    <div
                        className={`${!loginHidden ? "hidden" : ""} w-full lg:w-4/12 px-4 order-2 lg:order-3`}
                    >
                        <SetNewPasswordForm
                            data={dataForSetPass}
                            closeSetPass={setLoginHiddenStatus}
                        />
                    </div>
                    <div
                        className={`${loginHidden ? "hidden" : ""} w-full lg:w-4/12 px-4 order-3 lg:order-2`}
                    >
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
                            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                                <div className="text-blueGray-400 text-center mb-3 mt-3 font-bold">
                                    <small>Login as {title}</small>
                                </div>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ setFieldValue }) => (
                                        <Form>
                                            {/* Email */}
                                            <div className="relative w-full mb-3">
                                                <label
                                                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                    htmlFor="email"
                                                >
                                                    Email
                                                </label>
                                                <Field
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    className="border-0 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                    placeholder="Email"
                                                />
                                                <ErrorMessage
                                                    name="email"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            {/* Password */}
                                            <div className="relative w-full mb-3">
                                                <label
                                                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                    htmlFor="password"
                                                >
                                                    Password
                                                </label>
                                                <Field
                                                    type="password"
                                                    name="password"
                                                    id="password"
                                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                    placeholder="Password"
                                                />
                                                <ErrorMessage
                                                    name="password"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            {/* OTP Verification Section */}
                                            {otpSec && (
                                                <div className="relative w-full mb-3">
                                                    <label
                                                        htmlFor="otp"
                                                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                    >
                                                        Enter OTP
                                                    </label>
                                                    <input
                                                        id="otp"
                                                        name="otp"
                                                        contentEditable={!signInDisabled}
                                                        type="text"
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                        placeholder="6-digit OTP"
                                                    />
                                                    <button
                                                        disabled={!signInDisabled}
                                                        onClick={verifyOtp}
                                                        type="button"
                                                        className={`${signInDisabled ? "bg-black" : "bg-teal-500"
                                                            } mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                                                    >
                                                        {signInDisabled ? "Verify OTP" : "Verified"}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <div className="text-center mt-6">
                                                <button
                                                    style={{
                                                        cursor: signInDisabled
                                                            ? "not-allowed"
                                                            : "pointer",
                                                    }}
                                                    disabled={signInDisabled}
                                                    type="submit"
                                                    className={`${signInDisabled
                                                        ? "bg-gray-500"
                                                        : "bg-blueGray-800"
                                                        } text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
                                                >
                                                    SIGN IN
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                        <div className="flex flex-wrap mt-6 relative">
                            <div className="w-1/2">
                                <Link href="/forget-password" className="text-blueGray-200">
                                    <small>Forgot password?</small>
                                </Link>
                            </div>
                            {slug !== "manager-login" && (
                                <div className="w-1/2 text-right">
                                    <Link
                                        href={`/auth/${register}`}
                                        className="text-blueGray-200"
                                    >
                                        <small>Create new account</small>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            <ToastContainer />
            </div>
        </>
    );
}
Login.layout = Auth;