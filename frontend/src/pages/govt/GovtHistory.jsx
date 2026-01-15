import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "../../components/common/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  Download
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8080";

export default function GovtHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_URL}/govt/subsidies/history`, { headers });
      setHistory(response.data.subsidies || []);
    } catch (error) {
      console.error("Error fetching govt history:", error);
      toast.error("Failed to load subsidy history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'DISBURSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading history...</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/govt/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Subsidy History
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Historical record of all processed subsidy applications.
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Processed Applications</CardTitle>
          <CardDescription>
            List of all approved, rejected, and disbursed subsidies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                header: 'Applicant',
                cell: (user) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                )
              },
              {
                header: 'Location',
                cell: (user) => (
                  <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>{user.city}, {user.state}</span>
                  </div>
                )
              },
              {
                header: 'System Details',
                cell: (user) => (
                  <div className="text-sm">
                    <Badge variant="outline" className="mr-2">
                      {user.plant_capacity_kw} kW
                    </Badge>
                  </div>
                )
              },
              {
                header: 'Status',
                accessorKey: 'subsidy_status',
                cell: (user) => (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeVariant(user.subsidy_status)}`}>
                    {user.subsidy_status}
                  </span>
                )
              },
              {
                header: 'Processed Date',
                accessorKey: 'updated_at',
                cell: (user) => (
                  <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(user.updated_at).toLocaleDateString()}</span>
                  </div>
                )
              },
              {
                header: 'Actions',
                cell: (user) => (
                  <div className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => window.location.href = `/users/${user.id}?view=true`}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>
                ),
                className: "text-right"
              }
            ]}
            data={history}
            emptyMessage="No historical records found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
