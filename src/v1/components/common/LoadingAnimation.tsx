import { FaSpinner } from "react-icons/fa";

const LoadingAnimation = () => {
  return (
    <div className="flex justify-center items-center min-h-[70dvh]">
      <FaSpinner className="animate-spin text-4xl text-oha_primary" />
    </div>
  );
};

export default LoadingAnimation;
