import React, { useEffect, useState } from "react";
import Link from "next/link";
// components

import IndexDropdown from "@/components/Dropdowns/IndexDropdown";
import { useRouter } from "next/router";

export default function Navbar(props) {
  
  const route = useRouter();
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [isLogin, setIsLogin] = useState(null);


  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const coloseNavBar = () => {
    setNavbarOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || null;
    setIsLogin(token);
  }, []);
  return (
    <>
      <nav className="top-0 fixed z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-white shadow">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link
              className="text-blueGray-700 text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
              href="/"
            >
              Vi Exports
            </Link>

            <button
              className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
          <div
            className={
              "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
              (navbarOpen ? " block" : " hidden")
            }
            id="example-navbar-warning"
          >
            <ul
              style={{ gap: "16px" }}
              className="flex flex-col lg:flex-row list-none lg:ml-auto"
            >
              <li className={`flex items-center ${isLogin && "hidden"}`}>
                <IndexDropdown
                  options={{
                    btnName: "Login",
                    menus: [
                      { label: "Login as buyer", href: "/auth/buyer-login" },
                      { label: "Login as seller", href: "/auth/seller-login" },
                      {
                        label: "Login as manager",
                        href: "/auth/manager-login",
                      },
                    ],
                  }}
                  isOpen={openDropdown === "login"}
                  onToggle={() => handleDropdownToggle("login")}
                  closeOtherDropdowns={closeAllDropdowns}
                  closeNavbar={coloseNavBar}
                />
              </li>
              <li className={`flex items-center ${isLogin && "hidden"}`}>
                <IndexDropdown
                  options={{
                    btnName: "Signup",
                    menus: [
                      {
                        label: "Register as buyer",
                        href: "/auth/register/buyer",
                      },
                      {
                        label: "Register as seller",
                        href: "/auth/register/seller",
                      },
                    ],
                  }}
                  isOpen={openDropdown === "signup"}
                  onToggle={() => handleDropdownToggle("signup")}
                  closeOtherDropdowns={closeAllDropdowns}
                  closeNavbar={coloseNavBar}
                />
              </li>

              <li className={`flex items-center ${!isLogin && "hidden"}`}>
                <button
                  style={{ borderRadius: "8px" }}
                  className="hover:text-blueGray-500 border text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                  onClick={() => route.push("/dashboard")}
                >
                  Dashboard
                </button>
              </li>
              {/* <li className="flex items-center">
                <Link
                  className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                  href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdemos.creative-tim.com%2Fnotus-nextjs%2F"
                  target="_blank"
                >
                  <i className="text-blueGray-400 fab fa-facebook text-lg leading-lg " />
                  <span className="lg:hidden inline-block ml-2">Share</span>
                </Link>
              </li>

              <li className="flex items-center">
                <Link
                  className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                  href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fdemos.creative-tim.com%2Fnotus-nextjs%2F&text=Start%20your%20development%20with%20a%20Free%20Tailwind%20CSS%20and%20NextJS%20UI%20Kit%20and%20Admin.%20Let%20Notus%20NextJS%20amaze%20you%20with%20its%20cool%20features%20and%20build%20tools%20and%20get%20your%20project%20to%20a%20whole%20new%20level."
                  target="_blank"
                >
                  <i className="text-blueGray-400 fab fa-twitter text-lg leading-lg " />
                  <span className="lg:hidden inline-block ml-2">Tweet</span>
                </Link>
              </li>

              <li className="flex items-center">
                <Link
                  className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                  href="https://github.com/creativetimofficial/notus-nextjs?ref=nnjs-index-navbar"
                  target="_blank"
                >
                  <i className="text-blueGray-400 fab fa-github text-lg leading-lg " />
                  <span className="lg:hidden inline-block ml-2">Star</span>
                </Link>
              </li> */}

              {/* <li className="flex items-center">
                <Link href={"/auth/login"}>
                  {" "}
                  <button
                    className="bg-blueGray-700 text-white active:bg-blueGray-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Login
                  </button>
                </Link>
              </li>
              <li className="flex items-center">
                <Link href={"/auth/register"}>
                  <button
                    className="bg-blueGray-700 text-white active:bg-blueGray-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Signup
                  </button>
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
