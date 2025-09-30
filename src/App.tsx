import React, { useState } from 'react';
import { Users, DollarSign, PieChart, CheckCircle, Menu, X, Moon, Sun, Plus, Trash2, Edit2, UserPlus, Receipt, TrendingUp } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  members: string[];
  total: number;
}

interface Expense {
  id: number;
  groupId: number;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
}

interface NewGroup {
  name: string;
  members: string;
}

interface NewExpense {
  description: string;
  amount: string;
  paidBy: string;
  groupId: number | null;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function DividAiApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: 'Viagem Praia 2024', members: ['João', 'Maria', 'Pedro'], total: 1250.50 },
    { id: 2, name: 'República', members: ['João', 'Carlos', 'Ana', 'Lucas'], total: 3420.00 },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, groupId: 1, description: 'Hotel', amount: 800, paidBy: 'João', date: '2024-03-15' },
    { id: 2, groupId: 1, description: 'Mercado', amount: 450.50, paidBy: 'Maria', date: '2024-03-16' },
    { id: 3, groupId: 2, description: 'Aluguel', amount: 2000, paidBy: 'João', date: '2024-03-01' },
    { id: 4, groupId: 2, description: 'Energia', amount: 420, paidBy: 'Carlos', date: '2024-03-05' },
  ]);

  const [newGroup, setNewGroup] = useState<NewGroup>({ name: '', members: '' });
  const [newExpense, setNewExpense] = useState<NewExpense>({ description: '', amount: '', paidBy: '', groupId: null });

  const handleCreateGroup = () => {
    if (newGroup.name && newGroup.members) {
      const membersArray = newGroup.members.split(',').map(m => m.trim());
      setGroups([...groups, { 
        id: groups.length + 1, 
        name: newGroup.name, 
        members: membersArray, 
        total: 0 
      }]);
      setNewGroup({ name: '', members: '' });
      setShowCreateGroup(false);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy && newExpense.groupId) {
      const expense: Expense = {
        id: expenses.length + 1,
        groupId: newExpense.groupId,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        paidBy: newExpense.paidBy,
        date: new Date().toISOString().split('T')[0]
      };
      setExpenses([...expenses, expense]);
      
      setGroups(groups.map(g => 
        g.id === expense.groupId 
          ? { ...g, total: g.total + expense.amount }
          : g
      ));
      
      setNewExpense({ description: '', amount: '', paidBy: '', groupId: null });
      setShowAddExpense(false);
    }
  };

  const handleDeleteGroup = (id: number) => {
    setGroups(groups.filter(g => g.id !== id));
    setExpenses(expenses.filter(e => e.groupId !== id));
  };

  const calculateSettlement = (group: Group): Record<string, number> => {
    const groupExpenses = expenses.filter(e => e.groupId === group.id);
    const balances: Record<string, number> = {};
    
    group.members.forEach(member => {
      balances[member] = 0;
    });
    
    groupExpenses.forEach(expense => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    });
    
    const sharePerPerson = group.total / group.members.length;
    
    Object.keys(balances).forEach(member => {
      balances[member] = balances[member] - sharePerPerson;
    });
    
    return balances;
  };

  const getSettlementInstructions = (balances: Record<string, number>): Settlement[] => {
    const creditors = Object.entries(balances).filter(([_, amount]) => amount > 0);
    const debtors = Object.entries(balances).filter(([_, amount]) => amount < 0);
    const instructions: Settlement[] = [];
    
    const balancesCopy = { ...balances };
    
    debtors.forEach(([debtor, debtAmount]) => {
      let remainingDebt = Math.abs(debtAmount);
      
      creditors.forEach(([creditor, creditAmount]) => {
        if (remainingDebt > 0.01 && balancesCopy[creditor] > 0.01) {
          const amount = Math.min(remainingDebt, balancesCopy[creditor]);
          instructions.push({
            from: debtor,
            to: creditor,
            amount: amount
          });
          remainingDebt -= amount;
          balancesCopy[creditor] -= amount;
        }
      });
    });
    
    return instructions;
  };

  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
              <X size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'} shadow-lg hover:shadow-xl transition`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="min-h-screen flex items-center justify-center px-4">
          <div className={`max-w-md w-full p-8 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>DividAí</span>
            </div>
            
            <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Bem-vindo de volta!
            </h2>
            
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
            >
              Entrar no Sistema
            </button>
            
            <p className={`text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Divida despesas sem complicação
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>DividAí</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:shadow-lg transition`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsLoggedIn(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} hover:shadow-lg transition`}
              >
                Sair
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total de Grupos</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{groups.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total de Despesas</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{expenses.length}</p>
              </div>
              <Receipt className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valor Total</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  R$ {groups.reduce((sum, g) => sum + g.total, 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
          >
            <Plus size={20} />
            <span>Novo Grupo</span>
          </button>
          
          <button
            onClick={() => setShowAddExpense(true)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            <DollarSign size={20} />
            <span>Adicionar Despesa</span>
          </button>
        </div>

        <div className="space-y-4">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Meus Grupos</h2>
          
          {groups.map(group => (
            <div key={group.id} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {group.members.length} participantes: {group.members.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    R$ {group.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowGroupDetails(true);
                  }}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <PieChart size={16} />
                  <span>Ver Detalhes</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowSettlement(true);
                  }}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <CheckCircle size={16} />
                  <span>Acertar Contas</span>
                </button>
                
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  <Trash2 size={16} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Modal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} title="Criar Novo Grupo">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nome do Grupo
            </label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-600 outline-none`}
              placeholder="Ex: Viagem Praia 2024"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Participantes (separados por vírgula)
            </label>
            <input
              type="text"
              value={newGroup.members}
              onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-600 outline-none`}
              placeholder="João, Maria, Pedro"
            />
          </div>
          
          <button
            onClick={handleCreateGroup}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition"
          >
            Criar Grupo
          </button>
        </div>
      </Modal>

      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="Adicionar Despesa">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Grupo
            </label>
            <select
              value={newExpense.groupId || ''}
              onChange={(e) => setNewExpense({ ...newExpense, groupId: parseInt(e.target.value) })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-600 outline-none`}
            >
              <option value="">Selecione um grupo</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Descrição
            </label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-600 outline-none`}
              placeholder="Ex: Aluguel, Mercado, Hotel"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-600 outline-none`}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Quem Pagou
            </label>
            <input
              type="text"
              value={newExpense.paidBy}
              onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-600 outline-none`}
              placeholder="Nome do participante"
            />
          </div>
          
          <button
            onClick={handleAddExpense}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition"
          >
            Adicionar Despesa
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={showGroupDetails} 
        onClose={() => {
          setShowGroupDetails(false);
          setSelectedGroup(null);
        }} 
        title={selectedGroup?.name || 'Detalhes do Grupo'}
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Participantes</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedGroup.members.join(', ')}
              </p>
            </div>
            
            <div>
              <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Despesas</h4>
              <div className="space-y-2">
                {expenses.filter(e => e.groupId === selectedGroup.id).map(expense => (
                  <div key={expense.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{expense.description}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pago por {expense.paidBy} • {expense.date}
                        </p>
                      </div>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        R$ {expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={showSettlement} 
        onClose={() => {
          setShowSettlement(false);
          setSelectedGroup(null);
        }} 
        title="Acerto de Contas"
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Total de Despesas</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                R$ {selectedGroup.total.toFixed(2)}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                R$ {(selectedGroup.total / selectedGroup.members.length).toFixed(2)} por pessoa
              </p>
            </div>
            
            <div>
              <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Saldo de Cada Pessoa</h4>
              <div className="space-y-2">
                {Object.entries(calculateSettlement(selectedGroup)).map(([member, balance]) => (
                  <div key={member} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{member}</p>
                      <p className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {balance >= 0 ? '+' : ''} R$ {balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Como Acertar</h4>
              <div className="space-y-2">
                {getSettlementInstructions(calculateSettlement(selectedGroup)).map((instruction, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 border-blue-600 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="font-semibold">{instruction.from}</span> deve pagar{' '}
                      <span className="font-bold text-blue-600">R$ {instruction.amount.toFixed(2)}</span> para{' '}
                      <span className="font-semibold">{instruction.to}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}