const ESCENAS = [
  {
    id: 'dic-2024', numero: '01', titulo: '¿Qué es la Corporativización de Airbnb?', corte: 'dic-2024', variable: 'precio_2024_t4',
    texto: ['El objetivo de este trabajo es mostrar la creciente desigualdad de gestión de la oferta de espacios de alojamiento en la plataforma y su distribución territorial, cuyo comportamiento actual muestra un creciente acaparamiento del mercado de alojamiento temporal de la plataforma Airbnb por anfitriones o “hosts” profesionales transformándolo hacia una estructura administrativa corporativista frente a los “pequeños anfitriones”. '],
    kpis: [{ valor: 'Corporativización', label: 'Mercantilización de la vivienda' }, { valor: 'Submercado de alquiler', label: 'Nuevo producto inmobiliario' }],
    tabla: { 
      titulo: 'Evolución de Anfitriones por Propiedades', 
      columnas: ['Propiedades', 'Host 2024', 'Host 2026', 'Diferencia', '%'], 
      filas: [
        ['1 propiedad', '8,355', '6,667', '-1,688', '-20.2%'], 
        ['2 a 5 propiedades', '2,869', '2,638', '-231', '-8.05%'], 
        ['6 a 10 propiedades', '453', '466', '+13', '2.87%'], 
        ['Más de 10 propiedades', '277', '287', '+10', '3.61%']
      ] 
    }
  },
  {
    id: 'mar-2025', numero: '02', titulo: 'Estructura de Desigualdad', corte: 'mar-2025', variable: 'precio_2025_t1',
    texto: ['En el caso de la plataforma de Airbnb la empresa tiene un rol intermediario para vincular actores corporativos en su búsqueda de acumulación de capital, utilizando el poder político y económico inherente a su estructura, este tipo de poder derivado de las plataformas se clasifica en tres tipos: “Hard power”, “Soft power” y “Asimetrical power”. Estos permiten influir o prevenir decisiones políticas, legitimar los procesos de intercambio desigual a través de la imagen del progreso tecnológico; también permean la facultad de estandarizar, automatizar y operar en diversos dominios dichas relaciones socioeconómicas.'],
    tabla: { 
      titulo: 'Evolución del Coeficiente de Gini', 
      columnas: ['Corte', 'N.º Hosts', 'N.º Alojam.', 'Gini'], 
      filas: [
        ['Dic 2024', '11,954', '26,281', '0.4773'],
        ['Mar 2025', '11,821', '26,067', '0.4789'],
        ['Jun 2025', '11,897', '26,401', '0.4801'],
        ['Sep 2025', '12,046', '27,051', '0.4845'],
        ['Dic 2025', '10,357', '23,242', '0.4786'],
        ['Mar 2026', '10,058', '22,770', '0.4838'],
        ['Jun 2026', '14,107', '31,430', '0.4825'],
        ['Sep 2026', '13,381', '30,468', '0.4896']
      ] 
    }
  },
   {
    id: 'jun-2025', numero: '03', titulo: 'Estructura Corporativa', corte: 'jun-2025', variable: 'precio_2025_t2',
    texto: ['Hacia mediados de 2025, la oferta repuntó hasta los 26,401 alojamientos.', 'El 10% de los anfitriones (los corporativos) controlaba el 46.5% de la oferta total de la ciudad, mientras que el 80% de los pequeños apenas y superaba el 31%.'],
    kpis: [{ valor: '46.5%', label: 'Controlado por el Top 10%' }, { valor: '0.4801', label: 'Índice de Gini' }],
    graficaDeciles: true // 👈 Esto activa las barras apiladas
  },
  {
    id: 'sep-2025', numero: '04', titulo: 'Tendencias Estructurales de las Ciudades', corte: 'sep-2025', variable: 'precio_2025_t3',
    texto: ['Los fenómenos de la turistificación y la financiarización de los inmuebles en la Ciudad de México apuntan a las fuerzas de atracción que existen en función de la dinámica del valor territorial, que consiste en reemplazar lugares de convivencia local por negocios orientados al turismo. Esto ha aumentado la crisis de vivienda y gentrificación durante los últimos años. Los casos de Nueva York y Barcelona muestran un escenario, donde se desplaza el interés a zonas donde las viviendas en renta son áreas habitacionales, comenzando un cambio hacia el modelo del mercado de plataformas, lo que ha intensificado el acoso y presiones de desalojo para la liberación de viviendas con el fin de obtener mayores beneficios que giran en torno a la mercantilización de la vivienda'],
    kpis: [{ valor: '10,000 Apartamentos', label: 'Fueron reincorporados en Barcelona al mercado residencial' }, { valor: 'Año 2023', label: 'Ilegal alquilar a corto plazo un apartamento de Nueva York' }]
  },
  {
    id: 'dic-2025', numero: '05', titulo: 'Tendencias Estructurales y Crisis de Vivienda', corte: 'dic-2025', variable: null,
    texto: [
      'La distribución de los alojamientos las ciudades se encuentran sujeto al llamado “turismo urbano”, definido por viajeros cuya prioridad es viajar a los sitios más importantes de las ciudades, así como por los denominados “nómadas digitales” que intensifican la gentrificación trasnacional, fenómeno documentado ampliamente en América Latina. Este perfil de consumidores requiere infraestructura digital, así como de diversos servicios urbanos altamente especializados. ',
      'La estructura corporativista está consolidad con casí la mitad de la oferta de alojamientos; Se presentó un aumento de los precios durante el periodo del Mundal.'
    ],
    tabla: {
      titulo: 'Evolución del Mercado Inmobiliario de Plataformas',
      columnas: ['Corte', 'Alojamientos', 'Precio Prom.'],
      filas: [
        ['Dic 2024', '26,281', '$1,932 MXN'],
        ['Mar 2025', '26,067', '$1,665 MXN'],
        ['Jun 2025', '26,401', '$1,989 MXN'],
        ['Sep 2025', '27,051', '$1,792 MXN'],
        ['Mar 2026', '22,770', '$2,400 MXN'],
        ['Jun 2026', '31,430', '$2,913 MXN'],
        ['Sep 2026', '30,468', '$2,340 MXN']
      ]
    }
  },
  {
    id: 'mar-2026', numero: '06', titulo: 'Medidas de regulación: Reforma a la Ley de Turismo, Ley de Vivienda y Ley para la Reconstrucción Integral de la CDMX', corte: 'mar-2026', variable: 'precio_2026_t1',
    texto: [
      'Ante la crisis de vivienda y el avance de la corporativización, el gobierno de la Ciudad de México implementó un paquete de reformas estructurales. Estas medidas buscan regular la actividad de las plataformas digitales y proteger el suelo habitacional.',
      '• <strong>Límite de ocupación (Tope del 50%):</strong> Se establece un coeficiente máximo del 50% anual (aprox. 180 días) para los inmuebles en plataformas. Superar este límite impedirá la renovación del registro el siguiente año.',
      '• <strong>Prohibición en vivienda social y reconstruida:</strong> Queda estrictamente prohibido rentar bajo este esquema viviendas de interés social, popular o inmuebles reconstruidos con recursos públicos tras los sismos de 2017.',
      '• <strong>Padrón de Anfitriones y Plataformas:</strong> Se obliga a crear un padrón oficial, requiriendo un folio de registro y el reporte periódico de la actividad.',
      '• <strong>Objetivo de la medida:</strong> Frenar la gentrificación, proteger el derecho a la vivienda ante el alza de rentas y equilibrar la competencia con la industria hotelera tradicional.'
    ],
    kpis: [{ valor: '22,770', label: 'Alojamientos' }, { valor: '0.4838', label: 'Índice de Gini' }]
  },
  {
    id: 'jun-2026', numero: '07', titulo: 'Tendencias Cualitativas', corte: 'jun-2026', variable: 'precio_2026_t2',
    texto: [
      'El análisis de los comentarios de los huéspedes revela cómo la experiencia de la ciudad se transforma. A través del procesamiento de lenguaje natural, se observa que los discursos sobre el alojamiento no solo reflejan la satisfacción con el inmueble, sino también la tensión por la saturación turística y los cambios en el tejido social de las colonias.'
    ],
    imagen: 'img/comentarios_output.png' // 👈 Asegúrate de que esta sea la ruta y extensión correctas
  },
];