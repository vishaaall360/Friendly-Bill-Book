/**
 * Application Footer
 * Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.
 * 
 * Displays copyright, legal links, and application metadata.
 * This is proprietary software - unauthorized use is prohibited.
 */

import { Mail, Shield, FileText, Scale } from 'lucide-react'

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-copyright">
            <p className="copyright-text">
              © {new Date().getFullYear()} FRIENDLY BILL BOOK. Licensed by JB YOUR SAFE TECHNOLOGY.
            </p>
            <p className="proprietary-notice">
              Friendly Bill Book is developed and owned by JB YOUR SAFE TECHNOLOGY.
            </p>
          </div>

          <nav className="footer-links">
            <a href="#about" title="About the application">
              <FileText size={16} />
              <span>About</span>
            </a>
            <a href="#privacy" title="Privacy policy">
              <Shield size={16} />
              <span>Privacy</span>
            </a>
            <a href="#terms" title="Terms of service">
              <Scale size={16} />
              <span>Terms</span>
            </a>
            <a href="#licenses" title="Third-party licenses">
              <Mail size={16} />
              <span>Licenses</span>
            </a>
          </nav>
        </div>

        <div className="footer-disclaimer">
          <p>
            Original software components are proprietary. Third-party components remain subject to their respective licenses.
            <br />
            <small>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                View project repository
              </a>
            </small>
          </p>
        </div>
      </div>

      <style jsx>{`
        .app-footer {
          background: #1a1a1a;
          color: #e0e0e0;
          padding: 1.5rem 1rem 1rem;
          margin-top: 0;
          border-top: 1px solid #333;
          font-size: 0.85rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .footer-copyright {
          flex: 1;
          min-width: 200px;
        }

        .copyright-text {
          margin: 0;
          font-weight: 600;
          color: #fff;
          font-size: 0.95rem;
        }

        .proprietary-notice {
          margin: 0.25rem 0 0 0;
          color: #aaa;
          font-size: 0.8rem;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .footer-links a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #b0b0b0;
          text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0;
        }

        .footer-links a:hover {
          color: #00ccff;
        }

        .footer-links svg {
          flex-shrink: 0;
        }

        .footer-disclaimer {
          text-align: center;
          border-top: 1px solid #333;
          padding-top: 1rem;
          color: #888;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .footer-disclaimer p {
          margin: 0;
        }

        .footer-disclaimer a {
          color: #00ccff;
          text-decoration: none;
        }

        .footer-disclaimer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .app-footer {
            padding: 1.25rem 0.75rem 0.75rem;
            margin-top: 0;
          }

          .footer-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .footer-links {
            justify-content: flex-start;
            gap: 1rem;
            width: 100%;
          }

          .footer-links span {
            display: none;
          }

          .footer-copyright {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .footer-links {
            gap: 0.75rem;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
