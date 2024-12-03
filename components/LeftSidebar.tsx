import React, { useState } from "react";
import { 
  Home, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";

const LeftSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarItem = ({ 
    icon: Icon, 
    label, 
    isCollapsed 
  }: { 
    icon: React.ElementType, 
    label: string, 
    isCollapsed: boolean 
  }) => (
    <div 
      className={`
        flex items-center 
        p-3 
        hover:bg-gray-100 
        cursor-pointer 
        transition-all 
        duration-300
        ${isCollapsed ? 'justify-center' : 'justify-start'}
      `}
    >
      <Icon className="w-5 h-5 mr-3" />
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </div>
  );

  return (
    <aside 
      className={`
        bg-white 
        border-r 
        h-full 
        transition-all 
        duration-300 
        ${isCollapsed ? 'w-16' : 'w-64'}
        relative
      `}
    >
      <div className="p-4 flex items-center justify-between border-b">
        {!isCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
        <button 
          onClick={toggleSidebar} 
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className="mt-4">
        <SidebarItem 
          icon={Home} 
          label="Home" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          isCollapsed={isCollapsed} 
        />
        <SidebarItem 
          icon={HelpCircle} 
          label="Support" 
          isCollapsed={isCollapsed} 
        />
      </nav>
    </aside>
  );
};

export default LeftSidebar;