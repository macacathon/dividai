function todayYMD() {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Registra atividade */
function logActivity(/** @type {Activity} */ entry) {
  db.activities.unshift(entry);
}

/** Recalcula total de um grupo com base nas despesas */
function recalcGroupTotal(groupId) {
  const total = db.expenses
    .filter((e) => e.groupId === groupId)
    .reduce((s, e) => s + e.amount, 0);
  const g = db.groups.find((g) => g.id === groupId);
  if (g) g.total = Number(total.toFixed(2));
}

/** Calcula saldos por membro (quanto cada um pagou - cota) */
function calculateBalances(/** @type {Group} */ group) {
  const groupExpenses = db.expenses.filter((e) => e.groupId === group.id);
  const balances = Object.fromEntries(group.members.map((m) => [m, 0]));
  for (const exp of groupExpenses) {
    if (!(exp.paidBy in balances)) balances[exp.paidBy] = 0; // robustez
    balances[exp.paidBy] += exp.amount;
  }
  const share = group.members.length ? group.total / group.members.length : 0;
  for (const m of Object.keys(balances))
    balances[m] = Number((balances[m] - share).toFixed(2));
  return { balances, share: Number(share.toFixed(2)) };
}

/** Gera instruções de acerto */
function settlementInstructions(balancesObj) {
  const creditors = Object.entries(balancesObj)
    .filter(([, v]) => v > 0)
    .map(([member, amount]) => ({ member, amount }));
  const debtors = Object.entries(balancesObj)
    .filter(([, v]) => v < 0)
    .map(([member, amount]) => ({ member, amount: Math.abs(amount) }));
  /** @type {{from:string,to:string,amount:number}[]} */
  const steps = [];
  for (const d of debtors) {
    let remaining = d.amount;
    for (const c of creditors) {
      if (remaining <= 0.01) break;
      if (c.amount <= 0.01) continue;
      const pay = Math.min(remaining, c.amount);
      steps.push({
        from: d.member,
        to: c.member,
        amount: Number(pay.toFixed(2)),
      });
      remaining = Number((remaining - pay).toFixed(2));
      c.amount = Number((c.amount - pay).toFixed(2));
    }
  }
  return steps;
}

module.exports = {
  todayYMD,
  logActivity,
  recalcGroupTotal,
  calculateBalances,
  settlementInstructions,
};
