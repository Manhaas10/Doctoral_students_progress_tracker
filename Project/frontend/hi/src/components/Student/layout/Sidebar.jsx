import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, User, Calendar, FileText, Book, GraduationCap, Bell, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/student-dashboard", icon: Home },
  { label: "Profile", href: "/profile", icon: User },
  { label: "DC Meetings", href: "/dcmeeting", icon: Calendar },
  { label: "Comprehensive Exam", href: "/exam", icon: FileText },
  { label: "Publications", href: "/publication", icon: Book },
  { label: "SWAYAM Courses", href: "/swayam_course", icon: GraduationCap },
  // { label: "Notifications", href: "/notification", icon: Bell },
];

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  return (
    <div
      className={`h-screen sticky top-0 left-0 bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {expanded && <h1 className="text-xl font-semibold text-white">Phd Connect</h1>}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-full hover:bg-gray-800 transition ml-auto"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <ChevronLeft className="h-5 w-5 text-white" />
          ) : (
            <ChevronRight className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <li key={href}>
                <NavLink
                  to={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {expanded && <span>{label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto p-3 border-t border-gray-700">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          {expanded && <span>Logout</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
