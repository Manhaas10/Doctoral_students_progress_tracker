import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // ✅ Single import statement
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PublicationHistory = () => {
  const { rollNumber } = useParams(); // ✅ Get roll number from URL
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/publications/history/student/${rollNumber}`);
        if (!response.ok) throw new Error("Failed to fetch publication history");

        const data = await response.json();
        console.log(data);
        setHistoryData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [rollNumber]);

  // ✅ Group history by `title` instead of `publicationId`
  const groupedHistory = historyData.reduce((acc, item) => {
    if (!acc[item.title]) {
      acc[item.title] = [];
    }
    acc[item.title].push(item);
    return acc;
  }, {});
  // Convert [2025, 3, 26] to a readable date format
const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length !== 3) return "Invalid Date";
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  

  // ✅ Define status colors
  const statusColors = {
    Submitted: "bg-gray-500 text-white",
    Published: "bg-blue-500 text-white",
    Accepted: "bg-green-500 text-white",
    "Editorial Revision": "bg-yellow-500 text-white",
    Rejected: "bg-red-500 text-white",
    Default: "bg-gray-400 text-gray-700",
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* ✅ Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Publication History</h1>
              <p className="text-gray-600 mt-1">Track the status history of your publications</p>
            </div>
            <Link to="/publicationsg">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {/* ✅ Loading & Error Handling */}
          {loading && <p className="text-gray-500">Loading history...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* ✅ Render History Data */}
          {!loading && !error && (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([title, histories]) => (
                <div key={title} className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
                  <div className="relative border-l-2 border-gray-200 ml-3 pl-8 space-y-6">
                    {histories.map((history, index) => (
                      <div key={index} className="relative">
                        {/* ✅ Timeline Dot */}
                        <div className="absolute -left-10 top-0 h-6 w-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                          <div className={`h-3 w-3 rounded-full ${statusColors[history.status] || statusColors.Default}`}></div>
                        </div>

                        {/* ✅ Status Card */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <h3 className="font-medium text-gray-900">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-2 ${statusColors[history.status] || statusColors.Default}`}>
                                {history.status}
                              </span>
                            </h3>
                            {/* <span className="text-sm text-gray-500">{history.dateOfSubmission}</span> */}
                            <span className="text-sm text-gray-500">{formatDate(history.dateOfSubmission)}</span>

                          </div>
                          <p className="mt-2 text-gray-600">{history.publishername}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PublicationHistory;
