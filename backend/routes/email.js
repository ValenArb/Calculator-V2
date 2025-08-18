import express from 'express';
import emailService from '../config/email.js';

const router = express.Router();

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    const result = await emailService.testConfiguration();
    
    if (result.success) {
      res.json({
        message: 'Email service is configured correctly',
        status: 'operational'
      });
    } else {
      res.status(500).json({
        error: 'Email service configuration failed',
        details: result.error,
        status: 'disabled'
      });
    }
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      error: 'Email test failed',
      message: error.message
    });
  }
});

// Send invitation email
router.post('/invitation', async (req, res) => {
  try {
    console.log('🔍 Invitation email request received:', req.body);
    
    const { 
      to, 
      inviterName, 
      projectName, 
      role, 
      invitationLink 
    } = req.body;

    console.log('📧 Processing invitation email for:', {
      to,
      inviterName,
      projectName,
      role,
      invitationLink
    });

    // Validate required fields
    if (!to || !inviterName || !projectName || !role || !invitationLink) {
      console.error('❌ Missing required fields:', {
        to: !!to,
        inviterName: !!inviterName,
        projectName: !!projectName,
        role: !!role,
        invitationLink: !!invitationLink
      });
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'inviterName', 'projectName', 'role', 'invitationLink']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error('❌ Invalid email format:', to);
      return res.status(400).json({
        error: 'Invalid email format',
        email: to
      });
    }

    console.log('✅ Validation passed, sending email...');

    const result = await emailService.sendInvitationEmail({
      to,
      inviterName,
      projectName,
      role,
      invitationLink
    });

    console.log('📬 Email service result:', result);

    if (result.success) {
      res.json({
        message: 'Invitation email sent successfully',
        messageId: result.messageId,
        to: to
      });
    } else {
      res.status(500).json({
        error: 'Failed to send invitation email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error sending invitation email:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send notification email
router.post('/notification', async (req, res) => {
  try {
    const {
      to,
      title,
      message,
      actionUrl,
      actionText
    } = req.body;

    // Validate required fields
    if (!to || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'title', 'message']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = Array.isArray(to) ? to : [to];
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          email: email
        });
      }
    }

    const result = await emailService.sendNotificationEmail({
      to,
      title,
      message,
      actionUrl,
      actionText
    });

    if (result.success) {
      res.json({
        message: 'Notification email sent successfully',
        messageId: result.messageId,
        to: emails
      });
    } else {
      res.status(500).json({
        error: 'Failed to send notification email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error sending notification email:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send custom email
router.post('/send', async (req, res) => {
  try {
    const {
      to,
      subject,
      html,
      text,
      attachments
    } = req.body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'subject', 'html or text']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = Array.isArray(to) ? to : [to];
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          email: email
        });
      }
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      attachments: attachments || []
    });

    if (result.success) {
      res.json({
        message: 'Email sent successfully',
        messageId: result.messageId,
        to: emails
      });
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get email service status
router.get('/status', (req, res) => {
  res.json({
    configured: emailService.isConfigured,
    service: 'Gmail App Password',
    status: emailService.isConfigured ? 'operational' : 'disabled',
    message: emailService.isConfigured 
      ? 'Email service is ready to send emails'
      : 'Email service is not configured. Check environment variables.'
  });
});

export default router;