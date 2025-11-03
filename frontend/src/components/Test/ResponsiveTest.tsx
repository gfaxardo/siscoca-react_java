import { useResponsive, useResponsiveClasses } from '../../hooks/useResponsive';

export default function ResponsiveTest() {
  const breakpoints = useResponsive();
  const classes = useResponsiveClasses();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">🧪 Test de Responsividad</h2>
      
      {/* Información de breakpoints */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Breakpoints Actuales:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div>Móvil: {breakpoints.isMobile ? '✅' : '❌'}</div>
          <div>Tablet: {breakpoints.isTablet ? '✅' : '❌'}</div>
          <div>Desktop: {breakpoints.isDesktop ? '✅' : '❌'}</div>
          <div>Móvil Pequeño: {breakpoints.isSmallMobile ? '✅' : '❌'}</div>
          <div>Desktop Grande: {breakpoints.isLargeDesktop ? '✅' : '❌'}</div>
          <div>Ancho: {breakpoints.width}px</div>
        </div>
      </div>

      {/* Test de formulario responsivo */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Test de Formulario Responsivo</h3>
        <form className={`space-y-3 ${classes.spacing}`}>
          <div className={`grid ${classes.grid} gap-3`}>
            <div>
              <label className={`block ${classes.text.sm} font-semibold text-gray-700 mb-1`}>
                Nombre
              </label>
              <input 
                type="text" 
                className={`w-full border rounded-lg ${classes.input}`}
                placeholder="Nombre del usuario"
              />
            </div>
            <div>
              <label className={`block ${classes.text.sm} font-semibold text-gray-700 mb-1`}>
                Email
              </label>
              <input 
                type="email" 
                className={`w-full border rounded-lg ${classes.input}`}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className={`block ${classes.text.sm} font-semibold text-gray-700 mb-1`}>
                Teléfono
              </label>
              <input 
                type="tel" 
                className={`w-full border rounded-lg ${classes.input}`}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <button className={`bg-blue-600 text-white rounded-lg ${classes.button}`}>
            Enviar Formulario
          </button>
        </form>
      </div>

      {/* Test de tarjetas responsivas */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Test de Tarjetas Responsivas</h3>
        <div className={`grid ${classes.grid} gap-4`}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={`bg-gray-50 rounded-lg ${classes.card.padding}`}>
              <h4 className={`font-semibold ${classes.card.title} mb-2`}>
                Tarjeta {item}
              </h4>
              <p className={`text-gray-600 ${classes.text.sm}`}>
                Esta es una tarjeta de prueba para verificar la responsividad.
              </p>
              <div className="mt-3 flex gap-2">
                <button className={`bg-blue-500 text-white rounded px-3 py-1 ${classes.text.xs}`}>
                  Acción 1
                </button>
                <button className={`bg-gray-500 text-white rounded px-3 py-1 ${classes.text.xs}`}>
                  Acción 2
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test de modal responsivo */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Test de Modal Responsivo</h3>
        <div className={`bg-gray-100 rounded-lg ${classes.modal.padding}`}>
          <div className={`max-w-4xl mx-auto ${classes.modal.content}`}>
            <div className="bg-white rounded-lg shadow-lg">
              <div className={`border-b p-4 ${classes.modal.padding}`}>
                <h4 className={`font-semibold ${classes.text.lg}`}>Título del Modal</h4>
              </div>
              <div className={`p-4 ${classes.modal.padding}`}>
                <p className={`text-gray-600 ${classes.text.sm} mb-4`}>
                  Este es el contenido del modal de prueba para verificar la responsividad.
                </p>
                <div className="flex gap-2 justify-end">
                  <button className={`bg-gray-500 text-white rounded px-4 py-2 ${classes.text.sm}`}>
                    Cancelar
                  </button>
                  <button className={`bg-blue-600 text-white rounded px-4 py-2 ${classes.text.sm}`}>
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test de texto responsivo */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Test de Texto Responsivo</h3>
        <div className="space-y-2">
          <p className={classes.text.xs}>Texto extra pequeño (xs)</p>
          <p className={classes.text.sm}>Texto pequeño (sm)</p>
          <p className={classes.text.base}>Texto base (base)</p>
          <p className={classes.text.lg}>Texto grande (lg)</p>
          <p className={classes.text.xl}>Texto extra grande (xl)</p>
          <p className={classes.text['2xl']}>Texto 2x grande (2xl)</p>
        </div>
      </div>
    </div>
  );
}
