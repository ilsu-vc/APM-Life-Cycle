import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Users, 
  Cpu, 
  Lock, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2,
  Edit2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export function Settings() {
  const { profile, updateProfileData } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'users'));
          const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
          setSystemUsers(usersData);
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'secretary' | 'agent') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setSystemUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          // Compress to a highly efficient JPEG Base64 string
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      let photoUrl = profile?.photoUrl || '';

      if (avatarFile) {
        // Bypass Firebase Storage entirely. Compress and save directly as a base64 string to Firestore!
        photoUrl = await compressImage(avatarFile);
      }

      await updateProfileData({
        firstName,
        lastName,
        photoUrl
      });
      
      setIsEditingProfile(false);
      setAvatarFile(null);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">System Settings</h2>
          <p className="text-zinc-500 font-medium">Manage your personal preferences and baseline configurations.</p>
        </div>
        {isAdmin && (
          <div className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-3 self-start md:self-center shadow-lg shadow-zinc-200">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Elevated Privileges Active</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm overflow-hidden group hover:border-zinc-300 transition-colors">
          <CardHeader className="bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-900" />
                <CardTitle className="text-xs font-black uppercase tracking-widest">Account Profile</CardTitle>
              </div>
              <Button 
                variant={isEditingProfile ? "default" : "ghost"} 
                size="sm" 
                onClick={() => {
                  if (isEditingProfile) {
                    setIsEditingProfile(false);
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  } else {
                    setIsEditingProfile(true);
                  }
                }}
                className={`h-8 gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${!isEditingProfile && 'hover:bg-zinc-900 hover:text-white border border-zinc-200 hover:border-zinc-900'}`}
              >
                <Edit2 className="w-3 h-3" /> {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
            <CardDescription className="text-xs font-medium">System identification and access metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6 font-sans">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-16 w-16 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-300 overflow-hidden flex-shrink-0 cursor-pointer group relative flex items-center justify-center"
                  >
                    {(avatarPreview || profile?.photoUrl) ? (
                      <>
                        <img src={avatarPreview || profile?.photoUrl} alt={profile?.displayName} className="h-full w-full object-cover group-hover:opacity-50 transition-opacity" referrerPolicy="no-referrer" />
                        <ImageIcon className="absolute w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-400 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Avatar Node</p>
                    <p className="text-xs text-zinc-500 font-medium">Click the image to upload a new profile picture from your device.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">First Name</Label>
                    <Input id="firstName" name="firstName" defaultValue={profile?.firstName} required className="rounded-xl border-2 border-zinc-100 h-10 focus:border-zinc-900 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Name</Label>
                    <Input id="lastName" name="lastName" defaultValue={profile?.lastName} required className="rounded-xl border-2 border-zinc-100 h-10 focus:border-zinc-900 transition-all font-bold" />
                  </div>
                </div>

                <Button type="submit" disabled={isUploading} className="w-full h-12 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-zinc-200 group mt-4">
                  {isUploading ? 'Propagating...' : 'Save Changes'} <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-zinc-100 border-2 border-zinc-50 overflow-hidden flex-shrink-0">
                    {profile?.photoUrl ? (
                      <img src={profile.photoUrl} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-xl text-zinc-300">
                        {profile?.displayName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black uppercase text-zinc-400">Authenticated Identity</p>
                      <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-zinc-200 py-0 h-4">{profile?.role}</Badge>
                    </div>
                    <p className="text-xl font-black text-zinc-900 truncate tracking-tight leading-none">{profile?.displayName || 'N/A'}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-1">{profile?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">First Name</p>
                    <p className="text-xs font-bold text-zinc-900">{profile?.firstName || '—'}</p>
                  </div>
                  <div className="bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Last Name</p>
                    <p className="text-xs font-bold text-zinc-900">{profile?.lastName || '—'}</p>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-dashed border-zinc-100 italic text-[10px] text-zinc-400 font-medium flex items-center justify-between">
              <span>Metadata synced via regional cluster.</span>
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Encrypted
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm opacity-60 grayscale-[0.5]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-400" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Notice</p>
               <p className="text-xs text-zinc-500 font-medium leading-relaxed">Alert thresholds are currently controlled at the organizational level to maintain system-wide sync stability.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Exclusive Sections */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-zinc-200" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 bg-white px-4">Administrative Engine</h3>
            <Separator className="flex-1 bg-zinc-200" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="border-emerald-100 shadow-xl shadow-emerald-50/50 col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="border-b border-emerald-50 bg-emerald-50/20">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-zinc-900 rounded-lg">
                       <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Role Authority</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                   <p className="text-xs text-zinc-500 font-medium mb-4">Modify permissions for agents on this regional node.</p>
                   
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 group hover:border-zinc-900 transition-all cursor-pointer">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-black text-[10px]">JD</div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-tight">John Doe</p>
                               <p className="text-[8px] text-zinc-400 font-bold uppercase">Active Agent</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase h-8 hover:bg-zinc-900 hover:text-white">Promote</Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 opacity-50">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-black text-[10px]">SA</div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-tight">System Auditor</p>
                               <p className="text-[8px] text-zinc-400 font-bold uppercase">External Partner</p>
                            </div>
                         </div>
                         <Badge variant="secondary" className="text-[8px] font-black uppercase">Read Only</Badge>
                      </div>

                      {systemUsers.map(user => (
                        <div key={user.uid} className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-100 group hover:border-zinc-300 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-[10px] overflow-hidden">
                                {user.photoUrl ? <img src={user.photoUrl} alt={user.displayName} className="w-full h-full object-cover" /> : user.displayName.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[100px]">{user.displayName}</p>
                                 <p className="text-[8px] text-zinc-400 font-bold uppercase truncate max-w-[100px]">{user.email}</p>
                              </div>
                           </div>
                           <Select value={user.role} onValueChange={(v: 'admin'|'secretary'|'agent') => handleRoleChange(user.uid, v)}>
                             <SelectTrigger className="w-[100px] h-8 text-[9px] font-black uppercase border-zinc-200">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="admin" className="text-[10px] font-bold uppercase">Admin</SelectItem>
                               <SelectItem value="secretary" className="text-[10px] font-bold uppercase">Secretary</SelectItem>
                               <SelectItem value="agent" className="text-[10px] font-bold uppercase">Agent</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>

             <Card className="border-zinc-900 shadow-xl col-span-1 md:col-span-2">
                <CardHeader className="bg-zinc-900 text-white border-none">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                           <Cpu className="w-4 h-4 text-white" />
                        </div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest">Global Configuration</CardTitle>
                      </div>
                      <Badge className="bg-emerald-500 text-[8px] uppercase tracking-tighter">Healthy</Badge>
                   </div>
                   <CardDescription className="text-zinc-400 text-xs">Direct control over the VMSPRO reactive core parameters.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between group">
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Maintenance Protocol</p>
                            <p className="text-[10px] text-zinc-500 font-medium">Bypass all regional locks for core updates.</p>
                         </div>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={maintenanceMode ? 'text-red-500' : 'text-zinc-300'}
                        >
                           {maintenanceMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                         </Button>
                      </div>

                      <div className="flex items-center justify-between group">
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Telemetry Debugging</p>
                            <p className="text-[10px] text-zinc-500 font-medium">Capture millisecond-latency sync logs.</p>
                         </div>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDebugLogs(!debugLogs)}
                          className={debugLogs ? 'text-emerald-500' : 'text-zinc-300'}
                        >
                           {debugLogs ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                         </Button>
                      </div>
                   </div>

                   <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 flex flex-col justify-between">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Core Integrity</p>
                         <div className="space-y-3">
                            <div className="flex items-center gap-2">
                               <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                               <span className="text-[10px] font-bold text-zinc-600">Database Sync: ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                               <span className="text-[10px] font-bold text-zinc-600">CDN Propagation: 100%</span>
                            </div>
                         </div>
                      </div>
                      <Button className="w-full mt-6 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest h-10">
                        Force System Sync
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        </motion.div>
      )}

      {!isAdmin && (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center">
           <Lock className="w-8 h-8 text-zinc-300 mx-auto mb-4" />
           <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Enterprise Features Locked</h4>
           <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto mt-2">Administrative controls for role management and system engine parameters are restricted to root administrators.</p>
        </div>
      )}
    </div>
  );
}
