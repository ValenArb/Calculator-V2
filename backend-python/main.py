from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
from calculations.dpms import DPMSCalculator
from calculations.loads_per_panel import LoadsPerPanelCalculator
from calculations.thermal import ThermalCalculator
from calculations.voltage_drop import VoltageDropCalculator
from calculations.short_circuit import ShortCircuitCalculator
from calculations.electrical_constants import ElectricalValidation

app = FastAPI(
    title="Calculadora Eléctrica API",
    description="Backend de cálculos eléctricos para la aplicación Calculadora Eléctrica",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class DimensionsModel(BaseModel):
    x: float
    y: float
    h: float

class CargaModel(BaseModel):
    cantidadBocas: int
    identificacionCircuito: str
    dpms: float
    fase: str
    corriente: float

class CargasModel(BaseModel):
    TUG: List[CargaModel] = []
    IUG: List[CargaModel] = []
    ATE: List[CargaModel] = []
    ACU: List[CargaModel] = []
    TUE: List[CargaModel] = []
    OCE: List[CargaModel] = []

class DPMSModel(BaseModel):
    id: str
    denominacionTablero: str
    denominacionAmbiente: str
    dimensiones: DimensionsModel
    superficie: float
    gradoElectrificacion: str
    cargas: CargasModel

class LoadsByPanelModel(BaseModel):
    id: str
    identificacionTablero: str
    lineaOCarga: str
    tipoCarga: str
    alimentacion: str
    potenciaAparente: float
    cosPhi: float

class ThermalModel(BaseModel):
    id: str
    circuito: str
    corriente: float
    conductor: str
    seccion: float
    capacidadPortante: float
    temperatura: float

class VoltageDropModel(BaseModel):
    id: str
    circuito: str
    longitud: float
    corriente: float
    seccion: float
    caidaTension: float
    caidaPermisible: float

class ShortCircuitModel(BaseModel):
    id: str
    punto: str
    corrienteCC: float
    tiempo: float
    energia: float

# Request Models
class DPMSCalculationRequest(BaseModel):
    data: List[DPMSModel]

class LoadsCalculationRequest(BaseModel):
    data: List[LoadsByPanelModel]

class ThermalCalculationRequest(BaseModel):
    data: List[ThermalModel]

class VoltageDropCalculationRequest(BaseModel):
    data: List[VoltageDropModel]

class ShortCircuitCalculationRequest(BaseModel):
    data: List[ShortCircuitModel]

# Initialize calculators
dpms_calculator = DPMSCalculator()
loads_calculator = LoadsPerPanelCalculator()
thermal_calculator = ThermalCalculator()
voltage_drop_calculator = VoltageDropCalculator()
short_circuit_calculator = ShortCircuitCalculator()

@app.get("/")
async def root():
    return {"message": "Calculadora Eléctrica API - Funcionando correctamente"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/calculate/dpms")
async def calculate_dpms(request: DPMSCalculationRequest):
    """
    Calcula DPMS (Determinación de la Potencia Máxima Simultánea)
    """
    try:
        results = []
        for item in request.data:
            result = dpms_calculator.calculate(item.dict())
            results.append(result)
        return {"results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en cálculo DPMS: {str(e)}")

@app.post("/calculate/loads-per-panel")
async def calculate_loads_per_panel(request: LoadsCalculationRequest):
    """
    Calcula cargas por tablero
    """
    try:
        results = []
        for item in request.data:
            result = loads_calculator.calculate(item.dict())
            results.append(result)
        return {"results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en cálculo de cargas: {str(e)}")

@app.post("/calculate/thermal")
async def calculate_thermal(request: ThermalCalculationRequest):
    """
    Calcula verificación térmica de conductores
    """
    try:
        results = []
        for item in request.data:
            result = thermal_calculator.calculate(item.dict())
            results.append(result)
        return {"results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en cálculo térmico: {str(e)}")

@app.post("/calculate/voltage-drop")
async def calculate_voltage_drop(request: VoltageDropCalculationRequest):
    """
    Calcula caída de tensión
    """
    try:
        results = []
        for item in request.data:
            result = voltage_drop_calculator.calculate(item.dict())
            results.append(result)
        return {"results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en cálculo de caída de tensión: {str(e)}")

@app.post("/calculate/short-circuit")
async def calculate_short_circuit(request: ShortCircuitCalculationRequest):
    """
    Calcula corriente de cortocircuito
    """
    try:
        results = []
        for item in request.data:
            result = short_circuit_calculator.calculate(item.dict())
            results.append(result)
        return {"results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en cálculo de cortocircuito: {str(e)}")

@app.post("/validate/electrical-parameters")
async def validate_electrical_parameters(data: dict):
    """
    Valida parámetros eléctricos básicos
    """
    try:
        results = {}
        
        if 'voltage' in data:
            results['voltage_valid'] = ElectricalValidation.validate_voltage(data['voltage'])
            
        if 'current' in data:
            results['current_valid'] = ElectricalValidation.validate_current(data['current'])
            
        if 'power_factor' in data:
            results['power_factor_valid'] = ElectricalValidation.validate_power_factor(data['power_factor'])
            
        if 'conductor_section' in data:
            results['conductor_section_valid'] = ElectricalValidation.validate_conductor_section(data['conductor_section'])
            
        if 'temperature' in data:
            results['temperature_valid'] = ElectricalValidation.validate_temperature(data['temperature'])
            
        return {"validation_results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en validación: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)