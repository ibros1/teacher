import { useEffect } from "react";
import { Button } from "../../components/ui/button";
import logo from "../../../public/logo.png";
import { useFormik } from "formik";
import * as yup from "yup";
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUserFn,
  resetRegisterState,
} from "../../store/slices/auth/register";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import Spinner from "../../components/spinner";
const Register = () => {
  const registerState = useSelector((state: RootState) => state.registerSlice);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useEffect(() => {
    if (registerState.error) {
      toast.dismiss();
      toast.error(registerState.error);
      return;
    }
    if (registerState.loading) {
      toast.dismiss();
      toast.loading("loading...");
      return;
    }
    if (registerState.data.isSuccess) {
      toast.dismiss();
      toast.success("Registration successful!!");

      formik.resetForm();
      dispatch(resetRegisterState());
      navigate("/login");
      return;
    }
  }, [registerState, dispatch, navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      fullName: "",
      phoneNumber: "",
      sex: "",
      password: "",
      comfirmPassword: "",
      profilePhoto: null as File | null,
      coverPhoto: null as File | null, // Changed to File | null
    },
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("username", values.username);
      formData.append("fullName", values.fullName);
      formData.append("phone_number", values.phoneNumber);
      formData.append("sex", values.sex);
      formData.append("password", values.password);
      formData.append("comfirmPassword", values.comfirmPassword);

      dispatch(registerUserFn(formData));
      console.log(formData);
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email("Invalid email address")
        .required("Email is required"),
      username: yup
        .string()
        .min(2, "Username must above 2 characters")
        .max(32, "maximum characters of username is 32")
        .required("Username is required"),
      fullName: yup.string().required("Full name is required"),
      phoneNumber: yup.string().required("Phone number is required"),

      sex: yup.string().required("Sex is required"),
      password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      comfirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    }),
  });

  return (
    <div>
      <div className="min-h-screen py-16 bg-white dark:bg-[#091025] flex items-center justify-center px-4 transition-colors">
        <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[40%] bg-white dark:bg-[#091025] dark:backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-600 dark:border-white/20 text-gray-900 dark:text-white transition-colors">
          {/* Logo and Header */}
          <div className="text-center mb-6">
            <img
              src={logo}
              alt="FaceTeacher Logo"
              className="mx-auto h-full w-[40%] mb-2"
            />
            <h2 className="text-2xl font-semibold">Welcome to FaceTeacher</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Create your account to start learning
            </p>
          </div>

          <div className="info text-green-600 font-bold"></div>

          {/* Form */}
          <form className="space-y-5" onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="grid">
                <label className="block my-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="border border-gray-300 p-3 w-full rounded-md focus:outline-none dark:bg-[#091025] focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                  placeholder="Enter your Email"
                  onChange={formik.handleChange}
                  value={formik.values.email.toLowerCase()}
                />
                <p className="text-green-600 font-bold">
                  {" "}
                  {formik.touched.email && formik.errors.email}{" "}
                </p>
              </div>

              <div className="grid">
                <label className="block my-1">Username</label>
                <input
                  type="text"
                  name="username"
                  className="border border-gray-300 p-3 w-full rounded-md focus:outline-none dark:bg-[#091025] focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                  placeholder="Enter your Username"
                  onChange={formik.handleChange}
                  value={formik.values.username}
                />
                <p className="text-green-600 font-bold">
                  {" "}
                  {formik.touched.username && formik.errors.username}{" "}
                </p>
              </div>

              <div className="grid">
                <label className="block my-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="border border-gray-300 p-3 w-full rounded-md focus:outline-none dark:bg-[#091025] focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                  placeholder="Enter your Full Name"
                  onChange={formik.handleChange}
                  value={formik.values.fullName}
                />
                <p className="text-green-600 font-bold">
                  {" "}
                  {formik.touched.fullName && formik.errors.fullName}{" "}
                </p>
              </div>

              <div className="grid">
                <label className="block my-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="border border-gray-300 p-3 w-full rounded-md focus:outline-none dark:bg-[#091025] focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                  placeholder="Enter your Phone Number"
                  onChange={formik.handleChange}
                  value={formik.values.phoneNumber}
                />
                <p className="text-green-600 font-bold">
                  {" "}
                  {formik.touched.phoneNumber && formik.errors.phoneNumber}{" "}
                </p>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="flex flex-wrap items-center">
              <label className="block my-1 mr-4">Sex:</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sex"
                    value="male"
                    onChange={formik.handleChange}
                    checked={formik.values.sex === "male"}
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sex"
                    value="female"
                    onChange={formik.handleChange}
                    checked={formik.values.sex === "female"}
                  />
                  <span>Female</span>
                </label>
              </div>
              <p className="text-green-600 font-bold ml-2">
                {" "}
                {formik.touched.sex && formik.errors.sex}{" "}
              </p>
            </div>

            {/* Password Fields */}
            <div>
              <label className="block my-1">Password</label>
              <input
                type="password"
                name="password"
                className="border border-gray-300 p-3 w-full rounded-md focus:outline-none dark:bg-[#091025] focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                placeholder="Enter your password"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <p className="text-green-600 font-bold">
                {" "}
                {formik.touched.password && formik.errors.password}{" "}
              </p>
            </div>

            <div>
              <label className="block my-1">Confirm Password</label>
              <input
                type="password"
                name="comfirmPassword"
                className="border border-gray-300 p-3 w-full rounded-md focus:outline-none dark:bg-[#091025] focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                placeholder="Confirm your password"
                onChange={formik.handleChange}
                value={formik.values.comfirmPassword}
              />
              <p className="text-green-600 font-bold">
                {" "}
                {formik.touched.comfirmPassword &&
                  formik.errors.comfirmPassword}{" "}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              disabled={formik.errors && registerState.loading}
              type="submit"
              className=" disabled:bg-gray-500 disabled:cursor-auto  bg-green-600 w-full hover:bg-green-700 transition duration-300 font-semibold"
            >
              {registerState.loading ? <Spinner /> : "Sign Up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-green-600 dark:border-white/20" />

          {/* Link to login */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 dark:text-green-700 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
