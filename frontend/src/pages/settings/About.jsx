/**
 * Friendly Bill Book - About & Application Information
 * Copyright © 2026 Friendly Bill Book. All Rights Reserved.
 * 
 * Displays company information, CRM details, and licensing information.
 */

import { useEffect, useState } from 'react'
import { Building2, Phone, Mail, Globe, Shield, Zap, FileText, CheckCircle2, Sparkles, Database, Cloud } from 'lucide-react'
import { fetchBusinessSettings } from '../../services/api'

function About() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinessSettings()
      .then(data => setSettings(data))
      .catch(err => console.error('Error loading settings:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="module-page about-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SETTINGS / ABOUT</p>
          <h1>Friendly Bill Book</h1>
          <p>Complete Smart Billing, CRM & Inventory Management System</p>
        </div>
      </div>

      <div className="about-container">
        {/* Friendly Bill Book Hero Card */}
        <article className="about-card featured-about-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}>
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <h2>Friendly Bill Book</h2>
              <p className="subtitle">All-in-One Cloud Billing & Business Suite</p>
            </div>
          </div>

          <div className="card-content">
            <h3>About Friendly Bill Book</h3>
            <p>
              Friendly Bill Book is a modern, ultra-reliable business billing and management software designed for growing businesses, traders, service providers, and enterprises. From raising GST invoices and quotations to tracking inventory and automated cloud backups, Friendly Bill Book simplifies your daily workflow.
            </p>

            <div className="services-grid">
              <div className="service-item">
                <FileText size={20} color="#10B981" />
                <strong>GST Invoicing & Billing</strong>
                <small>Create professional GST invoices, proforma bills, and delivery challans</small>
              </div>

              <div className="service-item">
                <Shield size={20} color="#06B6D4" />
                <strong>Smart Quotations</strong>
                <small>Convert quotes into proforma or final tax invoices with 1-click</small>
              </div>

              <div className="service-item">
                <Zap size={20} color="#F59E0B" />
                <strong>Live Inventory Control</strong>
                <small>Track products, raw materials, stock-in, stock-out and reorder signals</small>
              </div>

              <div className="service-item">
                <Cloud size={20} color="#3B82F6" />
                <strong>Google Sheets Sync</strong>
                <small>Auto-sync records and export spreadsheets for instant backup</small>
              </div>

              <div className="service-item">
                <Database size={20} color="#8B5CF6" />
                <strong>Secure Cloud Workspace</strong>
                <small>Multi-user access with secure email/password authentication</small>
              </div>

              <div className="service-item">
                <CheckCircle2 size={20} color="#10B981" />
                <strong>Financial Reports</strong>
                <small>Sales, purchase, profit & loss, GST GSTR-1/3B ready reports</small>
              </div>
            </div>
          </div>
        </article>

        {/* Application Details */}
        <article className="about-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
              <Building2 size={28} color="white" />
            </div>
            <div>
              <h2>System Specifications</h2>
              <p className="subtitle">Version & Platform Details</p>
            </div>
          </div>

          <div className="card-content">
            <div className="app-details">
              <div className="detail-row">
                <strong>Application Name:</strong>
                <span>Friendly Bill Book</span>
              </div>

              <div className="detail-row">
                <strong>Edition:</strong>
                <span>Enterprise Business CRM & Billing Suite</span>
              </div>

              <div className="detail-row">
                <strong>Version:</strong>
                <span>2.4.0 (Latest Release)</span>
              </div>

              <div className="detail-row">
                <strong>Release Year:</strong>
                <span>{new Date().getFullYear()}</span>
              </div>

              <div className="detail-row">
                <strong>Primary Database:</strong>
                <span>SQLite Local Database</span>
              </div>

              <div className="detail-row">
                <strong>Cloud Integration:</strong>
                <span>Secure app access with Google Sheets data sync</span>
              </div>
            </div>

            <div className="contact-info">
              <h3>Registered Business Details</h3>
              {settings ? (
                <div className="settings-contact">
                  <div className="contact-item">
                    <Building2 size={18} />
                    <div>
                      <strong>Company Name</strong>
                      <p>{settings.company_name || 'Friendly Bill Book'}</p>
                    </div>
                  </div>

                  {settings.gstin && (
                    <div className="contact-item">
                      <Shield size={18} />
                      <div>
                        <strong>GSTIN</strong>
                        <p>{settings.gstin}</p>
                      </div>
                    </div>
                  )}

                  {settings.phone && (
                    <div className="contact-item">
                      <Phone size={18} />
                      <div>
                        <strong>Phone</strong>
                        <p>{settings.phone}</p>
                      </div>
                    </div>
                  )}

                  {settings.email && (
                    <div className="contact-item">
                      <Mail size={18} />
                      <div>
                        <strong>Email</strong>
                        <p>{settings.email}</p>
                      </div>
                    </div>
                  )}

                  {settings.website && (
                    <div className="contact-item">
                      <Globe size={18} />
                      <div>
                        <strong>Website</strong>
                        <p>{settings.website}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>Loading company information...</p>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default About
