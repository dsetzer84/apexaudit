import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const navLinkClass = ({ isActive }) =>
  `hover:text-white transition ${isActive ? 'text-white' : ''}`;

export default function Header() {
  return (
    <header className="border-b border-zinc-800/80 sticky top-0 z-40 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center font-bold text-black text-xl shadow-lg glow-emerald">
            A
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            ApexAudit<span className="text-brand-500">.ai</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
          <NavLink to="/app" className={navLinkClass}>
            Audit Dashboard
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            Sample Scans
          </NavLink>
          <NavLink to="/compare" className={navLinkClass}>
            Comparisons
          </NavLink>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            to="/app"
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-zinc-950 font-semibold text-sm transition glow-emerald flex items-center space-x-2"
          >
            <span>Run Free Audit</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
