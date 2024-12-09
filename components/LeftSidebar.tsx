import React, { useState } from "react";
import { 
  Home, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  CandyCane,
  Cannabis
} from "lucide-react";
import Link from "next/link";

const LeftSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarItem = ({ 
    icon: Icon, 
    label, 
    isCollapsed, 
    href, 
    openInNewTab = false,
  }: { 
    icon: React.ElementType; 
    label: string; 
    isCollapsed: boolean; 
    href?: string; 
    openInNewTab?: boolean; 
  }) => {
    const content = (
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

    return href ? (
      <a
        href={href}
        target={openInNewTab ? "_blank" : "_self"}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    ) : (
      <div>{content}</div>
    );
  };

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
          icon={CandyCane} 
          label="Home"
          href="/" 
          isCollapsed={isCollapsed} 
        />
        {/* <SidebarItem 
          icon={Cannabis} 
          label="Settings" 
          isCollapsed={isCollapsed} 
        /> */}
        <SidebarItem 
          icon={HelpCircle} 
          label="Support" 
          href="https://seasidesec.com" /// Navigate to Support
          openInNewTab={true} // Open in new tab
          isCollapsed={isCollapsed} 
        />
      </nav>
    </aside>
  );
};

export default LeftSidebar;
