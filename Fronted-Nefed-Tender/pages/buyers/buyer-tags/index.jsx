import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBuyerTags, updateMSG } from "@/store/slices/buyersSlice";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import AddTagModal from "@/components/Modal/AddTagMadal";
import { useRouter } from "next/router";
import { toast } from "react-toastify";


const BuyerTags = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { buyerTags, buyerLoading, b_msg } = useSelector(
    (state) => state.buyers
  );

  const handleShowLists = (tagId) => {
    router.push(`/buyers/buyer-tags/${tagId}`);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (b_msg) {
      toast.info(b_msg);
      dispatch(updateMSG());
    }
  }, [b_msg]);

  useEffect(() => {
    if (!buyerTags) {
      dispatch(getBuyerTags());
    }
  }, [buyerTags]);

  if (buyerLoading) {
    return <LoadingScreen />;
  }
  return (
    <div>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"View tags, create tags, add or remove users"}
        title={"All Buyer Tags"}
      />
      <div className="p-4">
        <div className="flex justify-end">
          <button
            onClick={openModal}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Tag
          </button>
          <AddTagModal
            isOpen={isModalOpen}
            onClose={closeModal}
            user={"buyer"}
          />
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">Tag ID</th>
                <th className="py-2 px-4 border-b">Tag Name</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {buyerTags?.map((tag) => (
                <tr key={tag.id}>
                  <td className="py-2 px-4 border-b text-center">{tag.id}</td>
                  <td className="py-2 px-4 border-b text-center">{tag.name}</td>
                  <td className="flex gap-4 justify-center py-2 px-4 border-b text-center">
                    <button
                      onClick={() =>{
                         handleShowLists(tag.id)
                         localStorage.setItem('tag_name', tag.name)
                        }}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 transition duration-300"
                    >
                      Show Lists
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('tag_name', tag.name)
                        router.push(`buyer-tags/docs?${tag.id}`)}
                      }
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 transition duration-300"
                    >
                      View Docs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};
BuyerTags.layout = UserDashboard;
export default BuyerTags;
