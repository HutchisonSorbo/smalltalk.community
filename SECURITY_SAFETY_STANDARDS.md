# Security, Safety & Performance Standards

**Project Type:** Multi-Age Community Platform
**Infrastructure:** Vercel + Supabase + GitHub
**Current Date:** December 2025
**Last Updated:** 31 December 2025

This document defines security, safety, and performance requirements for a platform serving users of all ages, including children. All features must comply with these standards.

---

## Platform Context

This platform serves:
- **Children** (under 13) and **Teenagers** (13-17)
- **Adults** (18-64)
- **Seniors** (65+)
- **Organisations** (councils, community groups, businesses)
- **Professionals** (musicians, educators, service providers)

Because children use the platform, we must implement Victorian Child Safe Standards alongside general security best practices.

---

## Child Safety Compliance (Victorian Child Safe Standards)

### Age Verification & Parental Consent

**Requirements:**
- Collect date of birth on ALL new account registrations
- For users under 13, require verified parental consent before account activation
- Store parental consent records with timestamp and method of verification
- Re-verify parental consent annually for users under 13
- Parents must be able to view, modify, and delete their child's account and data

**Implementation in Supabase:**
```javascript
// api/auth/register.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, username, dateOfBirth, parentEmail } = req.body;

    // Calculate age
    const age = calculateAge(dateOfBirth);
    
    // Determine age group
    let ageGroup;
    if (age < 13) ageGroup = 'child';
    else if (age < 18) ageGroup = 'teen';
    else if (age < 65) ageGroup = 'adult';
    else ageGroup = 'senior';

    // Create user account
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        date_of_birth: dateOfBirth,
        age_group: ageGroup,
        account_status: age < 13 ? 'pending_parental_consent' : 'active',
        parent_email: age < 13 ? parentEmail : null,
        parent_consent_verified: age >= 13
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    // If child account, send parental consent request
    if (age < 13) {
      await sendParentalConsentRequest(user.id, parentEmail);
      
      return res.status(201).json({
        success: true,
        message: 'Account created. Parental consent email sent.',
        requiresConsent: true,
        userId: user.id
      });
    }

    // Log account creation
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'account_created',
      user_id: user.id,
      details: { ageGroup, email },
      severity: 'info'
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
```

**Parental consent process:**
```javascript
// api/auth/request-consent.js
import { supabaseAdmin } from '../../lib/supabase';
import crypto from 'crypto';

async function sendParentalConsentRequest(childUserId, parentEmail) {
  // 1. Generate secure consent token (32 bytes, URL-safe)
  const consentToken = crypto.randomBytes(32).toString('base64url');
  
  // 2. Store consent request in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
  
  await supabaseAdmin.from('parental_consent_requests').insert({
    token: consentToken,
    child_user_id: childUserId,
    parent_email: parentEmail,
    expires_at: expiresAt.toISOString(),
    status: 'pending'
  });
  
  // 3. Send email to parent
  const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-consent?token=${consentToken}`;
  
  await sendEmail({
    to: parentEmail,
    subject: 'Verify Your Child\'s Account',
    html: `
      <h2>Account Verification Required</h2>
      <p>Your child has created an account on our platform. To activate their account, please verify your consent by clicking the link below:</p>
      <a href="${consentUrl}">Verify Consent</a>
      <p>This link expires in 7 days.</p>
      <p>If you did not authorize this account creation, please ignore this email.</p>
    `
  });
  
  // 4. Log consent request
  await supabaseAdmin.from('audit_logs').insert({
    event_type: 'user_action',
    action: 'consent_request_sent',
    user_id: childUserId,
    details: { parentEmail, expiresAt },
    severity: 'info'
  });
}

// Verify consent endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    // 1. Find consent request
    const { data: request, error: requestError } = await supabaseAdmin
      .from('parental_consent_requests')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired consent link'
      });
    }

    // 2. Check if expired
    if (new Date(request.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'This consent link has expired'
      });
    }

    // 3. Update consent request
    await supabaseAdmin
      .from('parental_consent_requests')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('token', token);

    // 4. Activate child account
    await supabaseAdmin
      .from('users')
      .update({
        account_status: 'active',
        parent_consent_verified: true,
        parent_consent_date: new Date().toISOString()
      })
      .eq('id', request.child_user_id);

    // 5. Log consent verification
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'parental_consent_verified',
      user_id: request.child_user_id,
      details: { parentEmail: request.parent_email },
      severity: 'info'
    });

    return res.status(200).json({
      success: true,
      message: 'Account activated successfully'
    });

  } catch (error) {
    console.error('Consent verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.'
    });
  }
}
```

**Justification:** Victorian Child Safe Standards require platforms to obtain parental consent before collecting data from children under 13. Secure token-based verification ensures only authorized parents can approve accounts. Time-limited tokens reduce abuse risk.

---

### Content Moderation For All Ages

**Multi-layered content filtering:**
```javascript
// api/moderation/moderate-content.js
import { supabaseAdmin } from '../../lib/supabase';
import { getAIModel } from '../../lib/ai-config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentId, userId } = req.body;

    // 1. Fetch content and user
    const { data: content } = await supabaseAdmin
      .from('content')
      .select('*, users(*)')
      .eq('id', contentId)
      .single();

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // 2. Check for blocked keywords
    const keywordCheck = await checkBlockedKeywords(content.body);
    if (!keywordCheck.passed) {
      await logModerationEvent({
        contentId,
        userId,
        reason: 'blocked_keywords',
        details: { matches: keywordCheck.matches },
        action: 'rejected'
      });

      await supabaseAdmin
        .from('content')
        .update({
          moderation_status: 'rejected',
          is_visible: false,
          moderated_at: new Date().toISOString(),
          moderated_by: 'automated'
        })
        .eq('id', contentId);

      return res.status(200).json({
        approved: false,
        reason: 'Content contains inappropriate language'
      });
    }

    // 3. Check for personal information
    const piiCheck = checkForPersonalInfo(content.body);
    if (piiCheck.found) {
      await logModerationEvent({
        contentId,
        userId,
        reason: 'personal_information',
        details: { types: piiCheck.types },
        action: 'rejected'
      });

      await supabaseAdmin
        .from('content')
        .update({
          moderation_status: 'rejected',
          is_visible: false,
          moderated_at: new Date().toISOString(),
          moderated_by: 'automated'
        })
        .eq('id', contentId);

      return res.status(200).json({
        approved: false,
        reason: 'Please remove personal information such as phone numbers and addresses'
      });
    }

    // 4. AI safety check
    const model = getAIModel(content.visibility || 'public');
    
    try {
      const result = await model.generateContent(
        `Analyze this content for safety and appropriateness: "${content.body}". Respond with "SAFE" or "UNSAFE" and brief reason.`
      );

      const response = result.response.text();
      
      // Check if AI blocked the content
      if (result.response.promptFeedback?.blockReason) {
        await logModerationEvent({
          contentId,
          userId,
          reason: 'ai_safety_block',
          details: { blockReason: result.response.promptFeedback.blockReason },
          action: 'rejected'
        });

        await supabaseAdmin
          .from('content')
          .update({
            moderation_status: 'rejected',
            is_visible: false,
            moderated_at: new Date().toISOString(),
            moderated_by: 'ai'
          })
          .eq('id', contentId);

        return res.status(200).json({
          approved: false,
          reason: 'Content does not meet our safety standards'
        });
      }

      // Check AI response
      if (response.includes('UNSAFE')) {
        await logModerationEvent({
          contentId,
          userId,
          reason: 'ai_flagged_unsafe',
          details: { aiResponse: response },
          action: 'flagged'
        });

        // For child/teen content, reject immediately
        if (content.users.age_group === 'child' || content.users.age_group === 'teen') {
          await supabaseAdmin
            .from('content')
            .update({
              moderation_status: 'rejected',
              is_visible: false,
              moderated_at: new Date().toISOString(),
              moderated_by: 'ai'
            })
            .eq('id', contentId);

          return res.status(200).json({
            approved: false,
            reason: 'Content requires review'
          });
        }

        // For adult content, flag for manual review
        await supabaseAdmin
          .from('content')
          .update({
            moderation_status: 'flagged',
            is_visible: false,
            moderated_at: new Date().toISOString(),
            moderated_by: 'ai'
          })
          .eq('id', contentId);

        return res.status(200).json({
          approved: false,
          reason: 'Content is under review'
        });
      }

    } catch (aiError) {
      console.error('AI moderation error:', aiError);
      
      // If AI fails, flag for manual review
      await logModerationEvent({
        contentId,
        userId,
        reason: 'ai_check_failed',
        details: { error: aiError.message },
        action: 'pending_review'
      });

      await supabaseAdmin
        .from('content')
        .update({
          moderation_status: 'pending',
          is_visible: false,
          moderated_at: new Date().toISOString(),
          moderated_by: 'system'
        })
        .eq('id', contentId);

      return res.status(200).json({
        approved: false,
        reason: 'Content is being reviewed'
      });
    }

    // 5. All checks passed - approve content
    await logModerationEvent({
      contentId,
      userId,
      reason: 'passed_all_checks',
      details: {},
      action: 'approved'
    });

    await supabaseAdmin
      .from('content')
      .update({
        moderation_status: 'approved',
        is_visible: true,
        moderated_at: new Date().toISOString(),
        moderated_by: 'automated'
      })
      .eq('id', contentId);

    return res.status(200).json({
      approved: true,
      message: 'Content approved'
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Moderation failed'
    });
  }
}

// Helper functions
async function checkBlockedKeywords(text) {
  const { data: config } = await supabaseAdmin
    .from('moderation_config')
    .select('blocked_keywords')
    .single();

  const lowerText = text.toLowerCase();
  const matches = [];

  for (const keyword of config.blocked_keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  }

  return {
    passed: matches.length === 0,
    matches
  };
}

function checkForPersonalInfo(text) {
  const patterns = {
    phone: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    address: /\b\d+\s+[A-Za-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln)\b/gi,
    postcode: /\b\d{4}\b/g // Australian postcodes
  };

  const found = [];
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      found.push(type);
    }
  }

  return {
    found: found.length > 0,
    types: found
  };
}

async function logModerationEvent(data) {
  await supabaseAdmin.from('audit_logs').insert({
    event_type: 'moderation',
    action: `content_${data.action}`,
    user_id: data.userId,
    target_id: data.contentId,
    details: {
      reason: data.reason,
      ...data.details
    },
    severity: data.action === 'rejected' ? 'warning' : 'info'
  });
}
```

**Blocked keywords configuration (stored in Supabase):**
```sql
-- Create moderation configuration table
CREATE TABLE moderation_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_keywords TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial configuration
INSERT INTO moderation_config (blocked_keywords) VALUES (
  ARRAY[
    -- Profanity (add actual words)
    'explicit_word_1',
    'explicit_word_2',
    
    -- Personal info solicitation
    'whats your address',
    'send me your phone number',
    'where do you live',
    'what school do you go to',
    
    -- Grooming language
    'keep this secret',
    'dont tell your parents',
    'this is between us',
    'meet me alone',
    
    -- Self-harm
    'how to hurt myself',
    'suicide methods',
    'ways to die',
    
    -- Bullying
    'kill yourself',
    'you should die',
    
    -- Add more keywords as needed
  ]
);
```

**Justification:** Multi-layered filtering catches content that single checks miss. Keyword lists provide fast initial filtering. Pattern matching catches personal information. AI provides context-aware moderation for subtle violations. Different age groups receive appropriate protection levels. All moderation events are logged for audit trails required by Victorian standards.

---

### Age-Appropriate Content Filtering

**Content visibility rules implemented in RLS:**
```sql
-- Function to check if user can view content
CREATE OR REPLACE FUNCTION can_view_content(content_age_restriction TEXT, user_age_group TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- All ages content visible to everyone
  IF content_age_restriction = 'all_ages' THEN
    RETURN TRUE;
  END IF;
  
  -- Teens and up content visible to teens, adults, seniors
  IF content_age_restriction = 'teens_and_up' AND user_age_group IN ('teen', 'adult', 'senior') THEN
    RETURN TRUE;
  END IF;
  
  -- Adults only content visible to adults and seniors
  IF content_age_restriction = 'adults_only' AND user_age_group IN ('adult', 'senior') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Update content RLS policy to use age restrictions
DROP POLICY IF EXISTS "Users can view appropriate content" ON content;

CREATE POLICY "Users can view appropriate content"
  ON content FOR SELECT
  USING (
    is_visible = TRUE 
    AND moderation_status = 'approved'
    AND can_view_content(
      age_restriction,
      (SELECT age_group FROM users WHERE id = auth.uid())
    )
  );
```

**Content creation rules:**
```javascript
// api/content/create.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, visibility, userId } = req.body;

    // Get user's age group
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('age_group, account_status')
      .eq('id', userId)
      .single();

    if (!user || user.account_status !== 'active') {
      return res.status(403).json({ error: 'Account not active' });
    }

    // Determine age restriction based on user's age group
    let ageRestriction = 'all_ages';
    
    // Children can only create all-ages content
    if (user.age_group === 'child') {
      ageRestriction = 'all_ages';
    }
    // Teens can create all-ages or teens-and-up content
    else if (user.age_group === 'teen' && visibility === 'teens_and_up') {
      ageRestriction = 'teens_and_up';
    }
    // Adults can create any restriction level
    else if (user.age_group === 'adult' || user.age_group === 'senior') {
      ageRestriction = visibility || 'all_ages';
    }

    // Create content
    const { data: content, error: contentError } = await supabaseAdmin
      .from('content')
      .insert({
        user_id: userId,
        title,
        body,
        content_type: 'text',
        visibility: visibility || 'public',
        age_restriction: ageRestriction,
        moderation_status: user.age_group === 'child' ? 'pending' : 'approved',
        is_visible: user.age_group !== 'child' // Child content requires pre-approval
      })
      .select()
      .single();

    if (contentError) {
      throw contentError;
    }

    // If child content, immediately send for moderation
    if (user.age_group === 'child') {
      await moderateContent(content.id, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Content submitted for review',
        contentId: content.id,
        requiresApproval: true
      });
    }

    // Log content creation
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'content_created',
      user_id: userId,
      target_id: content.id,
      details: { contentType: 'text', ageRestriction },
      severity: 'info'
    });

    return res.status(201).json({
      success: true,
      message: 'Content created successfully',
      contentId: content.id
    });

  } catch (error) {
    console.error('Content creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create content'
    });
  }
}
```

**Justification:** Age-based filtering protects children from inappropriate content while allowing adults full platform access. Database-level enforcement via RLS ensures filtering cannot be bypassed. Children's content requires pre-approval to prevent harmful content from appearing.

---

### Reporting & Incident Response

**Report handling with priority-based response:**
```javascript
// api/reports/create.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentId, reporterId, reportType, reason, details } = req.body;

    // Validate inputs
    if (!contentId || !reporterId || !reportType || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Determine priority
    const priority = assessReportPriority(reportType, reason, details);

    // If critical, immediately hide content
    if (priority === 'critical' || priority === 'high') {
      await supabaseAdmin
        .from('content')
        .update({
          is_visible: false,
          moderation_status: 'under_review'
        })
        .eq('id', contentId);
    }

    // Create report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        reporter_id: reporterId,
        content_id: contentId,
        report_type: reportType,
        reason,
        details,
        priority,
        status: 'pending'
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    // Log report
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'safety',
      action: 'content_reported',
      user_id: reporterId,
      target_id: contentId,
      details: {
        reportType,
        reason,
        priority
      },
      severity: priority === 'critical' ? 'critical' : 'warning'
    });

    // If critical, send immediate notifications
    if (priority === 'critical') {
      await notifyModerators({
        type: 'urgent_report',
        reportId: report.id,
        contentId,
        reason,
        reportedAt: new Date()
      });
    }

    // Estimate review time based on priority
    const estimatedReviewTime = {
      critical: '1 hour',
      high: '4 hours',
      medium: '24 hours',
      low: '72 hours'
    }[priority];

    return res.status(201).json({
      success: true,
      message: 'Thank you for your report. We are reviewing this content.',
      reportId: report.id,
      estimatedReviewTime
    });

  } catch (error) {
    console.error('Report creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit report'
    });
  }
}

// Priority assessment
function assessReportPriority(reportType, reason, details) {
  const criticalKeywords = [
    'child safety',
    'immediate danger',
    'suicide',
    'self harm',
    'self-harm',
    'abuse',
    'exploitation',
    'grooming',
    'threatening'
  ];

  const highKeywords = [
    'harassment',
    'bullying',
    'threats',
    'personal information',
    'inappropriate contact',
    'unsafe'
  ];

  const combinedText = `${reason} ${details || ''}`.toLowerCase();

  // Check for critical keywords
  if (criticalKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'critical';
  }

  // Safety concerns are always high priority
  if (reportType === 'safety_concern') {
    return 'high';
  }

  // Check for high-priority keywords
  if (highKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'high';
  }

  // Inappropriate content is medium priority
  if (reportType === 'inappropriate') {
    return 'medium';
  }

  // Everything else is low priority
  return 'low';
}

// Notify moderators function
async function notifyModerators(data) {
  // Get all moderator users
  const { data: moderators } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('account_type', 'organisation') // Assuming moderators are organisation accounts
    .eq('account_status', 'active');

  // Send notifications (implement via email, SMS, or in-app notification)
  for (const moderator of moderators) {
    await sendEmail({
      to: moderator.email,
      subject: 'URGENT: Content Report Requires Immediate Review',
      html: `
        <h2>Urgent Report</h2>
        <p>A critical content report has been submitted that requires immediate review.</p>
        <p><strong>Report ID:</strong> ${data.reportId}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reports/${data.reportId}">Review Report</a></p>
      `
    });
  }
}
```

**Report review SLAs:**
- **Critical:** 1 hour maximum (child safety, immediate danger)
- **High:** 4 hours maximum (harassment, personal info)
- **Medium:** 24 hours maximum (inappropriate content)
- **Low:** 72 hours maximum (spam, other)

**Justification:** Fast response to safety reports protects users. Priority-based triage ensures serious issues are addressed immediately. Automatic hiding of high-priority content prevents further harm. Victorian standards require prompt action on reports involving child safety.

---

### Parent/Guardian Controls

**Parental access and control features:**
```javascript
// api/parents/child-activity.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { parentUserId, childUserId } = req.query;

    // Verify parent-child relationship
    const { data: child } = await supabaseAdmin
      .from('users')
      .select('parent_email, date_of_birth, age_group')
      .eq('id', childUserId)
      .single();

    const { data: parent } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', parentUserId)
      .single();

    if (!child || !parent || child.parent_email !== parent.email) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Fetch child's content
    const { data: content } = await supabaseAdmin
      .from('content')
      .select('*')
      .eq('user_id', childUserId)
      .order('created_at', { ascending: false });

    // Fetch reports on child's content
    const contentIds = content.map(c => c.id);
    const { data: reports } = await supabaseAdmin
      .from('reports')
      .select('*')
      .in('content_id', contentIds);

    // Fetch groups child is in
    const { data: groups } = await supabaseAdmin
      .from('community_groups')
      .select('id, name, group_type, member_count')
      .contains('members', [childUserId]);

    // Log parental access
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'parent_viewed_child_activity',
      user_id: parentUserId,
      target_id: childUserId,
      details: { childAge: calculateAge(child.date_of_birth) },
      severity: 'info'
    });

    return res.status(200).json({
      success: true,
      data: {
        content: content.map(c => ({
          id: c.id,
          title: c.title,
          createdAt: c.created_at,
          moderationStatus: c.moderation_status,
          isVisible: c.is_visible
        })),
        reports: reports.map(r => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.created_at
        })),
        groups: groups.map(g => ({
          name: g.name,
          type: g.group_type,
          memberCount: g.member_count
        })),
        accountStatus: child.account_status,
        ageGroup: child.age_group
      }
    });

  } catch (error) {
    console.error('Parent activity view error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch child activity'
    });
  }
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
```

**Delete child account function:**
```javascript
// api/parents/delete-child-account.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { parentUserId, childUserId } = req.body;

    // Verify parent-child relationship
    const { data: child } = await supabaseAdmin
      .from('users')
      .select('parent_email, date_of_birth')
      .eq('id', childUserId)
      .single();

    const { data: parent } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', parentUserId)
      .single();

    if (!child || !parent || child.parent_email !== parent.email) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Delete all child's content (CASCADE will handle related data)
    await supabaseAdmin
      .from('content')
      .delete()
      .eq('user_id', childUserId);

    // Remove from all groups
    const { data: groups } = await supabaseAdmin
      .from('community_groups')
      .select('id, members, member_count')
      .contains('members', [childUserId]);

    for (const group of groups) {
      const updatedMembers = group.members.filter(id => id !== childUserId);
      await supabaseAdmin
        .from('community_groups')
        .update({
          members: updatedMembers,
          member_count: group.member_count - 1
        })
        .eq('id', group.id);
    }

    // Mark account as deleted (don't actually delete for audit purposes)
    await supabaseAdmin
      .from('users')
      .update({
        account_status: 'deleted',
        deleted_at: new Date().toISOString(),
        deleted_by: 'parent'
      })
      .eq('id', childUserId);

    // Log deletion
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'child_account_deleted',
      user_id: parentUserId,
      target_id: childUserId,
      details: {
        reason: 'parent_request',
        childAge: calculateAge(child.date_of_birth)
      },
      severity: 'warning'
    });

    return res.status(200).json({
      success: true,
      message: 'Account and all associated data have been deleted'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
}
```

**Justification:** Victorian standards require parents to have visibility and control over their children's online activities. This builds trust and gives parents tools to protect their children. Audit logging provides accountability and compliance records.

---

## General Platform Security

### Authentication Security

**Password requirements:**
```javascript
// lib/validation.js

export function validatePassword(password) {
  const requirements = {
    minLength: 10,
    requiresUppercase: true,
    requiresLowercase: true,
    requiresNumber: true,
    requiresSpecial: true
  };

  const errors = [];

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  if (requirements.requiresUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requirements.requiresLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requirements.requiresNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requirements.requiresSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check against common passwords
  const commonPasswords = [
    'password123',
    'qwerty123',
    'abc123456',
    '123456789',
    'password1'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

**Session security:**
```javascript
// Supabase Auth handles sessions automatically, but we can add additional checks

// api/auth/verify-session.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if account is active
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('account_status, last_active')
      .eq('id', user.id)
      .single();

    if (userData.account_status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Update last active timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user.id);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ error: 'Session verification failed' });
  }
}
```

**Justification:** Strong password requirements reduce account compromise risk. Session verification ensures only authenticated users access protected resources. Last active tracking helps identify inactive or compromised accounts.

---

### Rate Limiting

**Implement rate limiting to prevent abuse:**
```javascript
// lib/rate-limiter.js
import { supabaseAdmin } from './supabase';

const RATE_LIMITS = {
  ai_requests: {
    perMinute: 5,
    perHour: 50,
    perDay: 200
  },
  content_creation: {
    perMinute: 3,
    perHour: 30,
    perDay: 100
  },
  reports: {
    perMinute: 2,
    perHour: 10,
    perDay: 50
  },
  api_calls: {
    perMinute: 60,
    perHour: 1000
  }
};

export async function checkRateLimit(userId, action) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const limits = RATE_LIMITS[action];
  if (!limits) {
    return { allowed: true };
  }

  // Check per-minute limit
  if (limits.perMinute) {
    const { count: minuteCount } = await supabaseAdmin
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', oneMinuteAgo.toISOString());

    if (minuteCount >= limits.perMinute) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        retryAfter: 60,
        limit: 'per_minute'
      };
    }
  }

  // Check per-hour limit
  if (limits.perHour) {
    const { count: hourCount } = await supabaseAdmin
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', oneHourAgo.toISOString());

    if (hourCount >= limits.perHour) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        retryAfter: 3600,
        limit: 'per_hour'
      };
    }
  }

  // Check per-day limit
  if (limits.perDay) {
    const { count: dayCount } = await supabaseAdmin
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', oneDayAgo.toISOString());

    if (dayCount >= limits.perDay) {
      return {
        allowed: false,
        reason: 'Daily limit reached',
        retryAfter: 86400,
        limit: 'per_day'
      };
    }
  }

  // Log this request
  await supabaseAdmin.from('rate_limit_log').insert({
    user_id: userId,
    action,
    created_at: now.toISOString()
  });

  return { allowed: true };
}

// Clean up old rate limit logs (run periodically)
export async function cleanupRateLimitLogs() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await supabaseAdmin
    .from('rate_limit_log')
    .delete()
    .lt('created_at', twoDaysAgo.toISOString());
}
```

**Rate limit table schema:**
```sql
CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster rate limit checks
CREATE INDEX idx_rate_limit_user_action_time 
ON rate_limit_log(user_id, action, created_at DESC);
```

**Usage in API endpoints:**
```javascript
// api/ai/generate.js
import { checkRateLimit } from '../../lib/rate-limiter';

export default async function handler(req, res) {
  try {
    const { userId } = req.body;

    // Check rate limit
    const rateCheck = await checkRateLimit(userId, 'ai_requests');
    
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Please try again in ${rateCheck.retryAfter} seconds.`,
        retryAfter: rateCheck.retryAfter
      });
    }

    // Proceed with AI generation
    // ...

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Justification:** Rate limiting prevents abuse, reduces costs, and protects against malicious actors. Different limits for different actions provide appropriate controls. Database-backed rate limiting works across multiple Vercel function instances.

---

### Data Privacy & Protection

**Personal data handling:**
```javascript
// api/users/delete-account.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    // Get user data before deletion for audit log
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email, age_group, account_created')
      .eq('id', userId)
      .single();

    // Delete all user's content
    await supabaseAdmin
      .from('content')
      .delete()
      .eq('user_id', userId);

    // Remove from groups
    const { data: groups } = await supabaseAdmin
      .from('community_groups')
      .select('id, members, member_count')
      .contains('members', [userId]);

    for (const group of groups) {
      const updatedMembers = group.members.filter(id => id !== userId);
      await supabaseAdmin
        .from('community_groups')
        .update({
          members: updatedMembers,
          member_count: group.member_count - 1
        })
        .eq('id', group.id);
    }

    // Mark user as deleted (keep for audit purposes for 30 days)
    await supabaseAdmin
      .from('users')
      .update({
        account_status: 'deleted',
        email: `deleted_${userId}@deleted.local`, // Anonymize email
        username: `deleted_user_${userId}`,
        deleted_at: new Date().toISOString(),
        deletion_scheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .eq('id', userId);

    // Log deletion
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'account_deleted',
      user_id: userId,
      details: {
        ageGroup: user.age_group,
        accountAge: Math.floor((Date.now() - new Date(user.account_created).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
      },
      severity: 'warning'
    });

    return res.status(200).json({
      success: true,
      message: 'Account scheduled for deletion. All data will be permanently removed in 30 days.'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
}
```

**Data export (GDPR compliance):**
```javascript
// api/users/export-data.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    // Fetch all user data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: content } = await supabaseAdmin
      .from('content')
      .select('*')
      .eq('user_id', userId);

    const { data: reports } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('reporter_id', userId);

    const { data: auditLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000); // Limit to recent 1000 logs

    // Compile data export
    const dataExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        accountType: user.account_type,
        ageGroup: user.age_group,
        accountCreated: user.account_created,
        lastActive: user.last_active
      },
      content: content.map(c => ({
        id: c.id,
        title: c.title,
        body: c.body,
        contentType: c.content_type,
        createdAt: c.created_at,
        moderationStatus: c.moderation_status
      })),
      reports: reports.map(r => ({
        id: r.id,
        contentId: r.content_id,
        reportType: r.report_type,
        reason: r.reason,
        createdAt: r.created_at,
        status: r.status
      })),
      activityLog: auditLogs.map(log => ({
        action: log.action,
        timestamp: log.created_at,
        details: log.details
      }))
    };

    // Log data export
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'data_exported',
      user_id: userId,
      details: {
        contentCount: content.length,
        reportCount: reports.length
      },
      severity: 'info'
    });

    // Return as downloadable JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
    return res.status(200).json(dataExport);

  } catch (error) {
    console.error('Data export error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
}
```

**Justification:** Victorian standards and Australian privacy laws require platforms to allow users to access and delete their personal data. 30-day deletion window allows recovery of accidentally deleted accounts. Data export provides transparency and portability.

---

### Input Validation & Sanitisation

**Comprehensive input validation:**
```javascript
// lib/validation.js

export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  // 3-20 characters, letters, numbers, underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function sanitiseTextInput(text, maxLength = 5000) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input');
  }

  // Remove null bytes
  text = text.replace(/\0/g, '');

  // Trim whitespace
  text = text.trim();

  // Enforce max length
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }

  // Remove potentially dangerous Unicode characters
  text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return text;
}

export function validateContentType(contentType) {
  const validTypes = ['text', 'image', 'ai_generated', 'event', 'resource'];
  return validTypes.includes(contentType);
}

export function validateVisibility(visibility) {
  const validOptions = ['public', 'community', 'private', 'age_restricted'];
  return validOptions.includes(visibility);
}

export function validateDateOfBirth(dateString) {
  const date = new Date(dateString);
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Check if date is in the past
  if (date >= new Date()) {
    return { valid: false, error: 'Date of birth must be in the past' };
  }

  // Check if date is reasonable (not more than 120 years ago)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  
  if (date < minDate) {
    return { valid: false, error: 'Invalid date of birth' };
  }

  return { valid: true };
}

export function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

**Usage in API endpoints:**
```javascript
// api/content/create.js
import { validateUUID, sanitiseTextInput, validateVisibility } from '../../lib/validation';

export default async function handler(req, res) {
  try {
    const { title, body, visibility, userId } = req.body;

    // Validate inputs
    if (!validateUUID(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Content body is required' });
    }

    if (visibility && !validateVisibility(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility option' });
    }

    // Sanitise inputs
    const sanitisedTitle = sanitiseTextInput(title, 200);
    const sanitisedBody = sanitiseTextInput(body, 10000);

    // Proceed with content creation
    // ...

  } catch (error) {
    console.error('Content creation error:', error);
    return res.status(500).json({ error: 'Failed to create content' });
  }
}
```

**Justification:** Input validation prevents injection attacks, data corruption, and application errors. Sanitisation removes potentially dangerous content. Type checking ensures data integrity. Victorian standards require platforms to protect against malicious inputs.

---

### Performance Optimization

**Database query optimization:**
```javascript
// WRONG - N+1 query problem
async function getUsersWithContent() {
  const users = await supabase.from('users').select('*');
  
  for (const user of users.data) {
    const content = await supabase
      .from('content')
      .select('*')
      .eq('user_id', user.id);
    user.content = content.data;
  }
  
  return users.data;
}

// RIGHT - Single query with JOIN
async function getUsersWithContent() {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      content (
        id,
        title,
        created_at,
        moderation_status
      )
    `)
    .eq('account_status', 'active')
    .limit(50);
  
  return data;
}
```

**Pagination for large datasets:**
```javascript
// api/content/list.js
export default async function handler(req, res) {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;

    // Get user's age group for content filtering
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('age_group')
      .eq('id', userId)
      .single();

    // Build query with pagination
    let query = supabaseAdmin
      .from('content')
      .select('*, users(username, age_group)', { count: 'exact' })
      .eq('is_visible', true)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply age-appropriate filtering
    if (user.age_group === 'child') {
      query = query.eq('age_restriction', 'all_ages');
    } else if (user.age_group === 'teen') {
      query = query.in('age_restriction', ['all_ages', 'teens_and_up']);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
        hasMore: offset + limitNum < count
      }
    });

  } catch (error) {
    console.error('Content list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    });
  }
}
```

**Caching strategies:**
```javascript
// For frequently accessed, rarely changing data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedModerationConfig() {
  const cacheKey = 'moderation_config';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const { data } = await supabaseAdmin
    .from('moderation_config')
    .select('*')
    .single();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

**Justification:** Efficient queries reduce database load and improve response times. Pagination prevents memory issues with large datasets. Caching reduces database calls for frequently accessed data. These optimizations ensure platform remains fast as user base grows.

---

### Monitoring & Alerting

**Critical metrics to monitor:**

1. **User Safety Metrics**
   - Number of reports per hour
   - Critical/high-priority reports
   - Average report response time
   - Failed moderation checks

2.
