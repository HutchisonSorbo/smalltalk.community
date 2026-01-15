# Incident Response Plan

**Project**: smalltalk.community  
**Last Updated**: 2 January 2026  
**Document Owner**: Ryan Hutchison

---

## Contacts

| Role | Name | Primary Contact | Backup Contact |
|------|------|-----------------|----------------|
| Incident Commander | Ryan Hutchison | <ryanhutchison@outlook.com.au> | <smalltalkcommunity.backup@gmail.com> |
| Child Safety Officer | Ryan Hutchison | <ryanhutchison@outlook.com.au> | <smalltalkcommunity.backup@gmail.com> |

---

## Severity Levels

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **P1 - Critical** | Active breach, teen safety incident | Unauthorised access to user data, predatory behaviour reported | **Immediate** |
| **P2 - High** | Security vulnerability discovered | RLS bypass, injection flaw, authentication issue | **4 hours** |
| **P3 - Medium** | Service degradation, suspicious activity | Unusual traffic, failed login spikes, performance issues | **24 hours** |
| **P4 - Low** | Minor issues, false positives | Single failed login, minor bugs | **72 hours** |

---

## Response Procedures

### P1 - Critical Incidents

#### Immediate (0-15 minutes)

1. ✅ Acknowledge incident
2. ✅ Assess scope and impact
3. ✅ If teen safety: Notify legal counsel immediately
4. ✅ Document initial findings

#### Containment (15-60 minutes)

1. ✅ Contain the incident (may require service shutdown)
2. ✅ Preserve evidence:
   - Database snapshots
   - Audit logs
   - Error logs
3. ✅ Block malicious actors if identified
4. ✅ Initial stakeholder notification

#### Recovery (1-24 hours)

1. ✅ Root cause analysis
2. ✅ Implement remediation
3. ✅ User notification (if required)
4. ✅ Regulatory notification within 72 hours (for data breaches)

---

### P2 - High Priority

#### Initial Response (within 4 hours)

1. ✅ Acknowledge and document
2. ✅ Assess vulnerability severity
3. ✅ Determine if active exploitation
4. ✅ Implement temporary mitigation

#### Resolution (within 7 days)

1. ✅ Develop permanent fix
2. ✅ Test in staging environment
3. ✅ Deploy fix
4. ✅ Verify resolution
5. ✅ Update documentation

---

### P3/P4 - Medium/Low Priority

1. ✅ Log in issue tracker
2. ✅ Prioritize in next sprint
3. ✅ Implement fix
4. ✅ Document resolution

---

## Teen Safety Incident Protocol

> **⚠️ CRITICAL**: Users aged 13-17 are considered children under Victorian Child Safe Standards.

### Immediate Actions

1. **Escalate immediately** to Child Safety Officer (Ryan Hutchison)
2. **Do NOT delete** any content or data - preserve for investigation
3. **Remove content visibility** but retain in database
4. **Document everything** with timestamps

### Mandatory Reporting

Report to relevant authorities when:

- Criminal activity suspected
- Predatory behaviour identified
- Self-harm or suicide indicators
- Grooming patterns detected

**Reporting Contacts**:

- **Victoria Police**: 000 (emergency) or local station
- **Commission for Children and Young People Victoria**: <https://ccyp.vic.gov.au>
- **eSafety Commissioner**: <https://www.esafety.gov.au>

### User Notification

- Notify affected user within 24 hours
- For users under 18, attempt guardian contact where information available
- Provide support resources

---

## Data Breach Procedure

### Australian Privacy Act Requirements

| Timeline | Action |
|----------|--------|
| Immediately | Contain breach, preserve evidence |
| Within 24 hours | Initial assessment of scope |
| Within 72 hours | Notify OAIC if "eligible data breach" |
| Within 72 hours | Notify affected individuals |

### Eligible Data Breach Criteria

A breach is "eligible" if:

1. Unauthorised access to personal information occurred
2. Serious harm to individuals is likely
3. Remedial action hasn't prevented the serious harm

### Notification Template

```
Subject: Important Security Notice from smalltalk.community

Dear [User],

We are writing to inform you of a security incident that may have affected your personal information.

What happened: [Brief description]
What information was involved: [Details]
What we are doing: [Actions taken]
What you can do: [Recommended actions]

We apologize for any concern this may cause.

[Signature]
```

---

## Post-Incident Actions

### Within 48 Hours

- [ ] Incident debrief meeting
- [ ] Document timeline of events
- [ ] Identify root cause

### Within 7 Days

- [ ] Complete post-mortem report
- [ ] Update security measures
- [ ] Update this document if needed

### Ongoing

- [ ] Monitor for recurrence
- [ ] Review and improve detection
- [ ] Schedule quarterly security reviews

---

## Evidence Preservation

### What to Preserve

- Audit logs (all `audit_logs` table entries)
- Access logs (Vercel/server logs)
- Database snapshots
- User communication
- Screenshots of relevant content

### Retention Period

- Minimum 7 years for incidents involving minors
- Minimum 3 years for other security incidents

### Storage

- Separate from production database
- Encrypted at rest
- Access restricted to Incident Commander

---

## Review Schedule

| Review | Frequency | Owner |
|--------|-----------|-------|
| Incident response drill | Quarterly | Incident Commander |
| Document review | Annually | Incident Commander |
| Contact list update | Quarterly | Incident Commander |

---

*Last reviewed: 2 January 2026*  
*Next scheduled review: April 2026*
