import { useEffect, useMemo, useState } from 'react'
import { getCreditMovements } from '../../services/creditsApi'
import './CreditMovementsPage.css'

const MOVEMENT_CONFIG = {
  purchase: {
    title: 'Compra aprobada',
    icon: '+',
    tone: 'positive',
  },
  query_charge: {
    title: 'Consulta de Verifik',
    icon: '−',
    tone: 'negative',
  },
  query_refund: {
    title: 'Crédito reintegrado',
    icon: '↺',
    tone: 'positive',
  },
  admin_adjustment: {
    title: 'Ajuste de créditos',
    icon: '±',
    tone: 'neutral',
  },
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatAmount(value) {
  const amount = Number(value)
  return `${amount > 0 ? '+' : ''}${amount} ${Math.abs(amount) === 1 ? 'crédito' : 'créditos'}`
}

function getMovementReference(movement) {
  const documentType = movement.metadata?.document_type
  const documentNumber = movement.metadata?.document_number

  if (movement.source_type === 'query' && documentType && documentNumber) {
    return {
      label: 'Consulta',
      value: `${documentType} · ${documentNumber}`,
    }
  }

  return {
    label: 'Referencia',
    value: movement.reference || 'No aplica',
  }
}

function CreditMovementsPage({ token, user }) {
  const [movements, setMovements] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadMovements() {
      setLoading(true)
      setError('')

      try {
        const data = await getCreditMovements(token)
        if (!cancelled) {
          setMovements(data.movements)
          setPagination(data)
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMovements()
    return () => { cancelled = true }
  }, [token])

  const summary = useMemo(() => {
    const purchased = movements
      .filter((movement) => movement.type === 'purchase')
      .reduce((total, movement) => total + Number(movement.amount), 0)
    const used = movements
      .filter(
        (movement) =>
          movement.type === 'query_charge' &&
          movement.query_status === 'completed'
      )
      .reduce((total, movement) => total + Math.abs(Number(movement.amount)), 0)
    const inProgress = movements
      .filter(
        (movement) =>
          movement.type === 'query_charge' &&
          ['pending', 'processing'].includes(movement.query_status)
      )
      .reduce((total, movement) => total + Math.abs(Number(movement.amount)), 0)
    const balance = movements[0]?.balance_after ?? user?.wallet?.balance ?? 0

    return { purchased, used, inProgress, balance }
  }, [movements, user])

  // Un intento fallido se reintegra automáticamente y no se presenta como
  // crédito usado. Solo mostramos consultas cuyo resultado fue completado.
  const visibleMovements = useMemo(
    () =>
      movements.filter((movement) => {
        if (movement.type === 'query_refund') return false
        if (movement.type === 'query_charge') {
          return movement.query_status === 'completed'
        }
        return true
      }),
    [movements]
  )

  async function handleLoadMore() {
    if (!pagination || pagination.page >= pagination.total_pages) return

    setLoadingMore(true)
    try {
      const data = await getCreditMovements(token, pagination.page + 1)
      setMovements((currentMovements) => [...currentMovements, ...data.movements])
      setPagination(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <main className="credits-page">
      <header className="credits-page__header">
        <p className="credits-page__eyebrow">MI BILLETERA</p>
        <h1>Movimientos de créditos</h1>
        <p>Consulta las compras y verificaciones completadas de tu cuenta.</p>
      </header>

      <section className="credits-summary" aria-label="Resumen de créditos">
        <article className="credits-summary__balance">
          <span>Saldo disponible</span>
          <strong>◎ {summary.balance}</strong>
          <p>créditos disponibles</p>
        </article>
        <article>
          <span>Créditos comprados</span>
          <strong>+{summary.purchased}</strong>
        </article>
        <article>
          <span>Consultas completadas</span>
          <strong>{summary.used}</strong>
        </article>
        <article>
          <span>Consultas en proceso</span>
          <strong>{summary.inProgress}</strong>
        </article>
      </section>

      {loading && <p className="credits-page__message">Cargando movimientos...</p>}
      {!loading && error && <p className="credits-page__message credits-page__message--error">{error}</p>}

      {!loading && !error && visibleMovements.length === 0 && (
        <section className="credits-empty">
          <span>◎</span>
          <h2>Aún no tienes movimientos</h2>
          <p>Las compras y consultas realizadas aparecerán en este historial.</p>
        </section>
      )}

      {!loading && !error && visibleMovements.length > 0 && (
        <section className="credits-list" aria-label="Historial de movimientos">
          {visibleMovements.map((movement) => {
            const config = MOVEMENT_CONFIG[movement.type] || MOVEMENT_CONFIG.admin_adjustment
            const reference = getMovementReference(movement)

            return (
              <article className="credit-movement" key={movement.id}>
                <div className={`credit-movement__icon credit-movement__icon--${config.tone}`}>
                  {config.icon}
                </div>
                <div className="credit-movement__main">
                  <h2>{config.title}</h2>
                  <p>{movement.description}</p>
                  <small>{formatDateTime(movement.created_at)}</small>
                </div>
                <div className="credit-movement__reference">
                  <span>{reference.label}</span>
                  <strong>{reference.value}</strong>
                </div>
                <div className="credit-movement__amount">
                  <strong className={`credit-movement__amount--${config.tone}`}>
                    {formatAmount(movement.amount)}
                  </strong>
                  <span>Saldo: {movement.balance_after}</span>
                </div>
              </article>
            )
          })}

          {pagination?.page < pagination?.total_pages && (
            <button type="button" className="credits-page__more" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Cargando...' : 'Cargar más movimientos'}
            </button>
          )}
        </section>
      )}
    </main>
  )
}

export default CreditMovementsPage
