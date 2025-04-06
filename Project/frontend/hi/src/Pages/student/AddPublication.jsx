import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Student/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios'; // Make sure axios is imported

const AddPublication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [student, setStudent] = useState(null); // Initialize student state

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          withCredentials: true
        });

        if (response.data && response.data.name && response.data.email && response.data.rollNumber) {
          setStudent({
            name: response.data.name,
            email: response.data.email,
            rollNumber: response.data.rollNumber,
            orcidId: response.data.orcid || "",
            researchArea: response.data.areaofresearch || ""
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const rollNo = student ? student.rollNumber : ''; // Ensure rollNo is safely accessed

  const [formData, setFormData] = useState({
    title: '',
    publishername: '',
    doi: '',
    publicationType: '',
    quartile: '',
    status: '',
    journal: '',
    indexing: '',
    dateOfSubmission: new Date().toISOString().split('T')[0],
  });
console.log(formData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSwitchChange = (checked) => {
  //   setFormData(prev => ({ ...prev }));
  // };
  const handleBack = () => {
    navigate('/publication');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.publicationType.trim()) newErrors.publicationType = 'Type of Publication is required';
    if (!formData.publishername.trim()) newErrors.Publishername = 'Publisher name is required';
    if (!formData.indexing.trim()) newErrors.indexing = 'indexing is required';
    if (!formData.quartile.trim()) newErrors.quartile = 'category quartile is required';
    if (!formData.status.trim()) newErrors.status = 'status is required';
    if (!formData.doi.trim()) {
      newErrors.doi = 'DOI is required';
    } else if (!/^10\.\d{4,}\/\S+$/.test(formData.doi)) {
      newErrors.doi = 'Invalid DOI format (10.xxxx/xxxxx)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      const payload = { ...formData, rollNo };
  
      // ✅ First API call - Add publication
      const response = await axios.post('http://localhost:8080/api/publications/add', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status >= 200 && response.status < 300) { // Success range
        toast({ title: "Success", description: "Publication added successfully!", variant: "default" });
  
        // ✅ Second API call - Store in history table
        await axios.post('http://localhost:8080/api/publications/history/add', payload, {
          headers: { 'Content-Type': 'application/json' },
        });
  
        // Redirect after a small delay
        setTimeout(() => {
          navigate('/publication');
        }, 500);
      } else {
        throw new Error('Failed to add publication');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save publication. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setFormData({
      title: '',
    publishername: '',
    doi: '',
    publicationType: 'Journal',
    quartile: 'q1',
    status: 'Submitted',
    journal: '',
    indexing: '',
      // sendCopyToCoordinator: false
    });
    setErrors({});
  };
  

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/publication')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add Publication</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Publication Details</CardTitle>
            <CardDescription>Enter the details of your research paper or publication</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <Label>DOI Link <span className="text-destructive">*</span></Label>
              <Input name="doi" placeholder="Enter DOI link" value={formData.doi} onChange={handleInputChange} className={errors.doi ? "border-destructive" : ""} />
              {errors.doi && <p className="text-sm text-destructive">{errors.doi}</p>}

              <Label>Research Paper Title <span className="text-destructive">*</span></Label>
              <Input name="title" placeholder="Enter title" value={formData.title} onChange={handleInputChange} className={errors.title ? "border-destructive" : ""} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              <Label>Type of Publication<span className="text-destructive">*</span></Label>
              <Select value={formData.publicationType} onValueChange={(value) => handleSelectChange('publicationType', value)}>
                <SelectTrigger><SelectValue placeholder="Select publication type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Journal">Journal</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Bookchapter">Book chapter</SelectItem>
                  <SelectItem value="Patent">Patent</SelectItem>
                </SelectContent>
              </Select>
              {errors.publicationType && <p className="text-sm text-destructive">{errors.publicationType}</p>}

              <Label>Publisher Name <span className="text-destructive">*</span></Label>
              <Input name="publishername" placeholder="Enter publisher name" value={formData.publishername} onChange={handleInputChange} className={errors.journal ? "border-destructive" : ""} />
              {errors.Publishername && <p className="text-sm text-destructive">{errors.Publishername}</p>}
              <Label>Journal</Label>
              <Input name="journal" placeholder="journal" value={formData.journal} onChange={handleInputChange} className={errors.journal ? "border-destructive" : ""} />
              {/* {errors.journal && <p className="text-sm text-destructive">{errors.journal}</p>} */}

              <Label>Indexing<span className="text-destructive">*</span></Label>
              <Select value={formData.indexing} onValueChange={(value) => handleSelectChange('indexing', value)}>
                <SelectTrigger><SelectValue placeholder="Select Indexing" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web of Science">Web of Science</SelectItem>
                  <SelectItem value="scopus">Scopus</SelectItem>
                  <SelectItem value="google scholar">Google Scholar</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
              {errors.indexing && <p className="text-sm text-destructive">{errors.indexing}</p>}
              <Label>Category Quartile<span className="text-destructive">*</span></Label>
              <Select value={formData.quartile} onValueChange={(value) => handleSelectChange('quartile', value)}>
                <SelectTrigger><SelectValue placeholder="Select quartile" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Q1</SelectItem>
                  <SelectItem value="q2">Q2</SelectItem>
                  <SelectItem value="q3">Q3</SelectItem>
                  <SelectItem value="q4">Q4</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
              {errors.quartile && <p className="text-sm text-destructive">{errors.quartile}</p>}

              <Label>Publication Status<span className="text-destructive">*</span></Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Editorial Revision">Editorial Revision</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}

              {/* <Label>Send Copy to Coordinator</Label> */}
              {/* <Switch checked={formData.sendCopyToCoordinator} onCheckedChange={handleSwitchChange} /> */}

              <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
                <Button disabled={loading} type="submit">
                  {loading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {loading ? "Submitting..." : "Submit"}
                </Button>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddPublication;
