import React, { useState } from 'react';
import { User, Mail, Phone, Link, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProfileCard = ({ profileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(profileData);
  const [tempProfile, setTempProfile] = useState(profileData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  return (
    <Card className="card-transition">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Profile Information</CardTitle>
          {/* {!isEditing && (
            <Button onClick={() => setIsEditing(f)} variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          )} */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm" className="text-xs w-full">
                Change Photo
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField icon={User} label="Full Name" name="name" value={tempProfile.name}  />
              <ProfileField icon={User} label="Roll Number" value={profile.rollNumber} />
              <ProfileField icon={Mail} label="Email" value={profile.email} />
              <ProfileField icon={Link} label="ORCID ID" name="orcid" value={tempProfile.orcid}  fullWidth />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={handleCancel} variant="outline" size="sm" className="gap-1">
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleSave} variant="default" size="sm" className="gap-1">
                  <Check className="h-4 w-4" /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfileField = ({ icon: Icon, label, name, value, isEditing, onChange, fullWidth }) => (
  <div className={`space-y-2 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    {isEditing && onChange ? (
      <Input name={name} value={value} onChange={onChange} className="h-9" />
    ) : (
      <p className="font-medium">{value}</p>
    )}
  </div>
);

export default ProfileCard;
