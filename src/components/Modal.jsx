import { useEffect, useRef, useState } from 'react'
import { GRADES } from '../constants/grades'

export function GradeSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {GRADES.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
    </select>
  )
}

export function UnitModal({ unit, onSave, onClose }) {
  const nameRef = useRef()
  const descRef = useRef()
  const [grade, setGrade] = useState(unit?.grade ?? '초5-1')

  useEffect(() => { nameRef.current?.focus() }, [])

  function handleSave() {
    const name = nameRef.current.value.trim()
    if (!name) { nameRef.current.focus(); return }
    onSave({ name, desc: descRef.current.value.trim(), grade })
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{unit ? '단원 수정' : '단원 추가'}</div>
        <label>단원 이름</label>
        <input ref={nameRef} defaultValue={unit?.name ?? ''} placeholder="예: 분수의 사칙연산" />
        <label>설명 (선택)</label>
        <input ref={descRef} defaultValue={unit?.desc ?? ''} placeholder="예: 통분, 약분" />
        <label>학기</label>
        <GradeSelect value={grade} onChange={setGrade} />
        <div className="modal-btns">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  )
}

const COLORS = [
  { v: '#2E9B6E', l: '초록' }, { v: '#2D6BE4', l: '파랑' },
  { v: '#6C4FD4', l: '보라' }, { v: '#C97B0A', l: '주황' },
  { v: '#C0392B', l: '빨강' },
]

export function MemberModal({ member, role, onSave, onClose }) {
  const nameRef = useRef()
  const [color, setColor] = useState(member?.color ?? '#2E9B6E')
  const [grade, setGrade] = useState(member?.grade ?? '초3-1')
  const isChild = role === 'child'

  useEffect(() => { nameRef.current?.focus() }, [])

  function handleSave() {
    const name = nameRef.current.value.trim()
    if (!name) { nameRef.current.focus(); return }
    onSave({ name, color, grade: isChild ? grade : undefined })
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{member ? '구성원 수정' : isChild ? '아이 추가' : '부모 추가'}</div>
        <label>이름</label>
        <input ref={nameRef} defaultValue={member?.name ?? ''} placeholder={isChild ? '예: 셋째' : '예: 할머니'} />
        {isChild && (
          <>
            <label>학년/학기</label>
            <GradeSelect value={grade} onChange={setGrade} />
          </>
        )}
        <label>색상</label>
        <select value={color} onChange={e => setColor(e.target.value)}>
          {COLORS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
        </select>
        <div className="modal-btns">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  )
}

export function ApproveModal({ childName, unitName, stepLabel, onApprove, onReject, onClose }) {
  const fbRef = useRef()

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">단계 완료 확인</div>
        <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: '.75rem' }}>
          <strong>{childName}</strong>의 <strong>{unitName}</strong><br />
          <strong>{stepLabel}</strong> 단계를 승인하거나 반려하세요.
        </div>
        <label>피드백 (선택)</label>
        <textarea ref={fbRef} rows={3} placeholder="아이에게 전달할 메시지..." style={{ resize: 'vertical' }} />
        <div className="modal-btns">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-danger" onClick={() => onReject(fbRef.current.value)}>반려</button>
          <button className="btn btn-ok" onClick={() => onApprove(fbRef.current.value)}>승인</button>
        </div>
      </div>
    </div>
  )
}
