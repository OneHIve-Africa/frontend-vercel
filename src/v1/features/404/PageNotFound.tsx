import React from "react";
import Bee from "../../../assets/images/bee.png";
import { Link } from "react-router-dom";

const PageNotFound: React.FC = () => {
  return (
    <div className="flex flex-col justify-center w-full items-center min-h-screen text-center px-4">
      <img src={Bee} alt="Lost bee" className="w-48 h-48 mb-6" />

      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Oops! Page Not Found
      </h1>
      <p className="text-gray-600 mb-6">
        We couldn’t find the page you were looking for.
        <br />
        It might have been moved or doesn't exist anymore.
      </p>

      <div className="flex gap-4">
        <Link
          to={"/"}
          className="bg-oha_primary hover:bg-orange-400 transition-all ease-in text-white font-semibold py-2 px-4 rounded-lg"
        >
          Go to Dashboard
        </Link>
        <Link
          to={"#"}
          className="bg-white border transition-all ease-in border-orange-500 hover:bg-orange-100 text-orange-500 font-semibold py-2 px-4 rounded-lg"
        >
          Browse Resources
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
