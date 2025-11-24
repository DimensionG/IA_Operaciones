"use client";
import { useState, useEffect } from 'react';

// Componente principal
export default function Calculadora() {
  const [modeloActual, setModeloActual] = useState(null);
  const [operacion, setOperacion] = useState('suma');
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [estado, setEstado] = useState('Cargando...');
  const [tf, setTf] = useState(null);

  // Cargar TensorFlow.js dinámicamente
  useEffect(() => {
    const cargarTF = async () => {
      try {
        setEstado('Cargando TensorFlow.js...');
        const tfModule = await import('@tensorflow/tfjs');
        setTf(tfModule);
        setEstado('TensorFlow.js listo ✅');
      } catch (error) {
        console.error('Error cargando TensorFlow.js:', error);
        setEstado('Error cargando TensorFlow.js ❌');
      }
    };

    cargarTF();
  }, []);

  // Cargar modelo cuando cambia la operación
  useEffect(() => {
    if (!tf) return;

    let isMounted = true;

    const cargarModelo = async () => {
      if (!isMounted) return;

      setModeloActual(null);
      setResultado(null);
      setEstado(`Cargando modelo de ${operacion}...`);
      setCargando(true);

      try {
        const rutaModelo = operacion === 'suma' 
          ? '/modelo_suma/model.json' 
          : '/modelo_resta/model.json';
        
        console.log(`Cargando: ${rutaModelo}`);
        const modelo = await tf.loadLayersModel(rutaModelo);
        
        if (isMounted) {
          setModeloActual(modelo);
          setEstado(`Modelo de ${operacion} cargado ✅`);
          console.log('Modelo cargado exitosamente');
        }
      } catch (error) {
        console.error('Error cargando modelo:', error);
        if (isMounted) {
          setEstado('Error cargando modelo ❌');
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    cargarModelo();

    return () => {
      isMounted = false;
    };
  }, [operacion, tf]);

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

      // Crear tensor y predecir
      const entrada = tf.tensor2d([[numA, numB]]);
      const prediccion = modeloActual.predict(entrada);
      const [resultadoPrediccion] = await prediccion.data();
      
      setResultado(resultadoPrediccion);
      
      // Limpiar memoria
      entrada.dispose();
      prediccion.dispose();

    } catch (error) {
      console.error('Error en cálculo:', error);
      // Fallback a cálculo manual
      const calculoManual = operacion === 'suma' 
        ? parseFloat(valA) + parseFloat(valB)
        : parseFloat(valA) - parseFloat(valB);
      setResultado(calculoManual);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnter = (e) => {
    if (e.key === 'Enter') calcular();
  };

  const probarEjemplo = (a, b) => {
    setValA(a.toString());
    setValB(b.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl w-full max-w-md border border-gray-700">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Calculadora Neuronal
          </h1>
          <p className="text-gray-400 text-sm">IA para sumas y restas</p>
        </div>

        {/* Selector de operación */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setOperacion('suma')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              operacion === 'suma' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300'
            }`}
          >
            ➕ Suma
          </button>
          <button
            onClick={() => setOperacion('resta')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              operacion === 'resta' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300'
            }`}
          >
            ➖ Resta
          </button>
        </div>

        {/* Estado */}
        <div className={`text-center mb-4 text-sm px-4 py-2 rounded-full ${
          estado.includes('✅') ? 'bg-green-900 text-green-300' : 
          estado.includes('❌') ? 'bg-red-900 text-red-300' : 
          'bg-blue-900 text-blue-300'
        }`}>
          {estado}
        </div>

        {/* Ejemplos rápidos */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2 text-center">Probar con:</p>
          <div className="grid grid-cols-2 gap-2">
            {[[10, 5], [25, 15], [8, 3], [100, 50]].map(([a, b], i) => (
              <button
                key={i}
                onClick={() => probarEjemplo(a, b)}
                className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                disabled={cargando}
              >
                {a} & {b}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Número A</label>
            <input
              type="number"
              value={valA}
              onChange={(e) => setValA(e.target.value)}
              onKeyDown={manejarEnter}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ingresa un número"
              disabled={cargando}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Número B</label>
            <input
              type="number"
              value={valB}
              onChange={(e) => setValB(e.target.value)}
              onKeyDown={manejarEnter}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ingresa otro número"
              disabled={cargando}
            />
          </div>
        </div>

        {/* Botón calcular */}
        <button
          onClick={calcular}
          disabled={!modeloActual || !valA || !valB || cargando}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all disabled:cursor-not-allowed"
        >
          {cargando ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Calculando...
            </div>
          ) : (
            `Calcular ${operacion}`
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