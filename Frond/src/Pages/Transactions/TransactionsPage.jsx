import { useEffect, useMemo, useState } from 'react'
import { getMyPaymentTransactions } from '../../services/transactionsApi'
import './TransactionsPage.css'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(value))
}

function formatDateTime(value) {
  if (!value) return 'Sin confirmar'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPaymentMethod(value) {
  if (!value) return 'Sin definir'

  return value.replaceAll('_', ' ')
}

function getStatusLabel(status) {
  const labels = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    DECLINED: 'Rechazada',
    VOIDED: 'Anulada',
    ERROR: 'Error',
  }

  return labels[status] || status
}

/**
 * Muestra el historial de compras de créditos del usuario.
 *
 * @param {Object} props
 * @param {string} props.token - JWT de la sesión activa.
 */
function TransactionsPage({ token }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await getMyPaymentTransactions(token)
        setData(response)
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    loadTransactions()
  }, [token])

  const summary = useMemo(() => {
    const transactions = data?.transactions || []

    const approvedTransactions = transactions.filter(
      (transaction) => transaction.status === 'APPROVED'
    )

    const creditedAmount = approvedTransactions.reduce(
      (total, transaction) => total + transaction.credits_amount,
      0
    )

    return {
      total: transactions.length,
      approved: approvedTransactions.length,
      credits: creditedAmount,
    }
  }, [data])

  if (error) {
    return (
      <main className="transactions-page">
        <p className="transactions-page__error">{error}</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="transactions-page">
        <p className="transactions-page__message">
          Cargando transacciones...
        </p>
      </main>
    )
  }

  return (
    <main className="transactions-page">
      <header className="transactions-page__header">
        <p className="transactions-page__eyebrow">MIS COMPRAS</p>
        <h1>Transacciones</h1>
        <p>Consulta el estado y detalle de tus compras de créditos.</p>
      </header>

      <section className="transactions-summary" aria-label="Resumen de compras">
        <article>
          <span>Transacciones realizadas</span>
          <strong>{summary.total}</strong>
        </article>

        <article>
          <span>Compras aprobadas</span>
          <strong>{summary.approved}</strong>
        </article>

        <article>
          <span>Créditos acreditados</span>
          <strong>{summary.credits}</strong>
        </article>
      </section>

      {data.transactions.length === 0 ? (
        <section className="transactions-empty">
          <span>◎</span>
          <h2>Aún no tienes transacciones</h2>
          <p>Cuando compres un paquete de créditos, aparecerá aquí.</p>
        </section>
      ) : (
        <section className="transactions-list" aria-label="Historial de compras">
          {data.transactions.map((transaction) => (
            <article className="transaction-card" key={transaction.id}>
              <div className="transaction-card__main">
                <div className="transaction-card__icon">◎</div>

                <div>
                  <h2>{transaction.package?.name || 'Paquete Verifik'}</h2>

                  <p className="transaction-card__reference">
                    Ref. {transaction.reference}
                  </p>

                  <p className="transaction-card__date">
                    Solicitada: {formatDateTime(transaction.created_at)}
                  </p>
                </div>
              </div>

              <div className="transaction-card__details">
                <div>
                  <span>Valor</span>
                  <strong>{formatCurrency(transaction.amount_paid)}</strong>
                </div>

                <div>
                  <span>Créditos acreditados</span>
                  <strong>
                    {transaction.status === 'APPROVED' && transaction.credited_at
                      ? `+${transaction.credits_amount} ${
                          transaction.credits_amount === 1 ? 'crédito' : 'créditos'
                        }`
                      : '0 créditos'}
                  </strong>
                </div>

                <div>
                  <span>Método</span>
                  <strong>{formatPaymentMethod(transaction.payment_method)}</strong>
                </div>

                <div>
                  <span>Confirmación</span>
                  <strong>{formatDateTime(transaction.credited_at)}</strong>
                </div>
              </div>

              <span
                className={`transaction-card__status transaction-card__status--${transaction.status.toLowerCase()}`}
              >
                {getStatusLabel(transaction.status)}
              </span>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default TransactionsPage