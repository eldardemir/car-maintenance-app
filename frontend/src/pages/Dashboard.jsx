import { useEffect, useState } from "react";
import api from "../api/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100";

const secondaryButtonClass =
  "rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50";

const primaryButtonClass =
  "rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [plan, setPlan] = useState("free");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [tireYear, setTireYear] = useState("");
  const [vehicleImage, setVehicleImage] = useState("");
  const [costs, setCosts] = useState({});
  const [costTimeline, setCostTimeline] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceType, setServiceType] = useState("MALI");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [reminders, setReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderType, setReminderType] = useState("Registracija");
  const [reminderDueDate, setReminderDueDate] = useState("");

  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    overdue: 0,
    soon: 0,
    ok: 0,
    vehicleCount: 0,
  });

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/analytics/overview");
      setAnalytics(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat("bs-BA", {
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDateInput = (value) => new Date(value).toISOString().slice(0, 10);

  const getTodayInputDate = () => new Date().toISOString().slice(0, 10);

  const handleVehicleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be smaller than 4 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setVehicleImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const chartData = costTimeline.map((item) => ({
    ...item,
    name: new Date(item.date).toLocaleDateString(),
  }));

  const loadCostTimeline = async () => {
    try {
      const res = await api.get("/analytics/costs-by-date");
      setCostTimeline(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadTotalCost = async (vehicleId) => {
    try {
      const res = await api.get(`/services/total/${vehicleId}`);

      setCosts((prev) => ({
        ...prev,
        [vehicleId]: res.data.totalCost,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setPlan(res.data.plan);
    } catch (err) {
      console.log(err);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);

      res.data.forEach((vehicle) => {
        loadTotalCost(vehicle.id);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddVehicle = async () => {
    if (!name || !year) {
      alert("Name and year are required");
      return;
    }

    try {
      await api.post("/vehicles", {
        name,
        year: Number(year),
        tireYear: tireYear ? Number(tireYear) : null,
        imageUrl: vehicleImage || null,
      });

      setName("");
      setYear("");
      setTireYear("");
      setVehicleImage("");
      setShowModal(false);

      loadVehicles();
      loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding vehicle");
    }
  };

  const resetVehicleForm = () => {
    setEditingVehicle(null);
    setName("");
    setYear("");
    setTireYear("");
    setVehicleImage("");
  };

  const openAddVehicleModal = () => {
    resetVehicleForm();
    setShowModal(true);
  };

  const openEditVehicleModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setName(vehicle.name);
    setYear(String(vehicle.year));
    setTireYear(vehicle.tireYear ? String(vehicle.tireYear) : "");
    setVehicleImage(vehicle.imageUrl || "");
    setShowModal(true);
  };

  const handleSaveVehicle = async () => {
    if (!editingVehicle) {
      await handleAddVehicle();
      return;
    }

    if (!name || !year) {
      alert("Name and year are required");
      return;
    }

    try {
      const res = await api.patch(`/vehicles/${editingVehicle.id}`, {
        name,
        year: Number(year),
        tireYear: tireYear ? Number(tireYear) : null,
        imageUrl: vehicleImage || null,
      });

      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle.id === editingVehicle.id ? res.data : vehicle))
      );

      if (selectedVehicle?.id === editingVehicle.id) {
        setSelectedVehicle(res.data);
      }

      resetVehicleForm();
      setShowModal(false);
      await loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating vehicle");
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(`Delete ${vehicle.name} and all related services/reminders?`);
    if (!confirmed) return;

    try {
      await api.delete(`/vehicles/${vehicle.id}`);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
      setCosts((prev) => {
        const next = { ...prev };
        delete next[vehicle.id];
        return next;
      });

      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle(null);
        setServices([]);
        setReminders([]);
      }

      await loadAnalytics();
      await loadCostTimeline();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting vehicle");
    }
  };

  const loadServices = async (vehicle) => {
    try {
      const res = await api.get(`/services/${vehicle.id}`);
      setSelectedVehicle(vehicle);
      setServices(res.data);
      await loadReminders(vehicle.id);
    } catch (err) {
      console.log(err);
    }
  };

  const loadReminders = async (vehicleId) => {
    try {
      const res = await api.get(`/reminders/${vehicleId}`);
      setReminders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddService = async () => {
    if (!selectedVehicle) return;

    if (!servicePrice || Number(servicePrice) <= 0) {
      alert("Service price must be greater than 0");
      return;
    }

    if (!serviceDate) {
      alert("Service date is required");
      return;
    }

    try {
      await api.post("/services", {
        vehicleId: selectedVehicle.id,
        type: serviceType,
        price: Number(servicePrice),
        date: serviceDate,
      });

      setServiceType("MALI");
      setServicePrice("");
      setServiceDate("");
      setShowServiceModal(false);

      await loadServices(selectedVehicle);
      await loadTotalCost(selectedVehicle.id);
      await loadAnalytics();
      await loadCostTimeline();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding service");
    }
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setServiceType("MALI");
    setServicePrice("");
    setServiceDate(getTodayInputDate());
  };

  const openAddServiceModal = () => {
    resetServiceForm();
    setShowServiceModal(true);
  };

  const openEditServiceModal = (service) => {
    setEditingService(service);
    setServiceType(service.type);
    setServicePrice(String(service.price));
    setServiceDate(formatDateInput(service.date));
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!editingService) {
      await handleAddService();
      return;
    }

    if (!servicePrice || Number(servicePrice) <= 0) {
      alert("Service price must be greater than 0");
      return;
    }

    if (!serviceDate) {
      alert("Service date is required");
      return;
    }

    try {
      await api.patch(`/services/${editingService.id}`, {
        type: serviceType,
        price: Number(servicePrice),
        date: serviceDate,
      });

      resetServiceForm();
      setShowServiceModal(false);

      if (selectedVehicle) {
        await loadServices(selectedVehicle);
        await loadTotalCost(selectedVehicle.id);
      }

      await loadAnalytics();
      await loadCostTimeline();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating service");
    }
  };

  const handleDeleteService = async (service) => {
    const confirmed = window.confirm(`Delete service ${service.type}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/services/${service.id}`);

      if (selectedVehicle) {
        await loadServices(selectedVehicle);
        await loadTotalCost(selectedVehicle.id);
      }

      await loadAnalytics();
      await loadCostTimeline();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting service");
    }
  };

  const handleAddReminder = async () => {
    if (!selectedVehicle) return;

    if (!reminderType || !reminderDueDate) {
      alert("Reminder type and due date are required");
      return;
    }

    try {
      await api.post("/reminders", {
        vehicleId: selectedVehicle.id,
        type: reminderType,
        dueDate: reminderDueDate,
      });

      setReminderType("Registracija");
      setReminderDueDate("");
      setShowReminderModal(false);

      await loadReminders(selectedVehicle.id);
      await loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding reminder");
    }
  };

  const resetReminderForm = () => {
    setEditingReminder(null);
    setReminderType("Registracija");
    setReminderDueDate("");
  };

  const openAddReminderModal = () => {
    resetReminderForm();
    setShowReminderModal(true);
  };

  const openEditReminderModal = (reminder) => {
    setEditingReminder(reminder);
    setReminderType(reminder.type);
    setReminderDueDate(formatDateInput(reminder.dueDate));
    setShowReminderModal(true);
  };

  const handleSaveReminder = async () => {
    if (!editingReminder) {
      await handleAddReminder();
      return;
    }

    if (!reminderType || !reminderDueDate) {
      alert("Reminder type and due date are required");
      return;
    }

    try {
      await api.patch(`/reminders/${editingReminder.id}`, {
        type: reminderType,
        dueDate: reminderDueDate,
        completed: editingReminder.completed,
      });

      resetReminderForm();
      setShowReminderModal(false);

      if (selectedVehicle) {
        await loadReminders(selectedVehicle.id);
      }

      await loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating reminder");
    }
  };

  const handleDeleteReminder = async (reminder) => {
    const confirmed = window.confirm(`Delete reminder ${reminder.type}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/reminders/${reminder.id}`);

      if (selectedVehicle) {
        await loadReminders(selectedVehicle.id);
      }

      await loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting reminder");
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await api.patch(`/reminders/${reminderId}/complete`);

      if (selectedVehicle) {
        await loadReminders(selectedVehicle.id);
      }

      await loadAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error completing reminder");
    }
  };

  const getReminderStatus = (reminder) => {
    if (reminder.completed) {
      return {
        label: "Done",
        className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
      };
    }

    const now = new Date();
    const due = new Date(reminder.dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Overdue",
        className: "bg-red-50 text-red-700 ring-red-100",
      };
    }

    if (diffDays <= 7) {
      return {
        label: "Soon",
        className: "bg-amber-50 text-amber-700 ring-amber-100",
      };
    }

    return {
      label: "OK",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await loadVehicles();
      await loadUser();
      await loadAnalytics();
      await loadCostTimeline();
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      label: "Total spent",
      value: `${formatMoney(analytics.totalSpent)} BAM`,
      tone: "border-zinc-200 bg-white",
      accent: "bg-zinc-950",
    },
    {
      label: "Overdue",
      value: analytics.overdue,
      tone: "border-red-100 bg-red-50",
      accent: "bg-red-500",
    },
    {
      label: "Soon",
      value: analytics.soon,
      tone: "border-amber-100 bg-amber-50",
      accent: "bg-amber-500",
    },
    {
      label: "OK",
      value: analytics.ok,
      tone: "border-emerald-100 bg-emerald-50",
      accent: "bg-emerald-500",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        <aside className="animate-fade-in border-b border-zinc-200 bg-white/85 px-5 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-3">
              <div className="animate-soft-float grid h-11 w-11 place-items-center rounded-lg bg-zinc-950 text-lg font-black text-amber-300">
                C
              </div>
              <div>
                <h1 className="text-xl font-black">CarCare</h1>
                <p className="text-sm text-zinc-500">Plan: {plan}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:bg-zinc-50 active:translate-y-0 lg:mt-8 lg:w-full"
            >
              Logout
            </button>
          </div>

          <nav className="mt-6 hidden space-y-2 lg:block">
            <button className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-left text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
              Dashboard
            </button>
            <div className="animate-fade-up stagger-1 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-bold uppercase text-zinc-500">Garage</p>
              <p className="mt-2 text-2xl font-black">{vehicles.length}</p>
              <p className="text-sm text-zinc-500">tracked vehicles</p>
            </div>
          </nav>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <header className="animate-fade-up mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                Maintenance overview
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Analytics Dashboard
              </h2>
              <p className="mt-3 max-w-2xl text-zinc-600">
                Track service spend, vehicle history and upcoming reminders from one place.
              </p>
            </div>

            <button
              onClick={openAddVehicleModal}
              className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-black text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_16px_36px_rgba(245,158,11,0.34)] active:translate-y-0"
            >
              Add Vehicle
            </button>
          </header>

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <article
                key={stat.label}
                className={`animate-fade-up rounded-lg border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${stat.tone} stagger-${index + 1}`}
              >
                <div className={`animate-fill-bar mb-5 h-1.5 w-12 rounded-full ${stat.accent}`} />
                <p className="text-sm font-semibold text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight">{stat.value}</p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="animate-fade-up stagger-1 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">Spending by date</h3>
                  <p className="text-sm text-zinc-500">Service costs grouped by entry date</p>
                </div>
              </div>

              <div className="h-[290px]">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} width={42} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e4e4e7",
                        boxShadow: "0 14px 36px rgba(24, 24, 27, 0.12)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#18181b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: "#f59e0b", stroke: "#18181b", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="animate-fade-up stagger-2 rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
              <p className="text-sm font-semibold text-amber-300">This month</p>
              <h3 className="mt-2 text-3xl font-black">{vehicles.length} vehicles tracked</h3>
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/10 p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.14]">
                  <p className="text-xs text-zinc-400">Services</p>
                  <p className="mt-1 text-2xl font-black">{services.length}</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.14]">
                  <p className="text-xs text-zinc-400">Reminders</p>
                  <p className="mt-1 text-2xl font-black">{reminders.length}</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.14]">
                  <p className="text-xs text-zinc-400">Plan</p>
                  <p className="mt-1 text-2xl font-black capitalize">{plan}</p>
                </div>
              </div>
            </article>
          </section>

          <section className="animate-fade-up stagger-2 mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">Vehicles</h3>
                <p className="text-sm text-zinc-500">Open a vehicle to manage service history and reminders.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {vehicles.length === 0 && (
                <div className="animate-scale-in rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-zinc-500 lg:col-span-2">
                  Add your first vehicle to start tracking maintenance costs.
                </div>
              )}

              {vehicles.map((vehicle, index) => (
                <article
                  key={vehicle.id}
                  className={`animate-scale-in rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg stagger-${(index % 4) + 1} ${
                    selectedVehicle?.id === vehicle.id ? "border-zinc-950" : "border-zinc-200"
                  }`}
                >
                  <div className="mb-4 overflow-hidden rounded-lg bg-zinc-100">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="h-44 w-full object-cover transition duration-500 hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-44 place-items-center bg-[linear-gradient(135deg,#18181b,#52525b)] text-sm font-bold text-amber-200">
                        No vehicle image
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                        Vehicle
                      </p>
                      <h4 className="mt-1 text-2xl font-black">{vehicle.name}</h4>
                      <p className="mt-1 text-sm text-zinc-500">
                        {vehicle.year}
                        {vehicle.tireYear ? ` · Tires ${vehicle.tireYear}` : ""}
                      </p>
                    </div>

                    <div className="rounded-lg bg-zinc-50 px-4 py-3 text-right">
                      <p className="text-xs font-semibold text-zinc-500">Spent</p>
                      <p className="mt-1 font-black">{formatMoney(costs[vehicle.id])} BAM</p>
                    </div>
                  </div>

                  <button
                    onClick={() => loadServices(vehicle)}
                    className="mt-5 w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0"
                  >
                    {selectedVehicle?.id === vehicle.id ? "Opened" : "Open Vehicle"}
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openEditVehicleModal(vehicle)}
                      className={secondaryButtonClass}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle)}
                      className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {selectedVehicle && (
            <section className="animate-fade-up mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <PanelHeader
                  title={selectedVehicle.name}
                  subtitle="Service history"
                  action="Add Service"
                  onAction={openAddServiceModal}
                />

                {services.length === 0 ? (
                  <EmptyState text="No services added yet." />
                ) : (
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div
                        key={service.id}
                        className={`animate-fade-up rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm stagger-${(index % 4) + 1}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-black">{service.type}</p>
                            <p className="text-sm text-zinc-500">
                              {new Date(service.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-black">{formatMoney(service.price)} BAM</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => openEditServiceModal(service)}
                            className={secondaryButtonClass}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <PanelHeader
                  title="Reminders"
                  subtitle="Upcoming maintenance"
                  action="Add Reminder"
                  onAction={openAddReminderModal}
                />

                {reminders.length === 0 ? (
                  <EmptyState text="No reminders added yet." />
                ) : (
                  <div className="space-y-3">
                    {reminders.map((reminder, index) => {
                      const status = getReminderStatus(reminder);

                      return (
                        <div
                          key={reminder.id}
                          className={`animate-fade-up rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm stagger-${(index % 4) + 1}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-black">{reminder.type}</p>
                              <p className="text-sm text-zinc-500">
                                {new Date(reminder.dueDate).toLocaleDateString()}
                              </p>
                            </div>

                            <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${status.className}`}>
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {!reminder.completed && (
                              <button
                                onClick={() => handleCompleteReminder(reminder.id)}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => openEditReminderModal(reminder)}
                              className={secondaryButtonClass}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder)}
                              className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>
          )}
        </section>
      </div>

      {showModal && (
        <Modal
          title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
          onClose={() => {
            resetVehicleForm();
            setShowModal(false);
          }}
        >
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
          <input type="number" placeholder="Tire Year" value={tireYear} onChange={(e) => setTireYear(e.target.value)} className={inputClass} />
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
            {vehicleImage ? (
              <img
                src={vehicleImage}
                alt="Vehicle preview"
                className="mb-3 h-40 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mb-3 grid h-40 place-items-center rounded-lg bg-zinc-200 text-sm font-bold text-zinc-500">
                Vehicle image preview
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-700">Vehicle image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleVehicleImageChange}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-zinc-800"
              />
            </label>

            {vehicleImage && (
              <button
                onClick={() => setVehicleImage("")}
                className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
              >
                Remove image
              </button>
            )}
          </div>
          <ModalActions
            confirmLabel={editingVehicle ? "Save" : "Add"}
            onCancel={() => {
              resetVehicleForm();
              setShowModal(false);
            }}
            onConfirm={handleSaveVehicle}
          />
        </Modal>
      )}

      {showServiceModal && (
        <Modal
          title={editingService ? "Edit Service" : "Add Service"}
          onClose={() => {
            resetServiceForm();
            setShowServiceModal(false);
          }}
        >
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={inputClass}>
            <option value="MALI">Mali servis</option>
            <option value="VELIKI">Veliki servis</option>
            <option value="KOCNICE">Kocnice</option>
            <option value="KLIMA">Klima</option>
            <option value="ELEKTRONIKA">Elektronika</option>
            <option value="OSTALO">Ostalo</option>
          </select>
          <input type="number" placeholder="Price" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} className={inputClass} />
          <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className={inputClass} />
          <ModalActions
            confirmLabel={editingService ? "Save" : "Add"}
            onCancel={() => {
              resetServiceForm();
              setShowServiceModal(false);
            }}
            onConfirm={handleSaveService}
          />
        </Modal>
      )}

      {showReminderModal && (
        <Modal
          title={editingReminder ? "Edit Reminder" : "Add Reminder"}
          onClose={() => {
            resetReminderForm();
            setShowReminderModal(false);
          }}
        >
          <input placeholder="Reminder type" value={reminderType} onChange={(e) => setReminderType(e.target.value)} className={inputClass} />
          <input type="date" value={reminderDueDate} onChange={(e) => setReminderDueDate(e.target.value)} className={inputClass} />
          <ModalActions
            confirmLabel={editingReminder ? "Save" : "Add"}
            onCancel={() => {
              resetReminderForm();
              setShowReminderModal(false);
            }}
            onConfirm={handleSaveReminder}
          />
        </Modal>
      )}
    </main>
  );
}

function PanelHeader({ title, subtitle, action, onAction }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      <button onClick={onAction} className={`${secondaryButtonClass} transition hover:-translate-y-0.5 active:translate-y-0`}>
        {action}
      </button>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="animate-scale-in rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm font-medium text-zinc-500">
      {text}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 px-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(24,24,27,0.28)]">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-black">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:-translate-y-0.5 hover:bg-zinc-50 active:translate-y-0"
            aria-label="Close modal"
          >
            x
          </button>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ confirmLabel = "Add", onCancel, onConfirm }) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-2">
      <button onClick={onCancel} className={`${secondaryButtonClass} transition hover:-translate-y-0.5 active:translate-y-0`}>
        Cancel
      </button>
      <button onClick={onConfirm} className={`${primaryButtonClass} transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0`}>
        {confirmLabel}
      </button>
    </div>
  );
}
