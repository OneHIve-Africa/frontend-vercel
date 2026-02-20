import { abstract, logo, woman_login } from "../../../../assets";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
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
            Bee
            <br />
            Alive
          </h1>
          <div className=" h-full absolute bottom-0">
            <img
              src={woman_login}
              alt="Beekeeper with honeycomb"
              className=" w-full h-full object-cover object-center "
            />
          </div>
        </div>
      </div>
      {/* form */}
      <div className="bg-oha_primary ">
        <div className="bg-white rounded-tl-[4rem]  h-full w-full ">
          <div className=" w-full h-full flex flex-col lg:p-10">
            <div className=" ">
              <img src={logo} alt="" />
            </div>
            <div className=" w-full h-full">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
