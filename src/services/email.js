// Email service for sending various types of emails
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class EmailService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/email`;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Email API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Test email service configuration
  async testConfiguration() {
    try {
      return await this.request('/test');
    } catch (error) {
      console.error('Email service test failed:', error);
      throw error;
    }
  }

  // Get email service status
  async getStatus() {
    try {
      return await this.request('/status');
    } catch (error) {
      console.error('Failed to get email service status:', error);
      return {
        configured: false,
        status: 'error',
        message: 'Failed to check email service status'
      };
    }
  }

  // Send invitation email
  async sendInvitation({ 
    email, 
    inviterName, 
    projectName, 
    role, 
    invitationToken,
    projectId 
  }) {
    try {
      console.log('🔍 EmailService.sendInvitation called with:', {
        email, 
        inviterName, 
        projectName, 
        role, 
        invitationToken,
        projectId
      });
      
      // Generate invitation link
      const baseUrl = window.location.origin;
      const invitationLink = `${baseUrl}/accept-invitation?token=${invitationToken}&project=${projectId}`;

      console.log('🔗 Generated invitation link:', invitationLink);

      const requestData = {
        to: email,
        inviterName,
        projectName,
        role,
        invitationLink
      };
      
      console.log('📧 Sending request to backend with:', requestData);

      const result = await this.request('/invitation', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log('✅ Backend response:', result);
      console.log('✅ Invitation email sent successfully:', {
        to: email,
        project: projectName,
        role
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to send invitation email:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  // Send notification email
  async sendNotification({
    emails,
    title,
    message,
    actionUrl = null,
    actionText = null
  }) {
    try {
      const result = await this.request('/notification', {
        method: 'POST',
        body: JSON.stringify({
          to: Array.isArray(emails) ? emails : [emails],
          title,
          message,
          actionUrl,
          actionText
        })
      });

      console.log('✅ Notification email sent:', {
        to: emails,
        title
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to send notification email:', error);
      throw error;
    }
  }

  // Send custom email
  async sendCustomEmail({
    emails,
    subject,
    htmlContent,
    textContent = null,
    attachments = []
  }) {
    try {
      const result = await this.request('/send', {
        method: 'POST',
        body: JSON.stringify({
          to: Array.isArray(emails) ? emails : [emails],
          subject,
          html: htmlContent,
          text: textContent,
          attachments
        })
      });

      console.log('✅ Custom email sent:', {
        to: emails,
        subject
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to send custom email:', error);
      throw error;
    }
  }

  // Send project update notification
  async sendProjectUpdate({
    projectCollaborators,
    projectName,
    updateType,
    updatedBy,
    details,
    projectId
  }) {
    try {
      const collaboratorEmails = projectCollaborators
        .filter(collab => collab.email && collab.email !== updatedBy)
        .map(collab => collab.email);

      if (collaboratorEmails.length === 0) {
        console.log('No collaborators to notify for project update');
        return { success: true, message: 'No collaborators to notify' };
      }

      const updateMessages = {
        'project_modified': `El proyecto "${projectName}" ha sido modificado`,
        'calculations_updated': `Se han actualizado los cálculos en "${projectName}"`,
        'collaborator_added': `Se ha agregado un nuevo colaborador al proyecto "${projectName}"`,
        'document_generated': `Se ha generado un nuevo documento para "${projectName}"`,
        'protocol_completed': `Se ha completado un protocolo de ensayo en "${projectName}"`
      };

      const message = updateMessages[updateType] || `Se ha actualizado el proyecto "${projectName}"`;
      const actionUrl = `${window.location.origin}/project/${projectId}`;

      return await this.sendNotification({
        emails: collaboratorEmails,
        title: 'Actualización de Proyecto',
        message: `
          <h3>${message}</h3>
          <p><strong>Actualizado por:</strong> ${updatedBy}</p>
          ${details ? `<p><strong>Detalles:</strong> ${details}</p>` : ''}
        `,
        actionUrl,
        actionText: 'Ver Proyecto'
      });

    } catch (error) {
      console.error('❌ Failed to send project update notification:', error);
      throw error;
    }
  }

  // Send PDF protocol email
  async sendProtocolReport({
    emails,
    projectName,
    protocolType,
    generatedBy,
    pdfAttachment = null
  }) {
    try {
      const subject = `Protocolo ${protocolType} - ${projectName}`;
      const html = `
        <h2>📋 Protocolo de Ensayo Generado</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">${projectName}</h3>
          <p><strong>Tipo de Protocolo:</strong> ${protocolType}</p>
          <p><strong>Generado por:</strong> ${generatedBy}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
        </div>
        <p>El protocolo de ensayo ha sido generado y está disponible ${pdfAttachment ? 'como archivo adjunto' : 'para descarga en el proyecto'}.</p>
      `;

      const attachments = pdfAttachment ? [pdfAttachment] : [];

      return await this.sendCustomEmail({
        emails,
        subject,
        htmlContent: html,
        attachments
      });

    } catch (error) {
      console.error('❌ Failed to send protocol report email:', error);
      throw error;
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Batch email validation
  validateEmails(emails) {
    const emailList = Array.isArray(emails) ? emails : [emails];
    const invalid = emailList.filter(email => !this.isValidEmail(email));
    
    return {
      valid: invalid.length === 0,
      invalidEmails: invalid,
      validEmails: emailList.filter(email => this.isValidEmail(email))
    };
  }
}

// Create and export a singleton instance
const emailService = new EmailService();

export default emailService;

// Export individual methods for convenience
export const {
  testConfiguration,
  getStatus,
  sendInvitation,
  sendNotification,
  sendCustomEmail,
  sendProjectUpdate,
  sendProtocolReport,
  isValidEmail,
  validateEmails
} = emailService;