export const GRADES = []
for (let g = 1; g <= 6; g++) for (let s = 1; s <= 2; s++) GRADES.push({ v: `초${g}-${s}`, l: `초등 ${g}학년 ${s}학기` })
for (let g = 1; g <= 3; g++) for (let s = 1; s <= 2; s++) GRADES.push({ v: `중${g}-${s}`, l: `중등 ${g}학년 ${s}학기` })
