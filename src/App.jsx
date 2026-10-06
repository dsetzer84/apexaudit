import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AiFixModal from './components/AiFixModal.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import LandingPage from './pages/LandingPage.jsx';
import AuditDashboard from './pages/AuditDashboard.jsx';
import HistoryDashboard from './pages/HistoryDashboard.jsx';
import CompareHub from './pages/CompareHub.jsx';
import CompareDetail from './pages/CompareDetail.jsx';
import NotFound from './pages/NotFound.jsx';

import { runAudit, fallbackAudit } from './lib/auditClient.js';
import { useSchema } from './hooks/useSchema.js';

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Audit State
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [activeAudit, setActiveAudit] = useState(null);
  const [aiFixModal, setAiFixModal] = useState(null);

  // Progress animation shown while the backend audit is in flight.
  const runScanAnimation = () =>
    new Promise((resolve) => {
      const steps = [
        'Connecting to target server...',
        'Parsing DOM & Meta Tags...',
        'Evaluating Readability & Value Proposition...',
        'Measuring Core Web Vitals & Asset Overhead...',
        'Generating Contextual AI Copy Rewrites...',
      ];
      let idx = 0;
      setScanStep(steps[0]);
      const interval = setInterval(() => {
        idx += 1;
        if (idx < steps.length) {
          setScanStep(steps[idx]);
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 600);
    });

  // Real AI Audit Execution Logic — calls the serverless backend
  // (`/api/audit`), which fetches and analyses the target page for real.
  // The seeded demo engine is kept as an offline fallback.
  const handleRunAudit = async (e, customInputUrl = null) => {
    if (e) e.preventDefault();
    const input = customInputUrl || targetUrl || 'my-website.com';
    setIsScanning(true);
    setActiveAudit(null);

    await runScanAnimation();

    let resultData;
    try {
      resultData = await runAudit(input);
    } catch (err) {
      // Backend unavailable (e.g. local `vite dev` without `vercel dev`, or a
      // network failure) — fall back to the deterministic demo engine so the
      // UI still renders a result instead of an empty state.
      resultData = fallbackAudit(input, err);
    }

    setIsScanning(false);
    setActiveAudit(resultData);
    navigate('/app');
  };

  // Schema Injection Effect (Product + FAQPage + BreadcrumbList JSON-LD),
  // derived from the current route so breadcrumbs always match the URL.
  useSchema(pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-500 selection:text-black">
      <ScrollToTop />
      <Header />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                handleRunAudit={handleRunAudit}
                targetUrl={targetUrl}
                setTargetUrl={setTargetUrl}
                isScanning={isScanning}
              />
            }
          />
          <Route
            path="/app"
            element={
              <AuditDashboard
                activeAudit={activeAudit}
                isScanning={isScanning}
                scanStep={scanStep}
                targetUrl={targetUrl}
                setTargetUrl={setTargetUrl}
                handleRunAudit={handleRunAudit}
                setAiFixModal={setAiFixModal}
              />
            }
          />
          <Route path="/history" element={<HistoryDashboard handleRunAudit={handleRunAudit} />} />
          <Route path="/compare" element={<CompareHub />} />
          <Route path="/compare/:slug" element={<CompareDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AiFixModal aiFixModal={aiFixModal} setAiFixModal={setAiFixModal} />

      <Footer />
    </div>
  );
}
