import { Construction } from 'lucide-react';

const ComingSoon = ({ title, description }) => {
  return (
    <div className="p-8 text-center">
      <Construction className="w-16 h-16 text-orange-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
        <div className="text-sm text-orange-800">
          <strong>🚧 Calculadora en desarrollo</strong>
        </div>
        <div className="text-xs text-orange-600 mt-1">
          Esta herramienta estará disponible en próximas actualizaciones
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Mientras tanto, puedes usar las calculadoras disponibles en otras categorías</p>
      </div>
    </div>
  );
};

export default ComingSoon;