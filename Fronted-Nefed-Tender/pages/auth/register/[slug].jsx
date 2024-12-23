import React from "react";
import Auth from "@/layouts/Auth";
import { useRouter } from "next/router";
import {
    buyer_tag,
   seller_tag,
   manager_tag
} from "@/utils/tags";
import BuyerRegistrationForm from "@/components/RegistrationForm/BuyerRegistrationForm";
import SellerRegistrationForm from "@/components/RegistrationForm/SellerRegistrationForm";



export default function Register() {
 const router = useRouter();
 const { slug } = router.query;

  const registerConfig = {
    buyer: {
      title: "Buyer",
      apiEndpoint: "buyer/register",
      tag_id: buyer_tag,
      register: "auth/register/buyer",
      description:
        "Log in to explore a wide range of shipping opportunities. As a merchant, you can create requirements, view offerings, and book spaces on vessels effortlessly. Our user-friendly interface allows you to manage your shipments efficiently, ensuring a smooth and reliable booking experience.",
        formComponent: BuyerRegistrationForm,
    },
    seller: {
      title: "Seller",
      apiEndpoint: "seller/register",
      tag_id: seller_tag,
      register: "auth/register/seller",
      description:
        "Login to create offerings and confirm bookings after receiving booking requests. As a Operator/Ship Owner, you will continuously monitor requirements to start creating offerings based on the incoming data. Our platform provides robust tools to help you manage your listings efficiently and achieve the best possible outcomes.",
        formComponent: SellerRegistrationForm,
    },
    manager: {
      title: "Manager",
      tag_id: manager_tag,
      register: "auth/register/manager",
      description:
        "As a Vessel Broker on our platform, you gain access to a network of ship owners and charterers, allowing you to facilitate vessel bookings and manage inquiries effortlessly. Our registration process is quick and straightforward, ensuring that you can begin connecting with potential clients and managing your brokerage services efficiently. Complete your profile with relevant details to get started and unlock exclusive opportunities within the shipping industry",
    },
    
} 

   const { title, apiEndpoint, description, formComponent: FormComponent} =
     registerConfig[slug] || {};
     console.log(slug)

  return (
    <div className="container mx-auto px-4 h-full">
      <div
        style={{ gap: "24px" }}
        className="flex justify-between flex-wrap lg:flex-nowrap h-full"
      >
        <div className="lg:w-4/12 px-4 order-1 lg:order-1">
          <h1 style={{ fontSize: "32px", color: "orangered" }}>
            Welcome to <span style={{ color: "green" }}>{title}</span>{" "}
            Registration
          </h1>
          <div className="hidden lg:block order-3 lg:order-3">
           
          </div>
          <p style={{ fontSize: "18px", color: "white", marginTop: "16px" }}>
            {description}
          </p>
        </div>
        <div className="w-full lg:w-6/12 px-4 order-2 lg:order-2">
          {/* Dynamically Render Registration Form */}
          {FormComponent ? (
            <FormComponent />
          ) : (
            <p className="text-red-500">Invalid registration type.</p>
          )}
        </div>
        <div className="w-full lg:hidden px-4 order-3 lg:order-3">
          
        </div>
      </div>
    </div>
  );
}

Register.layout = Auth;
