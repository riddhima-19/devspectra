// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authAPI } from '../api/services';
import PageLayout from '../components/layout/PageLayout';
import { Button, Input, Textarea, Card } from '../components/ui';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [form,   setForm]   = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    const res = await updateProfile(form);
    if (res.success) toast.success('Profile updated');
    else toast.error(res.error || 'Update failed');
    setSaving(false);
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      return toast.error('Passwords do not match');
    }
    setChangingPw(true);
    try {
      await authAPI.updatePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-ds-text mb-8">Profile Settings</h1>

          {/* Avatar + stats */}
          <Card className="p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ds-accent to-ds-pink flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-display font-semibold text-ds-text">{user?.name}</p>
              <p className="text-sm text-ds-muted">{user?.email}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-ds-muted">
                  <span className="text-ds-accent font-medium">{user?.stats?.totalProjects || 0}</span> projects
                </span>
                <span className="text-xs text-ds-muted">
                  <span className="text-ds-accent font-medium">{user?.stats?.totalAnalyses || 0}</span> analyses
                </span>
              </div>
            </div>
          </Card>

          {/* Profile form */}
          <Card className="p-6 mb-6 space-y-4">
            <h2 className="text-base font-display font-semibold text-ds-text">Personal Information</h2>
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
            <Textarea label="Bio" value={form.bio} rows={3}
              placeholder="Tell us about yourself..."
              onChange={e => setForm({ ...form, bio: e.target.value })}/>
            <div className="flex justify-end">
              <Button onClick={saveProfile} loading={saving}>Save Changes</Button>
            </div>
          </Card>

          {/* Password */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-display font-semibold text-ds-text">Change Password</h2>
            <Input label="Current Password" type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}/>
            <Input label="New Password" type="password" value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}/>
            <Input label="Confirm New Password" type="password" value={pwForm.confirm}
              onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}/>
            <div className="flex justify-end">
              <Button onClick={changePassword} loading={changingPw} variant="secondary">
                Update Password
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
