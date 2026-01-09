import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';

// Pages (index.tsx inside each folder)
import Home from '@/Pages/Home';
import Dashboard from '@/Pages/Dashboard';
import Analytics from '@/Pages/Analytics';
import Profile from '@/Pages/Profile';
import SavedJobs from '@/Pages/SavedJobs';
import Upload from '@/Pages/Upload';
import Settings from '@/Pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
