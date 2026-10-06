import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-10 bg-zinc-950 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white">ApexAudit AI</span>
          <span>© 2026 All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/compare" className="hover:text-zinc-300">
            SEO Competitor Hub
          </Link>
          <Link to="/compare/surfer-seo" className="hover:text-zinc-300">
            Surfer SEO Alternative
          </Link>
          <Link to="/compare/ahrefs" className="hover:text-zinc-300">
            Ahrefs Alternative
          </Link>
        </div>
      </div>
    </footer>
  );
}
