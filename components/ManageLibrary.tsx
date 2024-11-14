import { useEffect, useRef, useState } from "react";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {
  HandHelping,
  WandSparkles,
  LifeBuoyIcon,
  BookOpenText,
  ChevronDown,
  Send,
  Upload,
} from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { AiOutlineFilePdf } from 'react-icons/ai';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react"; // Import MoreHorizontal icon from lucide-react

const Table = ({ children, className }: any) => (
  <table className={`min-w-full ${className}`}>{children}</table>
);

const Tbody = ({ children }: any) => <tbody>{children}</tbody>;

const Tr = ({ children, className }: any) => (
  <tr className={`border-t ${className}`}>{children}</tr>
);

const Th = ({ children, className }: any) => (
  <th className={`text-left font-medium text-gray-600 ${className}`}>
    {children}
  </th>
);

const Td = ({ children, className }: any) => (
  <td className={`py-2 px-4 ${className}`}>{children}</td>
);

const ManageLibrary = () => {
  const [collections, setCollections] = useState([
    { id: 1, name: "Knowledge Base 1", items: 42 },
    { id: 2, name: "Knowledge Base 2", items: 25 },
    { id: 3, name: "Knowledge Base 3", items: 16 },
  ]);

  return (
    <div className="flex flex-col items-center pt-10">
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="flex-1 flex flex-col overflow-hidden pt-6 px-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Manage Library</h1>
            <Button className="gap-2">
              Add New Knowledge Base
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <thead>
                <Tr>
                  <Th className="border-b py-4 px-6">Knowledge Base</Th>
                  <Th className="border-b py-4 px-6">Documents</Th>
                  <Th className="border-b py-4 px-6">Actions</Th> {/* New column for actions */}
                </Tr>
              </thead>
              <Tbody>
                {collections.map((collection) => (
                  <Tr key={collection.id} className="hover:bg-gray-100">
                    <Td className="border-b py-4 px-6">{collection.name}</Td>
                    <Td className="border-b py-4 px-6">{collection.items}</Td>
                    <Td className="border-b py-4 px-6 text-right">
                      {/* Dropdown Menu with 3 dots */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreHorizontal /> {/* 3 dots icon from lucide-react */}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <div className="flex justify-end w-full">
            <Button size="sm">Save Changes</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ManageLibrary;
