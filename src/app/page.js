"use client";
import { useState, useEffect } from 'react';

// Importación dinámica de TensorFlow.js para mejor compatibilidad
let tf;
if (typeof window !== 'undefined') {
  import('@tensorflow/tfjs').then((module) => {
    tf = module;
  });
}

export default function Calculadora() {
  const [modeloActual, setModeloActual] = useState(null);
  const [operacion, setOperacion] = useState('suma');
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [estadoModelo, setEstadoModelo] = useState('Iniciando...');
  const [tfReady, setTfReady] = useState(false);

  // Cargar TensorFlow.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@tensorflow/tfjs').then((module) => {
        tf = module;
        setTfReady(true);
        setEstadoModelo('TensorFlow.js listo ✅');
      }).catch(error => {
        console.error('Error cargando TensorFlow.js:', error);
        setEstadoModelo('Error cargando TensorFlow.js ❌');
      });
    }
  }, []);

  // Cargar modelo cuando cambia la operación
  useEffect(() => {
    if (!tfReady || !tf) return;

    let isMounted = true;

    async function cargarModelo() {
      if (!isMounted) return;
      
      setModeloActual(null);
      setResultado(null);
      setEstadoModelo(`Cargando modelo de ${operacion}...`);
      setCargando(true);

      try {
        const path = operacion === 'suma' 
          ? '/modelo_suma/model.json' 
          : '/modelo_resta/model.json';
        
        console.log(`Cargando modelo desde: ${path}`);
        const modelo = await tf.loadLayersModel(path);
        
        if (isMounted) {
          setModeloActual(modelo);
          setEstadoModelo(`✅ Modelo de ${operacion} cargado`);
        }
      } catch (err) {
        console.error('Error cargando modelo:', err);
        if (isMounted) {
          setEstadoModelo('❌ Error cargando modelo');
          // Fallback: crear modelo simple
          crearModeloFallback();
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    }

    async function crearModeloFallback() {
      try {
        const model = tf.sequential();
        model.add(tf.layers.dense({
          units: 1,
          inputShape: [2],
          kernelInitializer: 'ones',
          biasInitializer: 'zeros',
        }));

        model.compile({
          optimizer: tf.train.adam(0.1),
          loss: 'meanSquaredError'
        });

        if (isMounted) {
          setModeloActual(model);
          setEstadoModelo('⚠️ Usando modelo simple');
        }
      } catch (error) {
        console.error('Error en fallback:', error);
      }
    }

    cargarModelo();

    return () => {
      isMounted = false;
    };
  }, [operacion, tfReady]);

  const calcular = async () => {
    if (!modeloActual || !valA || !valB || !tf) return;

    setCargando(true);
    try {
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (isNaN(numA) || isNaN(numB)) {
        alert('Por favor ingresa números válidos');
        return;
      }

      const inputTensor = tf.tensor2d([[numA, numB]]);
      const prediccionTensor = modeloActual.predict(inputTensor);
      const valores = await prediccionTensor.data();
      
      setResultado(valores[0]);
      
      // Limpiar memoria
      inputTensor.dispose();
      prediccionTensor.dispose();

    } catch (error) {
      console.error('Error en cálculo:', error);
      // Cálculo manual como fallback
      const resultadoManual = operacion === 'suma' 
        ? parseFloat(valA) + parseFloat(valB)
        : parseFloat(valA) - parseFloat(valB);
      setResultado(resultadoManual);
    } finally {
      setCargando(false);
    }
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter') {
      calcular();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl w-full max-w-md border border-gray-700">
        
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
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              operacion === 'suma' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            ➕ Suma
          </button>
          <button
            onClick={() => setOperacion('resta')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              operacion === 'resta' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            ➖ Resta
          </button>
        </div>

        {/* Estado */}
        <div className={`text-center mb-4 text-sm px-4 py-2 rounded-full ${
          estadoModelo.includes('✅') 
            ? 'bg-green-900 text-green-300' 
            : estadoModelo.includes('❌')
            ? 'bg-red-900 text-red-300'
            : 'bg-blue-900 text-blue-300'
        }`}>
          {estadoModelo}
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Número A</label>
            <input
              type="number"
              value={valA}
              onChange={(e) => setValA(e.target.value)}
              onKeyPress={manejarKeyPress}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Primer número"
              disabled={cargando}
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Número B</label>
            <input
              type="number"
              value={valB}
              onChange={(e) => setValB(e.target.value)}
              onKeyPress={manejarKeyPress}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Segundo número"
              disabled={cargando}
            />
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={calcular}
          disabled={!modeloActual || !valA || !valB || cargando}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all"
        >
          {cargando ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Calculando...
            </div>
          ) : (
            `Calcular ${operacion === 'suma' ? 'Suma' : 'Resta'}`
          )}
        </button>

        {/* Resultado */}
        {resultado !== null && (
          <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-600 text-center">
            <p className="text-gray-400 text-sm uppercase mb-2">Resultado</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              {resultado.toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm">
              {valA} {operacion === 'suma' ? '+' : '-'} {valB} = {
                operacion === 'suma' 
                  ? (parseFloat(valA) + parseFloat(valB)).toFixed(2)
                  : (parseFloat(valA) - parseFloat(valB)).toFixed(2)
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}