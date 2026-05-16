# CHYE YAN TONG

📍 Kuala Lumpur, Malaysia | ✉ chyeyantong03@gmail.com | 🔗 [LinkedIn](https://www.linkedin.com/in/yantongchye) | 🔗 [GitHub](https://github.com/yantongggg)

---

## EDUCATION

**Bachelor of Computer Science (Cybersecurity)** — Asia Pacific University (APU), Bukit Jalil
*Sept 2022 – Jul 2025* | CGPA: 3.81 | First Class Distinction

- Relevant Coursework: Penetration Testing | Network Design | Linux Administration | AWS Cloud | Deep Learning for Security | Web & Mobile Application Development

---

## PROFESSIONAL EXPERIENCE

**AI Security Engineer** | Maybank HQ – Menara Maybank
*Jan 2026 – Present*

- Develop and implement AI-driven security solutions within the AI Security Engineering team
- Conduct offensive security assessments across web applications, APIs, and mobile platforms
- Active bug bounty researcher with confirmed vulnerabilities reported on Bugcrowd and GitHub open-source repositories
- Discovered and responsibly disclosed 6 CVEs across open-source projects (HeyForm, Open WebUI, compliance-trestle)

**Cybersecurity Intern** | Maybank HQ – Menara Maybank
*Aug 2024 – Nov 2024*

- Performed internal penetration testing on web, mobile, API, infrastructure, and NAC systems
- Discovered critical vulnerabilities in payment APIs, OTP flows, and wireless networks
- Delivered security reports aligned with Bank Negara Malaysia (BNM) RMiT compliance standards
- Strengthened internal cyber resilience through systematic vulnerability assessment and exploit validation

**Cloud Trainee** | PayNet — AWS re/Start Program
*Jun 2024 – Jul 2024*

- Trained in AWS compute, storage, networking, and security fundamentals
- Deployed cloud services (EC2, IAM, RDS, S3) and configured monitoring with CloudWatch
- Earned AWS Certified Cloud Practitioner credential

---

## AWARDS & ACHIEVEMENTS

| Award | Event | Year |
|-------|-------|------|
| 🏆 **Champion + Best Slide/Demo** | Sparkathon 2025 (APU x BAT) — JetCycle AI Tech Swap Station | 2025 |
| 🏆 **Champion — Security Track** | NexG Godamlah! 2.0 Smart ID Hackathon — MyLayak Zero-Trust Platform | 2025 |
| 🥇 **Gold Award** | MIJC2026 Virtual Innovation — eKYC Biometric Authentication Research | 2026 |
| 🏅 **Top 15 / 100+ Teams** | EY Young Technology Professional Challenge (YTPC) 2025 — Trendify | 2025 |
| 🏅 **Blueprint Hackathon Finalist** | LUNA Women's Safety App | 2026 |
| 🏅 **Borneo Hackathon** | Wira Disaster Resilience Platform | 2026 |

---

## SECURITY RESEARCH (CVEs)

| Severity | Vulnerability | Project | ID |
|----------|--------------|---------|----|
| **High** | Stored XSS via Unauthenticated SVG File Upload | heyform/heyform | CVE-2026-45797 |
| **High** | SSRF via Unauthenticated Image Proxy | heyform/heyform | GHSA-3j2g-3q97-fvv5 |
| **High** | Arbitrary File Write via Cache Path Traversal | oscal-compass/compliance-trestle | GHSA-mj4x-vf5c-5xg8 |
| **High** | Arbitrary File Write via Cache Path Traversal | oscal-compass/compliance-trestle | GHSA-g3vg-vx23-3858 |
| **Moderate** | Critical SSRF in Remote Fetching Subsystem | oscal-compass/compliance-trestle | GHSA-w76h-q7c6-jpjp |
| **Moderate** | Mass Assignment — User ID Spoofing | open-webui/open-webui | CVE-2026-45396 |

---

## KEY PROJECTS

### MyLayak — Zero-Trust Eligibility Platform | 🏆 Champion, Godamlah! 2.0

- Architected a zero-trust eligibility platform allowing citizens to discover government subsidies without exposing personal data
- Implemented **dual-layer steganographic QR authentication** on MyDigital ID to prevent QR faking and copying
- Designed Soulbound Eligibility Tokens (SETs) with server-side JWT issuance, pattern obfuscation, and BB84 quantum key distribution
- **Tech:** React, TypeScript, Node.js, HMAC-SHA256, XOR+ROT13 obfuscation, QKD (BB84 protocol)

### eKYC Biometric Authentication System | Final Year Project | 🥇 Gold, MIJC2026

- Designed a multi-modal biometric framework for AI-resilient digital identity verification
- Integrated facial recognition, liveness detection (EAR/MAR + landmark dynamics), and behavioural biometrics (keystroke/mouse dynamics) for continuous post-login authentication
- Engineered anomaly detection engine to combat deepfakes, synthetic identities, and session hijacking
- **Tech:** React, TypeScript, Tailwind, Python ML backend, AES-256, Supabase RLS, REST APIs

### LUNA — Women's Safety App | Blueprint Hackathon Finalist

- Built a comprehensive safety application disguised as a period tracker with encrypted evidence vault and AI forensic analysis
- Implemented **deepfake photo immunization** using adversarial perturbation and steganographic verification (SHA-256 hashing)
- Integrated Google Gemini AI (evidence analysis, deepfake detection), Azure Neural TTS, and real-time boundary-setting coaching
- **Tech:** React, TypeScript, Supabase, Firebase, Google Gemini Vision, Azure Cognitive Services

### Wira — AI Disaster Resilience Platform | Borneo Hackathon

- Developed a gamified disaster preparedness platform for ASEAN covering 10 countries with real disaster data
- Built **Possum Protocol** — offline emergency toolkit with mesh networking, GPS sharing, and distress signal detection
- Designed AR-based training simulations and gamification system (XP, badges, streaks) for sustained engagement
- **Tech:** React, TypeScript, Vite, Tailwind CSS, Recharts, Google Maps API

### KongsiGo — TNG Group Wallet | TNGD FinHack (Hackathon)

- Built a shared-wallet engine on top of the Touch 'n Go eWallet platform supporting Trip and Family pools with atomic, double-entry ledgering to guarantee financial integrity.
- Implemented device-bound Phone + PIN auth and HMAC-sealed, passwordless login with AWS Lambda verification and replay protection for secure approvals.
- Engineered democratic spend voting (majority/unanimous/threshold/admin) with early reject and emergency override; ensured atomic vote resolution and execution.
- Added real-time WebSocket sync for per-pool state, steganographic QR invites, and TNG-gated HMAC payment flow for secure, auditable transfers.
- Built on-device ML (DistilBERT tx classifier + Isolation Forest anomaly detector) and dual AI agents (per-pool financial agent + personal assistant) for fraud detection and budgeting assistance.
- **Tech:** Python (FastAPI), React 18, TypeScript, PostgreSQL, Redis (pub/sub), WebSockets, ONNX ML, Claude/Ollama LLMs, AWS Lambda
- **Repo:** https://github.com/Scarce01/tng_group_wallet

### QuIEP — Community Energy Platform | Hackathon Project

- Built rooftop solar potential assessment website and mobile app for peer-to-peer community energy trading
- Implemented **Q-ORCA** quantum-secure broadcast architecture for real-time congestion-aware pricing and safety detection (arc faults, current leakage)
- **Tech:** Web platform, mobile app, quantum-secure broadcast protocol

### JetCycle — AI Tech Swap Station | 🏆 Champion + Best Demo, Sparkathon 2025

- Designed an AI-powered smart kiosk with robotic arm for automated e-waste dismantling and component categorization (reusable, recyclable, disposable)
- Created full product workflow from device scanning to digital reward distribution
- Developed Figma prototype and demo video for end-to-end visualization

### Trendify — Supply Chain Trendsetter | Top 15, EY YTPC 2025

- Architected a scalable, data-driven supply chain intelligence platform powered by SAP technologies
- Designed predictive market modeling to help Malaysian businesses anticipate and respond to market shifts

### SipMate — AI Wine Discovery App | World's Largest Hackathon (Bolt)

- Built a wine discovery app with 3,000+ wines and AI-generated descriptions using DeepSeek API
- Developed personalized recommendation engine; planning RAG integration for improved accuracy
- **Tech:** React Native, Expo, Supabase, DeepSeek API

---

## CERTIFICATIONS

- **AWS Certified Cloud Practitioner** (2024)
- **Cisco NetAcad** — Switching & Routing Essentials (Merit)

---

## EXTRACURRICULAR

- **Bug Bounty Researcher** — Active on Bugcrowd; security findings on GitHub open-source repositories
- **CTF Competitions** — rEntas CTF, picoCTF 2024
- **Solana Hackathon** — Built blockchain trading platform using Web3 tools
- **Google Hackathon** — Developed Foodie Map, a location-based food discovery tool with Notion integration

---

## TECHNICAL SKILLS

| Category | Skills |
|----------|--------|
| **Security** | Penetration Testing, Web/API/Mobile Security, Bug Bounty, Zero Trust Architecture, AI/ML Security |
| **Languages** | Python, TypeScript, Java, SQL, JavaScript, C# |
| **Frameworks** | React, React Native, Tailwind CSS, Vite, Supabase, Firebase |
| **Tools** | Burp Suite, Wireshark, Frida, Nmap, Git |
| **Cloud** | AWS (EC2, IAM, RDS, S3, CloudWatch), Supabase, Firebase Hosting |
| **Soft Skills** | Technical Reporting, Team Leadership, Problem Solving, Critical Thinking |
