import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  Activity,
  Download,
  Upload,
  Database,
  Eye,
  FileText
} from 'lucide-react';

const StatisticsSection = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock statistics data - will be replaced with API call
  const mockStats = {
    overview: {
      totalProjects: 12,
      activeProjects: 5,
      completedProjects: 6,
      draftProjects: 1,
      completionRate: 75
    },
    byStatus: {
      active: 5,
      completed: 6,
      draft: 1,
      archived: 0
    },
    byType: {
      residential: 7,
      commercial: 3,
      industrial: 2
    },
    activity: {
      last30Days: 24,
      activeProjectsLast30Days: 4
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/stats/dashboard?userId=${userId}`);
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // TODO: Implement quick actions
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend.positive ? '' : 'rotate-180'}`} />
            <span className="text-sm font-medium">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading for statistics cards */}
        <div>
          <div className="h-6 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading for quick actions */}
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Resumen de Actividad
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FolderOpen}
            title="Total Proyectos"
            value={stats.overview.totalProjects}
            subtitle="Todos los proyectos"
            color="blue"
          />
          
          <StatCard
            icon={Clock}
            title="Proyectos Activos"
            value={stats.overview.activeProjects}
            subtitle="En desarrollo"
            color="green"
          />
          
          <StatCard
            icon={CheckCircle}
            title="Completados"
            value={stats.overview.completedProjects}
            subtitle={`${stats.overview.completionRate}% tasa de finalización`}
            color="purple"
          />
          
          <StatCard
            icon={Activity}
            title="Actividad Reciente"
            value={stats.activity.last30Days}
            subtitle="Últimos 30 días"
            color="orange"
            trend={{ positive: true, value: '+12%' }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickAction('import')}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
          >
            <Upload className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-3 transition-colors" />
            <h3 className="font-medium text-gray-900 mb-1">Importar Datos</h3>
            <p className="text-sm text-gray-600">Importar proyectos desde archivo</p>
          </button>
          
          <button
            onClick={() => handleQuickAction('export')}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:bg-green-50 transition-all text-left group"
          >
            <Download className="w-8 h-8 text-gray-600 group-hover:text-green-600 mb-3 transition-colors" />
            <h3 className="font-medium text-gray-900 mb-1">Exportar Todo</h3>
            <p className="text-sm text-gray-600">Exportar todos los proyectos</p>
          </button>
          
          <button
            onClick={() => handleQuickAction('backup')}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
          >
            <Database className="w-8 h-8 text-gray-600 group-hover:text-purple-600 mb-3 transition-colors" />
            <h3 className="font-medium text-gray-900 mb-1">Respaldo</h3>
            <p className="text-sm text-gray-600">Crear respaldo de datos</p>
          </button>
          
          <button
            onClick={() => handleQuickAction('analytics')}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50 transition-all text-left group"
          >
            <Eye className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-3 transition-colors" />
            <h3 className="font-medium text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Ver análisis detallado</p>
          </button>
        </div>
      </div>

    </div>
  );
};

export default StatisticsSection;