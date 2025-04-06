import React from "react";
import PageLayout from "@/components/Co-ordinator/layout/Layout";
import { Card, CardContent,CardDescription,CardHeader, CardTitle,CardFooter } from "@/components/ui/card";

// import { UserCheck, Calendar, BookOpen, FileText, Clock, FilePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { UploadCloud, BookOpen, ClipboardCheck,ChevronRight} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Dashboardc= () => {
  // Sample data for DC meetings only
  const navigate= useNavigate();


  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Swayam Courses</CardTitle>
                <UploadCloud className="h-5 w-5 text-phd-accent" />
              </div>
              <CardDescription>
                Upload Swayam Course and View course log
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
              Upload Swayam courses via an Excel sheet and track student course requests along with the course log.
              </p>
              <CardFooter className="pt-1">
                <Button variant="ghost" size="sm" className="w-full justify-between" onClick={()=>navigate('/Cocourses')}>
                  <span>Go to Courses</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </CardContent>
          </Card>

          

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Comprehensive Exam </CardTitle>
                <ClipboardCheck className="h-5 w-5 text-phd-accent" />
              </div>
              <CardDescription>
                Manage comprehensive exam 
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-8">
              Announce exams, review student requests, and upload/view examination results.
              </p>
              <CardFooter className="pt-1">
                <Button variant="ghost" size="sm" className="w-full justify-between" onClick={()=>navigate('/cocompre')}>
                  <span>Go to Exam Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
          </div>
      </div>
    </PageLayout>
  );
};

export default Dashboardc;
