import { useState } from 'react';
import { X, Mail, UserPlus, Shield, Send, Users, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminsService } from '../../services/firebase/admins';

const InviteAdminModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onAdminInvited
}) => {
  const [inviteForm, setInviteForm] = useState({
    email: '',
    message: ''
  });
  const [isInviting, setIsInviting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setInviteForm({ email: '', message: '' });
    setValidationError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = async () => {
    try {
      // Validation
      if (!inviteForm.email.trim()) {
        setValidationError('El email es obligatorio');
        return;
      }

      if (!validateEmail(inviteForm.email)) {
        setValidationError('Ingresa un email válido');
        return;
      }

      // Check if email is current user
      if (inviteForm.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
        setValidationError('No puedes invitarte a ti mismo');
        return;
      }

      // Check if user is already admin
      const isAlreadyAdmin = await adminsService.isAdminInFirebase(inviteForm.email);
      if (isAlreadyAdmin) {
        setValidationError('Este usuario ya es administrador');
        return;
      }

      setValidationError('');
      setIsInviting(true);

      // Send invitation
      const invitationId = await adminsService.sendAdminInvitation(
        inviteForm.email,
        currentUser.email,
        inviteForm.message
      );

      toast.success(`Invitación enviada a ${inviteForm.email}`);
      
      if (onAdminInvited) {
        onAdminInvited(inviteForm.email);
      }

      handleClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación: ' + error.message);
    } finally {
      setIsInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Invitar Administrador
                </h2>
                <p className="text-sm text-gray-600">
                  Agrega un nuevo administrador al sistema
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Permisos de Administrador
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Agregar códigos de error</li>
                  <li>• Crear fabricantes y líneas de productos</li>
                  <li>• Invitar otros administradores</li>
                  <li>• Gestionar la base de datos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Nuevo Administrador *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={inviteForm.email}
                  onChange={(e) => {
                    setInviteForm(prev => ({ ...prev, email: e.target.value }));
                    setValidationError('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isInviting}
                />
              </div>
              {validationError && (
                <div className="flex items-center space-x-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">{validationError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de Bienvenida (Opcional)
              </label>
              <textarea
                placeholder="Mensaje personalizado para el nuevo administrador..."
                rows={3}
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isInviting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Este mensaje será incluido en la notificación de invitación
              </p>
            </div>
          </div>

          {/* Current User Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Invitando como: <span className="font-medium">{currentUser?.email}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isInviting}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleInvite}
              disabled={isInviting || !inviteForm.email.trim()}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
                isInviting || !inviteForm.email.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {isInviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Invitación</span>
                </>
              )}
            </button>
          </div>

          {/* Success Note */}
          <div className="mt-4 flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800">
              <p className="font-medium mb-1">Nota:</p>
              <p>El usuario será agregado inmediatamente como administrador. En el futuro se implementará un sistema de invitaciones por email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteAdminModal;