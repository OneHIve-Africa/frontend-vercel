import { abso, bee } from "@/assets";
import { useNavigate } from "react-router-dom";

const BeeInvestmentCard = () => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-oha_secondary rounded-lg px-8 pt-5 pb-8 w-full mx-auto text-white shadow-lg relative flex flex-col gap-5 bg-cover bg-no-repeat bg-center min-h-full "
      style={{
        backgroundImage: `url(${abso})`,
      }}
    >
      <h2 className="text-2xl font-bold whitespace-nowrap">
        Maximize Your Impact!
      </h2>

      <p className="text-sm font-light">
        Investing in more hives or reinvesting your earnings can increase both
        your profitability and positive impact.
      </p>

      <ul className="text-sm font-light">
        <li className="flex items-center gap-3">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          <span className="">Invest in More Hives</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          <span className="">Reinvest Your Earnings</span>
        </li>
      </ul>

      <button
        className="bg-white text-green-500 text-md font-medium py-2 px-3 rounded-md hover:bg-green-50 transition-colors w-32 cursor-pointer shadow"
        onClick={() => navigate("/new-investment")}
      >
        Invest
      </button>

      <div className="absolute right-3 bottom-5">
        <img src={bee} alt="bee image" className="w-24" />
      </div>
    </div>
  );
};

export default BeeInvestmentCard;
