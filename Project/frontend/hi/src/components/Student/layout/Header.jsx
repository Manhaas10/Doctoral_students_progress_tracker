import React, { useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationPanel from "../../ui/NotificationPanel";

const Header = ({ studentName }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize navigation

  const toggleDarkMode = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setDarkMode(!darkMode);
    toast({
      title: `${darkMode ? "Light" : "Dark"} mode activated`,
      description: `Switched to ${darkMode ? "light" : "dark"} mode successfully.`,
      duration: 1500,
    });
  };

  const handleLogout = () => {
    // Clear user session (if using localStorage, remove token here)
    localStorage.removeItem("authToken");

    // Navigate to login page
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-medium">
          <span>Doctoral Students Portal</span>
        </h1>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)}>
            <Bell className="h-5 w-5" />
          </Button>
          <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} /> */}

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
  <AvatarImage src="/placeholder.svg" alt={studentName || "Student"} />
  <AvatarFallback className="bg-primary text-primary-foreground">
    {studentName ? studentName.split(" ").map(n => n[0]).join("") : "S"}
  </AvatarFallback>
</Avatar>

              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{studentName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={()=>navigate('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive"
                onClick={handleLogout} // Logout Action
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
