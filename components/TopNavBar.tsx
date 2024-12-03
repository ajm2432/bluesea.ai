"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { themes } from "@/styles/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HandHelping,
  WandSparkles,
  LifeBuoyIcon,
  BookOpenText,
  ChevronDown,
  Send,
  Upload,
} from "lucide-react";
// Define color themes
const themeColors = {
  neutral: "#000000",
  red: "#EF4444",
  violet: "#8B5CF6",
  blue: "#3B82F6",
  tangerine: "#F97316",
  emerald: "#10B981",
  amber: "#F59E0B",
} as const;

type ThemeName = keyof typeof themes;

// ColorCircle component for selecting theme colors
const ColorCircle = ({
  themeName,
  isSelected,
}: {
  themeName: ThemeName;
  isSelected: boolean;
}) => (
  <div
    className="relative border flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
    style={{ backgroundColor: themeColors[themeName] }}
  >
    {isSelected && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Check className="text-white" size={12} />
      </div>
    )}
  </div>
);

interface TopNavBarProps {
  onLogout: () => void;
  onManageLibraryClick: () => void; // Function to handle "Manage Library" click
}

// Define a type for tools
type Tool = {
  id: string;
  name: string;
};

// Add tools data
const tools: Tool[] = [
  { id: "tool1", name: "Personal AI" },
  { id: "tool2", name: "Report Creator" },
  { id: "tool3", name: "PowerPoint Creator" },
];

const TopNavBar: React.FC<TopNavBarProps> = ({ onLogout, onManageLibraryClick }) => {
  const { theme, setTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState<ThemeName>("blue");
  const [selectedtool, setSelectedtool] = useState(tools[0].id); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedColorTheme = (localStorage.getItem("color-theme") ||
      "blue") as ThemeName;
    setColorTheme(savedColorTheme);
    applyTheme(savedColorTheme, theme === "dark");
  }, [theme]);

  const applyTheme = (newColorTheme: ThemeName, isDark: boolean) => {
    const root = document.documentElement;
    const themeVariables = isDark
      ? themes[newColorTheme].dark
      : themes[newColorTheme].light;

    Object.entries(themeVariables).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value as string);
    });
  };

  const handleThemeChange = (newColorTheme: ThemeName) => {
    setColorTheme(newColorTheme);
    localStorage.setItem("color-theme", newColorTheme);
    applyTheme(newColorTheme, theme === "dark");
  };

  const handleModeChange = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    if (mode !== "system") {
      applyTheme(colorTheme, mode === "dark");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className="text-foreground p-4 flex justify-between items-center">
      <div className="font-bold text-xl flex gap-2 items-center">
        <Image
          src="/wave.png"
          alt="Wave Logo"
          width={30}
          height={30}
        />
        <h2
          style={{
            color: theme === "dark" ? "#fff" : "#333",
            margin: 0,
          }}
        >
          SeasideSec AI Solutions
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ColorCircle themeName={colorTheme} isSelected={false} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(themes) as ThemeName[]).map((themeName) => (
              <DropdownMenuItem
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                className="flex items-center gap-2"
              >
                <ColorCircle
                  themeName={themeName}
                  isSelected={colorTheme === themeName}
                />
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleModeChange("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-grow text-muted-foreground sm:flex-grow-0"
            >
              {tools.find((tool) => tool.id === selectedtool)?.name || "Select tool"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {tools.map((tool) => (
            <DropdownMenuItem
              key={tool.id}
              onSelect={() => setSelectedtool(tool.id)}
            >
              {tool.name}
            </DropdownMenuItem>
          ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
        {/* Manage Library Button, triggers the passed function to toggle visibility */}
        <Button variant="outline" onClick={onManageLibraryClick}>
          Manage Library
        </Button>
        <Button variant="outline" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default TopNavBar;
