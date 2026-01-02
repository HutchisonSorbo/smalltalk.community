# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x | ✅ |
| < 1.0 | ❌ |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue.

**Report via**:

1. **GitHub Security Advisories** - Use private vulnerability reporting
2. **Email** (future): <security@smalltalk.community>

### Information to Include

- Description of the vulnerability
- Steps to reproduce (proof of concept)
- Potential impact assessment
- Affected components/versions
- Your suggested fix (if any)

### Response Timeline

| Severity | Acknowledgment | Resolution Target |
|----------|----------------|-------------------|
| Critical | 4 hours | 72 hours |
| High | 24 hours | 7 days |
| Medium | 48 hours | 30 days |
| Low | 7 days | 60 days |

## Security Architecture

### Defense in Depth

1. **Network**: Vercel edge protection, DDoS mitigation
2. **Application**: Input validation, CSP, sanitization
3. **Database**: RLS policies, parameterized queries
4. **Monitoring**: Sentry, audit logs

### Data Classification

| Classification | Examples | Protection |
|----------------|----------|------------|
| Public | App content | Standard |
| Internal | User emails | Encrypted at rest |
| Confidential | Passwords | Hashed |
| Restricted | Teen data (13-17) | Maximum protection |

## Compliance

- **Victorian Child Safe Standards** - 11 standards implemented
- **Australian Privacy Act 2024** - Data breach notification within 72 hours
- **OWASP Top 10:2025** - Bi-annual security assessment

## Further Information

For detailed security implementation requirements, see:

- [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md)
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)

---

*Last updated: 2 January 2026*
