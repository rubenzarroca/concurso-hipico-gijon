import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { database } from '../firebase'; // Ajusta la ruta según la ubicación de firebase.js
import { ref, push, remove, onValue } from 'firebase/database';

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState('');
  const [series, setSeries] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [bets, setBets] = useState([]);

  const days = ['27 Agosto', '28 Agosto', '29 Agosto', '30 Agosto', '31 Agosto', '1 Septiembre'];

  useEffect(() => {
    const betsRef = ref(database, 'bets');
    const unsubscribe = onValue(betsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const betsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setBets(betsArray);
      } else {
        setBets([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBet = {
      day: selectedDay,
      series,
      betAmount: parseFloat(betAmount),
      prizeAmount: parseFloat(prizeAmount),
      balance: parseFloat(prizeAmount) - parseFloat(betAmount)
    };
    push(ref(database, 'bets'), newBet)
      .then(() => {
        setSeries('');
        setBetAmount('');
        setPrizeAmount('');
      })
      .catch((error) => {
        console.error('Error adding new bet: ', error);
      });
  };

  const handleDelete = (id) => {
    remove(ref(database, `bets/${id}`))
      .catch((error) => {
        console.error('Error deleting bet: ', error);
      });
  };

  const filteredBets = bets.filter(bet => bet.day === selectedDay);

  const totalBet = filteredBets.reduce((sum, bet) => sum + bet.betAmount, 0);
  const totalPrize = filteredBets.reduce((sum, bet) => sum + bet.prizeAmount, 0);
  const totalBalance = filteredBets.reduce((sum, bet) => sum + bet.balance, 0);

  const overallBalance = bets.reduce((sum, bet) => sum + bet.balance, 0);

  const chartData = useMemo(() => {
    return days.map(day => ({
      name: day,
      balance: bets.filter(bet => bet.day === day).reduce((sum, bet) => sum + bet.balance, 0)
    }));
  }, [bets, days]);

  const formatEuro = (value) => `${value.toFixed(2)} €`;

  return (
    <div className="max-w-7xl mx-auto mt-8 p-4 sm:p-6 lg:p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-red-600 mb-6">Concurso Hípico Internacional GIJÓN</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-gray-700">Día:</label>
          <select
            id="day"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Seleccione un día</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="series" className="block text-sm font-medium text-gray-700">Serie:</label>
          <select
            id="series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Seleccione una serie</option>
            {['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 6', 'Serie 7', 'Serie Desempate'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700">Cantidad apostada (€):</label>
          <input
            type="number"
            id="betAmount"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div>
          <label htmlFor="prizeAmount" className="block text-sm font-medium text-gray-700">Premio ganado (€):</label>
          <input
            type="number"
            id="prizeAmount"
            value={prizeAmount}
            onChange={(e) => setPrizeAmount(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <button
          type="submit"
          className="sm:col-span-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Registrar Apuesta
        </button>
      </form>

      {selectedDay && filteredBets.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-bold mb-4">Resumen del Día: {selectedDay}</h3>
          <table className="w-full border-collapse border border-red-200">
            <thead>
              <tr className="bg-red-500 text-white">
                <th className="border border-red-300 px-4 py-2">Serie</th>
                <th className="border border-red-300 px-4 py-2">Apuesta</th>
                <th className="border border-red-300 px-4 py-2">Premio</th>
                <th className="border border-red-300 px-4 py-2">Balance</th>
                <th className="border border-red-300 px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet) => (
                <tr key={bet.id}>
                  <td className="border border-red-300 px-4 py-2">{bet.series}</td>
                  <td className="border border-red-300 px-4 py-2">{formatEuro(bet.betAmount)}</td>
                  <td className="border border-red-300 px-4 py-2">{formatEuro(bet.prizeAmount)}</td>
                  <td className="border border-red-300 px-4 py-2">{formatEuro(bet.balance)}</td>
                  <td className="border border-red-300 px-4 py-2">
                    <button 
                      onClick={() => handleDelete(bet.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border border-red-300 px-4 py-2">Total</td>
                <td className="border border-red-300 px-4 py-2">{formatEuro(totalBet)}</td>
                <td className="border border-red-300 px-4 py-2">{formatEuro(totalPrize)}</td>
                <td className="border border-red-300 px-4 py-2">{formatEuro(totalBalance)}</td>
                <td className="border border-red-300 px-4 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Balance por Día</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis tickFormatter={formatEuro} />
              <Tooltip 
                formatter={(value) => [formatEuro(value), "Balance"]}
                labelFormatter={(label) => `Día: ${label}`}
              />
              <Bar dataKey="balance" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg text-white">
        <h3 className="text-2xl font-bold mb-2">Balance Total del Concurso</h3>
        <p className={`text-4xl font-bold ${overallBalance >= 0 ? 'text-green-300' : 'text-yellow-300'}`}>
          {formatEuro(overallBalance)}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
