'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

export default function AppTopbar({ email = '', publicUrl = '', showAdmin = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('mobileMenuOpen');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('mobileMenuOpen');
    };
  }, [open]);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/login');
  }

  const primaryItems = [
    { href: '/dashboard', label: t.dashboard },
    { href: '/analytics', label: t.analytics },
    { href: '/radar-skill', label: t.radarSkill },
    { href: '/ai-tools', label: t.aiTools }
  ];

  const secondaryItems = [
    { href: '/consultation', label: t.consultation }
  ];

  const adminItem = showAdmin ? [{ href: '/admin', label: 'Admin' }] : [];
  const allItems = [...primaryItems, ...secondaryItems, ...adminItem];

  function isActive(href) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  const navLink = (item, extraClass = '') => (
    <Link
      key={item.href}
      href={item.href}
      className={`navLink ${extraClass} ${isActive(item.href) ? 'active' : ''}`.trim()}
      onClick={() => setOpen(false)}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="topbar topbarShell">
      <div className="topbarInner">
        <Link href="/dashboard" className="brandBlock brandLink" onClick={() => setOpen(false)}>
          <strong>QR Curriculum</strong>
          {email && <span>{email}</span>}
        </Link>

        <nav className="topbarDesktopNav" aria-label="Navigazione principale">
          <div className="navGroup mainNavGroup">{primaryItems.map(item => navLink(item, 'primaryNav'))}</div>
          <div className="navGroup secondaryNavGroup">{secondaryItems.map(item => navLink(item))}</div>
          <div className="navGroup utilityNavGroup">
            {showAdmin && navLink({ href: '/admin', label: 'Admin' }, 'adminNav')}
            {publicUrl && (
              <a className="navLink publicNav" href={publicUrl} target="_blank" rel="noreferrer">
                {t.publicProfile}
              </a>
            )}
            <LanguageToggle />
            {email && <button type="button" className="navAction logoutBtn" onClick={logout}>{t.logout}</button>}
          </div>
        </nav>

        <button
          type="button"
          className="mobileMenuToggle"
          aria-label={open ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={open}
          aria-controls="mobile-main-navigation"
          onClick={() => setOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && <button type="button" className="mobileScrim" aria-label="Chiudi menu" onClick={() => setOpen(false)} />}

      <aside id="mobile-main-navigation" className={`mobileDrawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobileDrawerHeader">
          <div>
            <strong>QR Curriculum</strong>
            {email && <span className="mobileUser">{email}</span>}
          </div>
          <button type="button" className="mobileClose" aria-label="Chiudi menu" onClick={() => setOpen(false)}>×</button>
        </div>

        <nav className="mobileDrawerNav" aria-label="Menu mobile">
          {allItems.map(item => navLink(item))}
          {publicUrl && (
            <a className="navLink publicNav" href={publicUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              {t.publicProfile}
            </a>
          )}
          <div className="mobileDrawerFooter">
            <LanguageToggle />
            {email && <button type="button" className="navAction logoutBtn" onClick={logout}>{t.logout}</button>}
          </div>
        </nav>
      </aside>
    </header>
  );
}