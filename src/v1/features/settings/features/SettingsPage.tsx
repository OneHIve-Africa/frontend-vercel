import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { User, Bell, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { logo as defaultAvatar, abso, abstract } from "@/assets";
import HoneycombPattern from "@/v1/components/common/HoneycombPattern";

const settingsNav = [
  {
    name: "Profile",
    fullName: "Profile Information",
    path: "/settings/profile",
    icon: User,
    desc: "Personal info & contact details",
  },
  {
    name: "Notifications",
    fullName: "Notification Preferences",
    path: "/settings/notifications",
    icon: Bell,
    desc: "Yield, hive & impact alerts",
  },
  {
    name: "Security",
    fullName: "Security & Legal",
    path: "/settings/account",
    icon: ShieldCheck,
    desc: "Password, compliance & legal",
  },
];

const SettingsPage: React.FC = () => {
  const { profile } = useUserProfileStore();

  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : "Investor Partner";

  return (
    <div className="w-full min-h-full py-1 sm:py-6 px-0 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
      {/* Top Investor Account Banner - Soft translucent white on mobile, crisp card on sm+ */}
      <div className="relative overflow-hidden bg-white/85 sm:bg-white backdrop-blur-xs border border-stone-200/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs sm:shadow-sm">
        {/* Subtle contour & honeycomb textures */}
        <HoneycombPattern opacity={0.05} color="#1b9d3c" />
        <img
          src={abso}
          alt=""
          aria-hidden="true"
          className="absolute -right-16 -top-20 w-64 sm:w-80 h-64 sm:h-80 object-contain opacity-20 pointer-events-none select-none"
        />
        <img
          src={abstract}
          alt=""
          aria-hidden="true"
          className="absolute -left-20 -bottom-24 w-56 sm:w-72 h-56 sm:h-72 object-contain opacity-10 pointer-events-none select-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 border-2 border-stone-200/80 shadow-xs flex items-center justify-center">
                <img
                  src={profile?.profile_image_url || defaultAvatar}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                title="Account active"
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h1 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight truncate">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-100/70 sm:bg-emerald-50 text-emerald-800 sm:text-emerald-700 border border-emerald-300 sm:border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 truncate max-w-xs sm:max-w-md">
                {profile?.email || "investor@onehive.africa"}
              </p>
            </div>
          </div>

          {/* Quick Account Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 md:pt-0">
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-stone-100 sm:bg-stone-50 border border-stone-200/80 text-[11px] sm:text-xs font-medium text-stone-700 sm:text-stone-600">
              Role: <span className="font-semibold text-stone-900 sm:text-stone-800">{profile?.position || "Investor Partner"}</span>
            </div>
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-100/70 sm:bg-amber-50 border border-amber-300/80 sm:border-amber-200/70 text-[11px] sm:text-xs font-medium text-amber-900 sm:text-amber-800">
              Status: <span className="font-semibold">Active Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
        {/* Navigation */}
        <aside className="w-full lg:w-80 shrink-0 bg-white/80 sm:bg-white backdrop-blur-xs border border-stone-200/80 rounded-2xl p-2 sm:p-4 shadow-xs sm:shadow-sm">
          <div className="px-3 py-2 mb-2 hidden lg:block">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Navigation
            </h2>
          </div>

          {/* Tab Bar: Horizontal scroll on mobile, vertical stack on lg */}
          <nav className="flex lg:flex-col gap-2 sm:gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none snap-x touch-pan-x">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-3 rounded-xl text-left transition-all duration-150 shrink-0 lg:shrink w-auto lg:w-full select-none snap-start min-h-[40px] sm:min-h-[44px] ${
                      isActive
                        ? "bg-stone-900 text-white shadow-xs font-medium"
                        : "text-stone-700 hover:text-stone-900 bg-stone-100/80 sm:bg-transparent hover:bg-stone-200/80 sm:hover:bg-stone-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-stone-200/70 sm:bg-stone-100 text-stone-700 sm:text-stone-600 group-hover:text-stone-900"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                          <span className="inline lg:hidden">{item.name}</span>
                          <span className="hidden lg:inline">{item.fullName}</span>
                        </div>
                        <div
                          className={`text-xs truncate hidden lg:block mt-0.5 ${
                            isActive ? "text-stone-300" : "text-stone-400"
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content Outlet - Soft white on mobile, crisp card on sm+ */}
        <main className="flex-1 w-full bg-white/80 sm:bg-white backdrop-blur-xs border border-stone-200/80 rounded-2xl p-4 sm:p-6 lg:p-10 shadow-xs sm:shadow-sm relative overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
