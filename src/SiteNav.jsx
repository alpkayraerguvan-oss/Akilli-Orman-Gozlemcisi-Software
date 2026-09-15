import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
import { isStandaloneDisplay } from "./pwa.js";
import { clerkAppearance, useClerkFlag } from "./clerkFlag.js";
import { useDemo, writeDemo } from "./demoFlag.js";
import { CookieBanner, FontConsent } from "./CookieBanner.jsx";
import { LEGAL_LINKS } from "./legalPagesCopy.js";
import { navPacks, overlayLinks } from "./navPacks.js";
import { useLang } from "./lang.js";

export { DESKTOP_TABS, NAV_PACKS } from "./navPacks.js";

function TabLinks({ tabs, onPick }) {
  return tabs.map((tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      end={tab.end}
      aria-label={tab.ariaLabel}
      title={tab.ariaLabel}
      className={({ isActive }) => [tab.tone, isActive ? "is-on" : undefined].filter(Boolean).join(" ")}
      onClick={onPick}
    >
      {tab.label}
    </NavLink>
  ));
}

function ClerkButtons() {
  const { isLoaded, isSignedIn } = useUser();
  const demo = useDemo();
  const { copy } = useLang();
  if (!isLoaded && !demo) return <span>{copy.chrome.hesap}</span>;
  if (isSignedIn) return <UserButton afterSignOutUrl="/" />;
  if (demo) {
    return (
      <div className="nav-auth">
        <span className="nav-demo">{copy.chrome.demo}</span>
        <button type="button" className="hit ghost" onClick={() => writeDemo(false)}>
          {copy.chrome.demoCikis}
        </button>
      </div>
    );
  }
  return (
    <div className="nav-auth">
      <SignInButton mode="modal" appearance={clerkAppearance}>
        <button type="button" className="hit ghost">
          {copy.chrome.giris}
        </button>
      </SignInButton>
      <SignUpButton mode="modal" appearance={clerkAppearance}>
        <button type="button" className="hit">
          {copy.chrome.kayit}
        </button>
      </SignUpButton>
    </div>
  );
}

function ClerkAuth() {
  if (!useClerkFlag()) return null;
  return <ClerkButtons />;
}

export function SiteNav({ product = "demo" }) {
  const dialogRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const { lang, setLang, copy } = useLang();
  const packsAll = navPacks(lang);
  const legal = LEGAL_LINKS.map((item) => ({
    ...item,
    label: copy.legal[item.id] || item.label,
  }));

  useEffect(() => {
    setStandalone(
      isStandaloneDisplay({
        displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
        iosStandalone: Boolean(window.navigator.standalone),
      }),
    );
  }, []);

  const packs = standalone
    ? packsAll.flatMap((pack) => {
        const tabs = pack.tabs.filter((tab) => tab.to !== "/cihaz");
        const overlay = (pack.overlay || pack.tabs).filter((tab) => tab.to !== "/cihaz");
        if (!tabs.length && !overlay.length && !pack.specs) return [];
        return [{ ...pack, tabs, overlay }];
      })
    : packsAll;
  const barPacks = packs.filter((pack) => pack.id !== "kutu");
  const kutuPack = packs.find((pack) => pack.id === "kutu");

  useEffect(() => {
    return () => {
      try {
        dialogRef.current?.close();
      } catch {
        /* already closed */
      }
    };
  }, []);

  function openMenu() {
    try {
      const d = dialogRef.current;
      if (d && !d.open) d.showModal();
    } catch {
      /* already open */
    }
    setMenuOpen(true);
  }

  function closeMenu() {
    try {
      const d = dialogRef.current;
      if (d?.open) d.close();
    } catch {
      /* already closed */
    }
    setMenuOpen(false);
  }

  return (
    <>
      <a className="skip" href="#icerik">
        {copy.nav.skip}
      </a>
      <header className="hud">
        <Link className="brand" to="/" aria-label={copy.nav.brand}>
          <img src="/logo.png" alt="AOG" width="240" height="44" />
        </Link>
        <nav className="hud-tabs" aria-label={copy.nav.sayfalar}>
          {barPacks.map((pack, i) =>
            pack.tabs.length ? (
              <Fragment key={pack.id}>
                {i > 0 && barPacks[i - 1].tabs.length ? (
                  <span className="hud-gap" aria-hidden="true" />
                ) : null}
                <div className="hud-pack" role="group" aria-label={pack.label}>
                  <TabLinks tabs={pack.tabs} />
                </div>
              </Fragment>
            ) : null,
          )}
        </nav>
        {kutuPack?.tabs.length ? (
          <nav className="hud-kutu" aria-label={kutuPack.label}>
            <TabLinks tabs={kutuPack.tabs} />
          </nav>
        ) : null}
        <div className="hud-end">
          <ClerkAuth />
          <button
            type="button"
            className="hud-lang"
            aria-label={copy.nav.langAria}
            onClick={() => setLang(lang === "en" ? "tr" : "en")}
          >
            {copy.nav.lang}
          </button>
          <button
            type="button"
            className="hex"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={openMenu}
          >
            <span className="hex-face">{copy.nav.menu}</span>
          </button>
        </div>
      </header>
      <dialog
        ref={dialogRef}
        id="site-menu"
        className="nav-dialog"
        aria-labelledby="nav-title"
        onClose={() => setMenuOpen(false)}
      >
        <div className="nav-sheet">
          <div className="nav-hud">
            <Link className="brand" to="/" onClick={closeMenu} aria-label={copy.nav.anaSayfa}>
              <img src="/logo.png" alt="" width="240" height="44" />
            </Link>
            <button type="button" className="hex" onClick={closeMenu} aria-label={copy.nav.kapat}>
              <span className="hex-face">{copy.nav.kapat}</span>
            </button>
          </div>
          <div className="nav-body">
            <h2 id="nav-title" className="visually-hidden">
              {copy.nav.siteMenu}
            </h2>
            {packs.map((pack) => {
              const links = overlayLinks(pack);
              return (
                <section
                  key={pack.id}
                  className={`nav-pack ${pack.tone}`}
                  aria-labelledby={`nav-pack-${pack.id}`}
                >
                  <h3 id={`nav-pack-${pack.id}`}>{pack.label}</h3>
                  {links.length ? (
                    <ul className="nav-primary">
                      {links.map((item) => (
                        <li key={item.to}>
                          <NavLink
                            className={({ isActive }) =>
                              [item.tone, isActive ? "is-on" : undefined].filter(Boolean).join(" ")
                            }
                            to={item.to}
                            end={item.end}
                            onClick={closeMenu}
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {pack.specs ? (
                    <ul className="nav-specs">
                      {pack.specs.map((item) => (
                        <li key={item.href}>
                          <Link to={item.href} onClick={closeMenu}>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>
          <div className="nav-foot">
            <span>
              {product === "software" ? copy.nav.yazilim : "Akıllı Orman Gözlemcisi"}
            </span>
            {legal.map((item) => (
              <Link key={item.to} to={item.to} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}

export function SiteFooter() {
  const { copy } = useLang();
  const legal = LEGAL_LINKS.map((item) => ({
    ...item,
    label: copy.legal[item.id] || item.label,
  }));
  return (
    <footer className="site-end">
      <span>Defenders Of Green</span>
      <span>Akıllı Orman Gözlemcisi</span>
      <span>TEKNOFEST 2026</span>
      <nav className="legal-end" aria-label={copy.nav.yasal}>
        {legal.map((item) => (
          <Link key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

export function Shell({ product, children, footer = true }) {
  const location = useLocation();

  // Layout effect: these attributes change padding and the scroll container,
  // so they must land before paint or the page jumps on every route change.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const onBoard =
      location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/pair");
    root.dataset.chrome = "tabs";
    root.dataset.surface = onBoard ? "ha" : "market";
    if (location.pathname.startsWith("/asistan")) root.dataset.chat = "owui";
    else delete root.dataset.chat;
    const standalone = isStandaloneDisplay({
      displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
      iosStandalone: Boolean(window.navigator.standalone),
    });
    root.dataset.display = standalone ? "standalone" : "browser";
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", onBoard ? "#e4ece0" : "#e8f0e4");
    return () => {
      delete root.dataset.chrome;
      delete root.dataset.surface;
      delete root.dataset.display;
      delete root.dataset.chat;
    };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <FontConsent />
      <SiteNav product={product} />
      <main className="view-pane" id="icerik">
        {children}
        {footer ? <SiteFooter /> : null}
      </main>
      <CookieBanner />
    </div>
  );
}
