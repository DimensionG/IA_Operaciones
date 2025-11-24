import tensorflow as tf
import numpy as np
import os
import json

print(f"TensorFlow version: {tf.__version__}")

def entrenar_y_guardar(operacion, nombre_carpeta):
    """
    Entrena y guarda un modelo para suma o resta
    """
    print(f"\n=== ENTRENANDO MODELO DE {operacion.upper()} ===")
    
    # 1. GENERACIÓN DE DATOS
    np.random.seed(42)  # Para resultados reproducibles
    X = np.random.uniform(-100, 100, (10000, 2)).astype(np.float32)
    
    if operacion == 'suma':
        y = X[:, 0] + X[:, 1]  # Suma: A + B
        print(f"Ejemplo: {X[0][0]:.2f} + {X[0][1]:.2f} = {y[0]:.2f}")
    else:
        y = X[:, 0] - X[:, 1]  # Resta: A - B
        print(f"Ejemplo: {X[0][0]:.2f} - {X[0][1]:.2f} = {y[0]:.2f}")
    
    # 2. CREACIÓN DEL MODELO
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=[2], name='capa_oculta'),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='linear', name='salida')
    ])
    
    # 3. COMPILACIÓN
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='mean_squared_error',
        metrics=['mae']
    )
    
    print(f"Arquitectura del modelo de {operacion}:")
    model.summary()
    
    # 4. ENTRENAMIENTO
    print("Iniciando entrenamiento...")
    history = model.fit(
        X, y, 
        epochs=100, 
        batch_size=32, 
        validation_split=0.2,
        verbose=1
    )
    
    # 5. EVALUACIÓN
    test_loss, test_mae = model.evaluate(X[:100], y[:100], verbose=0)
    print(f"Error promedio del modelo: {test_mae:.4f}")
    
    # 6. PRUEBA CON DATOS CONOCIDOS
    test_cases = np.array([[10, 5], [20, 3], [100, 50], [-5, 3]], dtype=np.float32)
    predictions = model.predict(test_cases)
    
    print("\n🔍 PRUEBAS DEL MODELO:")
    for i, (a, b) in enumerate(test_cases):
        pred = predictions[i][0]
        if operacion == 'suma':
            real = a + b
            print(f"  {a:.1f} + {b:.1f} = {pred:.2f} (Real: {real:.1f})")
        else:
            real = a - b
            print(f"  {a:.1f} - {b:.1f} = {pred:.2f} (Real: {real:.1f})")
    
    # 7. GUARDAR MODELO KERAS
    keras_file = f'{nombre_carpeta}.h5'
    model.save(keras_file)
    print(f"✅ Modelo Keras guardado: {keras_file}")
    
    # 8. CONVERTIR A TENSORFLOW.JS
    output_path = f'../calculadora-ia/public/{nombre_carpeta}'
    os.makedirs(output_path, exist_ok=True)
    
    # Comando de conversión
    convert_command = f"tensorflowjs_converter --input_format keras {keras_file} {output_path}"
    os.system(convert_command)
    
    print(f"✅ Modelo TensorFlow.js guardado en: {output_path}")
    
    # 9. LIMPIAR ARCHIVO .h5 (opcional)
    if os.path.exists(keras_file):
        os.remove(keras_file)
        print(f"🗑️  Archivo temporal {keras_file} eliminado")
    
    return model

# EJECUCIÓN PRINCIPAL
if __name__ == "__main__":
    try:
        # Entrenar modelo de suma
        modelo_suma = entrenar_y_guardar('suma', 'modelo_suma')
        
        # Entrenar modelo de resta
        modelo_resta = entrenar_y_guardar('resta', 'modelo_resta')
        
        print("\n🎉 ¡ENTRENAMIENTO COMPLETADO!")
        print("📁 Estructura de archivos creada:")
        print("   public/modelo_suma/")
        print("   ├── model.json")
        print("   └── group1-shard1of1.bin")
        print("   public/modelo_resta/")
        print("   ├── model.json")
        print("   └── group1-shard1of1.bin")
        
    except Exception as e:
        print(f"❌ Error durante el entrenamiento: {e}")