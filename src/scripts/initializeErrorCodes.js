// Script to initialize error codes database with sample data
// Run this script once after setting up Firebase rules

import { errorCodesService } from '../services/firebase/errorCodes.js';

const sampleData = {
  manufacturers: [
    {
      id: 'abb',
      name: 'ABB',
      lines: [
        {
          id: 'acs880',
          name: 'ACS880 - Variadores de Frecuencia',
          hasSubLines: false,
          errorCodes: [
            {
              code: '2210',
              title: 'Falla de Fase de Entrada',
              description: 'Pérdida de una o más fases en la alimentación del variador',
              causes: [
                'Fusible de entrada quemado',
                'Contactor de línea defectuoso',
                'Cables de alimentación dañados',
                'Problemas en la red eléctrica'
              ],
              solutions: [
                'Verificar y reemplazar fusibles de entrada',
                'Inspeccionar el contactor de línea',
                'Revisar continuidad de cables de alimentación',
                'Verificar voltajes de red trifásica'
              ],
              severity: 'high'
            },
            {
              code: '2230',
              title: 'Sobrecorriente Instantánea',
              description: 'El variador detectó una sobrecorriente instantánea en la salida',
              causes: [
                'Cortocircuito en cables del motor',
                'Falla en el motor',
                'Aceleración muy rápida',
                'Carga mecánica bloqueada'
              ],
              solutions: [
                'Verificar aislamiento de cables del motor',
                'Inspeccionar el motor y sus conexiones',
                'Ajustar rampa de aceleración',
                'Verificar carga mecánica'
              ],
              severity: 'high'
            }
          ]
        }
      ]
    },
    {
      id: 'siemens',
      name: 'Siemens',
      lines: [
        {
          id: 'sinamics',
          name: 'SINAMICS - Variadores de Frecuencia',
          hasSubLines: true,
          subLines: [
            {
              id: 'g120',
              name: 'G120 - Aplicaciones Estándar',
              errorCodes: [
                {
                  code: 'F0001',
                  title: 'Sobrecorriente',
                  description: 'El variador ha detectado una sobrecorriente',
                  causes: [
                    'Cortocircuito en el motor o cables',
                    'Motor bloqueado mecánicamente',
                    'Parámetros incorrectos del motor',
                    'Rampa de desaceleración muy corta'
                  ],
                  solutions: [
                    'Verificar aislamiento del motor y cables',
                    'Liberar bloqueo mecánico',
                    'Configurar correctamente parámetros del motor',
                    'Aumentar tiempo de rampa de desaceleración'
                  ],
                  severity: 'high'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'schneider',
      name: 'Schneider Electric',
      lines: [
        {
          id: 'altivar',
          name: 'Altivar - Variadores de Velocidad',
          hasSubLines: true,
          subLines: [
            {
              id: 'atv32',
              name: 'ATV32 - Variadores Compactos',
              errorCodes: [
                {
                  code: 'OCF',
                  title: 'Sobrecorriente',
                  description: 'Detección de sobrecorriente en la salida del variador',
                  causes: [
                    'Cortocircuito entre fases del motor',
                    'Cortocircuito fase-tierra',
                    'Motor bloqueado',
                    'Aceleración/desaceleración muy rápida'
                  ],
                  solutions: [
                    'Verificar aislamiento entre fases del motor',
                    'Revisar conexión a tierra del motor',
                    'Liberar bloqueo mecánico del motor',
                    'Ajustar rampas de aceleración/desaceleración'
                  ],
                  severity: 'high'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  productCodes: [
    { code: 'ACS880-01', manufacturer: 'abb', line: 'acs880' },
    { code: 'ACS880-11', manufacturer: 'abb', line: 'acs880' },
    { code: 'G120C', manufacturer: 'siemens', line: 'sinamics', subLine: 'g120' },
    { code: 'G120P', manufacturer: 'siemens', line: 'sinamics', subLine: 'g120' },
    { code: 'ATV32H', manufacturer: 'schneider', line: 'altivar', subLine: 'atv32' },
    { code: 'ATV32HU', manufacturer: 'schneider', line: 'altivar', subLine: 'atv32' }
  ]
};

export async function initializeErrorCodesDatabase() {
  try {
    console.log('Initializing error codes database...');
    
    // Add manufacturers
    for (const manufacturer of sampleData.manufacturers) {
      console.log(`Adding manufacturer: ${manufacturer.name}`);
      await errorCodesService.addManufacturer({
        name: manufacturer.name
      });
      
      // Add lines
      for (const line of manufacturer.lines) {
        console.log(`Adding line: ${line.name}`);
        await errorCodesService.addLine(manufacturer.id, {
          name: line.name,
          hasSubLines: line.hasSubLines
        });
        
        if (line.hasSubLines && line.subLines) {
          // Add sublines
          for (const subLine of line.subLines) {
            console.log(`Adding subline: ${subLine.name}`);
            await errorCodesService.addSubLine(manufacturer.id, line.id, {
              name: subLine.name
            });
            
            // Add error codes to subline
            for (const errorCode of subLine.errorCodes) {
              console.log(`Adding error code: ${errorCode.code} to ${subLine.name}`);
              await errorCodesService.addErrorCode(
                manufacturer.id,
                line.id,
                subLine.id,
                errorCode
              );
            }
          }
        } else if (line.errorCodes) {
          // Add error codes directly to line
          for (const errorCode of line.errorCodes) {
            console.log(`Adding error code: ${errorCode.code} to ${line.name}`);
            await errorCodesService.addErrorCode(
              manufacturer.id,
              line.id,
              null,
              errorCode
            );
          }
        }
      }
    }
    
    // Add product codes
    for (const productCode of sampleData.productCodes) {
      console.log(`Adding product code: ${productCode.code}`);
      await errorCodesService.addProductCode(
        productCode.code,
        productCode.manufacturer,
        productCode.line,
        productCode.subLine
      );
    }
    
    console.log('Error codes database initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Uncomment the line below to run the initialization
// initializeErrorCodesDatabase();