import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// Define table components
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

// Define the props for the component
type ManageLibraryProps = {
  onSaveChanges: () => void;
  onAddKnowledgebase: () => void;
};

const ManageLibrary: React.FC<ManageLibraryProps> = ({
  onSaveChanges,
  onAddKnowledgebase,
}) => {
  const [collections, setCollections] = useState<{ id: number; name: string; items: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucketNames, setBucketNames] = useState(["demo-data-asg4563", "another bucket"]); // Example of multiple bucket names

  // Fetch collections data from the API for multiple buckets
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);

        // Create an array of promises for each bucket name
        const fetchPromises = bucketNames.map((bucketName) =>
          fetch(
            "https://iu150pbrqd.execute-api.us-east-1.amazonaws.com/dev/v1/get-knowledge",
            {
              method: "POST", // Use POST method
              headers: {
                "Content-Type": "application/json", // Ensure the request is JSON
              },
              body: JSON.stringify({
                bucket_name: bucketName, // Pass each bucket_name dynamically
              }),
            }
          ).then((response) => response.json())
        );

        // Wait for all fetch requests to complete
        const results = await Promise.all(fetchPromises);

        // Process each response
        const newCollections = results
          .filter((data) => data.status === "success") // Only include successful responses
          .map((data, index) => ({
            id: index + 1,
            name: data.data.bucket_name,
            items: data.data.object_count,
          }));

        setCollections(newCollections); // Update the state with the fetched collections
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [bucketNames]); // Re-fetch when bucketNames changes

  return (
    <div className="flex flex-col items-center pt-10">
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="flex-1 flex flex-col overflow-hidden pt-6 px-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Manage Library</h1>
            <Button className="gap-2" onClick={onAddKnowledgebase}>
              Add Knowledge
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <thead>
                <Tr>
                  <Th className="border-b py-4 px-6">Knowledge Base</Th>
                  <Th className="border-b py-4 px-6">Documents</Th>
                  <Th className="border-b py-4 px-6"></Th> {/* New column for actions */}
                </Tr>
              </thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td className="border-b py-4 px-6" colSpan={3}>
                      Loading collections...
                    </Td>
                  </Tr>
                ) : (
                  collections.map((collection) => (
                    <Tr key={collection.id} className="hover:bg-gray-100">
                      <Td className="border-b py-4 px-6">{collection.name}</Td>
                      <Td className="border-b py-4 px-6">{collection.items}</Td>
                      <Td className="border-b py-4 px-6 text-right">
                        {/* Dropdown Menu with 3 dots */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <div className="flex justify-end w-full">
            {/* Call onSaveChanges when Save Changes button is clicked */}
            <Button size="sm" onClick={onSaveChanges}>
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ManageLibrary;
