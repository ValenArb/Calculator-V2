import { useState } from 'react';
import { Cpu, Zap, Activity } from 'lucide-react';

const PowerCalculations = () => {
  const [activeCalculation, setActiveCalculation] = useState('active-power');
  const [inputs, setInputs] = useState({
    currentType: 'alterna-monofasica',
    voltage: 220,
    current: 10,
    cosPhi: 0.9
  });
  const [results, setResults] = useState({});

  const calculations = [
    {
      id: 'active-power',
      name: 'Potencia Activa',
      description: 'Cálculo de potencia activa (W)',
      icon: Cpu
    },
    {
      id: 'apparent-power',
      name: 'Potencia Aparente',
      description: 'Cálculo de potencia aparente (VA)',
      icon: Zap
    },
    {
      id: 'reactive-power',
      name: 'Potencia Reactiva',
      description: 'Cálculo de potencia reactiva (VAR)',
      icon: Activity
    },
    {
      id: 'power-factor',
      name: 'Factor de Potencia',
      description: 'Cálculo del factor de potencia',
      icon: Cpu
    }
  ];

  const handleInputChange = (field, value) => {
    const numValue = isNaN(value) ? value : parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateActivePower = () => {
    const { currentType, voltage, current, cosPhi } = inputs;
    let power;

    switch (currentType) {
      case 'continua':
        power = voltage * current;
        break;
      case 'alterna-monofasica':
        power = voltage * current * cosPhi;
        break;
      case 'alterna-trifasica':
        power = Math.sqrt(3) * voltage * current * cosPhi;
        break;
      case 'alterna-bifasica':
        power = 2 * voltage * current * cosPhi;
        break;
      default:
        power = 0;
    }

    setResults({
      activePower: power.toFixed(2)
    });
  };

  const calculateApparentPower = () => {
    const { currentType, voltage, current } = inputs;
    let power;

    switch (currentType) {
      case 'alterna-monofasica':
        power = voltage * current;
        break;
      case 'alterna-trifasica':
        power = Math.sqrt(3) * voltage * current;
        break;
      case 'alterna-bifasica':
        power = 2 * voltage * current;
        break;
      default:
        power = 0;
    }

    setResults({
      apparentPower: power.toFixed(2)
    });
  };

  const calculateReactivePower = () => {
    const { currentType, voltage, current, cosPhi } = inputs;
    const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
    let power;

    switch (currentType) {
      case 'alterna-monofasica':
        power = voltage * current * sinPhi;
        break;
      case 'alterna-trifasica':
        power = Math.sqrt(3) * voltage * current * sinPhi;
        break;
      case 'alterna-bifasica':
        power = 2 * voltage * current * sinPhi;
        break;
      default:
        power = 0;
    }

    setResults({
      reactivePower: power.toFixed(2)
    });
  };

  const calculatePowerFactor = () => {
    // This would require active and apparent power as inputs
    // For demonstration, we'll show the calculation from V, I, P
    const { voltage, current } = inputs;
    const activePower = parseFloat(inputs.activePower) || 0;
    const apparentPower = voltage * current;
    const powerFactor = activePower / apparentPower;
    const angle = Math.acos(powerFactor) * (180 / Math.PI);

    setResults({
      powerFactor: powerFactor.toFixed(3),
      angle: angle.toFixed(1)
    });
  };

  const handleCalculate = () => {
    switch (activeCalculation) {
      case 'active-power':
        calculateActivePower();
        break;
      case 'apparent-power':
        calculateApparentPower();
        break;
      case 'reactive-power':
        calculateReactivePower();
        break;
      case 'power-factor':
        calculatePowerFactor();
        break;
    }
  };

  const renderResults = () => {
    if (Object.keys(results).length === 0) return null;

    switch (activeCalculation) {
      case 'active-power':
        return (
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium mb-2">Potencia Activa</div>
              <div className="text-4xl font-bold text-blue-900">{results.activePower} W</div>
            </div>
          </div>
        );

      case 'apparent-power':
        return (
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-green-600 font-medium mb-2">Potencia Aparente</div>
              <div className="text-4xl font-bold text-green-900">{results.apparentPower} VA</div>
            </div>
          </div>
        );

      case 'reactive-power':
        return (
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-purple-600 font-medium mb-2">Potencia Reactiva</div>
              <div className="text-4xl font-bold text-purple-900">{results.reactivePower} VAR</div>
            </div>
          </div>
        );

      case 'power-factor':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-orange-600 font-medium">Factor de Potencia</div>
                <div className="text-3xl font-bold text-orange-900">{results.powerFactor}</div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-orange-600 font-medium">Ángulo de Fase</div>
                <div className="text-3xl font-bold text-orange-900">{results.angle}°</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cálculos de Potencia</h2>
        <p className="text-gray-600">Cálculos de potencia activa, aparente y reactiva</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {calculations.map((calc) => {
            const Icon = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => {
                  setActiveCalculation(calc.id);
                  setResults({});
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeCalculation === calc.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">{calc.name}</div>
                  <div className="text-xs opacity-75">{calc.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros</h3>
          
          <div className="space-y-4">
            {activeCalculation !== 'apparent-power' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de corriente
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'continua', label: 'Continua' },
                    { value: 'alterna-monofasica', label: 'AC Monofásica' },
                    { value: 'alterna-bifasica', label: 'AC Bifásica' },
                    { value: 'alterna-trifasica', label: 'AC Trifásica' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('currentType', type.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        inputs.currentType === type.value 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tensión (V)
                </label>
                <input
                  type="number"
                  value={inputs.voltage}
                  onChange={(e) => handleInputChange('voltage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente (A)
                </label>
                <input
                  type="number"
                  value={inputs.current}
                  onChange={(e) => handleInputChange('current', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {(activeCalculation === 'active-power' || activeCalculation === 'reactive-power') && inputs.currentType !== 'continua' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    cos φ
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={inputs.cosPhi}
                    onChange={(e) => handleInputChange('cosPhi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {activeCalculation === 'power-factor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Potencia Activa (W)
                  </label>
                  <input
                    type="number"
                    value={inputs.activePower}
                    onChange={(e) => handleInputChange('activePower', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleCalculate}
            className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Calcular
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h3>
          {Object.keys(results).length > 0 ? (
            renderResults()
          ) : (
            <div className="text-center py-8">
              <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Ingresa los parámetros y haz clic en "Calcular"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerCalculations;