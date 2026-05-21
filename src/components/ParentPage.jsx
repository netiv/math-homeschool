import { useState } from 'react'
import useStore, {
  getStep, isStepDone, stepsDone, childUnits, totalPts, avatarBg
} from '../store/useStore'
import { STEPS } from '../constants/steps'
import FeedbackThread from './FeedbackThread'
import { UnitModal, ApproveModal } from './Modal'
import { showToast } from './Toast'

export default function ParentPage({ user }) {
  const {
    members, units, progress, purchases, notifications,
    addUnit, updateUnit, deleteUnit, setStepStatus, addFeedback, markNotificationsRead,
  } = useStore()

  const children = members.filter(m => m.role === 'child')
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? null)
  const [gradeFilter, setGradeFilter] = useState('all')
  const [unitModal, setUnitModal] = useState(null) // null | 'new' | unit object
  const [approveTarget, setApproveTarget] = useState(null) // { childId, unitId, stepKey }

  const selectedChild = members.find(m => m.id === selectedChildId) ?? children[0] ?? null

  function selectChild(child) {
    setSelectedChildId(child.id)
    setGradeFilter('all')
    markNotificationsRead(user.id)
  }

  const myUnits = selectedChild ? childUnits(units, selectedChild) : []
  const au = myUnits.find(u => !STEPS.every(s => isStepDone(progress, selectedChild?.id, u.id, s.key))) ?? myUnits[0] ?? null

  const pts = selectedChild ? totalPts(units, progress, purchases, selectedChild.id) : 0
  const doneCount = myUnits.filter(u => STEPS.every(s => isStepDone(progress, selectedChild?.id, u.id, s.key))).length
  const auDone = au ? stepsDone(progress, selectedChild?.id, au.id) : 0

  const grades = ['all', ...new Set(units.map(u => u.grade ?? '미지정'))]
  const filtered = gradeFilter === 'all' ? units : units.filter(u => u.grade === gradeFilter)

  // 이 부모에게 온 pending 알림
  const pendingNotifs = notifications.filter(n => n.to === user.id && n.type === 'pending' && !n.read)

  function handleApprove(feedbackMsg) {
    if (!approveTarget || !selectedChild) return
    const { unitId, stepKey } = approveTarget
    setStepStatus(selectedChild.id, unitId, stepKey, 'approved', feedbackMsg, user.name, 'parent')
    const step = STEPS.find(s => s.key === stepKey)
    showToast(`✅ 승인! +${step?.pts}P 적립`)
    setApproveTarget(null)
  }

  function handleReject(feedbackMsg) {
    if (!approveTarget || !selectedChild) return
    const { unitId, stepKey } = approveTarget
    setStepStatus(selectedChild.id, unitId, stepKey, 'rejected', feedbackMsg, user.name, 'parent')
    showToast('반려했어요. 피드백을 확인하세요')
    setApproveTarget(null)
  }

  // 현재 단원의 모든 피드백
  const allFeedbacks = au && selectedChild
    ? Object.values(progress?.[selectedChild.id]?.[au.id] ?? {}).flatMap(step =>
        Array.isArray(step?.feedbacks) ? step.feedbacks : []
      ).sort((a, b) => a.id - b.id)
    : []

  function handleParentFeedback(text) {
    if (!au || !selectedChild) return
    const activeStep = STEPS.find(s => {
      const st = getStep(progress, selectedChild.id, au.id, s.key)
      return st.status !== 'approved'
    }) ?? STEPS[0]
    addFeedback(selectedChild.id, au.id, activeStep.key, text, user.name, 'parent')
  }

  function handleSaveUnit(data) {
    if (unitModal && typeof unitModal === 'object') {
      updateUnit(unitModal.id, data)
      showToast('단원이 수정됐어요')
    } else {
      addUnit(data)
      showToast('단원이 추가됐어요')
    }
    setUnitModal(null)
  }

  function handleDeleteUnit(id) {
    if (!confirm('이 단원을 삭제할까요?')) return
    deleteUnit(id)
    showToast('단원이 삭제됐어요')
  }

  return (
    <>
      {/* 아이 선택 탭 */}
      <div className="child-tabs">
        {children.map(c => {
          const hasNotif = pendingNotifs.some(n => n.childId === c.id)
          return (
            <div
              key={c.id}
              className={`child-tab${selectedChild?.id === c.id ? ' active' : ''}`}
              onClick={() => selectChild(c)}
            >
              {c.name}{c.grade ? ` (${c.grade})` : ''}
              {hasNotif && <span className="notif-dot" />}
            </div>
          )
        })}
      </div>

      {selectedChild && (
        <>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-lbl">{selectedChild.name} 포인트</div>
              <div className="stat-val" style={{ color: 'var(--cp)' }}>{pts}P</div>
            </div>
            <div className="stat">
              <div className="stat-lbl">완료 단원</div>
              <div className="stat-val">{doneCount}/{myUnits.length}</div>
            </div>
            <div className="stat">
              <div className="stat-lbl">현재 단원 진행</div>
              <div className="stat-val">{auDone}/{STEPS.length}단계</div>
            </div>
          </div>

          {/* pending 알림 있으면 요약 배너 */}
          {pendingNotifs.filter(n => n.childId === selectedChild.id).length > 0 && (
            <div className="card" style={{ background: 'var(--cwl)', borderColor: '#F5D08A', marginBottom: '.75rem' }}>
              <div style={{ fontSize: 13, color: 'var(--cw)', fontWeight: 500 }}>
                <i className="ti ti-bell" /> 완료 요청이 있어요 — 아래 목록에서 확인하세요
              </div>
            </div>
          )}
        </>
      )}

      {/* 단원 목록 */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span><i className="ti ti-books" /> 단원 관리</span>
          <button className="btn btn-sm btn-primary" onClick={() => setUnitModal('new')}>+ 단원 추가</button>
        </div>

        <div className="gf">
          {grades.map(gr => (
            <div
              key={gr}
              className={`gf-btn${gradeFilter === gr ? ' active' : ''}`}
              onClick={() => setGradeFilter(gr)}
            >
              {gr === 'all' ? '전체' : gr}
            </div>
          ))}
        </div>

        {filtered.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--txt2)', padding: '.5rem 0' }}>해당 학기 단원이 없어요</div>
          : filtered.map((u, i) => {
              if (!selectedChild) return null
              const pr = progress?.[selectedChild.id]?.[u.id] ?? {}
              const dn = STEPS.every(s => isStepDone(progress, selectedChild.id, u.id, s.key))
              const st = stepsDone(progress, selectedChild.id, u.id)
              const isAct = au?.id === u.id
              const pct = Math.round(st / STEPS.length * 100)

              // pending 단계 수
              const pendingCount = STEPS.filter(s => getStep(progress, selectedChild.id, u.id, s.key).status === 'pending').length

              return (
                <div key={u.id} className="unit-item">
                  <div style={{ fontSize: 12, color: 'var(--txt2)', minWidth: 20, textAlign: 'center' }}>{i + 1}</div>
                  <div className="unit-info">
                    <div className="unit-name">
                      {u.name} <span style={{ fontSize: 11, color: 'var(--txt2)', fontWeight: 400 }}>{u.grade}</span>
                    </div>
                    <div className="unit-meta">{u.desc}</div>
                    <div className="pb" style={{ marginTop: '.375rem' }}>
                      <div className="pb-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 64 }}>
                    <span className={`badge ${dn ? 'b-done' : isAct ? 'b-active' : 'b-todo'}`}>
                      {dn ? '완료' : isAct ? '진행중' : '대기'}
                    </span>
                    {pendingCount > 0 && (
                      <span className="badge b-pending" style={{ marginLeft: '.25rem' }}>요청 {pendingCount}</span>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: '.25rem' }}>{st}/{STEPS.length}</div>
                  </div>
                  <div className="unit-actions">
                    {/* pending 단계가 있으면 승인 버튼 */}
                    {pendingCount > 0 && (
                      <button
                        className="btn btn-sm btn-warn"
                        title="승인/반려"
                        onClick={() => {
                          const pendingStep = STEPS.find(s =>
                            getStep(progress, selectedChild.id, u.id, s.key).status === 'pending'
                          )
                          if (pendingStep) setApproveTarget({ unitId: u.id, stepKey: pendingStep.key })
                        }}
                      >
                        <i className="ti ti-check" />
                      </button>
                    )}
                    <button className="btn btn-sm btn-icon" title="수정" onClick={() => setUnitModal(u)}>
                      <i className="ti ti-edit" />
                    </button>
                    <button className="btn btn-sm btn-icon btn-danger" title="삭제" onClick={() => handleDeleteUnit(u.id)}>
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </div>
              )
            })
        }
      </div>

      {/* 피드백 */}
      <div className="card">
        <div className="card-title"><i className="ti ti-message-circle" /> 피드백 남기기</div>
        <FeedbackThread
          feedbacks={allFeedbacks}
          onSubmit={handleParentFeedback}
          placeholder="아이에게 피드백 남기기..."
        />
      </div>

      {/* 단원 모달 */}
      {unitModal && (
        <UnitModal
          unit={typeof unitModal === 'object' ? unitModal : null}
          onSave={handleSaveUnit}
          onClose={() => setUnitModal(null)}
        />
      )}

      {/* 승인/반려 모달 */}
      {approveTarget && selectedChild && (
        <ApproveModal
          childName={selectedChild.name}
          unitName={units.find(u => u.id === approveTarget.unitId)?.name ?? ''}
          stepLabel={STEPS.find(s => s.key === approveTarget.stepKey)?.label ?? ''}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setApproveTarget(null)}
        />
      )}
    </>
  )
}
