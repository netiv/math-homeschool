import { useState } from 'react'
import useStore, { getStep, isStepDone, stepsDone, childUnits, totalPts } from '../store/useStore'
import { STEPS } from '../constants/steps'
import FeedbackThread from './FeedbackThread'
import { showToast } from './Toast'

export default function ChildPage({ user }) {
  const { units, progress, purchases, setStepStatus, addFeedback, markNotificationsRead } = useStore()
  const [selectedUnitId, setSelectedUnitId] = useState(null)

  const myUnits = childUnits(units, user)

  // 첫 번째 미완료 단원을 active 단원으로
  const activeUnit = myUnits.find(u =>
    !STEPS.every(s => isStepDone(progress, user.id, u.id, s.key))
  ) ?? myUnits[0] ?? null

  const displayUnit = selectedUnitId
    ? (myUnits.find(u => u.id === selectedUnitId) ?? activeUnit)
    : activeUnit

  const pts = totalPts(units, progress, purchases, user.id)
  const doneCount = myUnits.filter(u => STEPS.every(s => isStepDone(progress, user.id, u.id, s.key))).length

  const unitProg = displayUnit ? (progress?.[user.id]?.[displayUnit.id] ?? {}) : {}
  const pct = displayUnit ? Math.round(stepsDone(progress, user.id, displayUnit.id) / STEPS.length * 100) : 0

  function handleStepClick(step) {
    if (!displayUnit) return
    const st = getStep(progress, user.id, displayUnit.id, step.key)
    if (st.status === 'approved') return

    if (st.status === 'pending') {
      // 요청 취소
      setStepStatus(user.id, displayUnit.id, step.key, 'idle', '', user.name, 'child')
      showToast('완료 요청을 취소했어요')
      return
    }

    // idle / rejected → 완료 요청
    setStepStatus(user.id, displayUnit.id, step.key, 'pending', '', user.name, 'child')
    showToast('완료 요청을 보냈어요!')
  }

  // 현재 단원의 모든 피드백을 합쳐서 표시 (stepKey 구분 없이 general 피드백)
  const allFeedbacks = displayUnit
    ? Object.values(unitProg).flatMap(step =>
        Array.isArray(step?.feedbacks) ? step.feedbacks : []
      ).sort((a, b) => a.id - b.id)
    : []

  function handleFeedbackSubmit(text) {
    if (!displayUnit) return
    // 현재 active step의 feedbacks에 추가 (없으면 첫 번째 단계에)
    const activeStep = STEPS.find(s => {
      const st = getStep(progress, user.id, displayUnit.id, s.key)
      return st.status !== 'approved'
    }) ?? STEPS[0]
    addFeedback(user.id, displayUnit.id, activeStep.key, text, user.name, 'child')
  }

  function getStepRowClass(step) {
    if (!displayUnit) return ''
    const st = getStep(progress, user.id, displayUnit.id, step.key)
    if (st.status === 'approved') return 'done'
    if (st.status === 'pending') return 'pending'
    if (st.status === 'rejected') return 'rejected'
    return 'active'
  }

  function getStepIcon(step) {
    if (!displayUnit) return null
    const st = getStep(progress, user.id, displayUnit.id, step.key)
    if (st.status === 'approved') return <i className="ti ti-check" />
    if (st.status === 'pending') return <i className="ti ti-clock" />
    if (st.status === 'rejected') return <i className="ti ti-x" />
    return null
  }

  return (
    <>
      <div className="stats-row">
        <div className="stat">
          <div className="stat-lbl">포인트</div>
          <div className="stat-val" style={{ color: 'var(--cp)' }}>{pts}P</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">완료 단원</div>
          <div className="stat-val">{doneCount}/{myUnits.length}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">현재 단원</div>
          <div className="stat-val" style={{ fontSize: 14, paddingTop: 4 }}>{activeUnit?.name ?? '없음'}</div>
        </div>
      </div>

      {/* 단원 선택 탭 */}
      {myUnits.length > 1 && (
        <div className="child-tabs">
          {myUnits.map(u => (
            <div
              key={u.id}
              className={`child-tab${(displayUnit?.id === u.id) ? ' active' : ''}`}
              onClick={() => setSelectedUnitId(u.id)}
            >
              {u.name}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-title"><i className="ti ti-list-check" /> 진행 중인 단원</div>
        {displayUnit ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{displayUnit.name}</div>
                <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{displayUnit.desc} · {displayUnit.grade}</div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--txt2)' }}>{pct}%</span>
            </div>
            <div className="pb"><div className="pb-fill" style={{ width: `${pct}%` }} /></div>
          </>
        ) : (
          <div style={{ color: 'var(--txt2)', fontSize: 13 }}>모든 단원 완료! 🎉</div>
        )}
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-repeat" /> 학습 사이클</div>
        <div className="cycle-wrap">
          {displayUnit
            ? STEPS.map((step, idx) => {
                const rowClass = getStepRowClass(step)
                const st = getStep(progress, user.id, displayUnit.id, step.key)
                return (
                  <div key={step.key} className={`step-row${rowClass ? ` ${rowClass}` : ''}`}>
                    <div className="step-chk" onClick={() => handleStepClick(step)}>
                      {getStepIcon(step)}
                    </div>
                    <div className="step-lbl">{idx + 1}. {step.label}</div>
                    <div className="step-pts">
                      {st.status === 'approved'  && <span style={{ color: 'var(--cok)' }}>+{step.pts}P</span>}
                      {st.status === 'pending'   && <span style={{ color: 'var(--cw)', fontSize: 11 }}>취소하려면 클릭</span>}
                      {st.status === 'rejected'  && <span style={{ color: 'var(--ce)', fontSize: 11 }}>반려 · 재요청 클릭</span>}
                      {st.status === 'idle'      && <span>+{step.pts}P</span>}
                    </div>
                  </div>
                )
              })
            : <div style={{ color: 'var(--txt2)', fontSize: 13 }}>표시할 단원이 없어요</div>
          }
        </div>
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-message-circle" /> 피드백</div>
        <FeedbackThread
          feedbacks={allFeedbacks}
          onSubmit={handleFeedbackSubmit}
          placeholder="느낀 점, 질문 남기기..."
        />
      </div>
    </>
  )
}
