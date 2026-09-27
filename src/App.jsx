import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";

import {
  Calendar,
  Users,
  LayoutDashboard,
  Plus,
  Trash2,
  Edit,
  LogOut,
  Search,
  MapPin,
  Clock,
  Menu,
  X,
} from "lucide-react";

import {
  seedStorage,
  getEvents,
  getRegistrations,
  getAdmin,
  saveAdmin,
  logoutAdmin,
  addEvent,
  updateEvent,
  deleteEvent,
  addRegistration,
  deleteRegistration,
} from "./services/storage";

import "./index.css";

// ---------------- HELPERS ----------------

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";

  const [hour, minute] = time.split(":");

  const date = new Date();
  date.setHours(Number(hour), Number(minute));

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------- APP ----------------

export default function App() {
  useEffect(() => {
    seedStorage();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/event/:id" element={<EventDetails />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ---------------- PROTECTED ROUTE ----------------

function ProtectedRoute({ children }) {
  const admin = getAdmin();

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ---------------- HOME ----------------

function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  return (
    <div className="public-page">
      <header className="public-navbar">
        <Link to="/" className="logo">
          <Calendar size={28} />
          Eventora
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Admin</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="badge">EVENT MANAGEMENT SYSTEM</span>

          <h1>
            Manage Your Events
            <br />
            With <span>Eventora</span>
          </h1>

          <p>
            Create events, manage registrations and track attendees
            easily from one modern dashboard.
          </p>

          <a href="#events" className="primary-btn">
            Explore Events
          </a>
        </div>
      </section>

      <section id="events" className="public-events">
        <div className="section-heading">
          <div>
            <span className="section-label">UPCOMING EVENTS</span>
            <h2>Discover Events</h2>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <Calendar size={50} />
            <h3>No events available</h3>
            <p>Admin can create new events from the dashboard.</p>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <footer>
        <h3>Eventora</h3>
        <p>Modern Event Management System</p>
        <p>Developer: Mr Arman</p>
      </footer>
    </div>
  );
}

// ---------------- EVENT CARD ----------------

function EventCard({ event }) {
  return (
    <div className="event-card">
      {event.image && (
        <img src={event.image} alt={event.title} />
      )}

      <div className="event-card-body">
        <span className="category">{event.category}</span>

        <h3>{event.title}</h3>

        <p>
          <Calendar size={16} />
          {formatDate(event.date)}
        </p>

        <p>
          <Clock size={16} />
          {formatTime(event.time)}
        </p>

        <p>
          <MapPin size={16} />
          {event.location}
        </p>

        <Link
          to={`/event/${event.id}`}
          className="secondary-btn"
        >
          View Event
        </Link>
      </div>
    </div>
  );
}

// ---------------- EVENT DETAILS ----------------

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const found = getEvents().find((item) => item.id === id);
    setEvent(found);
  }, [id]);

  if (!event) {
    return (
      <div className="center-page">
        <h2>Event not found</h2>
        <Link to="/" className="primary-btn">
          Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="public-page">
      <header className="public-navbar">
        <Link to="/" className="logo">
          <Calendar size={28} />
          Eventora
        </Link>

        <Link to="/" className="secondary-btn">
          Back
        </Link>
      </header>

      <main className="details-page">
        {event.image && (
          <img
            className="details-image"
            src={event.image}
            alt={event.title}
          />
        )}

        <div className="details-content">
          <span className="category">{event.category}</span>

          <h1>{event.title}</h1>

          <p className="description">
            {event.description}
          </p>

          <div className="details-info">
            <div>
              <Calendar />
              <strong>Date</strong>
              <span>{formatDate(event.date)}</span>
            </div>

            <div>
              <Clock />
              <strong>Time</strong>
              <span>{formatTime(event.time)}</span>
            </div>

            <div>
              <MapPin />
              <strong>Location</strong>
              <span>{event.location}</span>
            </div>

            <div>
              <Users />
              <strong>Capacity</strong>
              <span>{event.capacity} people</span>
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={() => setShowForm(true)}
          >
            Register Now
          </button>
        </div>
      </main>

      {showForm && (
        <RegistrationModal
          event={event}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// ---------------- REGISTRATION ----------------

function RegistrationModal({ event, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    try {
      addRegistration({
        eventId: event.id,
        eventTitle: event.title,
        ...form,
      });

      setSuccess(true);
      setMessage("Registration successful!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          <X />
        </button>

        {!success ? (
          <>
            <h2>Register for Event</h2>
            <p>{event.title}</p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />

              <button className="primary-btn" type="submit">
                Register
              </button>
            </form>

            {message && (
              <p className="error-message">{message}</p>
            )}
          </>
        ) : (
          <div className="success-box">
            <h2>Registration Successful 🎉</h2>
            <p>{message}</p>

            <button
              className="primary-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- LOGIN ----------------

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@eventora.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (
      email === "admin@eventora.com" &&
      password === "admin123"
    ) {
      saveAdmin({
        email,
        name: "Eventora Admin",
      });

      navigate("/admin");
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <Calendar size={35} />
        </div>

        <h1>Eventora</h1>

        <p>Admin Login</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        <div className="demo-login">
          <strong>Demo Login</strong>
          <p>admin@eventora.com</p>
          <p>admin123</p>
        </div>

        <Link to="/">← Back to Website</Link>
      </div>
    </div>
  );
}

// ---------------- ADMIN LAYOUT ----------------

function AdminLayout() {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);

  function handleLogout() {
    logoutAdmin();
    navigate("/login");
  }

  return (
    <div className="admin-layout">
      <aside className={mobileMenu ? "sidebar open" : "sidebar"}>
        <div className="sidebar-logo">
          <Calendar />
          <span>Eventora</span>
        </div>

        <nav>
          <Link
            to="/admin"
            onClick={() => setMobileMenu(false)}
          >
            <LayoutDashboard />
            Dashboard
          </Link>

          <Link
            to="/admin/events"
            onClick={() => setMobileMenu(false)}
          >
            <Calendar />
            Events
          </Link>

          <Link
            to="/admin/events/new"
            onClick={() => setMobileMenu(false)}
          >
            <Plus />
            Create Event
          </Link>

          <Link
            to="/admin/registrations"
            onClick={() => setMobileMenu(false)}
          >
            <Users />
            Registrations
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="mobile-topbar">
          <button onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>

          <strong>Eventora Admin</strong>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<AdminEvents />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route
            path="/events/:id/edit"
            element={<EventForm />}
          />
          <Route
            path="/registrations"
            element={<Registrations />}
          />
          <Route
            path="*"
            element={<Navigate to="/admin" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

// ---------------- DASHBOARD ----------------

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    setEvents(getEvents());
    setRegistrations(getRegistrations());
  }, []);

  const upcoming = events.filter(
    (event) => new Date(event.date) >= new Date()
  );

  const uniqueAttendees = new Set(
    registrations.map((item) => item.email)
  ).size;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to Eventora Admin Panel</p>
        </div>

        <Link
          to="/admin/events/new"
          className="primary-btn"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Calendar />}
          title="Total Events"
          value={events.length}
        />

        <StatCard
          icon={<Calendar />}
          title="Upcoming Events"
          value={upcoming.length}
        />

        <StatCard
          icon={<Users />}
          title="Registrations"
          value={registrations.length}
        />

        <StatCard
          icon={<Users />}
          title="Unique Attendees"
          value={uniqueAttendees}
        />
      </div>

      <div className="dashboard-panel">
        <h2>Upcoming Events</h2>

        {upcoming.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          upcoming.slice(0, 5).map((event) => (
            <div className="dashboard-event" key={event.id}>
              <div>
                <strong>{event.title}</strong>
                <span>
                  {formatDate(event.date)} •{" "}
                  {event.location}
                </span>
              </div>

              <Link to={`/admin/events/${event.id}/edit`}>
                <Edit size={18} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- STAT CARD ----------------

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

// ---------------- ADMIN EVENTS ----------------

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  function loadEvents() {
    setEvents(getEvents());
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;

    deleteEvent(id);
    loadEvents();
  }

  const filtered = events.filter((event) =>
    event.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p>Manage all your events</p>
        </div>

        <Link
          to="/admin/events/new"
          className="primary-btn"
        >
          <Plus size={18} />
          Add Event
        </Link>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-event-grid">
        {filtered.map((event) => (
          <div className="admin-event-card" key={event.id}>
            {event.image && (
              <img src={event.image} alt={event.title} />
            )}

            <div>
              <span className="category">
                {event.category}
              </span>

              <h3>{event.title}</h3>

              <p>
                <Calendar size={15} />
                {formatDate(event.date)}
              </p>

              <p>
                <MapPin size={15} />
                {event.location}
              </p>

              <div className="card-actions">
                <Link
                  to={`/admin/events/${event.id}/edit`}
                  className="edit-btn"
                >
                  <Edit size={16} />
                  Edit
                </Link>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- EVENT FORM ----------------

function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const existing = editing
    ? getEvents().find((event) => event.id === id)
    : null;

  const [form, setForm] = useState(
    existing || {
      title: "",
      category: "Technology",
      organizer: "Eventora Team",
      date: "",
      time: "",
      location: "",
      capacity: 100,
      image: "",
      description: "",
    }
  );

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (editing) {
      updateEvent(id, form);
    } else {
      addEvent(form);
    }

    navigate("/admin/events");
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>{editing ? "Edit Event" : "Create Event"}</h1>
          <p>
            {editing
              ? "Update event details"
              : "Create a new event"}
          </p>
        </div>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Event Title</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Tech Fest 2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option>Technology</option>
              <option>Workshop</option>
              <option>Conference</option>
              <option>Sports</option>
              <option>Music</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Organizer</label>

            <input
              name="organizer"
              value={form.organizer}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>

            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>

            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group full">
            <label>Location</label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Government Polytechnic Ambad"
              required
            />
          </div>

          <div className="form-group full">
            <label>Image URL</label>

            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group full">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="6"
              placeholder="Describe your event..."
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/admin/events")}
          >
            Cancel
          </button>

          <button className="primary-btn" type="submit">
            {editing ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------- REGISTRATIONS ----------------

function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");

  function loadData() {
    setRegistrations(getRegistrations());
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleDelete(id) {
    if (!window.confirm("Delete registration?")) return;

    deleteRegistration(id);
    loadData();
  }

  function exportCSV() {
    if (registrations.length === 0) {
      alert("No registrations to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Event",
      "Registered At",
    ];

    const rows = registrations.map((item) => [
      item.name,
      item.email,
      item.phone,
      item.eventTitle,
      item.registeredAt,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value || "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "eventora-registrations.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  const filtered = registrations.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.eventTitle
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Registrations</h1>
          <p>Manage event attendees</p>
        </div>

        <button className="primary-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search attendee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Event</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.eventTitle}</td>
                <td>
                  {new Date(
                    item.registeredAt
                  ).toLocaleDateString("en-IN")}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Users size={45} />
            <h3>No registrations found</h3>
          </div>
        )}
      </div>
    </div>
  );
}