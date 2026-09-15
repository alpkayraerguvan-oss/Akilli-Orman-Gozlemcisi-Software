import { SignIn, useUser } from "@clerk/react";
import { useLocation } from "react-router-dom";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import { clerkAppearance, useClerkFlag } from "./clerkFlag.js";
import { useDemo, writeDemo } from "./demoFlag.js";
import "./site.css";

export function RequireAuth({
  children,
  product = "software",
  title,
  lead,
}) {
  const clerkOn = useClerkFlag();
  const { copy } = useLang();
  if (!clerkOn) {
    return (
      <Shell product={product}>
        <article className="coat-page">
          <header className="coat-hero">
            <div className="coat-hero-copy">
              <h1>{title}</h1>
              <p>{copy.auth.clerkOff}</p>
            </div>
          </header>
        </article>
      </Shell>
    );
  }
  return (
    <SignedGate product={product} title={title} lead={lead}>
      {children}
    </SignedGate>
  );
}

function SignedGate({ children, product, title, lead }) {
  const { isLoaded, isSignedIn } = useUser();
  const demo = useDemo();
  const location = useLocation();
  const { copy } = useLang();
  if (demo && !isSignedIn) {
    return children;
  }
  if (!isLoaded) {
    return (
      <Shell product={product} footer={false}>
        <p className="boot" role="status">
          {copy.chrome.hesapOkunuyor}
        </p>
      </Shell>
    );
  }
  if (!isSignedIn) {
    return (
      <Shell product={product}>
        <article className="coat-page">
          <header className="coat-hero coat-hero-auth">
            <div className="coat-hero-copy">
              <h1>{title}</h1>
              <p>{lead}</p>
            </div>
            <div className="clerk-screen">
              <SignIn
                routing="hash"
                appearance={clerkAppearance}
                forceRedirectUrl={location.pathname}
                fallbackRedirectUrl={location.pathname}
              />
              <div className="clerk-demo">
                <button
                  type="button"
                  className="hit"
                  onClick={() => writeDemo(true)}
                >
                  {copy.chrome.demo}
                </button>
                <p>{copy.auth.demoHint}</p>
              </div>
            </div>
          </header>
        </article>
      </Shell>
    );
  }
  return children;
}
