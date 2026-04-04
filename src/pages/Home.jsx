import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api"; // ✅ IMPORT API

function Home() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [dark, setDark] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ FETCH EXPENSES
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await API.get("/expenses"); // ✅ CLEAN
        setExpenses(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchExpenses();
  }, []);

  // ✅ ADD / UPDATE EXPENSE
  const addExpense = async () => {
    if (!title || !amount || !category) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        // UPDATE
        const res = await API.put(`/expenses/${editId}`, {
          title,
          amount,
          category,
        });

        setExpenses(
          expenses.map((item) =>
            item._id === editId ? res.data : item
          )
        );

        setEditId(null);
      } else {
        // ADD
        const res = await API.post("/expenses", {
          title,
          amount,
          category,
        });

        setExpenses([...expenses, res.data]);
      }

      setTitle("");
      setAmount("");
      setCategory("");

    } catch (err) {
      console.log(err);
    }
  };

  // ✅ DELETE EXPENSE
  const deleteExpense = async (id) => {
    try {
      await API.delete(`/expenses/${id}`); // ✅ CLEAN
      setExpenses(expenses.filter((item) => item._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  const filteredExpenses = expenses.filter((item) =>
    filter ? item.category === filter : true
  );

  const categoryData = ["Food", "Travel", "Shopping"].map((cat) => ({
    name: cat,
    value: expenses
      .filter((item) => item.category === cat)
      .reduce((sum, item) => sum + item.amount, 0),
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

  return (
    <div
      className={`min-h-screen p-6 ${
        dark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDark(!dark)}
            className="text-2xl p-2 rounded-full hover:scale-110 transition"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Expense */}
      <div className={`p-4 rounded-xl shadow mb-6 ${dark ? "bg-gray-800" : "bg-white"}`}>
        <h2 className="text-xl font-semibold mb-4">
          {editId ? "Edit Expense" : "Add Expense"}
        </h2>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Category</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
          </select>

          <button
            onClick={addExpense}
            className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="mb-4 text-xl font-semibold">
        Total: ₹{total}
      </div>

      {/* Chart */}
      <div className={`p-4 rounded-xl shadow mb-6 ${dark ? "bg-gray-800" : "bg-white"}`}>
        <PieChart width={300} height={300}>
          <Pie data={categoryData} dataKey="value" outerRadius={100} label>
            {categoryData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      {/* Expense List */}
      <div className={`p-4 rounded-xl shadow ${dark ? "bg-gray-800" : "bg-white"}`}>
        <h2 className="text-xl font-semibold mb-4">Expenses</h2>

        {filteredExpenses.length === 0 ? (
          <p>No expenses found</p>
        ) : (
          filteredExpenses.map((item) => (
            <div key={item._id} className="flex justify-between border-b py-2">
              <span>
                {item.title} ({item.category})
              </span>

              <div className="flex gap-4">
                <span className="text-red-500">₹{item.amount}</span>

                <button
                  onClick={() => {
                    setTitle(item.title);
                    setAmount(item.amount);
                    setCategory(item.category);
                    setEditId(item._id);
                  }}
                  className="text-blue-500"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteExpense(item._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;