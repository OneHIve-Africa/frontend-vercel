import { abstract, bee } from "@/assets";
import { Button } from "@/components/Button";

const OldUser = () => {
  return (
    <div className="w-full h-full grid grid-cols-5">
      <div className="max-w-4xl col-span-4 px-5">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Hello Gideon</h1>
          <p className="text-gray-600 mt-2">
            Empowering communities, one hive at a time. Here's an overview of
            your contributions.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-white p-10 rounded-xl shadow">
          {/* Total Investment */}
          <div className="flex flex-col items-center justify-center bg-gray-800 text-white p-6 rounded-xl shadow-md">
            <span className="text-sm font-medium">Total Investment</span>
            <span className="text-2xl font-bold">GHS 40,689</span>
          </div>

          {/* Current Value */}
          <div className="flex flex-col items-center justify-center bg-white text-gray-900 p-6 rounded-xl shadow-md">
            <span className="text-sm font-medium">Current Value</span>
            <span className="text-2xl font-bold">GHS 40,689</span>
          </div>

          {/* ROI */}
          <div className="flex flex-col items-center justify-center bg-oha_secondary text-white p-6 rounded-xl shadow-md">
            <span className="text-sm font-medium">ROI</span>
            <span className="text-2xl font-bold">GHS 40,689</span>
          </div>
        </div>
      </div>
      {/* <Separator orientation="vertical" /> */}
      <div className=" col-span-1 w-full h-full border-l-2 border-l-gray-300 flex justify-center pt-24 pl-6">
        <div
          className="bg-oha_primary w-full rounded-xl shadow bg-cover h-fit bg-no-repeat flex flex-col justify-center items-center py-14 px-5"
          style={{ backgroundImage: `url(${abstract})` }}
        >
          <img src={bee} alt="bee" className="h-32" />

          <div className="text-white flex flex-col items-center gap-5">
            <h1 className="capitalize font-bold text-center">Did you know?</h1>
            <p className="text-xs text-center leading-snug">
              One-third of the food we eat relies on pollination by bees? By
              investing in hives, you're supporting global food security.
            </p>
            <Button className="py-2 text-sm font-semibold text-white bg-shads rounded hover:bg-shadsd focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none w-3/5">
              Invest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OldUser;
