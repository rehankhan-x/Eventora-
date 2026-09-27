const KEYS = {
  admin: "eventora_admin",
  events: "eventora_events",
  registrations: "eventora_registrations",
  settings: "eventora_settings",
  theme: "eventora_theme",
};

const demoEvents = [
  {
    id: "EVT-1001",
    title: "Tech Fest 2026",
    category: "Technology",
    date: "2026-10-15",
    time: "10:00",
    location: "Government Polytechnic Ambad",
    organizer: "Eventora Team",
    capacity: 250,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    description:
      "A technology festival featuring coding, innovation and project showcases.",
  },
  {
    id: "EVT-1002",
    title: "Web Development Workshop",
    category: "Workshop",
    date: "2026-10-22",
    time: "11:00",
    location: "Innovation Lab",
    organizer: "Tech Club",
    capacity: 100,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    description:
      "Hands-on workshop covering modern web development fundamentals.",
  },
];

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function seedStorage() {
  if (!localStorage.getItem(KEYS.events)) {
    write(KEYS.events, demoEvents);
  }

  if (!localStorage.getItem(KEYS.registrations)) {
    write(KEYS.registrations, []);
  }

  if (!localStorage.getItem(KEYS.settings)) {
    write(KEYS.settings, {
      organization: "Eventora",
      email: "admin@eventora.com",
    });
  }
}

export const getEvents = () => read(KEYS.events, []);

export const getRegistrations = () =>
  read(KEYS.registrations, []);

export const getAdmin = () =>
  read(KEYS.admin, null);

export const getSettings = () =>
  read(KEYS.settings, {
    organization: "Eventora",
    email: "admin@eventora.com",
  });

export function saveAdmin(admin) {
  return write(KEYS.admin, admin);
}

export function logoutAdmin() {
  localStorage.removeItem(KEYS.admin);
}

export function addEvent(event) {
  const events = getEvents();

  const newEvent = {
    ...event,
    id: `EVT-${Date.now().toString().slice(-6)}`,
    capacity: Number(event.capacity),
  };

  write(KEYS.events, [newEvent, ...events]);

  return newEvent;
}

export function updateEvent(id, updates) {
  const events = getEvents().map((event) =>
    event.id === id
      ? {
          ...event,
          ...updates,
          capacity: Number(updates.capacity),
        }
      : event
  );

  write(KEYS.events, events);

  return events.find((event) => event.id === id);
}

export function deleteEvent(id) {
  const events = getEvents().filter(
    (event) => event.id !== id
  );

  write(KEYS.events, events);

  const registrations = getRegistrations().filter(
    (registration) => registration.eventId !== id
  );

  write(KEYS.registrations, registrations);
}

export function addRegistration(data) {
  const registrations = getRegistrations();

  const duplicate = registrations.some(
    (registration) =>
      registration.eventId === data.eventId &&
      registration.email.toLowerCase() ===
        data.email.toLowerCase()
  );

  if (duplicate) {
    throw new Error(
      "This email is already registered for this event."
    );
  }

  const event = getEvents().find(
    (event) => event.id === data.eventId
  );

  const registeredCount = registrations.filter(
    (registration) => registration.eventId === data.eventId
  ).length;

  if (
    event &&
    registeredCount >= Number(event.capacity)
  ) {
    throw new Error("This event is full.");
  }

  const registration = {
    ...data,
    id: `REG-${Date.now().toString().slice(-7)}`,
    registeredAt: new Date().toISOString(),
  };

  write(KEYS.registrations, [
    registration,
    ...registrations,
  ]);

  return registration;
}

export function deleteRegistration(id) {
  write(
    KEYS.registrations,
    getRegistrations().filter(
      (registration) => registration.id !== id
    )
  );
}

export function saveSettings(settings) {
  return write(KEYS.settings, settings);
}