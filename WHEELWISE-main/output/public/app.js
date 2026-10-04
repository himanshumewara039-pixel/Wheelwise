const vehicleGrid = document.getElementById('vehicleGrid');
const statusBadge = document.getElementById('statusBadge');
let currentUser = '';
let activeAdminTab = 'customers';

function updateUserDashboard() {
  const userDashboard = document.getElementById('userDashboard');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!currentUser) {
    userDashboard.innerHTML = '<p>No user is currently logged in.</p>';
    logoutBtn.disabled = true;
    logoutBtn.style.opacity = '0.5';
    return;
  }

  logoutBtn.disabled = false;
  logoutBtn.style.opacity = '1';
  userDashboard.innerHTML = `
    <strong>Logged in as: ${currentUser}</strong>
    <ul>
      <li>Rental access is active</li>
      <li>Booking status available</li>
      <li>Quick checkout ready</li>
    </ul>
  `;
}

async function loadVehicles() {
  statusBadge.textContent = 'Loading...';
  try {
    const response = await fetch('/api/vehicles');
    const result = await response.json();
    const vehicles = result.vehicles || [];

    if (!vehicles.length) {
      statusBadge.textContent = 'No vehicles';
      vehicleGrid.innerHTML = '<div class="vehicle-card"><h4>No vehicles available</h4></div>';
      return;
    }

    vehicleGrid.innerHTML = vehicles
      .map(
        (vehicle) => `
          <article class="vehicle-card">
            <h4>${vehicle.name}</h4>
            <div class="meta">
              <span>Type: ${vehicle.type}</span>
              <span>ID: ${vehicle.id}</span>
            </div>
            <div class="price">₹${vehicle.price}/day</div>
            <span class="availability ${vehicle.status === 'Available' ? '' : 'unavailable'}">
              ${vehicle.status}
            </span>
          </article>
        `
      )
      .join('');

    statusBadge.textContent = `${vehicles.length} vehicles ready`;
  } catch (error) {
    statusBadge.textContent = 'Unable to load';
    vehicleGrid.innerHTML = '<div class="vehicle-card"><h4>Could not load fleet</h4></div>';
  }
}

async function renderAdminTab() {
  const adminData = document.getElementById('adminData');

  try {
    const [customersResponse, rentalsResponse, paymentsResponse] = await Promise.all([
      fetch('/api/customers'),
      fetch('/api/rentals'),
      fetch('/api/payments')
    ]);

    const customers = await customersResponse.json();
    const rentals = await rentalsResponse.json();
    const payments = await paymentsResponse.json();

    const customerList = (customers.customers || []).slice(0, 8);
    const rentalList = (rentals.rentals || []).slice(0, 6);
    const paymentList = (payments.payments || []).slice(0, 6);

    if (activeAdminTab === 'customers') {
      adminData.innerHTML = `
        <strong>Customers</strong>
        <ul>
          ${customerList.length ? customerList.map((user) => `<li>${user.username}</li>`).join('') : '<li>No customers.</li>'}
        </ul>
      `;
      return;
    }

    if (activeAdminTab === 'rentals') {
      adminData.innerHTML = `
        <strong>Recent rentals</strong>
        <ul>
          ${rentalList.length ? rentalList.map((item) => `<li>${item.username} • Vehicle ${item.vehicleId} • ₹${item.amount}</li>`).join('') : '<li>No rentals.</li>'}
        </ul>
      `;
      return;
    }

    adminData.innerHTML = `
      <strong>Payments</strong>
      <ul>
        ${paymentList.length ? paymentList.map((item) => `<li>${item.username} • ₹${item.amount} • ${item.method}</li>`).join('') : '<li>No payment records.</li>'}
      </ul>
    `;
  } catch (error) {
    adminData.innerHTML = '<p>Unable to load admin records.</p>';
  }
}

async function loadAdminData() {
  await renderAdminTab();
}

async function loadPayments() {
  const paymentData = document.getElementById('paymentData');

  try {
    const response = await fetch('/api/payments');
    const result = await response.json();
    const payments = result.payments || [];

    paymentData.innerHTML = `
      <strong>Payment timeline</strong>
      <ul>
        ${payments.length ? payments.map((item) => `<li>${item.username} • ₹${item.amount} • ${item.method} • ${item.status}</li>`).join('') : '<li>No payment records.</li>'}
      </ul>
    `;
  } catch (error) {
    paymentData.innerHTML = '<p>Unable to load payment records.</p>';
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const messageEl = document.getElementById('adminLoginMessage');

  try {
    const response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Admin login result';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      document.getElementById('adminLoginForm').reset();
      await loadAdminData();
      await loadPayments();
    }
  } catch (error) {
    messageEl.textContent = 'Admin login failed';
    messageEl.style.color = '#ff9f9f';
  }
}

async function handleBookingHistory(event) {
  event.preventDefault();
  const username = document.getElementById('historyUsername').value.trim();
  const historyData = document.getElementById('historyData');

  try {
    const response = await fetch(`/api/bookings/${encodeURIComponent(username)}`);
    const result = await response.json();
    const bookings = result.bookings || [];

    historyData.innerHTML = `
      <strong>Booking history</strong>
      <ul>
        ${bookings.length ? bookings.map((item) => `<li>Vehicle ${item.vehicleId} • ${item.days} days • ₹${item.amount} • ${item.status}</li>`).join('') : '<li>No bookings found.</li>'}
      </ul>
    `;
  } catch (error) {
    historyData.innerHTML = '<p>Unable to fetch booking history.</p>';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const messageEl = document.getElementById('registerMessage');

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Registration complete';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      document.getElementById('registerForm').reset();
    }
  } catch (error) {
    messageEl.textContent = 'Registration failed';
    messageEl.style.color = '#ff9f9f';
  }
}

async function handleAddVehicle(event) {
  event.preventDefault();
  const name = document.getElementById('vehicleName').value.trim();
  const price = Number(document.getElementById('vehiclePrice').value);
  const type = document.getElementById('vehicleType').value;
  const status = document.getElementById('vehicleStatus').value;
  const messageEl = document.getElementById('vehicleMessage');

  try {
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, type, status })
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Vehicle added';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      document.getElementById('addVehicleForm').reset();
      await loadVehicles();
      await loadAdminData();
    }
  } catch (error) {
    messageEl.textContent = 'Vehicle creation failed';
    messageEl.style.color = '#ff9f9f';
  }
}

async function handleDeleteVehicle(event) {
  event.preventDefault();
  const vehicleId = Number(document.getElementById('deleteVehicleId').value);
  const messageEl = document.getElementById('deleteVehicleMessage');

  try {
    const response = await fetch(`/api/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Vehicle deleted';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      document.getElementById('deleteVehicleForm').reset();
      await loadVehicles();
      await loadAdminData();
    }
  } catch (error) {
    messageEl.textContent = 'Vehicle deletion failed';
    messageEl.style.color = '#ff9f9f';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const messageEl = document.getElementById('loginMessage');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Login result';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      currentUser = result.username;
      document.getElementById('bookingUsername').value = result.username;
      document.getElementById('historyUsername').value = result.username;
      document.getElementById('returnUsername').value = result.username;
      document.getElementById('loginForm').reset();
      updateUserDashboard();
      await handleBookingHistory({ preventDefault: () => {} });
      alert(`Welcome, ${result.username}! You are now logged in.`);
    }
  } catch (error) {
    messageEl.textContent = 'Login failed';
    messageEl.style.color = '#ff9f9f';
  }
}

function openReservationSummary({ username, vehicleId, days, total }) {
  const modal = document.getElementById('summaryModal');
  const customerEl = document.getElementById('summaryCustomer');
  const vehicleEl = document.getElementById('summaryVehicle');
  const durationEl = document.getElementById('summaryDuration');
  const totalEl = document.getElementById('summaryTotal');

  if (!modal || !customerEl || !vehicleEl || !durationEl || !totalEl) return;

  customerEl.textContent = username;
  vehicleEl.textContent = `Vehicle #${vehicleId}`;
  durationEl.textContent = `${days} day(s)`;
  totalEl.textContent = `₹${total}`;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeReservationSummary() {
  const modal = document.getElementById('summaryModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

async function handleBooking(event) {
  event.preventDefault();
  const bookingUsername = document.getElementById('bookingUsername').value.trim();
  const vehicleId = Number(document.getElementById('bookingVehicleId').value);
  const days = Number(document.getElementById('bookingDays').value);
  const messageEl = document.getElementById('bookingMessage');

  try {
    const response = await fetch('/api/rent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: bookingUsername, vehicleId, days })
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Booking processed';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      document.getElementById('bookingForm').reset();
      openReservationSummary({
        username: bookingUsername,
        vehicleId,
        days,
        total: result.total
      });
      await loadVehicles();
      await loadAdminData();
      await loadPayments();
    }
  } catch (error) {
    messageEl.textContent = 'Booking failed';
    messageEl.style.color = '#ff9f9f';
  }
}

async function handleReturn(event) {
  event.preventDefault();
  const username = document.getElementById('returnUsername').value.trim();
  const vehicleId = Number(document.getElementById('returnVehicleId').value);
  const messageEl = document.getElementById('returnMessage');

  try {
    const response = await fetch('/api/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, vehicleId })
    });

    const result = await response.json();
    messageEl.textContent = result.message || 'Return processed';
    messageEl.style.color = response.ok ? '#7ef0c7' : '#ff9f9f';

    if (response.ok) {
      document.getElementById('returnForm').reset();
      await loadVehicles();
      await loadAdminData();
    }
  } catch (error) {
    messageEl.textContent = 'Return failed';
    messageEl.style.color = '#ff9f9f';
  }
}

document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', () => {
    activeAdminTab = button.dataset.tab;
    document.querySelectorAll('.tab-button').forEach((tab) => tab.classList.toggle('active', tab === button));
    loadAdminData();
  });
});

document.getElementById('registerForm').addEventListener('submit', handleRegister);
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('bookingForm').addEventListener('submit', handleBooking);
document.getElementById('returnForm').addEventListener('submit', handleReturn);
document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
document.getElementById('historyForm').addEventListener('submit', handleBookingHistory);
document.getElementById('addVehicleForm').addEventListener('submit', handleAddVehicle);
document.getElementById('deleteVehicleForm').addEventListener('submit', handleDeleteVehicle);
document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = '';
  document.getElementById('bookingUsername').value = '';
  document.getElementById('historyUsername').value = '';
  document.getElementById('returnUsername').value = '';
  document.getElementById('userDashboard').innerHTML = '<p>No user is currently logged in.</p>';
  updateUserDashboard();
  document.getElementById('historyData').innerHTML = '<p>Your booking records will appear here.</p>';
});
document.getElementById('loadAdminData').addEventListener('click', loadAdminData);
document.getElementById('loadPayments').addEventListener('click', () => {
  activeAdminTab = 'payments';
  document.querySelectorAll('.tab-button').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === 'payments'));
  loadAdminData();
});
document.getElementById('closeSummaryModal').addEventListener('click', closeReservationSummary);
document.getElementById('confirmSummaryBtn').addEventListener('click', closeReservationSummary);
document.querySelector('[data-close-modal="true"]').addEventListener('click', closeReservationSummary);
document.getElementById('exploreBtn').addEventListener('click', () => {
  document.getElementById('vehicles').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('loginBtn').addEventListener('click', () => {
  document.getElementById('loginUsername').focus();
});

updateUserDashboard();
loadVehicles();
loadAdminData();
loadPayments();
