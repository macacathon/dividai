const db = {
  groups: [
    {
      id: 1,
      name: 'Viagem Praia 2024',
      members: ['João', 'Maria', 'Pedro'],
      total: 1250.5,
    },
    {
      id: 2,
      name: 'República',
      members: ['João', 'Carlos', 'Ana', 'Lucas'],
      total: 3420,
    },
  ],
  expenses: [
    {
      id: 1,
      groupId: 1,
      description: 'Hotel',
      amount: 800,
      paidBy: 'João',
      date: '2024-03-15',
    },
    {
      id: 2,
      groupId: 1,
      description: 'Mercado',
      amount: 450.5,
      paidBy: 'Maria',
      date: '2024-03-16',
    },
    {
      id: 3,
      groupId: 2,
      description: 'Aluguel',
      amount: 2000,
      paidBy: 'João',
      date: '2024-03-01',
    },
    {
      id: 4,
      groupId: 2,
      description: 'Energia',
      amount: 420,
      paidBy: 'Carlos',
      date: '2024-03-05',
    },
  ],
  activities: [],
  users: [{ id: 1, name: 'Você' }],
  sessions: new Set(),
};

// Helpers de ID
const nextId = {
  group: () =>
    db.groups.length ? Math.max(...db.groups.map((g) => g.id)) + 1 : 1,
  expense: () =>
    db.expenses.length ? Math.max(...db.expenses.map((e) => e.id)) + 1 : 1,
  activity: () => Date.now(),
};

module.exports = {
  db,
  nextId,
};
