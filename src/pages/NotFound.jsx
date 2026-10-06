import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <Breadcrumb className="mb-8 text-left" />

      <div className="text-6xl font-black text-brand-500 mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-3">This page could not be found</h1>
      <p className="text-zinc-400 text-sm mb-8">
        The URL you requested is not part of ApexAudit AI. Head back to the audit dashboard and
        scan a site instead.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-zinc-950 font-bold text-sm glow-emerald transition"
      >
        <span>Back to ApexAudit AI</span>
        <Icon name="arrow-right" className="w-4 h-4" />
      </Link>
    </div>
  );
}
