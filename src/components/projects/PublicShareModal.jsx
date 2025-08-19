import React, { useState, useEffect } from 'react';
import { Link, Globe, Clock, Download, Copy, Trash2, Users, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Modal, AccessTimer } from '../ui';
import projectsService from '../../services/firebase/projects';

const PublicShareModal = ({ isOpen, onClose, project, onProjectUpdate }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  
  // Form state for new link
  const [linkOptions, setLinkOptions] = useState({
    expirationHours: 168, // 7 days default
    allowDownload: false,
    customExpiration: false
  });

  useEffect(() => {
    if (isOpen && project) {
      setShareLink(project.public_share_link || null);
    }
  }, [isOpen, project]);

  const handleGenerateLink = async () => {
    try {
      setGeneratingLink(true);
      
      const result = await projectsService.createPublicShareLink(project.id, user.uid, {
        expirationHours: linkOptions.expirationHours,
        allowDownload: linkOptions.allowDownload
      });
      
      const newShareLink = {
        token: result.shareToken,
        expires_at: result.expiresAt,
        created_at: new Date().toISOString(),
        created_by: user.uid,
        access_count: 0,
        is_active: true,
        permissions: {
          view_project: true,
          view_calculations: true,
          view_protocols: true,
          download_pdf: linkOptions.allowDownload
        }
      };
      
      setShareLink(newShareLink);
      
      if (onProjectUpdate) {
        onProjectUpdate();
      }
      
      toast.success('Enlace público generado exitosamente');
      
    } catch (error) {
      console.error('Error generating public link:', error);
      toast.error('Error al generar el enlace público');
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleRevokeLink = async () => {
    try {
      setLoading(true);
      
      await projectsService.revokePublicShareLink(project.id, user.uid);
      
      setShareLink(null);
      
      if (onProjectUpdate) {
        onProjectUpdate();
      }
      
      toast.success('Enlace público revocado exitosamente');
      
    } catch (error) {
      console.error('Error revoking public link:', error);
      toast.error('Error al revocar el enlace público');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const getShareUrl = () => {
    if (!shareLink) return '';
    return `${window.location.origin}/public/${project.id}/${shareLink.token}`;
  };

  const getExpirationOptions = () => [
    { value: 1, label: '1 hora' },
    { value: 6, label: '6 horas' },
    { value: 24, label: '1 día' },
    { value: 72, label: '3 días' },
    { value: 168, label: '1 semana' },
    { value: 720, label: '1 mes' },
    { value: 'custom', label: 'Personalizado' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartir Proyecto Públicamente">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Globe className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Compartir con Enlace Público</h3>
            <p className="text-sm text-blue-700">
              Cualquier persona con el enlace podrá ver este proyecto sin necesidad de autenticarse
            </p>
          </div>
        </div>

        {shareLink && shareLink.is_active ? (
          // Existing link management
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Enlace Público Activo</h4>
            
            {/* Link display */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg">
                <Link className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(getShareUrl())}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>

              {/* Link stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Visitado {shareLink.access_count || 0} veces</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Creado {new Date(shareLink.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Expiration timer */}
              <AccessTimer 
                expiryTime={shareLink.expires_at}
                showIcon={true}
                showText={true}
              />

              {/* Permissions */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900">Permisos Incluidos:</h5>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    <span>Ver información del proyecto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    <span>Ver cálculos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    <span>Ver protocolos</span>
                  </div>
                  {shareLink.permissions?.download_pdf && (
                    <div className="flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      <span>Descargar PDF</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleRevokeLink}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Revocando...' : 'Revocar Enlace'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          // Generate new link
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Generar Nuevo Enlace</h4>
            
            <div className="space-y-4">
              {/* Expiration time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Expiración
                </label>
                <select
                  value={linkOptions.customExpiration ? 'custom' : linkOptions.expirationHours}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setLinkOptions(prev => ({ ...prev, customExpiration: true }));
                    } else {
                      setLinkOptions(prev => ({ 
                        ...prev, 
                        expirationHours: parseInt(e.target.value),
                        customExpiration: false 
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={generatingLink}
                >
                  {getExpirationOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom expiration input */}
              {linkOptions.customExpiration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Personalizadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    value={linkOptions.expirationHours}
                    onChange={(e) => setLinkOptions(prev => ({ 
                      ...prev, 
                      expirationHours: parseInt(e.target.value) || 1 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 48"
                    disabled={generatingLink}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: 8760 horas (1 año)
                  </p>
                </div>
              )}

              {/* Download permission */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={linkOptions.allowDownload}
                  onChange={(e) => setLinkOptions(prev => ({ 
                    ...prev, 
                    allowDownload: e.target.checked 
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={generatingLink}
                />
                <label htmlFor="allowDownload" className="text-sm text-gray-700">
                  Permitir descarga de PDFs
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={generatingLink}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateLink}
                disabled={generatingLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {generatingLink ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Generar Enlace
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PublicShareModal;