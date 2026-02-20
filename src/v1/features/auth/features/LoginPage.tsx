import { abstract, logomain, logowhite, man_hive } from "../../../../assets";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div
      className=" min-h-screen lg:grid grid-cols-2 bg-white w-screen h-screen bg-no-repeat bg-contain"
      //   style={{ backgroundImage: `url(${abstract})` }}
    >
      {/* image side */}
      <div className=" relative overflow-hidden rounded-br-[4rem] bg-oha_primary">
        <div
          className="absolute w-full h-full bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${abstract})` }}
        ></div>
        <div className="relative p-12 h-full">
          <h1 className="text-white text-6xl font-bold leading-tight mt-12">
            One Hive
            <br />
            One Tree
          </h1>
          <div className=" h-full absolute bottom-0 -right-12">
            <img
              src={man_hive}
              alt="Beekeeper with honeycomb"
              className=" w-full h-full object-cover object-center "
            />
          </div>
        </div>
      </div>
      {/* form */}
      <div className="bg-oha_primary">
        <div className="bg-white rounded-tl-[4rem]  h-full w-full ">
          <div className=" w-full h-full flex flex-col lg:p-10">
            <div className="absolute top-0 left-0 p-5 px-14 lg:relative lg:p-0">
              <img src={logomain} alt="" className="hidden lg:block w-32 h-9" />
              <img src={logowhite} alt="" className="lg:hidden w-24 h-6" />
            </div>
            <div className=" w-full h-full">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
