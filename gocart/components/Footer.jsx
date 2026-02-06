"use client"
import Link from "next/link";
import img from "../assets/logo.png"
import Image from "next/image";

const Footer = () => {
  const XIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const TelegramIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.3346 3.33301L9.16797 12.4997M18.3346 3.33301L12.5013 18.333L9.16797 12.4997M18.3346 3.33301L3.33464 9.16634L9.16797 12.4997"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const quickLinks = [
    { text: "Home", path: "/" },
    { text: "About", path: "/about" },
    { text: "Become Plus Member", badge: "Coming Soon" },
    { text: "Create your Store", path: "/create-store" },
    { text: "FAQ", path: "/faq" },
  ];

  const legalLinks = [
    {
      text: "Privacy Policy",
      path: "https://app.termly.io/policy-viewer/policy.html?policyUUID=97783e1a-a68d-4a23-a8c7-572b31c875f3",
    },
    {
      text: "Terms of Use",
      path: "https://app.termly.io/policy-viewer/policy.html?policyUUID=268a0b5d-37cd-470c-989c-3e40161a4704",
    },
    {
      text: "Return Policy",
      path: "https://app.termly.io/policy-viewer/policy.html?policyUUID=c722b51e-a31f-44a2-9670-144af81ac95f",
    },
  ];

  const socialIcons = [
    { icon: XIcon, link: "https://x.com/dmarketplaceai", label: "X (Twitter)" },
    {
      icon: TelegramIcon,
      link: "https://t.me/+aqh8dTzYmMhiYjg6",
      label: "Telegram",
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 lg:gap-32">
          {/* Left Container - Logo and Socials */}
          <div className="md:w-[350px] flex-shrink-0">
          <Link href="/" className="inline-block mb-6 group">
  <Image
    src={img}
    alt="DMarketplace Logo"
    className="h-8 w-auto pl-5 scale-[3] sm:scale-[3.5] md:scale-[4] transition-all duration-300 group-hover:brightness-110"
  />
</Link>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              The future of shopping powered by Web3
            </p>

            <h4 className="text-slate-800 font-semibold text-xs uppercase tracking-wider mb-3">
              SOCIALS
            </h4>
            <div className="flex items-center gap-3">
              {socialIcons.map((item, i) => (
                <Link
                  href={item.link}
                  key={i}
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-slate-800 text-white hover:bg-green-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <item.icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Container - Three Columns */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {/* Quick Links */}
            <div>
              <h3 className="text-slate-800 font-semibold text-sm uppercase tracking-wider mb-4 relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full">
                QUICK LINKS
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, i) => (
                  <li key={i} className="group">
                    {link.text === "Become Plus Member" ? (
                      <button
                        onClick={() => alert("Coming soon 🚀")}
                        className="text-slate-600 text-sm hover:text-orange-600 transition-colors duration-200 flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                      >
                        <span className="inline-block transition-all duration-200">
                          {link.text}
                        </span>
                        {link.badge && (
                          <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium animate-pulse">
                            {link.badge}
                          </span>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={link.path}
                        className="text-slate-600 text-sm hover:text-green-600 transition-colors duration-200 flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                      >
                        <span className="inline-block transition-all duration-200">
                          {link.text}
                        </span>
                        {link.badge && (
                          <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium animate-pulse">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-slate-800 font-semibold text-sm uppercase tracking-wider mb-4 relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full">
                LEGAL
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link, i) => (
                  <li key={i} className="group">
                    <Link
                      href={link.path}
                      className="text-slate-600 text-sm hover:text-green-600 transition-colors duration-200 group-hover:translate-x-1 inline-block transition-transform"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-slate-800 font-semibold text-sm uppercase tracking-wider mb-4 relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full">
                CONTACT
              </h3>
              <div className="space-y-4">
                <div className="group">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">
                    TELEGRAM SUPPORT
                  </p>
                  <Link
                    href="https://t.me/dMarketplaceSupportBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-lg text-slate-700 hover:text-green-600 text-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <TelegramIcon />
                    <span className="font-medium">@dMarketplaceSupportBot</span>
                  </Link>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Need help? Our support team is available 24/7 through
                    Telegram
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} DMarketplace. All rights reserved.
            Terms and conditions applied.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
