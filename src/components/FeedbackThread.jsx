import { useRef } from 'react'

export default function FeedbackThread({ feedbacks = [], onSubmit, placeholder = '느낀 점, 질문 남기기...' }) {
  const inputRef = useRef()

  function handleSubmit() {
    const val = inputRef.current.value.trim()
    if (!val) return
    onSubmit(val)
    inputRef.current.value = ''
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return (
    <>
      <div className="fb-list">
        {feedbacks.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--txt2)' }}>아직 피드백이 없어요</div>
          : feedbacks.slice(-6).map(fb => (
            <div key={fb.id} className={`fb-item ${fb.role === 'child' ? 'child-fb' : 'parent-fb'}`}>
              <div className="fb-who">{fb.name} · {fb.time}</div>
              {fb.text}
            </div>
          ))
        }
      </div>
      <div className="fb-row">
        <input ref={inputRef} placeholder={placeholder} onKeyDown={handleKeyDown} />
        <button className="btn btn-primary btn-sm" onClick={handleSubmit}>남기기</button>
      </div>
    </>
  )
}
