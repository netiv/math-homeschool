import useStore, { totalPts } from '../store/useStore'
import { showToast } from './Toast'

export default function ShopPage({ user }) {
  const { units, progress, purchases, shopItems, buyItem } = useStore()

  const pts = totalPts(units, progress, purchases, user.id)

  function handleBuy(item) {
    if (pts < item.pts) { showToast('포인트가 부족해요'); return }
    buyItem(user.id, item)
    showToast(`${item.emoji} ${item.name} 구매 완료!`)
  }

  return (
    <>
      <div className="pt-banner">
        <div>
          <div style={{ fontSize: 13, color: 'var(--cp)', marginBottom: '.25rem' }}>내 포인트</div>
          <div className="pt-val">{pts}P</div>
        </div>
        <i className="ti ti-star" style={{ fontSize: 32, color: 'var(--cp)', opacity: .3 }} />
      </div>

      <div className="card-title" style={{ marginBottom: '.75rem' }}>
        <i className="ti ti-shopping-bag" /> 보상 상점
      </div>

      <div className="shop-grid">
        {shopItems.map(item => {
          const ok = pts >= item.pts
          return (
            <div key={item.id} className="shop-item">
              <div className="emoji">{item.emoji || '🎁'}</div>
              <div className="iname">{item.name}</div>
              <div className="ipts">{item.pts}P</div>
              <button
                className={`btn btn-sm${ok ? ' btn-primary' : ''}`}
                disabled={!ok}
                onClick={() => handleBuy(item)}
              >
                구매
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
