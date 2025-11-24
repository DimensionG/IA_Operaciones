"use client";
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function Calculadora() {
  const [modeloActual, setModeloActual] = useState(null);
  const [operacion, setOperacion] = useState('suma');
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [estadoModelo, setEstadoModelo] = useState('Cargando modelos...');

  // Cargar modelo cuando cambia la operación
  useEffect(() => {
    let isMounted = true;

    async function cargarModelo() {
      if (!isMounted) return;
      
      setModeloActual(null);
      setResultado(null);
      setEstadoModelo(`Cargando modelo de ${operacion}...`);

      try {
        const path = operacion === 'suma' 
          ? '/modelo_suma/model.json' 
          : '/modelo_resta/model.json';
        
        console.log(`🔄 Cargando modelo desde: ${path}`);
        const modelo = await tf.loadLayersModel(path);
        
        if (isMounted) {
          setModeloActual(modelo);
          setEstadoModelo(`✅ Modelo de ${operacion} cargado`);
          console.log(`✅ Modelo de ${operacion} cargado correctamente`);
        }
      } catch (error) {
        console.error(`❌ Error cargando modelo:`, error);
        if (isMounted) {
          setEstadoModelo('❌ Error cargando modelo');
        }
      }
    }

    cargarModelo();

    return () => {
      isMounted = false;
    };
  }, [operacion]);

  const calcular = async () => {
    if (!modeloActual || !valA || !valB) return;

    setCargando(true);
    try {
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (isNaN(numA) || isNaN(numB)) {
        alert('Por favor ingresa números válidos');
        return;
      }

      console.log(`🧮 Calculando: ${numA} ${operacion === 'suma' ? '+' : '-'} ${numB}`);

      // Crear tensor de entrada [1, 2]
      const inputTensor = tf.tensor2d([[numA, numB]]);
      
      // Realizar predicción
      const prediccionTensor = modeloActual.predict(inputTensor);
      const valores = await prediccionTensor.data();
      
      // Actualizar estado con resultado
      setResultado(valores[0]);
      
      // Limpiar memoria
      tf.dispose([inputTensor, prediccionTensor]);
      
      console.log(`✅ Resultado: ${valores[0].toFixed(2)}`);

    } catch (error) {
      console.error('❌ Error en cálculo:', error);
      setResultado(null);
    } finally {
      setCargando(false);
    }
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter') {
      calcular();
    }
  };

  // Función para probar valores rápidos
  const probarValores = (a, b) => {
    setValA(a.toString());
    setValB(b.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl w-full max-w-md border border-gray-700">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Calculadora Neuronal
          </h1>
          <p className="text-gray-400 text-sm">
            Sumas y restas potenciadas por IA
          </p>
        </div>

        {/* Selector de Operación */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setOperacion('suma')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              operacion === 'suma' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ➕ Suma
          </button>
          <button
            onClick={() => setOperacion('resta')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              operacion === 'resta' 
                ? 'bg-red-600 text-white shadow-lg scale-105' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ➖ Resta
          </button>
        </div>

        {/* Estado del Modelo */}
        <div className={`text-center mb-4 text-sm px-4 py-2 rounded-full ${
          estadoModelo.includes('✅') 
            ? 'bg-green-900 text-green-300' 
            : estadoModelo.includes('❌')
            ? 'bg-red-900 text-red-300'
            : 'bg-blue-900 text-blue-300'
        }`}>
          {estadoModelo}
        </div>

        {/* Valores de Prueba Rápidos */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2 text-center">Prueba con:</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => probarValores(10, 5)}
              className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              10 y 5
            </button>
            <button 
              onClick={() => probarValores(25, 15)}
              className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              25 y 15
            </button>
            <button 
              onClick={() => probarValores(100, 50)}
              className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              100 y 50
            </button>
            <button 
              onClick={() => probarValores(-5, 3)}
              className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              -5 y 3
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Número A
            </label>
            <input
              type="number"
              value={valA}
              onChange={(e) => setValA(e.target.value)}
              onKeyPress={manejarKeyPress}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ingresa el primer número"
              disabled={cargando}
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Número B
            </label>
            <input
              type="number"
              value={valB}
              onChange={(e) => setValB(e.target.value)}
              onKeyPress={manejarKeyPress}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ingresa el segundo número"
              disabled={cargando}
            />
          </div>
        </div>

        {/* Botón de Cálculo */}
        <button
          onClick={calcular}
          disabled={!modeloActual || !valA || !valB || cargando}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {cargando ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Calculando con IA...
            </div>
          ) : (
            `🧠 Calcular ${operacion === 'suma' ? 'Suma' : 'Resta'} con IA`
          )}
        </button>

        {/* Resultado */}
        {resultado !== null && (
          <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-600 text-center animate-fade-in">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Resultado de la IA
            </p>
            <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              {resultado.toFixed(2)}
            </p>
            
            {/* Comparación con valor real */}
            {valA && valB && (
              <div className="text-gray-500 text-sm">
                <p>
                  Valor real: {
                    operacion === 'suma' 
                      ? (parseFloat(valA) + parseFloat(valB)).toFixed(2)
                      : (parseFloat(valA) - parseFloat(valB)).toFixed(2)
                  }
                </p>
                <p className={`mt-1 ${
                  Math.abs(resultado - (operacion === 'suma' 
                    ? parseFloat(valA) + parseFloat(valB)
                    : parseFloat(valA) - parseFloat(valB)
                  )) < 0.1 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  Precisión: {
                    (100 - Math.abs(resultado - (operacion === 'suma' 
                      ? parseFloat(valA) + parseFloat(valB)
                      : parseFloat(valA) - parseFloat(valB)
                    )) / Math.abs(operacion === 'suma' 
                      ? parseFloat(valA) + parseFloat(valB)
                      : parseFloat(valA) - parseFloat(valB)
                    ) * 100).toFixed(1)
                  }%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Información Adicional */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            🤖 Modelos entrenados con TensorFlow | ⚡ Ejecutándose en tu navegador con TensorFlow.js
          </p>
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}