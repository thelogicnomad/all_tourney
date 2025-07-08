import { Search, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";


import { toast } from "react-toastify";


import { OrganizerContext } from "../Contexts/OrganizerContext/OrganizerContext";
import { useContext } from "react";


import { PlayerContext } from "../Contexts/PlayerContext/PlayerContext";




const Navigation = () => {

  const { isOrganizerLoggedIn, backend_URL, setOrganizerData, setIsOrganizerLoggedIn, getAuthStatusOrganizer } = useContext(OrganizerContext);

  const { isPlayerLoggedIn, setIsPlayerLoggedIn, playerData,setPlayerData, playerMail,setPlayerMail, getAuthStatusPlayer } = useContext(PlayerContext);


  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navigate = useNavigate();

  console.log(isPlayerLoggedIn,playerData);


  const handleLogOut = async(evt)=>{
    try{
          const fetchOptions = {
            method:"POST",
            credentials:"include",
          }

          const response = await fetch(`${backend_URL}/api/player/logout`,fetchOptions);
          const data = await response.json();

          if(data.success){
            toast.success(data.message);
            setIsPlayerLoggedIn(false);
            setPlayerData(false);
            getAuthStatusPlayer();
            navigate('/');
            console.log("Player Logged Out Successfully");
          }else{
            console.log("Error In LogOut Route Frontend Player",data.message);
            toast.error(data.message);
          }

        }catch(error){
          console.log("Error In LogOut Route Frontend Player",error);
          toast.error(`Error In LogOut Route Player Side ${error}`);
        }
  }








  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isHomePage ? "bg-transparent" : "bg-white shadow-sm"}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`hover:text-primary transition-colors ${isHomePage ? "text-white" : "text-gray-700"}`}>
              Home
            </Link>
            <Link to="/events" className={`hover:text-primary transition-colors ${isHomePage ? "text-white" : "text-gray-700"}`}>
              Events
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Sports"
                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Location and Auth */}
          <div className="flex items-center space-x-4">
            <select className={`hidden md:flex items-center space-x-2 ${isHomePage ? "text-white" : "text-gray-700"} `}>
              {/* <MapPin className="w-4 h-4" /> */}
              <option className="text-black">Bengaluru</option>
              <option className="text-black">Delhi</option>
              <option className="text-black">Kolkatha</option>
            </select>

            {/* {user ? (
              <div className="flex items-center space-x-2">
                <Link to={getDashboardLink()}>
                  <Button className="bg-primary hover:bg-primary/90 text-white">Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={logout}
                  className={isHomePage ? "text-black border-white hover:bg-white hover:text-gray-900" : ""}
                >
                  Logout
                </Button>
              </div>
            ) : ( */}


            {
              isPlayerLoggedIn?
              <div>
                   <Button className="bg-red-500 hover:bg-primary/90 text-white cursor-pointer" onClick={()=>{ handleLogOut() }}>Log Out</Button>
                </div> :
                <Link to="/roleSelection">
                   <Button className="bg-red-500 hover:bg-primary/90 text-white cursor-pointer">Login</Button>
                </Link> 
            }
           
                
             

              

            {/* )} */}

            <Button variant="ghost" size="icon" className={`md:hidden ${isHomePage ? "text-white" : "text-gray-700"}`}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
