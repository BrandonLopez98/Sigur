import { useState } from 'react'
import './HelpPage.css'

const faqGroups = [
  {
    icon: '🚀',
    title: 'Primeros pasos',
    questions: [
      {
        question: '¿Cómo realizo mi primera consulta?',
        answer: 'Entra a Nueva consulta, elige el tipo de documento, completa los datos solicitados y confirma que cuentas con la autorización del titular. Al enviarla se descuenta un crédito y podrás seguir el resultado desde Historial.',
      },
      {
        question: '¿Qué tipos de documentos puedo consultar?',
        answer: 'Puedes realizar consultas de personas, empresas y vehículos según los tipos habilitados en el formulario: cédula de ciudadanía (CC), cédula de extranjería (CE), NIT, pasaporte (PP), permiso de protección temporal (PPT) y placa.',
      },
      {
        question: '¿Necesito crear una cuenta para usar Verifik?',
        answer: 'Sí. Tu cuenta protege el acceso a tus consultas, reportes, movimientos de créditos y datos de perfil. También permite que el historial quede disponible únicamente para ti.',
      },
    ],
  },
  {
    icon: '💳',
    title: 'Créditos y pagos',
    questions: [
      {
        question: '¿Cómo funcionan los créditos?',
        answer: 'Cada consulta enviada consume un crédito. Puedes comprar paquetes desde Paquetes y revisar el saldo y cada movimiento en el indicador de créditos o en Movimientos de créditos.',
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Los pagos se procesan de forma segura con Wompi. En el checkout verás los medios de pago que Wompi tenga habilitados para tu compra.',
      },
      {
        question: '¿Qué ocurre si una consulta no puede completarse?',
        answer: 'Si el proveedor informa un fallo definitivo antes de entregar un resultado, Verifik reintegra automáticamente el crédito a tu billetera. El movimiento quedará registrado para que puedas revisarlo.',
      },
    ],
  },
  {
    icon: '📋',
    title: 'Resultados e interpretación',
    questions: [
      {
        question: '¿Qué significa “alto riesgo”?',
        answer: 'Indica que la consulta encontró coincidencias que requieren revisión reforzada. No constituye por sí sola una decisión ni una sanción: revisa el detalle del reporte y aplica el procedimiento de cumplimiento de tu organización.',
      },
      {
        question: '¿Qué información consulta Verifik?',
        answer: 'Verifik consolida la información que entrega el proveedor de validación en las fuentes disponibles para cada tipo de consulta. La disponibilidad y alcance pueden variar según el documento y la fuente.',
      },
      {
        question: '¿Cómo consulto el detalle del resultado?',
        answer: 'Cuando una consulta esté completada, ábrela desde Historial para revisar el resumen, los hallazgos y el detalle de cada fuente consultada.',
      },
    ],
  },
  {
    icon: '🔒',
    title: 'Seguridad y privacidad',
    questions: [
      {
        question: '¿Mis datos y consultas están protegidos?',
        answer: 'El acceso está vinculado a tu sesión y cada usuario solo puede ver su propio historial, movimientos y perfil. No compartas tu contraseña ni tu sesión con otras personas.',
      },
      {
        question: '¿Por qué debo confirmar la autorización del titular?',
        answer: 'La consulta de datos personales debe contar con una finalidad legítima y con la autorización aplicable. Antes de enviar una consulta, verifica que tienes la autorización y los soportes requeridos por tu proceso.',
      },
    ],
  },
]

const tutorials = [
  {
    number: '01',
    title: 'Realiza una consulta',
    description: 'Elige el documento, diligencia los datos y confirma la autorización del titular.',
    action: 'Ir a Nueva consulta',
    page: 'new-query',
  },
  {
    number: '02',
    title: 'Revisa un resultado',
    description: 'Encuentra consultas en proceso, completadas o fallidas y abre el detalle disponible.',
    action: 'Ver Historial',
    page: 'history',
  },
  {
    number: '03',
    title: 'Compra y controla créditos',
    description: 'Selecciona un paquete y consulta cada compra, consumo o reintegro en tu billetera.',
    action: 'Ver Paquetes',
    page: 'packages',
  },
]

function HelpPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('faq')
  const [openQuestion, setOpenQuestion] = useState(null)

  function toggleQuestion(question) {
    setOpenQuestion((current) => (current === question ? null : question))
  }

  return (
    <main className="help-page">
      <header className="help-page__hero">
        <p>CENTRO DE AYUDA</p>
        <h1>¿Cómo podemos ayudarte?</h1>
        <span>Encuentra respuestas claras para usar Verifik con seguridad.</span>
      </header>

      <div className="help-page__tabs" role="tablist" aria-label="Contenido de ayuda">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'faq'}
          className={activeTab === 'faq' ? 'help-page__tab help-page__tab--active' : 'help-page__tab'}
          onClick={() => setActiveTab('faq')}
        >
          Preguntas frecuentes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tutorials'}
          className={activeTab === 'tutorials' ? 'help-page__tab help-page__tab--active' : 'help-page__tab'}
          onClick={() => setActiveTab('tutorials')}
        >
          Tutoriales
        </button>
      </div>

      {activeTab === 'faq' ? (
        <section className="help-page__faq" aria-label="Preguntas frecuentes">
          {faqGroups.map((group) => (
            <section className="help-group" key={group.title}>
              <h2><span aria-hidden="true">{group.icon}</span>{group.title}</h2>
              <div className="help-group__questions">
                {group.questions.map((item) => {
                  const isOpen = openQuestion === item.question

                  return (
                    <article className={isOpen ? 'help-question help-question--open' : 'help-question'} key={item.question}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleQuestion(item.question)}
                      >
                        <span>{item.question}</span>
                        <span className="help-question__symbol" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <p>{item.answer}</p>}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </section>
      ) : (
        <section className="help-tutorials" aria-label="Tutoriales">
          <div className="help-tutorials__intro">
            <p>GUÍAS RÁPIDAS</p>
            <h2>Todo lo esencial, paso a paso</h2>
            <span>Usa estas guías para completar las acciones más frecuentes sin perderte entre pantallas.</span>
          </div>
          <div className="help-tutorials__list">
            {tutorials.map((tutorial) => (
              <article key={tutorial.number} className="help-tutorial">
                <span className="help-tutorial__number">{tutorial.number}</span>
                <div>
                  <h3>{tutorial.title}</h3>
                  <p>{tutorial.description}</p>
                </div>
                <button type="button" onClick={() => onNavigate(tutorial.page)}>
                  {tutorial.action} <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <aside className="help-support">
        <div>
          <span aria-hidden="true">✦</span>
          <div>
            <h2>¿No encontraste lo que buscabas?</h2>
            <p>Revisa tu historial o la información de tu cuenta para continuar con tu proceso.</p>
          </div>
        </div>
        <button type="button" onClick={() => onNavigate('account')}>Ir a mi cuenta</button>
      </aside>
    </main>
  )
}

export default HelpPage
