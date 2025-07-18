import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, RotateCcw, Gift, Store, TrendingUp } from "lucide-react";

const navItems = [
  {
    path: "/",
    label: "Home",
    icon: Home,
  },
  {
    path: "/rolls",
    label: "Rolls",
    icon: RotateCcw,
  },
  {
    path: "/my-gifts",
    label: "My Gifts",
    icon: Gift,
  },
  {
    path: "/shop",
    label: "Shop",
    icon: Store,
  },
  {
    path: "/earnings",
    label: "Earnings",
    icon: TrendingUp,
  },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-900/80 border-t border-white/10 max-w-md mx-auto shadow-2xl pointer-events-auto">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-3 px-3 text-xs transition-all duration-300 rounded-2xl min-w-0 flex-1 group relative overflow-hidden",
                isActive
                  ? "text-white transform scale-110"
                  : "text-gray-400 hover:text-white hover:scale-105",
              )}
            >
              {/* Active background effect */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl"></div>
              )}

              {/* Glow effect for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-lg"></div>
              )}

              {/* Icon with enhanced styling */}
              <div
                className={cn(
                  "relative z-10 p-2 rounded-xl transition-all duration-300 mb-1",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                    : "group-hover:bg-white/10",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label with enhanced styling */}
              <span
                className={cn(
                  "truncate text-center relative z-10 font-medium transition-all duration-300",
                  isActive && "text-shadow-sm",
                )}
              >
                {item.label}
              </span>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Link>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </div>
  );
}
