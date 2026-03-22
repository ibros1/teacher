import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FaCheckCircle } from "react-icons/fa";
import logo from "../../../public/logo.png";

interface Props {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: Props) => {
  const userLogin = useSelector((state: RootState) => state.loginSlice);
  const user = userLogin.data?.user;
  const isLoggedIn = userLogin.data?.isSuccess;

  const fullName = user?.full_name || "Guest User";
  const username = user?.username || "guest";
  const profilePhoto = user?.profilePhoto ? `${user.profilePhoto}` : "";
  const navigate = useNavigate();

  const links = [
    {
      label: "Home",
      to: "/",
      iconClass: "bb-icon-home",
      filledIconClass: "bb-icon-home bb-icon-f",
    },
    {
      label: "All Courses",
      to: "/courses",
      iconClass: "bb-icon-books",
      filledIconClass: "bb-icon-books bb-icon-f",
    },
    {
      label: "Contact",
      to: "/contact",
      iconClass: "bb-icon-phone-call",
      filledIconClass: "bb-icon-phone-call bb-icon-f",
    },
  ];

  if (isLoggedIn) {
    links.splice(
      2,
      0,
      {
        label: "My Profile",
        to: "/my-profile",
        iconClass: "bb-icon-user",
        filledIconClass: "bb-icon-user bb-icon-f",
      },
      {
        label: "My Courses",
        to: "/my-courses",
        iconClass: "bb-icon-graduation-cap",
        filledIconClass: "bb-icon-graduation-cap bb-icon-f",
      },
      {
        label: "My Certificates",
        to: "/certificates",
        iconClass: "bb-icon-certificate",
        filledIconClass: "bb-icon-certificate bb-icon-f",
      },
      {
        label: "My Orders",
        to: "/my-orders",
        iconClass: "bb-icon-checkbox",
        filledIconClass: "bb-icon-checkbox bb-icon-f",
      },

    );
  }

  if (user?.role === "ADMIN") {
    links.splice(0, 0, {
      label: "Dashboard",
      to: "/dashboard/admin",
      iconClass: "bb-icon-sidebar",
      filledIconClass: "bb-icon-sidebar bb-icon-f",
    });
  }

  const bottomLinks = [
    {
      label: "Account",
      to: "/my-settings",
      iconClass: "bb-icon-cog",
      filledIconClass: "bb-icon-cog bb-icon-f",
    },
    {
      label: "Log out",
      to: "/logout",
      iconClass: "bb-icon-sign-out",
      filledIconClass: "bb-icon-sign-out bb-icon-f",
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col justify-between overflow-y-auto scrollbar-hide">
      <div>
        {/* Header containing Logo and Mobile Close Button */}
        <div className="flex py-[9.9px] justify-between xl:justify-center items-center px-4 xl:px-2">
          <img
            src={logo}
            alt="Logo"
            className="w-[120px] xl:w-[180px] cursor-pointer"
            onClick={() => {
              navigate("/");
              if (onClose) onClose();
            }}
          />
          {onClose && (
            <i
              className="text-2xl bb-icon-times xl:hidden font-bold text-gray-600 cursor-pointer dark:text-white"
              onClick={onClose}
              role="button"
              tabIndex={0}
              aria-label="Close sidebar"
            ></i>
          )}
        </div>
        <hr className="w-full border-gray-200 dark:border-gray-700" />

        {/* Profile Info (Only if logged in) */}
        {isLoggedIn && (
          <div className="relative mx-2 p-4">
            <div className="flex py-2 items-center">
              <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-[#0f172a] shadow-md">
                <AvatarImage
                  src={profilePhoto}
                  alt={`${fullName}'s profile`}
                  className="object-cover"
                />
                <AvatarFallback className="text-sm font-semibold bg-gray-200 dark:bg-gray-700">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col ml-3">
                <div className="flex items-center gap-1 text-[14.4px] font-semibold text-gray-900 dark:text-white">
                  <span>
                    {fullName.length > 15
                      ? `${fullName.slice(0, 15)}...`
                      : fullName}
                  </span>
                  <FaCheckCircle className="text-green-600 text-md" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{username}
                </p>
              </div>
            </div>
          </div>
        )}
        {isLoggedIn && <hr className="border-gray-200 dark:border-gray-700" />}

        {/* Main Menu */}
        <nav className="flex flex-col py-4 px-2">
          {links.map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-2 my-1 transition-all duration-300 ${
                  isActive
                    ? "bg-green-600 text-white font-semibold shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <i
                    className={`text-2xl transition ${
                      isActive
                        ? link.filledIconClass
                        : `${link.iconClass} bb-icon-l`
                    }`}
                  ></i>
                  <span className="text-sm group-hover:translate-x-[2px] transition-all">
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Bottom Menu */}
      <div className="pt-4 border-t dark:border-gray-700 mt-auto">
        {isLoggedIn ? (
          <nav className="flex flex-col py-4 px-2">
            {bottomLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-2 my-1 transition-all duration-300 ${
                    isActive
                      ? "bg-green-600 text-white font-semibold shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i
                      className={`text-2xl transition ${
                        isActive
                          ? link.filledIconClass
                          : `${link.iconClass} bb-icon-l`
                      }`}
                    ></i>
                    <span className="text-sm group-hover:translate-x-[2px] transition-all">
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            <NavLink
              to="/login"
              onClick={onClose}
              className="text-center text-green-600 border shadow-sm px-4 py-2 rounded-md bg-gray-50 dark:bg-[#0F172A] dark:border-2 dark:border-gray-700 hover:text-green-700 font-semibold"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              onClick={onClose}
              className="text-center text-green-600 border shadow-sm px-4 py-2 rounded-md bg-gray-50 dark:bg-[#0F172A] dark:border-2 dark:border-gray-700 hover:text-green-700 font-semibold"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
