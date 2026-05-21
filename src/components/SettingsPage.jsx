import { useRef, useState } from 'react'
import useStore, { avatarBg, totalPts } from '../store/useStore'
import { MemberModal } from './Modal'
import { showToast } from './Toast'

export default function SettingsPage() {
  const { members, units, progress, purchases, shopItems, addMember, updateMember, removeMember, addShopItem, removeShopItem } = useStore()
  const [memberModal, setMemberModal] = useState(null) // null | { role, member? }

  const nameRef = useRef()
  const ptsRef = useRef()
  const emojiRef = useRef()

  function handleSaveMember(data) {
    if (memberModal.member) {
      updateMember(memberModal.member.id, data)
    } else {
      addMember({ ...data, role: memberModal.role })
    }
    showToast('저장됐어요')
    setMemberModal(null)
  }

  function handleRemoveMember(id) {
    if (members.length <= 1) { showToast('최소 1명은 있어야 해요'); return }
    if (!confirm('삭제할까요?')) return
    removeMember(id)
  }

  function handleAddItem() {
    const name = nameRef.current.value.trim()
    const pts = parseInt(ptsRef.current.value) || 0
    const emoji = emojiRef.current.value.trim() || '🎁'
    if (!name || pts <= 0) { showToast('이름과 포인트를 입력해주세요'); return }
    addShopItem({ name, pts, emoji })
    nameRef.current.value = ''
    ptsRef.current.value = ''
    emojiRef.current.value = ''
    showToast('아이템이 추가됐어요')
  }

  return (
    <>
      <div className="card">
        <div className="card-title"><i className="ti ti-users" /> 가족 구성원</div>
        {members.map(m => (
          <div key={m.id} className="unit-item">
            <div
              className="av"
              style={{ background: avatarBg(m.color), color: m.color, width: 32, height: 32, fontSize: 13 }}
            >
              {m.name[0]}
            </div>
            <div style={{ flex: 1, marginLeft: '.5rem' }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>
                {m.role === 'parent' ? '부모' : '아이'}
                {m.grade ? ` · ${m.grade}` : ''}
                {m.role === 'child' ? ` · ${totalPts(units, progress, purchases, m.id)}P` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.3rem' }}>
              <button className="btn btn-sm btn-icon" onClick={() => setMemberModal({ role: m.role, member: m })}>
                <i className="ti ti-edit" />
              </button>
              {members.length > 1 && (
                <button className="btn btn-sm btn-icon btn-danger" onClick={() => handleRemoveMember(m.id)}>
                  <i className="ti ti-trash" />
                </button>
              )}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
          <button className="btn btn-sm" onClick={() => setMemberModal({ role: 'child' })}>+ 아이 추가</button>
          <button className="btn btn-sm" onClick={() => setMemberModal({ role: 'parent' })}>+ 부모 추가</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-shopping-bag" /> 보상 아이템 관리</div>
        <div className="tag-list">
          {shopItems.map(item => (
            <div key={item.id} className="tag">
              {item.emoji || '🎁'} {item.name} ({item.pts}P)
              <i className="ti ti-x" onClick={() => removeShopItem(item.id)} />
            </div>
          ))}
        </div>
        <div className="input-row" style={{ marginTop: '.75rem' }}>
          <input ref={nameRef} placeholder="아이템 이름" style={{ flex: 1, minWidth: 100 }} />
          <input ref={ptsRef} type="number" placeholder="포인트" style={{ width: 80 }} />
          <input ref={emojiRef} placeholder="이모지" style={{ width: 58 }} />
          <button className="btn btn-sm btn-primary" onClick={handleAddItem}>추가</button>
        </div>
      </div>

      {memberModal && (
        <MemberModal
          member={memberModal.member ?? null}
          role={memberModal.role}
          onSave={handleSaveMember}
          onClose={() => setMemberModal(null)}
        />
      )}
    </>
  )
}
