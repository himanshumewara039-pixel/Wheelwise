const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  listVehicles,
  listCustomers,
  listRentals,
  listPayments,
  adminLogin,
  getUserBookings,
  addCustomer,
  loginUser,
  addVehicle,
  deleteVehicle,
  addRental,
  returnVehicle,
} = require('./src/dataStore');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'output', 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'WheelWise API' });
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await listVehicles();
    res.json({ vehicles });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await listCustomers();
    res.json({ customers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.get('/api/rentals', async (req, res) => {
  try {
    const rentals = await listRentals();
    res.json({ rentals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rentals' });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    const payments = await listPayments();
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Admin username and password are required' });
  }

  try {
    const result = await adminLogin(username, password);
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Admin login failed' });
  }
});

app.get('/api/bookings/:username', async (req, res) => {
  try {
    const bookings = await getUserBookings(req.params.username);
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking history' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await addCustomer(username, password);
    if (!result.success) {
      return res.status(409).json({ message: result.message });
    }
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  const { name, price, type, status } = req.body;
  if (!name || !price || !type) {
    return res.status(400).json({ message: 'Vehicle name, price, and type are required' });
  }

  try {
    const result = await addVehicle({ name, price, type, status });
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Vehicle creation failed' });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await deleteVehicle(req.params.id);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Vehicle deletion failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await loginUser(username, password);
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/rent', async (req, res) => {
  const { username, vehicleId, days } = req.body;
  if (!username || !vehicleId || !days) {
    return res.status(400).json({ message: 'Username, vehicleId and days are required' });
  }

  try {
    const result = await addRental(username, vehicleId, days);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Rental failed' });
  }
});

app.post('/api/return', async (req, res) => {
  const { username, vehicleId } = req.body;
  if (!username || !vehicleId) {
    return res.status(400).json({ message: 'Username and vehicleId are required' });
  }

  try {
    const result = await returnVehicle(username, vehicleId);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Return failed' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WheelWise server running on http://localhost:${PORT}`);
});
