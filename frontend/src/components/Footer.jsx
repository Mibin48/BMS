import { NavLink } from 'react-router-dom';
import { Droplets, Twitter, Linkedin, Github, Mail, Phone } from 'lucide-react';

const nav = {
    Platform: ['Inventory', 'Donor Management', 'Compliance', 'AI Analytics', 'Emergency Dispatch', 'Integrations'],
    Company: ['About', 'Blog', 'Careers', 'Partners', 'Press'],
    Legal: ['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Security', 'Data Policy'],
};

export default function Footer() {
    return (
        <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '80px 5% 40px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div className="footer-grid" style={{ marginBottom: 64 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                            <img
                                src="/logo/hema_full_icon.svg"
                                alt="HEM∆"
                                style={{ height: 72, width: 'auto', display: 'block', objectFit: 'contain' }}
                            />
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 260, marginBottom: 24 }}>
                            Kerala's intelligent blood management infrastructure. Every drop tracked. Every life protected.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <a key={i} href="#" style={{
                                    width: 36, height: 36, borderRadius: 9,
                                    border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text2)', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                        {/* Contact quick */}
                        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { Icon: Phone, text: '+91 471 XXX XXXX' },
                                { Icon: Mail, text: 'hello@hema.health' },
                            ].map(({ Icon, text }) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text3)' }}>
                                    <Icon size={13} color="var(--red)" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    {Object.entries(nav).map(([title, links]) => (
                        <div key={title}>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                                textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 20,
                            }}>{title}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                                {links.map(link => (
                                    <a key={link} href="#" style={{ fontSize: 14, color: 'var(--text2)', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{
                    paddingTop: 28, borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                        © 2025 HEM∆ Technologies Pvt. Ltd. · Thiruvananthapuram, Kerala
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                        NACO Certified · ISO 27001 · HIPAA Compliant
                    </span>
                </div>
            </div>
        </footer>
    );
}
