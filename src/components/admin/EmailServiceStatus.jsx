import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, RefreshCw, Send, Settings } from 'lucide-react';
import emailService from '../../services/email';
import toast from 'react-hot-toast';

const EmailServiceStatus = () => {
  const [status, setStatus] = useState({
    configured: false,
    status: 'checking',
    message: 'Verificando estado del servicio...'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);

  // Load email service status
  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const result = await emailService.getStatus();
      setStatus(result);
    } catch (error) {
      setStatus({
        configured: false,
        status: 'error',
        message: 'Error al verificar el estado del servicio de email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test email configuration
  const testConfiguration = async () => {
    setIsTesting(true);
    try {
      await emailService.testConfiguration();
      toast.success('Configuración de email válida');
      await loadStatus(); // Refresh status
    } catch (error) {
      toast.error('Error en la configuración de email: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  // Send test email
  const sendTestEmail = async (e, emailType = 'notification') => {
    if (e) e.preventDefault();
    
    if (!testEmail) {
      toast.error('Ingresa un email para enviar la prueba');
      return;
    }

    if (!emailService.isValidEmail(testEmail)) {
      toast.error('Formato de email inválido');
      return;
    }

    setIsTesting(true);
    try {
      let result;
      const timestamp = new Date().toLocaleString('es-AR');

      switch (emailType) {
        case 'invitation':
          result = await emailService.sendInvitation({
            email: testEmail,
            inviterName: 'Administrador del Sistema',
            projectName: 'Proyecto de Prueba - Instalación Eléctrica Demo',
            role: 'user',
            invitationToken: 'demo-token-123',
            projectId: 'demo-project-id'
          });
          toast.success(`Email de invitación de prueba enviado a ${testEmail}`);
          break;

        case 'protocol':
          result = await emailService.sendNotification({
            emails: [testEmail],
            title: 'Protocolo de Ensayo Completado',
            message: `
              <h3>📋 Protocolo de Ensayo Generado</h3>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">Edificio Comercial Centro</h4>
                <p><strong>Tipo de Protocolo:</strong> Protocolo de Ensayos FAT</p>
                <p><strong>Generado por:</strong> Administrador del Sistema</p>
                <p><strong>Fecha:</strong> ${timestamp}</p>
              </div>
              <p>El protocolo de ensayo ha sido generado exitosamente y está listo para descarga.</p>
              <div style="background: #dcfce7; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #166534;">
                  ✅ Este es un email de prueba del template de protocolos de ensayo.
                </p>
              </div>
            `,
            actionUrl: window.location.origin + '/project/demo',
            actionText: 'Ver Proyecto'
          });
          toast.success(`Email de protocolo de prueba enviado a ${testEmail}`);
          break;

        default: // notification
          result = await emailService.sendNotification({
            emails: [testEmail],
            title: 'Email de Prueba - Sistema NotiCalc',
            message: `
              <h3>🧪 Email de Prueba - NotiCalc</h3>
              <p>Este es un email de prueba enviado desde NotiCalc.</p>
              <p><strong>Timestamp:</strong> ${timestamp}</p>
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚡ Sistema de Gestión Eléctrica</strong><br>
                  Calculadora profesional para proyectos eléctricos con protocolos FAT.
                </p>
              </div>
              <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #1e40af;">
                  ✅ Si recibes este email, la configuración del servicio de email está funcionando correctamente.
                </p>
              </div>
            `,
            actionUrl: window.location.origin,
            actionText: 'Ir a NotiCalc'
          });
          toast.success(`Email de notificación de prueba enviado a ${testEmail}`);
          break;
      }
      
      console.log('Test email sent successfully:', result);
      
    } catch (error) {
      console.error('Test email error:', error);
      toast.error(`Error enviando email de prueba: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    if (status.status === 'operational') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (status.status === 'operational') return 'bg-green-100 border-green-200 text-green-800';
    if (status.status === 'disabled') return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    return 'bg-red-100 border-red-200 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Servicio de Email</h3>
      </div>

      {/* Status Display */}
      <div className={`border rounded-lg p-4 mb-4 ${getStatusColor()}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Estado: {status.status === 'operational' ? 'Operacional' : 
                        status.status === 'disabled' ? 'Deshabilitado' : 'Error'}
              </span>
              <button
                onClick={loadStatus}
                disabled={isLoading}
                className="text-sm px-3 py-1 rounded bg-white bg-opacity-70 hover:bg-opacity-100 transition-colors"
              >
                Actualizar
              </button>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {status.message}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      {status.configured && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </h4>
          <div className="text-sm text-blue-800">
            <p><strong>Servicio:</strong> {status.service || 'Gmail OAuth2'}</p>
            <p><strong>Estado:</strong> Configurado correctamente</p>
          </div>
        </div>
      )}

      {/* Not Configured Warning */}
      {!status.configured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Servicio No Configurado</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>Para habilitar el envío de emails, configura estas variables de entorno en el backend:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><code>GMAIL_USER</code> - Email de Gmail</li>
              <li><code>GMAIL_APP_PASSWORD</code> - Contraseña de aplicación de Gmail</li>
            </ul>
            <p className="mt-2 text-xs">
              💡 Requiere una cuenta Gmail con 2FA habilitado y contraseña de aplicación generada.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {status.configured && (
          <button
            onClick={testConfiguration}
            disabled={isTesting || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Probar Configuración
          </button>
        )}

        {status.configured && (
          <button
            onClick={() => setShowTestForm(!showTestForm)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar Email de Prueba
          </button>
        )}
      </div>

      {/* Test Email Form */}
      {showTestForm && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">📧 Enviar Email de Prueba</h4>
          
          <form onSubmit={sendTestEmail} className="space-y-4">
            {/* Email destinatario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinatario:
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Botones de email predefinidos */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTestEmail('valenarbert@gmail.com')}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Tu email principal
              </button>
              <button
                type="button"
                onClick={() => setTestEmail('noticalculadora@gmail.com')}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Email del sistema
              </button>
            </div>

            {/* Tipo de email de prueba */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de email de prueba:
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => sendTestEmail(null, 'notification')}
                  disabled={isTesting || !testEmail}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Email de Notificación</div>
                    <div className="text-sm text-gray-500">Prueba el template básico de notificaciones</div>
                  </div>
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <Send className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => sendTestEmail(null, 'invitation')}
                  disabled={isTesting || !testEmail}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Email de Invitación</div>
                    <div className="text-sm text-gray-500">Prueba el template de invitaciones a proyecto</div>
                  </div>
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <Send className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => sendTestEmail(null, 'protocol')}
                  disabled={isTesting || !testEmail}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Email de Protocolo</div>
                    <div className="text-sm text-gray-500">Prueba el template de reportes de protocolo</div>
                  </div>
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <Send className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                💡 Los emails se enviarán desde: noticalculadora@gmail.com
              </div>
              <button
                type="button"
                onClick={() => setShowTestForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmailServiceStatus;