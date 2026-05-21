import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STEPS } from '../constants/steps'

const AV_BG = {
  '#2D6BE4': '#EBF1FD',
  '#6C4FD4': '#F0ECFC',
  '#2E9B6E': '#E8F7F1',
  '#C97B0A': '#FEF4E0',
  '#C0392B': '#FDECEB',
}
export function avatarBg(color) { return AV_BG[color] || '#F1EFE8' }

function defaultState() {
  return {
    members: [
      { id: 'mom', name: '엄마',  role: 'parent', color: '#2D6BE4' },
      { id: 'dad', name: '아빠',  role: 'parent', color: '#6C4FD4' },
      { id: 'c1',  name: '첫째',  role: 'child',  color: '#2E9B6E', grade: '초5-1' },
      { id: 'c2',  name: '둘째',  role: 'child',  color: '#C97B0A', grade: '초3-1' },
    ],
    units: [
      { id: 'u1', name: '약수와 배수',     desc: '최대공약수, 최소공배수',       grade: '초5-1' },
      { id: 'u2', name: '분수의 사칙연산', desc: '통분, 약분, 이분수',           grade: '초5-1' },
      { id: 'u3', name: '소수의 사칙연산', desc: '자릿값 이해',                  grade: '초5-1' },
      { id: 'u4', name: '도형의 넓이',     desc: '평행사변형, 삼각형, 사다리꼴', grade: '초5-1' },
      { id: 'u5', name: '비와 비율',       desc: '비율, 백분율',                 grade: '초5-1' },
      { id: 'u6', name: '나눗셈',          desc: '나머지가 있는 나눗셈',         grade: '초3-1' },
      { id: 'u7', name: '평면도형',        desc: '선, 각, 삼각형, 사각형',       grade: '초3-1' },
    ],
    // progress[childId][unitId][stepKey] = { status: 'idle'|'pending'|'approved'|'rejected', feedbacks: [] }
    progress: {},
    notifications: [],
    shopItems: [
      { id: 'i1', name: '아이스크림', pts: 30,  emoji: '🍦' },
      { id: 'i2', name: '게임 30분',  pts: 50,  emoji: '🎮' },
      { id: 'i3', name: '치킨',       pts: 100, emoji: '🍗' },
      { id: 'i4', name: '영화 보기',  pts: 80,  emoji: '🎬' },
    ],
    purchases: [],
  }
}

// ── helpers (pure, used outside store too) ──────────────────────────────────

export function getStep(progress, childId, unitId, stepKey) {
  return progress?.[childId]?.[unitId]?.[stepKey] ?? { status: 'idle', feedbacks: [] }
}

export function isStepDone(progress, childId, unitId, stepKey) {
  return getStep(progress, childId, unitId, stepKey).status === 'approved'
}

export function stepsDone(progress, childId, unitId) {
  return STEPS.filter(s => isStepDone(progress, childId, unitId, s.key)).length
}

export function childUnits(units, child) {
  return child ? units.filter(u => u.grade === child.grade) : []
}

export function activeUnit(units, progress, childId) {
  const child = { grade: null } // placeholder; caller passes member
  const us = units.filter(u => true) // caller filters by grade
  for (const u of us) {
    if (!STEPS.every(s => isStepDone(progress, childId, u.id, s.key))) return u
  }
  return us[0] ?? null
}

export function totalPts(units, progress, purchases, childId) {
  let pts = 0
  units.forEach(u => {
    STEPS.forEach(s => {
      if (isStepDone(progress, childId, u.id, s.key)) pts += s.pts
    })
  })
  const spent = (purchases ?? []).filter(p => p.childId === childId).reduce((a, p) => a + p.pts, 0)
  return pts - spent
}

// ── store ────────────────────────────────────────────────────────────────────

const useStore = create(
  persist(
    (set, get) => ({
      ...defaultState(),

      // step 상태 변경
      setStepStatus(childId, unitId, stepKey, status, feedbackMsg, actorName, actorRole) {
        set(s => {
          const progress = structuredClone(s.progress)
          if (!progress[childId]) progress[childId] = {}
          if (!progress[childId][unitId]) progress[childId][unitId] = {}
          const prev = progress[childId][unitId][stepKey] ?? { status: 'idle', feedbacks: [] }
          const feedbacks = [...prev.feedbacks]
          if (feedbackMsg?.trim()) {
            feedbacks.push({
              id: Date.now(),
              name: actorName,
              role: actorRole,
              text: feedbackMsg.trim(),
              time: new Date().toLocaleDateString('ko'),
            })
          }
          progress[childId][unitId][stepKey] = { status, feedbacks }

          // 알림 생성
          const notifications = [...s.notifications]
          const unit = s.units.find(u => u.id === unitId)
          const stepLabel = STEPS.find(st => st.key === stepKey)?.label ?? stepKey

          if (status === 'pending') {
            // 아이 → 부모 알림
            const parents = s.members.filter(m => m.role === 'parent')
            parents.forEach(p => {
              notifications.push({
                id: `n${Date.now()}_${p.id}`,
                to: p.id,
                type: 'pending',
                childId,
                unitId,
                stepKey,
                msg: `${s.members.find(m => m.id === childId)?.name}이(가) "${unit?.name} > ${stepLabel}" 완료 요청했어요`,
                time: new Date().toLocaleString('ko'),
                read: false,
              })
            })
          } else if (status === 'approved' || status === 'rejected') {
            // 부모 → 아이 알림
            notifications.push({
              id: `n${Date.now()}_${childId}`,
              to: childId,
              type: status,
              childId,
              unitId,
              stepKey,
              msg: status === 'approved'
                ? `"${unit?.name} > ${stepLabel}" 단계가 승인됐어요! +${STEPS.find(st => st.key === stepKey)?.pts}P`
                : `"${unit?.name} > ${stepLabel}" 단계가 반려됐어요. 피드백을 확인하세요`,
              time: new Date().toLocaleString('ko'),
              read: false,
            })
          }

          return { progress, notifications }
        })
      },

      addFeedback(childId, unitId, stepKey, text, actorName, actorRole) {
        set(s => {
          const progress = structuredClone(s.progress)
          if (!progress[childId]) progress[childId] = {}
          if (!progress[childId][unitId]) progress[childId][unitId] = {}
          const prev = progress[childId][unitId][stepKey] ?? { status: 'idle', feedbacks: [] }
          progress[childId][unitId][stepKey] = {
            ...prev,
            feedbacks: [...prev.feedbacks, {
              id: Date.now(),
              name: actorName,
              role: actorRole,
              text: text.trim(),
              time: new Date().toLocaleDateString('ko'),
            }],
          }
          return { progress }
        })
      },

      markNotificationsRead(userId) {
        set(s => ({
          notifications: s.notifications.map(n =>
            n.to === userId ? { ...n, read: true } : n
          ),
        }))
      },

      // 단원 CRUD
      addUnit(unit) {
        set(s => ({ units: [...s.units, { id: `u${Date.now()}`, ...unit }] }))
      },
      updateUnit(id, patch) {
        set(s => ({ units: s.units.map(u => u.id === id ? { ...u, ...patch } : u) }))
      },
      deleteUnit(id) {
        set(s => ({ units: s.units.filter(u => u.id !== id) }))
      },

      // 구성원 CRUD
      addMember(member) {
        set(s => ({ members: [...s.members, { id: `m${Date.now()}`, ...member }] }))
      },
      updateMember(id, patch) {
        set(s => ({ members: s.members.map(m => m.id === id ? { ...m, ...patch } : m) }))
      },
      removeMember(id) {
        set(s => ({ members: s.members.filter(m => m.id !== id) }))
      },

      // 상점
      addShopItem(item) {
        set(s => ({ shopItems: [...s.shopItems, { id: `i${Date.now()}`, ...item }] }))
      },
      removeShopItem(id) {
        set(s => ({ shopItems: s.shopItems.filter(i => i.id !== id) }))
      },
      buyItem(childId, item) {
        set(s => ({
          purchases: [...s.purchases, {
            childId, itemId: item.id, pts: item.pts,
            name: item.name, time: new Date().toLocaleDateString('ko'),
          }],
        }))
      },
    }),
    { name: 'mhs4' }
  )
)

export default useStore
