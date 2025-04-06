
import React, { useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
// import NotificationPanel from "../../ui/NotificationPanel";


const Header= ({ studentName }) => {
  const [darkMode, setDarkMode] = useState(false);
  // const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-border h-16">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        <h1 className="text-lg font-medium">
          <span>Doctoral Student Portal</span>
        </h1>

        <div className="flex items-center gap-2">
          {/* <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="transition-all-200 hover:bg-accent/10"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} /> */}

          {/* <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="transition-all-200 hover:bg-accent/10"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden transition-all-200 hover:bg-accent/10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={studentName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {studentName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{studentName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={()=> navigate('/profileg')}>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive"
                onClick={handleLogout}
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