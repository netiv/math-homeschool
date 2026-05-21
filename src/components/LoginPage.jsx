import useStore, { avatarBg } from '../store/useStore'

export default function LoginPage({ onLogin }) {
  const members = useStore(s => s.members)
  const sorted = [...members.filter(m => m.role === 'parent'), ...members.filter(m => m.role === 'child')]

  return (
    <div className="login-wrap">
      <div className="logo" style={{ fontSize: 22 }}>
        <i className="ti ti-math-function" /> 수학 홈스쿨
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, marginTop: '1rem' }}>누구로 시작할까요?</div>
      <div style={{ fontSize: 14, color: 'var(--txt2)', marginTop: '.375rem' }}>가족 구성원을 선택하세요</div>
      <div className="family-grid">
        {sorted.map(m => (
          <div key={m.id} className="mc" onClick={() => onLogin(m)}>
            <div className="av2" style={{ background: avatarBg(m.color), color: m.color }}>
              {m.name[0]}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: '.2rem' }}>
              {m.role === 'parent' ? '부모' : '아이'}{m.grade ? ` · ${m.grade}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
