import { useState, useRef, useEffect } from 'react'
import useStore, { avatarBg } from '../store/useStore'

export default function LoginPage({ onLogin }) {
  const members = useStore(s => s.members)
  const sorted = [...members.filter(m => m.role === 'parent'), ...members.filter(m => m.role === 'child')]

  const [pendingParent, setPendingParent] = useState(null)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    if (pendingParent) inputRef.current?.focus()
  }, [pendingParent])

  function handleMemberClick(m) {
    if (m.role === 'parent' && m.password) {
      setPendingParent(m)
      setPwInput('')
      setPwError(false)
    } else {
      onLogin(m)
    }
  }

  function handlePasswordSubmit() {
    if (pwInput === pendingParent.password) {
      onLogin(pendingParent)
    } else {
      setPwError(true)
      setPwInput('')
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handlePasswordSubmit()
    if (e.key === 'Escape') { setPendingParent(null); setPwError(false) }
  }

  return (
    <div className="login-wrap">
      <div className="logo" style={{ fontSize: 22 }}>
        <i className="ti ti-math-function" /> 수학 홈스쿨
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, marginTop: '1rem' }}>누구로 시작할까요?</div>
      <div style={{ fontSize: 14, color: 'var(--txt2)', marginTop: '.375rem' }}>가족 구성원을 선택하세요</div>

      <div className="family-grid">
        {sorted.map(m => (
          <div
            key={m.id}
            className={`mc${pendingParent?.id === m.id ? ' mc-selected' : ''}`}
            onClick={() => handleMemberClick(m)}
          >
            <div className="av2" style={{ background: avatarBg(m.color), color: m.color }}>
              {m.name[0]}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: '.2rem' }}>
              {m.role === 'parent' ? '부모' : '아이'}{m.grade ? ` · ${m.grade}` : ''}
              {m.role === 'parent' && m.password && (
                <span style={{ marginLeft: '.3rem', opacity: .6 }}>
                  <i className="ti ti-lock" style={{ fontSize: 11 }} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 비밀번호 입력 패널 */}
      {pendingParent && (
        <div className="card" style={{ maxWidth: 320, marginTop: '1.25rem', width: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <div className="av" style={{ background: avatarBg(pendingParent.color), color: pendingParent.color }}>
              {pendingParent.name[0]}
            </div>
            {pendingParent.name} 비밀번호 입력
          </div>
          <div className="fb-row">
            <input
              ref={inputRef}
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false) }}
              onKeyDown={handleKeyDown}
              placeholder="비밀번호"
              style={pwError ? { borderColor: 'var(--ce)' } : {}}
            />
            <button className="btn btn-primary btn-sm" onClick={handlePasswordSubmit}>확인</button>
          </div>
          {pwError && (
            <div style={{ color: 'var(--ce)', fontSize: 12, marginTop: '.5rem' }}>
              <i className="ti ti-alert-circle" /> 비밀번호가 틀렸어요
            </div>
          )}
          <button
            className="btn btn-sm"
            style={{ marginTop: '.625rem', width: '100%' }}
            onClick={() => { setPendingParent(null); setPwError(false) }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  )
}
