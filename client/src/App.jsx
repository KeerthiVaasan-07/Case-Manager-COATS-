import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import useSpatialHover from './hooks/useSpatialHover';
import CustomCursor from './components/cyber/CustomCursor';
import { useAuth } from './context/AuthContext';
import CommandSidebar from './components/cyber/CommandSidebar';
import TopBar from './components/cyber/TopBar';
import GlobalSearch from './components/cyber/GlobalSearch';
import CaseDetailPanel from './components/cyber/CaseDetailPanel';
import AIAssistant from './components/cyber/AIAssistant';
import { useIdleSession, SecurityBanner, IdleWarning, SessionNotice } from './components/cyber/SessionGuard';
const CyberBackground = React.lazy(() => import('./components/cyber/CyberBackground'));

import LoginView from './components/LoginView';
import DemoLoginHelper from './components/DemoLoginHelper';
import SupervisoryDashboard from './components/SupervisoryDashboard';
import CaseRegistration from './components/CaseRegistration';
import ProgressUpdation from './components/ProgressUpdation';
import MyAssignedCases from './components/MyAssignedCases';

export default function App() {
  const { user, loading, isSupervisory, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [dossierCase, setDossierCase] = useState(null);
  const [progressCase, setProgressCase] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const reduce = useReducedMotion();
  useSpatialHover();
  const session = useIdleSession(!!user, logout);

  useEffect(() => {
    if (user) {
      setActiveTab(isSupervisory ? 'dashboard' : 'myCases');
    }
  }, [user?.username, user?.role]);

  // Global keyboard shortcut: Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader-scene" aria-hidden="true">
            <div className="loader-cube">{['f','b','l','r','t','u'].map(k => <i key={k} className={'face ' + k} />)}</div>
          </div>
          <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, fontWeight: 600, letterSpacing: '0.18em', marginTop: 34 }}>COATS</div>
          <div className="loader-bar"><span /></div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 12 }}>Opening secure investigation channel</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <CustomCursor />
        <SessionNotice />
        <LoginView onOpenDemoHelper={() => setIsDemoOpen(true)} />
        <DemoLoginHelper isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </>
    );
  }

  const navigateToProgress = (uid) => {
    setProgressCase(uid);
    setActiveTab('progress');
  };

  const handleCaseRegistered = (c) => {
    setProgressCase(c.unique_id);
    setActiveTab('progress');
  };

  const pageTitles = {
    dashboard: 'Command Center',
    myCases: 'My Assigned Cases',
    newCase: 'Case Intake (Step 1)',
    progress: 'Progress Updation (Step 2)',
    ai: 'COATS AI Investigation Engine',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <CustomCursor />
      <React.Suspense fallback={null}><div className="ambient-3d"><CyberBackground /></div></React.Suspense>

      {/* Collapsible Sidebar */}
      <CommandSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSupervisory={isSupervisory}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SecurityBanner left={session.left} />
        <TopBar
          pageTitle={pageTitles[activeTab] || activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenDemoHelper={() => setIsDemoOpen(true)}
        />

        <main id="main" tabIndex={-1} style={{ flex: 1, padding: '28px 32px', maxWidth: 1640, width: '100%', margin: '0 auto', perspective: 1400 }}>
          <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.975, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
          {activeTab === 'dashboard' && isSupervisory && (
            <SupervisoryDashboard onSelectCase={uid => setDossierCase(uid)} />
          )}
          {activeTab === 'myCases' && !isSupervisory && (
            <MyAssignedCases
              onNavigateToNewCase={() => setActiveTab('newCase')}
              onNavigateToProgress={navigateToProgress}
              onSelectCase={uid => setDossierCase(uid)}
            />
          )}
          {activeTab === 'newCase' && (
            <CaseRegistration
              onSuccess={handleCaseRegistered}
              onCancel={() => setActiveTab(isSupervisory ? 'dashboard' : 'myCases')}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressUpdation
              initialCaseId={progressCase}
              onUpdateSuccess={() => {}}
            />
          )}
          {activeTab === 'ai' && (
            <AIAssistant />
          )}
          </motion.div>
          </AnimatePresence>
        </main>

        <footer className="no-print" style={{
          borderTop: '1px solid var(--border)', background: 'rgba(7,12,24,0.7)', backdropFilter: 'blur(12px)',
          padding: '12px 32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          fontSize: 11.5, color: 'var(--faint)',
        }}>
          <span>COATS · Anti Terrorism Squad · Tamil Nadu Police</span>
          <span>{user?.username} · {user?.branch} Unit · {isSupervisory ? 'Level 1 Command' : 'Level 2 Case Officer'}</span>
        </footer>
      </div>

      <IdleWarning open={session.warning} left={session.left} onStay={session.extend} onLeave={() => session.signOut()} />

      {/* Global Search Palette */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={uid => setDossierCase(uid)}
      />

      {/* Case Details Slide-in Panel */}
      {dossierCase && (
        <CaseDetailPanel
          caseUniqueId={dossierCase}
          onClose={() => setDossierCase(null)}
          onUpdateProgress={navigateToProgress}
        />
      )}

      {/* Quick Switcher Modal */}
      <DemoLoginHelper isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
