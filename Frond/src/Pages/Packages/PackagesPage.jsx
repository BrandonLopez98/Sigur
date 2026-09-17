import { useEffect, useState } from 'react'
import { getPackages } from '../../services/packagesApi'
import { createPaymentCheckout } from '../../services/paymentsApi'
import './PackagesPage.css'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(value))
}

/**
 * Envía al usuario al Checkout Web de Wompi usando datos firmados
 * previamente por el backend.
 */
function openWompiCheckout(checkout) {
  const form = document.createElement('form')

  form.action = 'https://checkout.wompi.co/p/'
  form.method = 'GET'

  const fields = {
    'public-key': checkout.publicKey,
    currency: checkout.currency,
    'amount-in-cents': checkout.amountInCents,
    reference: checkout.reference,
    'signature:integrity': checkout.integritySignature,
  }

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input')

    input.type = 'hidden'
    input.name = name
    input.value = value

    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

/**
 * Página donde el cliente consulta y compra paquetes de créditos.
 *
 * @param {Object} props
 * @param {string} props.token - JWT del usuario autenticado.
 */
function PackagesPage({ token }) {
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [processingPackageId, setProcessingPackageId] = useState(null)

  useEffect(() => {
    async function loadPackages() {
      try {
        const data = await getPackages()
        setCatalog(data)
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    loadPackages()
  }, [])

  async function handleBuyPackage(creditPackage) {
    try {
      setPaymentError('')
      setProcessingPackageId(creditPackage.id)

      const paymentData = await createPaymentCheckout(token, creditPackage.id)

      openWompiCheckout(paymentData.checkout)
    } catch (requestError) {
      setPaymentError(requestError.message)
      setProcessingPackageId(null)
    }
  }

  if (error) {
    return (
      <main className="packages-page">
        <p className="packages-page__error">{error}</p>
      </main>
    )
  }

  if (!catalog) {
    return (
      <main className="packages-page">
        <p className="packages-page__message">Cargando paquetes...</p>
      </main>
    )
  }

  const { service, packages } = catalog

  return (
    <main className="packages-page">
      <header className="packages-page__header">
        <p className="packages-page__eyebrow">PLANES Y PRECIOS</p>
        <h1>Recarga tu cuenta</h1>
        <p>Elige la cantidad de verificaciones que necesitas.</p>
      </header>

      <section className="packages-service" aria-labelledby="service-title">
        <div>
          <h2 id="service-title">{service.title}</h2>
          <p>{service.description}</p>
        </div>

        <ul className="packages-service__benefits">
          {service.benefits.map((benefit) => (
            <li key={benefit}>✓ {benefit}</li>
          ))}
        </ul>
      </section>

      <section className="packages-grid" aria-label="Paquetes disponibles">
        {packages.map((creditPackage) => {
          const unitPrice =
            Number(creditPackage.price) / creditPackage.credits_amount

          const isProcessing = processingPackageId === creditPackage.id

          return (
            <article
              key={creditPackage.id}
              className={
                creditPackage.is_popular
                  ? 'package-card package-card--popular'
                  : 'package-card'
              }
            >
              {creditPackage.is_popular && (
                <span className="package-card__popular">★ MÁS POPULAR</span>
              )}

              <p className="package-card__name">{creditPackage.name}</p>

              <div className="package-card__credits">
                <strong>{creditPackage.credits_amount}</strong>
                <span>
                  {creditPackage.credits_amount === 1 ? 'crédito' : 'créditos'}
                </span>
              </div>

              <div className="package-card__price">
                {formatCurrency(creditPackage.price)}
              </div>

              <p className="package-card__unit-price">
                COP · {formatCurrency(unitPrice)} por crédito
              </p>

              <ul className="package-card__includes">
                <li>✓ Misma verificación Verifik</li>
                <li>✓ Resultado disponible en PDF</li>
                <li>✓ Historial de consultas</li>
              </ul>

              <button
                type="button"
                className="package-card__button"
                onClick={() => handleBuyPackage(creditPackage)}
                disabled={Boolean(processingPackageId)}
              >
                {isProcessing ? 'Redirigiendo a Wompi...' : 'Comprar'}
              </button>
            </article>
          )
        })}
      </section>

      {paymentError && (
        <p className="packages-page__error">{paymentError}</p>
      )}

      <footer className="packages-page__footer">
        <span>✓ Pago procesado de forma segura por Wompi</span>
        <span>✓ Compra de créditos sin suscripción</span>
        <span>✓ Todos los paquetes incluyen la misma verificación</span>
      </footer>
    </main>
  )
}

export default PackagesPage