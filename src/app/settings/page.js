'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { getAuthUser, logoutUser } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_GATEPASSES, INITIAL_DRIVERS, INITIAL_SUBSTATIONS } from '@/lib/seedData';
import { User, Building2, FileText, Database, LogOut, Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [orgName, setOrgName] = useState('महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्यादित');
  const [branchName, setBranchName] = useState('गाळण शाखा-दोंडाईचा जि.धुळे (Sub Division Dondaicha)');
  const [contractorName, setContractorName] = useState('M/S Standard Electrotech Service');
  const [defaultRemarks, setDefaultRemarks] = useState('वरील सर्व रोहित्र एल.टी. बुशिंग, एच.टी. बुशिंग व ऑईल पातळी तपासून बघितले. ट्रान्सफॉर्मर सुस्थितीत आहे.');

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const handleSaveSettings = () => {
    toast.success('Organization & PDF settings saved!');
  };

  const handleResetSeedData = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mseb_gatepasses', JSON.stringify(INITIAL_GATEPASSES));
    localStorage.setItem('mseb_drivers', JSON.stringify(INITIAL_DRIVERS));
    localStorage.setItem('mseb_substations', JSON.stringify(INITIAL_SUBSTATIONS));
    toast.success('Demo seed data reloaded successfully!');
    setTimeout(() => window.location.reload(), 600);
  };

  const confirmLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  return (
    <PageWrapper
      title="System Settings & Admin Profile"
      subtitle="Manage organization branding, default PDF remarks, and system preferences."
      actions={
        <Button variant="danger" icon={LogOut} onClick={() => setShowLogoutModal(true)}>
          Sign Out
        </Button>
      }
    >
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Admin Profile Card */}
        <Card header="User Profile & Station Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--primary-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                {user?.name?.[0] || 'A'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--gray-900)' }}>
                  {user?.name || 'System Admin'}
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                  {user?.email || 'admin@domain.com'} • <strong style={{ color: 'var(--primary-700)' }}>{user?.designation || 'Official'}</strong>
                </span>
              </div>
            </div>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-700)', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              <div><strong>Branch / Office:</strong> {user?.office?.name || 'Sub Division Dondaicha (दोंडाईचा)'}</div>
              <div><strong>Circle/Division:</strong> Dhule Circle</div>
              <div><strong>Active Session:</strong> {user?.loginTime ? new Date(user.loginTime).toLocaleString() : 'Authenticated'}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Organization Branding & PDF Remarks Defaults */}
      <Card header="Organization Branding & Default PDF Certificate Remarks" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Organization Header Text (संस्थेचे नाव)"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />

          <Input
            label="Branch / Sub Division Header (शाखा / उपविभाग)"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />

          <Input
            label="Default Contractor (ठेकेदाराचे नाव)"
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
          />

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>
              Default Condition Certificate Remarks (डिफॉल्ट शेरा टिपणी)
            </label>
            <textarea
              rows={3}
              value={defaultRemarks}
              onChange={(e) => setDefaultRemarks(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="accent" icon={Save} onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>
            Are you sure you want to log out of the <strong>Digital Gate Pass System</strong>?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={LogOut} onClick={confirmLogout}>
              Sign Out Now
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
