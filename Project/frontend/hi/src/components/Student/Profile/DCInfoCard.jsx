import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Save, Mail, Edit } from 'lucide-react';

const isValidEmail = (email) => {
  // Simple regex for email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const DCInfoCard = ({ dcData, onUpdate, readOnly }) => {
  const [editableData, setEditableData] = useState({
    chair: { ...dcData.chair },
    supervisor: { ...dcData.supervisor },
    members: [...dcData.members],
  });
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when dcData prop changes.
  useEffect(() => {
    setEditableData({
      chair: { ...dcData.chair },
      supervisor: { ...dcData.supervisor },
      members: [...dcData.members],
    });
  }, [dcData]);

  const handlePersonChange = (category, field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleMemberChange = (id, field, value) => {
    setEditableData((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));
  };

  // const addMember = () => {
  //   // New members have id: null
  //   setEditableData((prev) => ({
  //     ...prev,
  //     members: [...prev.members, { id: null, name: '', email: '' }],
  //   }));
  // };

  const addMember = () => {
    // Generate a temporary unique id for new members.
    const newMember = { id: Date.now() + Math.random(), name: '', email: '' };
    setEditableData((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  const removeMember = (id) => {
    setEditableData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== id),
    }));
  };

  const handleSave = () => {
    // Validate email fields before saving
    if (!isValidEmail(editableData.chair.email)) {
      alert("Please enter a valid email address for DC Chair.");
      return;
    }
    if (!isValidEmail(editableData.supervisor.email)) {
      alert("Please enter a valid email address for PhD Supervisor.");
      return;
    }
    for (let member of editableData.members) {
      if (!isValidEmail(member.email)) {
        alert("Please enter a valid email address for all DC members.");
        return;
      }
    }
    onUpdate(editableData);
    setIsEditing(false);
  };

  return (
    <Card className="w-full p-4 border border-gray-200 shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Doctoral Committee Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* DC Chair Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">DC Chair</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input
                value={editableData.chair.name}
                placeholder="Name"
                onChange={(e) => handlePersonChange('chair', 'name', e.target.value)}
                disabled={readOnly || !isEditing}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Input
                  value={editableData.chair.email}
                  placeholder="Email"
                  onChange={(e) => handlePersonChange('chair', 'email', e.target.value)}
                  onBlur={(e) => {
                    if (!isValidEmail(e.target.value)) {
                      alert("Please enter a valid email address for DC Chair.");
                    }
                  }}
                  disabled={readOnly || !isEditing}
                />
                {editableData.chair.email && (
                  <a
                    href={`mailto:${editableData.chair.email}`}
                    className="absolute right-3 top-[55%] -translate-y-1/2 text-primary hover:text-primary/80"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* PhD Supervisor Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">PhD Supervisor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input
                value={editableData.supervisor.name}
                placeholder="Name"
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Input
                  value={editableData.supervisor.email}
                  placeholder="Email"
                  disabled={true}
                />
                {editableData.supervisor.email && (
                  <a
                    href={`mailto:${editableData.supervisor.email}`}
                    className="absolute right-3 top-[55%] -translate-y-1/2 text-primary hover:text-primary/80 custom-transition"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* DC Members Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">DC Members</h3>
            {(!readOnly && isEditing) && (
              <Button
                onClick={addMember}
                variant="outline"
                size="sm"
                className="text-primary border-primary/40 hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            )}
          </div>
          {editableData.members.map((member, index) => (
            <div key={member.id ?? index} className="p-4 border border-gray-300 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Member {index + 1}</h4>
                {(!readOnly && isEditing && editableData.members.length > 1) && (
                  <Button
                    onClick={() => removeMember(member.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-100 h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <Input
                    value={member.name}
                    placeholder="Member Name"
                    onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                    disabled={readOnly || !isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="relative">
                    <Input
                      value={member.email}
                      placeholder="Member Email"
                      onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                      onBlur={(e) => {
                        if (!isValidEmail(e.target.value)) {
                          alert("Please enter a valid email address for all DC members.");
                        }
                      }}
                      disabled={readOnly || !isEditing}
                    />
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="absolute right-3 top-[55%] -translate-y-1/2 text-primary hover:text-primary/80 custom-transition"
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {editableData.members.length === 0 && (
            <div className="text-center p-6 border border-dashed border-gray-400 rounded-lg">
              <p className="text-gray-500">No DC members added. Click 'Add Member' to add.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {!readOnly && (
          <>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
              variant="outline"
            >
              <Edit className="h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default DCInfoCard;
