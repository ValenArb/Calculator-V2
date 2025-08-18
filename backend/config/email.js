import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Gmail App Password Configuration
const GMAIL_USER = process.env.GMAIL_USER || 'noticalculadora@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeService();
  }

  initializeService() {
    try {
      // Debug: Log environment variables (without showing the password)
      console.log('🔍 Email service initialization...');
      console.log('GMAIL_USER:', GMAIL_USER);
      console.log('GMAIL_APP_PASSWORD configured:', GMAIL_APP_PASSWORD ? 'YES' : 'NO');
      console.log('GMAIL_APP_PASSWORD length:', GMAIL_APP_PASSWORD ? GMAIL_APP_PASSWORD.length : 0);
      console.log('GMAIL_APP_PASSWORD first 4 chars:', GMAIL_APP_PASSWORD ? GMAIL_APP_PASSWORD.substring(0, 4) + '...' : 'N/A');
      
      // Check if Gmail app password is configured
      if (!GMAIL_APP_PASSWORD) {
        console.warn('⚠️ Gmail App Password not configured. Email service will be disabled.');
        console.warn('To enable email service, configure these environment variables:');
        console.warn('- GMAIL_APP_PASSWORD (Gmail 2FA App Password)');
        console.warn('- GMAIL_USER (optional, defaults to noticalculadora@gmail.com)');
        return;
      }

      // Create transporter with App Password authentication
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.isConfigured = true;
      console.log('✅ Gmail App Password service initialized successfully');
      console.log(`📧 Sending emails from: ${GMAIL_USER}`);

    } catch (error) {
      console.error('❌ Failed to initialize Gmail App Password service:', error.message);
      this.isConfigured = false;
    }
  }

  async createTransporter() {
    if (!this.isConfigured) {
      throw new Error('Email service is not configured. Please check your environment variables.');
    }

    return this.transporter;
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    if (!this.isConfigured) {
      console.warn('Email service not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `NotiCalc <${GMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.stripHtml(html),
        attachments
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', {
        messageId: result.messageId,
        to: mailOptions.to,
        subject
      });

      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send invitation email
  async sendInvitationEmail({ to, inviterName, projectName, role, invitationLink }) {
    console.log('🔍 EmailService.sendInvitationEmail called with:', {
      to, inviterName, projectName, role, invitationLink
    });
    
    const roleTranslations = {
      owner: 'Propietario',
      admin: 'Administrador', 
      user: 'Usuario',
      viewer: 'Visualizador'
    };

    const subject = `NotiCalc - Invitación: ${projectName}`;
    console.log('📧 Prepared email subject:', subject);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
            }
            .header { 
              background-color: #2563eb; 
              color: white; 
              padding: 20px; 
              text-align: center; 
            }
            .content { 
              padding: 30px; 
              background-color: #f8fafc; 
            }
            .button { 
              display: inline-block; 
              background-color: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .role-badge { 
              background-color: #dbeafe; 
              color: #1e40af; 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 14px; 
              font-weight: bold; 
            }
            .footer { 
              padding: 20px; 
              text-align: center; 
              color: #64748b; 
              font-size: 14px; 
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>📧 NotiCalc - Invitación</h1>
            </div>
            
            <div class="content">
              <p>¡Hola!</p>
              
              <p><strong>${inviterName}</strong> te ha invitado a colaborar en el proyecto:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">📋 ${projectName}</h3>
                <p style="margin: 5px 0;">
                  <strong>Tu rol:</strong> 
                  <span class="role-badge">${roleTranslations[role] || role}</span>
                </p>
              </div>
              
              <p>Como <strong>${roleTranslations[role] || role}</strong>, tendrás acceso a las funcionalidades correspondientes del proyecto según tu nivel de permisos.</p>
              
              <div style="text-align: center;">
                <a href="${invitationLink}" class="button">🚀 Aceptar Invitación</a>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚡ NotiCalc - Sistema Eléctrico</strong><br>
                  Plataforma profesional de gestión de proyectos eléctricos con protocolos FAT.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado desde NotiCalc</p>
              <p style="font-size: 12px;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('🚀 Calling sendEmail with params:', { to, subject });
    const result = await this.sendEmail({ to, subject, html });
    console.log('📬 sendEmail result:', result);
    return result;
  }

  // Send notification email
  async sendNotificationEmail({ to, title, message, actionUrl, actionText }) {
    const subject = `NotiCalc - ${title}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
            }
            .header { 
              background-color: #059669; 
              color: white; 
              padding: 20px; 
              text-align: center; 
            }
            .content { 
              padding: 30px; 
              background-color: #f0fdfa; 
            }
            .button { 
              display: inline-block; 
              background-color: #059669; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .footer { 
              padding: 20px; 
              text-align: center; 
              color: #64748b; 
              font-size: 14px; 
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🔔 ${title}</h1>
            </div>
            
            <div class="content">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
                ${message}
              </div>
              
              ${actionUrl && actionText ? `
                <div style="text-align: center;">
                  <a href="${actionUrl}" class="button">${actionText}</a>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado desde NotiCalc</p>
              <p style="font-size: 12px;">Sistema de Gestión de Proyectos Eléctricos</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  // Utility function to strip HTML tags for plain text version
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  // Test email configuration
  async testConfiguration() {
    console.log('🔍 Testing email configuration...');
    console.log('isConfigured:', this.isConfigured);
    
    if (!this.isConfigured) {
      console.log('❌ Service not configured');
      return { success: false, error: 'Service not configured' };
    }

    try {
      console.log('🔍 Getting transporter...');
      const transporter = await this.createTransporter();
      console.log('✅ Transporter obtained, verifying connection...');
      
      await transporter.verify();
      console.log('✅ Email configuration test passed');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();
export default emailService;