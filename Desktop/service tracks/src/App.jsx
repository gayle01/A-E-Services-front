import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Home, Inbox, UserRound, Camera, MapPin, Calendar, Clock, ChevronLeft, Upload, X, LogOut, User, LayoutGrid, Users } from 'lucide-react';
import BottomNav from './components/BottomNav';
import WorkerProfile from './components/WorkerProfile';
import MyJobs from './components/MyJobs';
import WorkersScreen from './components/WorkersScreen';
import ServicesScreen from './components/ServicesScreen';
import AccountScreen from './components/AccountScreen';
import NotificationsScreen from './components/NotificationsScreen';
import WorkerLogUpdateScreen from './components/WorkerLogUpdateScreen';
import VerificationReviewScreen from './components/VerificationReviewScreen';
import WorkerAssignedWorkScreen from './components/WorkerAssignedWorkScreen';
import WorkerRequestsScreen from './components/WorkerRequestsScreen';
import ContractsScreen from './components/ContractsScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AuthPage from './pages/AuthPage';
import WorkerSetupPage from './pages/WorkerSetupPage';
import ClientHomePage from './pages/ClientHomePage';
import CompanyHomePage from './pages/CompanyHomePage';
import { services, workers } from './data/marketData';
import { loadState, loadStateFromLocal, saveState } from './lib/persistence';
import { pathForScreen, screenFromPath } from './lib/routeMap';

const seedNotifications = [
  {
    id: 1,
    title: 'Welcome to TrackFlow',
    body: 'Get started by setting up your profile.',
    time: 'Now',
    unread: true,
    kind: 'system',
    audience: ['all']
  }
];

function loadStoredState() {
  return loadStateFromLocal();
}

function formatDateTime(date) {
  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const start = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  const end = endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return { datePart, timeRange: `${start} - ${end}` };
}

function addWeeks(date, weeks) {
  return new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function alignToWeekday(date, targetWeekday) {
  if (!Number.isInteger(targetWeekday) || targetWeekday < 0 || targetWeekday > 6) return date;
  const current = date.getDay();
  const delta = (targetWeekday - current + 7) % 7;
  return addDays(date, delta);
}

function formatOccurrenceDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatContractDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function buildYearlyOccurrences(contract, startDate, options = {}) {
  const durationValue = Number(options.durationValue || contract.durationValue || contract.durationMonths || 12);
  const durationUnit = options.durationUnit || contract.durationUnit || 'months';
  const frequency = options.frequency || contract.frequency || 'Weekly';
  const weekday = Number(options.weekday ?? contract.weekday ?? startDate.getDay());
  const durationWeeks =
    durationUnit === 'weeks'
      ? Math.max(1, durationValue)
      : Math.max(1, Math.ceil((durationValue * 52) / 12));
  const weeklyCount = Math.max(1, durationWeeks);
  const count =
    frequency === 'Biweekly'
      ? Math.max(1, Math.ceil(weeklyCount / 2))
      : frequency === 'Monthly'
        ? Math.max(1, durationUnit === 'weeks' ? Math.ceil(durationWeeks / 4.345) : durationValue)
        : weeklyCount;
  const alignedStart = alignToWeekday(startDate, weekday);

  const getOccurrenceDate = (index) => {
    if (frequency === 'Biweekly') return addWeeks(alignedStart, index * 2);
    if (frequency === 'Monthly') return addMonths(alignedStart, index);
    return addWeeks(alignedStart, index);
  };

  return Array.from({ length: count }).map((_, index) => {
    const day = getOccurrenceDate(index);
    const status =
      index < 4
        ? 'Verified'
        : index === 4
          ? 'Rejected'
          : index === 5
            ? 'Submitted'
            : index === 6
              ? 'In Progress'
              : 'Scheduled';

    return {
      id: contract.id * 1000 + index + 1,
      contractId: contract.id,
      title: contract.title,
      dateIso: day.toISOString(),
      dateLabel: formatOccurrenceDate(day),
      time: '08:00 AM - 10:00 AM',
      status,
      note: status === 'Rejected' ? 'Some sections were left unfinished.' : '',
      clientFeedback: status === 'Rejected' ? 'Please re-clean the kitchen and hallway.' : '',
      photos: []
    };
  });
}

function includesQuery(value, query) {
  return String(value || '').toLowerCase().includes(query.toLowerCase());
}

function createNameFromEmail(email) {
  const prefix = String(email || '').split('@')[0] || 'User';
  return prefix
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const clientLockedStatuses = new Set(['Completed', 'Verified', 'Rejected']);

function isClientLockedJob(job) {
  const hasClient = Boolean(String(job?.clientName || '').trim());
  return hasClient && clientLockedStatuses.has(job?.status);
}

function normalizeNotification(item) {
  const hasAudience = Array.isArray(item.audience) && item.audience.length > 0;
  const defaultAudience =
    item.kind === 'system' && item.title === 'Welcome to TrackFlow' ? ['all'] : ['internal'];
  return {
    ...item,
    kind: item.kind || 'updates',
    audience: hasAudience ? item.audience : defaultAudience
  };
}

function canRoleSeeNotification(item, role) {
  const audience = Array.isArray(item.audience) && item.audience.length > 0 ? item.audience : ['all'];
  if (audience.includes('all')) return true;
  if (!role) return false;
  return audience.includes(role);
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRouteScreen = screenFromPath(location.pathname);
  const [screenState, setScreenState] = useState(() => (initialRouteScreen || (loadStoredState().currentUser ? 'home' : 'welcome')));
  const currentScreen = screenFromPath(location.pathname) || screenState;
  const [authMode, setAuthMode] = useState('signup');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [pendingBookingWorker, setPendingBookingWorker] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [authUsers, setAuthUsers] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.authUsers) ? data.authUsers : [];
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const data = loadStoredState();
    // Force logout for legacy guest sessions
    return data.currentUser?.role === 'guest' ? null : (data.currentUser || null);
  });
  const [pendingWorkerSetupUserId, setPendingWorkerSetupUserId] = useState(null);
  const [workerRequests, setWorkerRequests] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.workerRequests) ? data.workerRequests : [];
  });
  const [jobs, setJobs] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.jobs) ? data.jobs : [];
  });
  const [contracts, setContracts] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.contracts) ? data.contracts : [];
  });
  const [occurrences, setOccurrences] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.occurrences) ? data.occurrences : [];
  });
  const [selectedContractId, setSelectedContractId] = useState(() => {
    const data = loadStoredState();
    return data.selectedContractId || null;
  });
  const [notifications, setNotifications] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.notifications) ? data.notifications : seedNotifications;
  });
  const [bookmarkedWorkerIds, setBookmarkedWorkerIds] = useState(() => {
    const data = loadStoredState();
    return Array.isArray(data.bookmarkedWorkerIds) ? data.bookmarkedWorkerIds : [];
  });
  const [selectedReviewJobId, setSelectedReviewJobId] = useState(null);
  const [reviewReadOnly, setReviewReadOnly] = useState(false);
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  const [clientWorkersFromServices, setClientWorkersFromServices] = useState(false);
  const [profileReturnScreen, setProfileReturnScreen] = useState('home');
  const [focusedOccurrenceId, setFocusedOccurrenceId] = useState(null);
  const [pendingCompanyAssignmentJobId, setPendingCompanyAssignmentJobId] = useState(null);
  const isCompanyRole = currentUser?.role === 'company';
  const isWorkerRole = currentUser?.role === 'worker';
  const isCompanyAccount = isCompanyRole || isWorkerRole;
  const setCurrentScreen = (nextScreen) => {
    setScreenState(nextScreen);
    const targetPath = pathForScreen(nextScreen);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    saveState({
      authUsers,
      currentUser,
      pendingWorkerSetupUserId,
      workerRequests,
      jobs,
      contracts,
      occurrences,
      selectedContractId,
      notifications,
      bookmarkedWorkerIds
    });
  }, [authUsers, currentUser, pendingWorkerSetupUserId, workerRequests, jobs, contracts, occurrences, selectedContractId, notifications, bookmarkedWorkerIds]);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const remote = await loadState();
      if (cancelled || !remote) return;
      if (Array.isArray(remote.authUsers)) setAuthUsers(remote.authUsers);
      if (remote.currentUser?.role === 'guest') {
        setCurrentUser(null);
      } else {
        setCurrentUser(remote.currentUser || null);
      }
      if (Array.isArray(remote.workerRequests)) setWorkerRequests(remote.workerRequests);
      if (Array.isArray(remote.jobs)) setJobs(remote.jobs);
      if (Array.isArray(remote.contracts)) setContracts(remote.contracts);
      if (Array.isArray(remote.occurrences)) setOccurrences(remote.occurrences);
      if (Array.isArray(remote.notifications)) setNotifications(remote.notifications);
      if (Array.isArray(remote.bookmarkedWorkerIds)) setBookmarkedWorkerIds(remote.bookmarkedWorkerIds);
      if (remote.selectedContractId !== undefined) setSelectedContractId(remote.selectedContractId || null);
      if (remote.pendingWorkerSetupUserId !== undefined) setPendingWorkerSetupUserId(remote.pendingWorkerSetupUserId || null);
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!screenFromPath(location.pathname)) {
      navigate(pathForScreen(currentScreen), { replace: true });
    }
  }, [location.pathname, currentScreen, navigate]);

  useEffect(() => {
    setIsClientMenuOpen(false);
  }, [currentScreen, currentUser?.id]);

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.trim();
    const serviceFilter = selectedServiceFilter.trim().toLowerCase();

    let source = workers;
    if (serviceFilter) {
      source = workers.filter((worker) => {
        const role = String(worker.role || '').toLowerCase();
        const serviceType = String(worker.serviceType || '').toLowerCase();
        return role.includes(serviceFilter) || serviceType.includes(serviceFilter);
      });
    }

    if (!query) return source;
    return source.filter((worker) => {
      return (
        includesQuery(worker.name, query) ||
        includesQuery(worker.role, query) ||
        includesQuery(worker.serviceType, query) ||
        includesQuery(worker.location, query)
      );
    });
  }, [searchQuery, selectedServiceFilter]);
  const companyCatalog = useMemo(() => {
    const companyUsers = authUsers.filter((user) => user.role === 'company');
    const query = searchQuery.trim();
    const serviceFilter = selectedServiceFilter.trim().toLowerCase();

    let source = companyUsers.map((company) => {
      const companyWorkers = authUsers.filter((user) => user.role === 'worker' && user.companyId === company.id);
      const categories = Array.isArray(company.workerCategories) ? company.workerCategories : [];
      return {
        id: company.id,
        name: company.name,
        role: 'Company',
        rating: 4.8,
        reviews: companyWorkers.length,
        location: company.location || 'Accra',
        serviceType: categories.length > 0 ? categories.join(', ') : 'General Services',
        image: company.image || `https://i.pravatar.cc/150?u=company-${company.id}`,
        coverImage: company.coverImage || company.image || `https://i.pravatar.cc/640?u=company-cover-${company.id}`,
        workerCategories: categories
      };
    });

    if (serviceFilter) {
      source = source.filter((company) =>
        Array.isArray(company.workerCategories) &&
        company.workerCategories.some((category) => String(category).toLowerCase().includes(serviceFilter))
      );
    }
    if (!query) return source;
    return source.filter((company) =>
      includesQuery(company.name, query) ||
      includesQuery(company.location, query) ||
      includesQuery(company.serviceType, query)
    );
  }, [authUsers, searchQuery, selectedServiceFilter]);

  const filteredServices = useMemo(() => {
    // Search should work on services/categories too.
    const query = searchQuery.trim();
    if (!query) return services;
    return services.filter((service) => includesQuery(service.name, query));
  }, [searchQuery]);


  const popularWorkers = useMemo(() => filteredWorkers.slice(0, 2), [filteredWorkers]);
  const visibleNotifications = useMemo(
    () => notifications.map(normalizeNotification).filter((item) => canRoleSeeNotification(item, currentUser?.role)),
    [notifications, currentUser]
  );
  const unreadNotifications = useMemo(
    () => visibleNotifications.filter((item) => item.unread).length,
    [visibleNotifications]
  );
  const clientRecentActivities = useMemo(
    () =>
      visibleNotifications.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        time: item.time,
        kind: item.kind,
        meta: item.meta
      })),
    [visibleNotifications]
  );
  const companyNavItems = useMemo(() => {
    if (isWorkerRole) {
      return [
        { id: 'home', name: 'Home', icon: Home },
        { id: 'jobs', name: 'Jobs', icon: CalendarDays },
        { id: 'contracts', name: 'Timeline', icon: CalendarDays },
        { id: 'account', name: 'Profile', icon: UserRound }
      ];
    }
    return [
      { id: 'home', name: 'Home', icon: Home },
      { id: 'requests', name: 'Requests', icon: Inbox },
      { id: 'jobs', name: 'Schedule', icon: CalendarDays },
      { id: 'contracts', name: 'Timeline', icon: CalendarDays },
      { id: 'account', name: 'Profile', icon: UserRound }
    ];
  }, [isWorkerRole]);
  const clientNavItems = useMemo(
    () => [
      { id: 'home', name: 'Home', icon: Home },
      { id: 'services', name: 'Services', icon: LayoutGrid },
      { id: 'workers', name: 'Companies', icon: Users },
      { id: 'contracts', name: 'Timeline', icon: CalendarDays },
      { id: 'account', name: 'Profile', icon: UserRound }
    ],
    []
  );
  const myWorkers = useMemo(
    () => authUsers.filter((user) => user.role === 'worker' && user.companyId === currentUser?.id),
    [authUsers, currentUser]
  );
  const myCompanyJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (currentUser?.role === 'worker') return job.assignedWorkerId === currentUser.id;
        if (currentUser?.role === 'company') {
          const teamWorkerIds = new Set(myWorkers.map((worker) => worker.id));
          const teamWorkerNames = new Set(myWorkers.map((worker) => worker.name));
          return (
            job.providerName === currentUser.name ||
            teamWorkerIds.has(job.assignedWorkerId) ||
            teamWorkerNames.has(job.providerName)
          );
        }
        return false;
      }),
    [jobs, currentUser, myWorkers]
  );
  const myClientJobs = useMemo(() => {
    if (currentUser?.role !== 'client') return [];

    const actualJobs = jobs.filter(
      (job) => job.clientName && job.clientName === currentUser.name
    );

    // Show sent requests in the jobs feed so "Send request" has immediate visible feedback.
    const requestRows = workerRequests
      .filter((request) => request.clientName === currentUser.name)
      .map((request) => ({
        id: request.id + 900000000,
        title: request.requestedService || request.title,
        date: 'Today',
        time: request.proposedTime || '--:--',
        providerName: request.companyName || request.workerName,
        location: request.location,
        rating: '5.0',
        status:
          request.status === 'pending'
            ? 'Requested'
            : request.status === 'accepted'
              ? 'Assigned'
              : 'Declined',
        providerImage: 'https://i.pravatar.cc/100?img=32',
        clientName: request.clientName
      }));

    return [...requestRows, ...actualJobs];
  }, [jobs, workerRequests, currentUser]);
  const myPendingRequests = useMemo(
    () =>
      workerRequests.filter(
        (request) =>
          (request.companyName === currentUser?.name || request.workerName === currentUser?.name) &&
          request.status === 'pending'
      ),
    [workerRequests, currentUser]
  );
  const completedJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.providerName === currentUser?.name && job.status === 'Verified'
      ).length,
    [jobs, currentUser]
  );
  const companyRating = useMemo(() => {
    const worker = workers.find((item) => item.name === currentUser?.name);
    return worker?.rating || 4.8;
  }, [currentUser]);
  const upcomingCompanyJob = useMemo(
    () => myCompanyJobs.find((job) => job.status === 'Active' || job.status === 'Assigned') || null,
    [myCompanyJobs]
  );
  const activeJobsCount = useMemo(
    () => myCompanyJobs.filter((job) => job.status === 'Active' || job.status === 'Assigned').length,
    [myCompanyJobs]
  );
  const myContracts = useMemo(
    () =>
      contracts.filter((contract) => {
        if (currentUser?.role === 'client') return contract.clientName === currentUser.name;
        if (currentUser?.role === 'worker') return contract.workerName === currentUser.name;
        if (currentUser?.role === 'company') {
          const workerNames = myWorkers.map((w) => w.name);
          return contract.workerName === currentUser.name || workerNames.includes(contract.workerName);
        }
        return false;
      }),
    [contracts, currentUser, myWorkers]
  );
  const selectedContractOccurrences = useMemo(
    () => occurrences.filter((occurrence) => occurrence.contractId === selectedContractId),
    [occurrences, selectedContractId]
  );
  const workerNameOptions = useMemo(
    () => workers.map((worker) => worker.name),
    []
  );
  const contractWorkerOptions = useMemo(
    () =>
      currentUser?.role === 'company'
        ? [currentUser.name, ...myWorkers.map((w) => w.name)]
        : workerNameOptions,
    [currentUser, myWorkers, workerNameOptions]
  );

  const addNotification = (title, body, options = {}) => {
    const audience =
      Array.isArray(options.audience) && options.audience.length > 0
        ? options.audience
        : currentUser?.role
          ? [currentUser.role]
          : ['internal'];
    const kind = options.kind || 'updates';
    const meta = options.meta || undefined;
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setNotifications((prev) => [
      { id: Date.now(), title, body, time, unread: true, audience, kind, meta },
      ...prev
    ]);
  };

  const ensureWorkerAssignments = (user) => {
    if (!user || (user.role !== 'company' && user.role !== 'worker')) return;
    const hasAny = jobs.some((job) => job.providerName === user.name);
    if (hasAny) return;

    const now = new Date();
    const one = formatDateTime(now);

    const seeded = [
      {
        id: Date.now() + 200,
        title: 'Office Deep Cleaning',
        date: one.datePart,
        time: one.timeRange,
        providerName: user.name,
        location: 'Airport Residential, Accra',
        rating: '5.0',
        status: 'Active',
        serviceIcon: undefined,
        providerImage: 'https://i.pravatar.cc/100?img=32',
        photos: []
      }
    ];

    setJobs((prev) => [...seeded, ...prev]);
  };

  const ensureYearlyContractTimeline = (user) => {
    if (!user) return;

    const roleKey = user.role === 'company' || user.role === 'worker' ? 'workerName' : 'clientName';
    const hasContract = contracts.some((contract) => contract[roleKey] === user.name);
    if (hasContract) return;

    const contractId = Date.now();
    const yearlyContract = {
      id: contractId,
      title: 'Yearly Cleaning Maintenance',
      clientName: user.role === 'client' ? user.name : 'Ama Kusi',
      workerName: user.role === 'company' || user.role === 'worker' ? user.name : 'Fatima Abdullahi',
      location: user.location || 'East Legon, Accra',
      frequency: 'Weekly',
      weekday: 2,
      durationValue: 12,
      durationUnit: 'months',
      startDate: '06 Jan 2026',
      endDate: '29 Dec 2026',
      status: 'Active'
    };

    const generated = buildYearlyOccurrences(yearlyContract, new Date('2026-01-06T08:00:00Z'), {
      frequency: yearlyContract.frequency,
      durationValue: yearlyContract.durationValue,
      durationUnit: yearlyContract.durationUnit,
      weekday: yearlyContract.weekday
    });
    setContracts((prev) => [yearlyContract, ...prev]);
    setOccurrences((prev) => [...generated, ...prev]);
    setSelectedContractId(contractId);
  };

  const createClientRequest = (company, details = {}) => {
    if (!currentUser) return;
    const now = new Date();
    const proposedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const companyName = company.companyName || company.name;
    const requestedService =
      details.category ||
      details.title ||
      selectedServiceFilter ||
      (Array.isArray(company.workerCategories) && company.workerCategories[0]) ||
      company.serviceType ||
      company.role ||
      'General Service';
    const request = {
      id: Date.now(),
      companyName,
      workerName: companyName,
      title: details.title || requestedService,
      requestedService,
      location: details.location || currentUser.location || 'Accra, Ghana',
      proposedTime,
      clientName: currentUser.name,
      note: details.note || '',
      status: 'pending'
    };
    setWorkerRequests((prev) => [request, ...prev]);
    addNotification('Request sent', `Your request has been sent to ${companyName}.`, {
      audience: ['client'],
      kind: 'requests'
    });
  };

  const acceptWorkerRequest = (requestId) => {
    const request = workerRequests.find((item) => item.id === requestId);
    if (!request) return;
    const companyName = request.companyName || request.workerName;

    setWorkerRequests((prev) =>
      prev.map((item) => (item.id === requestId ? { ...item, status: 'accepted' } : item))
    );

    const now = new Date();
    const { datePart, timeRange } = formatDateTime(now);
    const workId = Date.now();
    const newJob = {
      id: workId,
      title: request.title || request.requestedService,
      date: datePart,
      time: timeRange,
      providerName: companyName,
      location: request.location,
      rating: '5.0',
      status: 'Assigned',
      providerImage: 'https://i.pravatar.cc/100?img=32',
      clientName: request.clientName,
      category: request.requestedService || '',
      note: request.note || ''
    };
    setJobs((prev) => [newJob, ...prev]);
    setPendingCompanyAssignmentJobId(workId);
    setCurrentScreen('jobs');

    addNotification('Request accepted', `${companyName} accepted the request from ${request.clientName}.`, {
      audience: ['client', 'company'],
      kind: 'requests'
    });
  };

  const handleStartJob = (jobId) => {
    const jobToStart = jobs.find((job) => job.id === jobId && job.status === 'Assigned');
    if (!jobToStart) return;

    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: 'Active' } : job)));
    addNotification('Job started', `${jobToStart.providerName} started ${jobToStart.title}.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'timeline'
    });
  };

  const declineWorkerRequest = (requestId) => {
    const request = workerRequests.find((item) => item.id === requestId);
    if (!request) return;
    const companyName = request.companyName || request.workerName;
    setWorkerRequests((prev) =>
      prev.map((item) => (item.id === requestId ? { ...item, status: 'declined' } : item))
    );
    addNotification('Request declined', `${companyName} declined the request from ${request.clientName}.`, {
      audience: ['client'],
      kind: 'requests'
    });
  };

  const logWorkerProgress = (worker) => {
    const now = new Date();
    const { datePart, timeRange } = formatDateTime(now);
    const workId = Date.now();
    const newJob = {
      id: workId,
      title: worker.serviceType || worker.role,
      date: datePart,
      time: timeRange,
      providerName: worker.name,
      location: worker.location || 'Accra',
      rating: String(worker.rating || 4.5),
      status: 'Completed',
      serviceIcon: undefined,
      providerImage: worker.image
    };

    setJobs((prev) => [newJob, ...prev]);
    addNotification('Progress logged', `${worker.name} submitted a new progress update awaiting client verification.`, {
      audience: ['client', 'company'],
      kind: 'verification'
    });
    setCurrentScreen('jobs');
  };

  const verifyWorkerProgress = (worker) => {
    const candidate = jobs.find((job) => job.providerName === worker.name && job.status === 'Completed');
    if (!candidate) {
      addNotification('No update to verify', `No pending progress update found for ${worker.name}.`, {
        audience: ['client'],
        kind: 'verification'
      });
      return;
    }
    setSelectedReviewJobId(candidate.id);
    setCurrentScreen('review-work');
  };

  const approveReview = (feedback = '') => {
    if (!selectedReviewJobId) return;
    const target = jobs.find((job) => job.id === selectedReviewJobId);
    if (!target) return;

    setJobs((prev) =>
      prev.map((job) =>
        job.id === selectedReviewJobId
          ? { ...job, status: 'Verified', verificationFeedback: feedback || '' }
          : job
      )
    );
    addNotification('Work verified', feedback ? `You approved ${target.title}: "${feedback}"` : `You approved ${target.title}.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'verification'
    });
    setSelectedReviewJobId(null);
    setCurrentScreen('jobs');
  };

  const rejectReview = (feedback = '') => {
    if (!selectedReviewJobId) return;
    const target = jobs.find((job) => job.id === selectedReviewJobId);
    if (!target) return;

    setJobs((prev) =>
      prev.map((job) =>
        job.id === selectedReviewJobId
          ? { ...job, status: 'Active', rejectionFeedback: feedback || '' }
          : job
      )
    );
    addNotification('Revision requested', feedback ? `Revision requested for ${target.title}: "${feedback}"` : `You requested more proof for ${target.title}.`, {
      audience: ['company', 'worker'],
      kind: 'verification'
    });
    setSelectedReviewJobId(null);
    setCurrentScreen('jobs');
  };

  const handleSubmitProgress = (jobId) => {
    const jobToSubmit = jobs.find((job) => job.id === jobId && job.status === 'Active');
    if (!jobToSubmit) return;

    const updatedJob = { ...jobToSubmit, status: 'Completed', submittedAt: new Date().toISOString() };
    setJobs((prev) => prev.map((job) => (job.id === jobId ? updatedJob : job)));

    addNotification('Progress submitted', `${updatedJob.providerName} submitted progress for ${updatedJob.title}.`, {
      audience: ['client', 'company'],
      kind: 'verification',
      meta: {
        targetType: 'job-review',
        jobId: updatedJob.id
      }
    });
  };

  const updateOccurrenceStatus = (occurrenceId, nextStatus, extra = {}) => {
    const target = occurrences.find((o) => o.id === occurrenceId);
    if (!target) return null;

    const updated = { ...target, status: nextStatus, ...extra };
    setOccurrences((prev) => prev.map((o) => (o.id === occurrenceId ? updated : o)));
    return updated;
  };

  const handleStartOccurrence = (occurrenceId) => {
    const updated = updateOccurrenceStatus(occurrenceId, 'In Progress', {
      startedAt: new Date().toISOString()
    });
    if (!updated) return;
    addNotification('Occurrence started', `${updated.dateLabel}: work started.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'timeline'
    });
  };

  const handleSubmitOccurrence = (occurrenceId, payload = {}) => {
    const updated = updateOccurrenceStatus(occurrenceId, 'Submitted', {
      note: payload.note || '',
      photos: payload.photos || [],
      submittedAt: new Date().toISOString()
    });
    if (!updated) return;
    addNotification('Occurrence submitted', `${updated.dateLabel}: submitted for client verification.`, {
      audience: ['client', 'company'],
      kind: 'verification',
      meta: {
        targetType: 'occurrence-review',
        occurrenceId,
        contractId: updated.contractId
      }
    });
  };

  const handleApproveOccurrence = (occurrenceId, feedback = '') => {
    const updated = updateOccurrenceStatus(occurrenceId, 'Verified', {
      clientFeedback: feedback || '',
      verifiedAt: new Date().toISOString()
    });
    if (!updated) return;
    addNotification('Occurrence verified', `${updated.dateLabel} has been approved.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'verification'
    });
  };

  const handleRejectOccurrence = (occurrenceId, feedback = '') => {
    const updated = updateOccurrenceStatus(occurrenceId, 'Rejected', {
      clientFeedback: feedback || '',
      rejectedAt: new Date().toISOString()
    });
    if (!updated) return;
    addNotification('Occurrence rejected', `${updated.dateLabel} needs rework.`, {
      audience: ['company', 'worker'],
      kind: 'verification'
    });
  };

  const handleMarkOccurrenceMissed = (occurrenceId, feedback = '') => {
    const updated = updateOccurrenceStatus(occurrenceId, 'Missed', {
      clientFeedback: feedback || '',
      missedAt: new Date().toISOString()
    });
    if (!updated) return;
    addNotification('Occurrence marked missed', `${updated.dateLabel} was marked as missed.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'timeline'
    });
  };

  const handleCreateYearlyContract = (payload = {}) => {
    if (!currentUser) return;

    const durationValue = Number(payload.durationValue || 12);
    const durationUnit = payload.durationUnit || 'months';
    const frequency = payload.frequency || 'Weekly';
    const weekday = Number(payload.weekday ?? new Date().getDay());
    const startDate = payload.startDate ? new Date(payload.startDate) : new Date();
    const contractStart = Number.isNaN(startDate.getTime()) ? new Date() : startDate;
    const contractEnd =
      durationUnit === 'weeks'
        ? addWeeks(contractStart, durationValue)
        : addMonths(contractStart, durationValue);

    const contractId = Date.now();
    const newContract = {
      id: contractId,
      title: payload.title?.trim() || `${durationValue}-${durationUnit === 'weeks' ? 'Week' : 'Month'} Cleaning Contract`,
      clientName: currentUser.role === 'client' ? currentUser.name : 'Ama Kusi',
      workerName:
        currentUser.role === 'client'
          ? payload.workerName?.trim() || 'Fatima Abdullahi'
          : payload.workerName?.trim() || currentUser.name,
      location: payload.location?.trim() || currentUser.location || 'Accra',
      frequency,
      weekday,
      durationValue,
      durationUnit,
      startDate: formatContractDate(contractStart),
      endDate: formatContractDate(contractEnd),
      status: 'Active'
    };

    setContracts((prev) => [newContract, ...prev]);
    setOccurrences((prev) => [
      ...buildYearlyOccurrences(newContract, contractStart, { frequency, durationValue, durationUnit, weekday }),
      ...prev
    ]);
    setSelectedContractId(contractId);
    setCurrentScreen('contracts');
    addNotification('Contract created', `${newContract.title} is now active.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'timeline'
    });
  };

  const handleDeleteContract = (contractId) => {
    const target = contracts.find((contract) => contract.id === contractId);
    if (!target) return;
    setContracts((prev) => prev.filter((contract) => contract.id !== contractId));
    setOccurrences((prev) => prev.filter((occurrence) => occurrence.contractId !== contractId));
    if (selectedContractId === contractId) {
      setSelectedContractId(null);
    }
    addNotification('Contract deleted', `${target.title} and its occurrences were removed.`, {
      audience: ['client', 'company', 'worker'],
      kind: 'timeline'
    });
  };

  const handleUpdateActiveJob = (jobId, updates) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;
    if (currentUser?.role === 'company' && isClientLockedJob(target)) {
      addNotification('Edit blocked', `Job "${target.title}" is already client-facing and cannot be edited.`, {
        audience: ['company'],
        kind: 'system'
      });
      return;
    }

    let allowedUpdates = {};
    if (currentUser?.role === 'company') {
      // Company controls job scope/details only (never proof images).
      const {
        title,
        category,
        clientName,
        location,
        date,
        time,
        note
      } = updates;
      if (title !== undefined) allowedUpdates.title = title;
      if (category !== undefined) allowedUpdates.category = category;
      if (clientName !== undefined) allowedUpdates.clientName = clientName;
      if (location !== undefined) allowedUpdates.location = location;
      if (date !== undefined) allowedUpdates.date = date;
      if (time !== undefined) allowedUpdates.time = time;
      if (note !== undefined) allowedUpdates.note = note;
    } else if (currentUser?.role === 'worker') {
      // Worker can only upload visual proof of progress/completion.
      const { photos } = updates;
      if (photos !== undefined) allowedUpdates.photos = photos;
    } else {
      allowedUpdates = updates;
    }

    const updatedJob = { ...target, ...allowedUpdates };
    setJobs((prev) => prev.map((job) => (job.id === jobId ? updatedJob : job)));
    if (Object.keys(allowedUpdates).length > 0) {
      addNotification('Job updated', `Updated details for ${updatedJob.title}.`, {
        audience: ['client', 'company', 'worker'],
        kind: 'jobs'
      });
    }
  };

  const openVerificationFromJob = (jobId) => {
    const target = myClientJobs.find((job) => job.id === jobId);
    if (!target || target.status !== 'Completed') return;
    setReviewReadOnly(false);
    setSelectedReviewJobId(jobId);
    setCurrentScreen('review-work');
  };

  const openVerifiedDetailsFromJob = (jobId) => {
    const target = myClientJobs.find((job) => job.id === jobId);
    if (!target || target.status !== 'Verified') return;
    setReviewReadOnly(true);
    setSelectedReviewJobId(jobId);
    setCurrentScreen('review-work');
  };

  const handleProfileOpen = (worker) => {
    setProfileReturnScreen(currentScreen === 'workers' || currentScreen === 'services' ? 'workers' : currentScreen);
    setSelectedWorker({
      ...worker,
      coverImage: worker.image,
      isBookmarked: bookmarkedWorkerIds.includes(worker.id)
    });
    setCurrentScreen('profile');
  };

  const handleBook = () => {
    if (!selectedWorker) return;
    if (!currentUser) {
      setPendingBookingWorker(selectedWorker);
      setPendingActionType('request');
      setAuthMode('signin');
      setCurrentScreen('auth');
      return;
    }
    if (currentUser.role === 'company' || currentUser.role === 'worker') {
      setCurrentScreen('jobs');
    } else {
      setCurrentScreen('worker-log');
    }
  };

  const handleAuthenticate = ({ mode, role, email, password }) => {
    let authenticatedUser = null;

    if (mode === 'signup') {
      const exists = authUsers.some((user) => user.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { ok: false, error: 'Email already exists. Please sign in instead.' };
      }
      authenticatedUser = {
        id: Date.now(),
        email,
        password,
        role,
        name: createNameFromEmail(email),
        phone: '',
        location: '',
        about: '',
        workerCategories: []
      };
      setAuthUsers((prev) => [authenticatedUser, ...prev]);
      setCurrentUser(authenticatedUser);
      ensureWorkerAssignments(authenticatedUser);
    } else {
      const found = authUsers.find(
        (user) =>
          user.email.toLowerCase() === email.toLowerCase() &&
          user.password === password &&
          user.role === role
      );
      if (!found) {
        return { ok: false, error: 'Invalid credentials or role. Check details and try again.' };
      }
      authenticatedUser = found;
      setCurrentUser(authenticatedUser);
      ensureWorkerAssignments(authenticatedUser);
    }

    const workerToBook = pendingBookingWorker || selectedWorker;
    if (workerToBook && pendingActionType === 'request' && role === 'client') {
      setCurrentScreen('worker-log');
    } else if (workerToBook && pendingActionType === 'verify' && role === 'client') {
      verifyWorkerProgress(workerToBook);
    } else if (workerToBook && pendingActionType === 'log' && (role === 'company' || role === 'worker')) {
      setCurrentScreen('jobs');
    } else {
      setCurrentScreen('home');
    }
    setPendingBookingWorker(null);
    setPendingActionType(null);
    return { ok: true };
  };

  const handleResetPassword = ({ email, role, newPassword }) => {
    const targetEmail = String(email || '').toLowerCase();
    let found = false;
    setAuthUsers((prev) =>
      prev.map((user) => {
        const matches =
          user.email.toLowerCase() === targetEmail &&
          user.role === role;
        if (!matches) return user;
        found = true;
        return { ...user, password: newPassword };
      })
    );
    if (!found) {
      return { ok: false, error: 'No account found for that email and role.' };
    }
    return { ok: true };
  };

  const jumpToWorkersByService = (service) => {
    setClientWorkersFromServices(true);
    setSelectedServiceFilter(service.name);
    setSearchQuery('');
    setCurrentScreen('workers');
  };

  const jumpToWorkersByCategory = (categoryName) => {
    const queryByCategory = {
      Painter: 'Painting',
      Borehole: 'Borehole',
      Architect: 'Architect',
      Carpenter: 'Carpentry',
      Cleaner: 'Cleaning',
      Waste: 'Waste',
      Gardener: 'Gardener'
    };
    const value = queryByCategory[categoryName] || categoryName;
    setClientWorkersFromServices(true);
    setSelectedServiceFilter(value);
    setSearchQuery('');
    setCurrentScreen('workers');
  };

  const openAllWorkers = () => {
    setClientWorkersFromServices(false);
    setSelectedServiceFilter('');
    setSearchQuery('');
    setCurrentScreen('workers');
  };

  const openNotifications = () => {
    setIsClientMenuOpen(false);
    setCurrentScreen('notifications');
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, unread: false } : item))
    );
  };

  const markRoleNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        canRoleSeeNotification(normalizeNotification(item), currentUser?.role)
          ? { ...item, unread: false }
          : item
      )
    );
  };

  const toggleSelectedWorkerBookmark = () => {
    if (!selectedWorker?.id) return;
    setBookmarkedWorkerIds((prev) =>
      prev.includes(selectedWorker.id)
        ? prev.filter((id) => id !== selectedWorker.id)
        : [...prev, selectedWorker.id]
    );
    setSelectedWorker((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : prev));
  };

  const callSelectedWorker = () => {
    const name = selectedWorker?.name;
    if (!name) return;
    window.location.href = `tel:${selectedWorker.phone || '0540000000'}`;
  };

  const openSelectedWorkerLatestUpdate = () => {
    const name = selectedWorker?.name;
    if (!name) return;
    const candidate = jobs
      .filter((job) => job.providerName === name && ['Completed', 'Verified'].includes(job.status))
      .sort((a, b) => b.id - a.id)[0];
    if (!candidate) {
      addNotification('No update found', `No logged updates available yet for ${name}.`, {
        audience: ['client', 'company'],
        kind: 'verification'
      });
      setCurrentScreen('contracts');
      return;
    }
    setReviewReadOnly(candidate.status === 'Verified');
    setSelectedReviewJobId(candidate.id);
    setCurrentScreen('review-work');
  };

  const handleWorkerNavigate = () => {
    if (currentUser?.role === 'worker') {
      setCurrentScreen('jobs');
      return;
    }
    const destination = upcomingCompanyJob?.location;
    if (!destination) {
      addNotification('Navigation unavailable', 'No job location available to navigate to.', {
        audience: ['company', 'worker'],
        kind: 'system'
      });
      return;
    }

    const openFallback = () => {
      const query = encodeURIComponent(destination);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    if (!navigator.geolocation) {
      openFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;
        const dest = encodeURIComponent(destination);
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`,
          '_blank'
        );
      },
      () => {
        openFallback();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleClientCallFromJob = (job) => {
    const participant = job?.providerName;
    if (!participant) return;
    let worker = workers.find((w) => w.name === participant);
    
    if (!worker) {
      // Create a temporary worker profile if not found in static data
      worker = {
        id: 'temp-' + Date.now(),
        name: participant,
        role: 'Service Provider',
        location: job.location || 'Accra',
        image: job.providerImage || 'https://i.pravatar.cc/100?img=32',
        rating: 5.0,
        phone: '0540000000'
      };
    }
    setProfileReturnScreen('jobs');
    setSelectedWorker(worker);
    setCurrentScreen('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPendingBookingWorker(null);
    setPendingActionType(null);
    setPendingWorkerSetupUserId(null);
    setAuthMode('signin');
    setCurrentScreen('welcome');
  };

  const handleClearDemoData = () => {
    setWorkerRequests([]);
    setJobs([]);
    setContracts([]);
    setOccurrences([]);
    setSelectedContractId(null);
    setFocusedOccurrenceId(null);
    setPendingCompanyAssignmentJobId(null);
    setNotifications(seedNotifications);
    setSelectedServiceFilter('');
    setSearchQuery('');
    setCurrentScreen('home');
  };

  const handleSaveProfile = (updates) => {
    if (!currentUser) return;
    const nextUser = {
      ...currentUser,
      ...updates
    };
    setCurrentUser(nextUser);
    setAuthUsers((prev) =>
      prev.map((user) => (user.id === nextUser.id ? { ...user, ...updates } : user))
    );
    addNotification('Profile updated', 'Your profile details were saved successfully.', {
      audience: [currentUser.role],
      kind: 'system'
    });
  };

  const handleCreateWorker = (workerData) => {
    if (!currentUser || currentUser.role !== 'company') return;
    const newWorker = {
      id: Date.now(),
      role: 'worker',
      companyId: currentUser.id,
      name: workerData.name,
      email: workerData.email,
      password: workerData.password,
      phone: '',
      location: currentUser.location || 'Accra',
      workerCategories: currentUser.workerCategories || [],
      image: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70)
    };
    setAuthUsers((prev) => [newWorker, ...prev]);
    addNotification('Worker Created', `${newWorker.name} has been added to your team.`, {
      audience: ['company'],
      kind: 'requests'
    });
  };

  const handleAssignWorker = (jobId, workerId) => {
    const targetJob = jobs.find((job) => job.id === jobId);
    if (!targetJob) return;
    if (isClientLockedJob(targetJob)) {
      addNotification('Assignment locked', `Job "${targetJob.title}" is closed for assignment changes.`, {
        audience: ['company'],
        kind: 'system'
      });
      return;
    }
    const worker = myWorkers.find(w => w.id === Number(workerId));
    setJobs(prev => prev.map(job => job.id === jobId ? { ...job, assignedWorkerId: Number(workerId), assignedWorkerName: worker?.name } : job));
    addNotification('Job Assigned', `Job assigned to ${worker?.name || 'worker'}.`, {
      audience: ['company', 'worker'],
      kind: 'jobs'
    });
  };

  useEffect(() => {
    if (isCompanyAccount && ['workers', 'services', 'profile'].includes(currentScreen)) {
      setCurrentScreen('home');
    }
  }, [isCompanyAccount, currentScreen]);

  useEffect(() => {
    if (isWorkerRole && currentScreen === 'worker-log') {
      setCurrentScreen('jobs');
    }
    if (isWorkerRole && currentScreen === 'requests') {
      setCurrentScreen('jobs');
    }
  }, [isWorkerRole, currentScreen]);

  useEffect(() => {
    if (currentUser?.role !== 'client') return;
    if (['requests'].includes(currentScreen)) {
      setCurrentScreen('home');
    }
  }, [currentUser, currentScreen]);

  useEffect(() => {
    if (currentUser?.role !== 'client') return;
    if (currentScreen === 'services' && !clientWorkersFromServices) {
      setSelectedServiceFilter('');
      setSearchQuery('');
    }
  }, [currentUser, currentScreen, clientWorkersFromServices]);

  useEffect(() => {
    if (currentUser?.role !== 'client') return;
    if (currentScreen === 'home') {
      setClientWorkersFromServices(false);
    }
  }, [currentUser, currentScreen]);

  useEffect(() => {
    if (!currentUser) return;
    ensureYearlyContractTimeline(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (myContracts.length === 0) {
      setSelectedContractId(null);
      return;
    }
    const hasSelection = myContracts.some((contract) => contract.id === selectedContractId);
    if (!hasSelection) {
      setSelectedContractId(myContracts[0].id);
    }
  }, [myContracts, selectedContractId]);

  const handleWorkerSetupSave = (selectedCategories) => {
    const categories = selectedCategories.length > 0 ? selectedCategories : ['General'];
    const targetId = pendingWorkerSetupUserId || currentUser?.id;
    if (!targetId) return;

    setAuthUsers((prev) =>
      prev.map((user) => (user.id === targetId ? { ...user, workerCategories: categories } : user))
    );
    setCurrentUser((prev) => (prev && prev.id === targetId ? { ...prev, workerCategories: categories } : prev));
    setPendingWorkerSetupUserId(null);
    ensureWorkerAssignments({ ...(currentUser || {}), id: targetId, role: 'company', workerCategories: categories });
    setCurrentScreen('jobs');
  };

  const handleWorkerLogNewUpdate = (payload) => {
    if (!currentUser) return;
    if (currentUser.role === 'worker') {
      addNotification('Action unavailable', 'Workers can only submit updates for assigned jobs.', {
        audience: ['worker'],
        kind: 'system'
      });
      setCurrentScreen('jobs');
      return;
    }
    const now = new Date();
    const { datePart, timeRange } = formatDateTime(now);
    const workId = Date.now();

    if (currentUser.role === 'client') {
      if (!selectedWorker) return;
      createClientRequest(selectedWorker, payload);
      setCurrentScreen('home');
    } else {
      const isAssignment = !!payload.assignedWorkerId;
      const assignedWorker = isAssignment ? myWorkers.find(w => w.id === Number(payload.assignedWorkerId)) : null;
      const newJob = {
        id: workId,
        title: payload.title,
        date: datePart,
        time: timeRange,
        providerName: currentUser.name,
        assignedWorkerId: assignedWorker ? assignedWorker.id : undefined,
        assignedWorkerName: assignedWorker ? assignedWorker.name : undefined,
        location: payload.location,
        rating: '5.0',
        status: isAssignment ? 'Assigned' : 'Completed',
        serviceIcon: undefined,
        providerImage: 'https://i.pravatar.cc/100?img=32',
        category: payload.category,
        clientName: payload.clientName,
        note: payload.note,
        photos: payload.photos || []
      };
      setJobs((prev) => [newJob, ...prev]);
      if (isAssignment) {
        addNotification('Job Assigned', `You assigned "${payload.title}" to ${assignedWorker?.name || 'worker'}.`, {
          audience: ['company', 'worker'],
          kind: 'jobs'
        });
      } else {
        addNotification('Work update submitted', `${currentUser.name} submitted "${payload.title}" for verification.`, {
          audience: ['client', 'company'],
          kind: 'verification'
        });
      }
      setCurrentScreen('jobs');
    }
  };

  const handleWorkerRescheduleRequest = (jobId, request) => {
    setJobs((prev) => prev.map((job) => {
      if (job.id === jobId) {
        return {
          ...job,
          status: 'Reschedule Requested',
          rescheduleRequest: request
        };
      }
      return job;
    }));
    addNotification('Request Sent', 'Reschedule request sent to client.', {
      audience: ['client', 'company'],
      kind: 'requests'
    });
  };

  const selectedContractNameById = useMemo(
    () =>
      myContracts.reduce((acc, contract) => {
        acc[contract.id] = contract.title;
        return acc;
      }, {}),
    [myContracts]
  );
  const myContractIdSet = useMemo(() => new Set(myContracts.map((contract) => contract.id)), [myContracts]);
  const clientJobVerificationQueue = useMemo(
    () =>
      jobs
        .filter((job) => job.clientName === currentUser?.name && job.status === 'Completed')
        .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
        .slice(0, 4)
        .map((job) => ({
          id: job.id,
          type: 'job',
          title: job.title,
          dateLabel: job.date
        })),
    [jobs, currentUser]
  );
  const clientVerificationQueue = useMemo(
    () =>
      [
        ...clientJobVerificationQueue,
        ...occurrences
          .filter((occurrence) => myContractIdSet.has(occurrence.contractId))
          .filter((occurrence) => occurrence.status === 'Submitted')
          .sort((a, b) => new Date(b.dateIso) - new Date(a.dateIso))
          .map((occurrence) => ({
            id: occurrence.id,
            type: 'occurrence',
            contractId: occurrence.contractId,
            title: selectedContractNameById[occurrence.contractId] || occurrence.title || 'Scheduled Service',
            dateLabel: occurrence.dateLabel
          }))
      ].slice(0, 4),
    [clientJobVerificationQueue, occurrences, myContractIdSet, selectedContractNameById]
  );
  const clientVerificationStats = useMemo(() => {
    const scoped = occurrences.filter((o) => myContractIdSet.has(o.contractId));
    const jobSubmitted = jobs.filter((job) => job.clientName === currentUser?.name && job.status === 'Completed').length;
    const submitted = scoped.filter((o) => o.status === 'Submitted').length + jobSubmitted;
    const rejected = scoped.filter((o) => o.status === 'Rejected').length;
    const verified = scoped.filter((o) => o.status === 'Verified').length;
    const missed = scoped.filter((o) => o.status === 'Missed').length;
    return { submitted, rejected, verified, missed };
  }, [occurrences, myContractIdSet, jobs, currentUser]);

  const openVerificationOccurrence = (occurrence) => {
    if (!occurrence?.id || !occurrence?.contractId) return;
    setSelectedContractId(occurrence.contractId);
    setFocusedOccurrenceId(occurrence.id);
    setCurrentScreen('contracts');
  };
  const openClientVerificationItem = (item) => {
    if (!item?.id) return;
    if (item.type === 'job') {
      openVerificationFromJob(item.id);
      return;
    }
    openVerificationOccurrence(item);
  };

  const openClientActivity = (activity) => {
    if (activity?.meta?.targetType === 'job-review' && activity?.meta?.jobId) {
      openVerificationFromJob(activity.meta.jobId);
      return;
    }
    if (
      activity?.meta?.targetType === 'occurrence-review' &&
      activity?.meta?.occurrenceId &&
      activity?.meta?.contractId
    ) {
      openVerificationOccurrence({
        id: activity.meta.occurrenceId,
        contractId: activity.meta.contractId
      });
      return;
    }
    openNotifications();
  };

  const isAuthLayout = !currentUser || currentScreen === 'worker-setup';

  return (
    <div className={`app-stage min-h-screen ${isAuthLayout ? '' : 'flex justify-center items-center py-5 px-4'} relative overflow-hidden`}>
      <div className={`${isAuthLayout ? 'w-full min-h-screen overflow-y-auto' : 'phone-shell w-full max-w-md md:max-w-4xl lg:max-w-6xl min-h-[94vh] md:min-h-[88vh] overflow-hidden'} relative`}>
        {!currentUser && currentScreen === 'welcome' && (
          <WelcomeScreen
            onSignUp={() => {
              setAuthMode('signup');
              setCurrentScreen('auth');
            }}
            onSignIn={() => {
              setAuthMode('signin');
              setCurrentScreen('auth');
            }}
          />
        )}

        {!currentUser && currentScreen === 'auth' && (
          <AuthPage
            authMode={authMode}
            onAuthenticate={handleAuthenticate}
            onResetPassword={handleResetPassword}
            onBack={() => setCurrentScreen('welcome')}
          />
        )}

        {currentUser && currentScreen === 'worker-setup' && (
          <WorkerSetupPage
            services={services}
            currentUser={currentUser}
            onSave={handleWorkerSetupSave}
          />
        )}

        {!currentUser && !['welcome', 'auth'].includes(currentScreen) && (
          <WelcomeScreen
            onSignUp={() => {
              setAuthMode('signup');
              setCurrentScreen('auth');
            }}
            onSignIn={() => {
              setAuthMode('signin');
              setCurrentScreen('auth');
            }}
          />
        )}

        {currentUser && currentScreen === 'home' && !isCompanyAccount && (
          <ClientHomePage
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAccount={() => setCurrentScreen('account')}
            onOpenNotifications={openNotifications}
            onOpenMenu={() => setIsClientMenuOpen(true)}
            unreadNotifications={unreadNotifications}
            user={currentUser}
            onOpenContracts={() => setCurrentScreen('contracts')}
            onOpenVerificationItem={openClientVerificationItem}
            onOpenCompanies={openAllWorkers}
            companiesCount={companyCatalog.length}
            verificationQueue={clientVerificationQueue}
            verificationStats={clientVerificationStats}
            recentActivities={clientRecentActivities}
            onOpenActivity={openClientActivity}
          />
        )}

        {currentUser && currentScreen === 'home' && isCompanyAccount && (
          <CompanyHomePage
            completedJobs={completedJobs}
            pendingRequests={isCompanyRole ? myPendingRequests.length : 0}
            rating={companyRating}
            upcomingJob={upcomingCompanyJob}
            activeJobsCount={activeJobsCount}
            workers={myWorkers}
            isCompany={isCompanyRole}
            onAddWorker={handleCreateWorker}
            onNavigate={handleWorkerNavigate}
            onOpenRequests={() => {
              if (isCompanyRole) setCurrentScreen('requests');
            }}
          />
        )}

        {currentUser && currentScreen === 'profile' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <WorkerProfile
              worker={selectedWorker}
              onBack={() => setCurrentScreen(profileReturnScreen)}
              onCall={callSelectedWorker}
              onToggleBookmark={toggleSelectedWorkerBookmark}
              onViewLatestUpdate={openSelectedWorkerLatestUpdate}
              onBook={handleBook}
              actionLabel={
                !currentUser
                  ? 'Sign in to continue'
                  : currentUser.role === 'company'
                    ? 'Open Jobs'
                    : currentUser.role === 'worker'
                      ? 'Open Assigned Jobs'
                      : 'Request Service'
              }
            />
          </div>
        )}

        {currentUser && currentScreen === 'jobs' && currentUser.role === 'client' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <MyJobs
              jobs={myClientJobs}
              onOpenVerify={openVerificationFromJob}
              onOpenVerifiedDetails={openVerifiedDetailsFromJob}
              onCallWorker={handleClientCallFromJob}
            />
          </div>
        )}
        {currentUser && currentScreen === 'jobs' && isCompanyAccount && (
          <WorkerAssignedWorkScreen
            jobs={myCompanyJobs}
            workers={myWorkers}
            isCompany={currentUser.role === 'company'}
            focusJobId={pendingCompanyAssignmentJobId}
            onFocusHandled={() => setPendingCompanyAssignmentJobId(null)}
            workerCategories={currentUser.workerCategories || []}
            onStartJob={handleStartJob}
            onAssignWorker={handleAssignWorker}
            onUpdateActiveJob={handleUpdateActiveJob}
            onRequestReschedule={handleWorkerRescheduleRequest}
            onSubmitProgress={handleSubmitProgress}
            onOpenLogNewUpdate={isCompanyRole ? () => setCurrentScreen('worker-log') : undefined}
            onOpenAccount={() => setCurrentScreen('account')}
            onLogout={handleLogout}
          />
        )}

        {currentUser && currentScreen === 'requests' && isCompanyRole && (
          <WorkerRequestsScreen
            requests={myPendingRequests}
            onAccept={acceptWorkerRequest}
            onDecline={declineWorkerRequest}
          />
        )}

        {currentUser && currentScreen === 'review-work' && (
          <VerificationReviewScreen
            job={(isCompanyAccount ? jobs : myClientJobs).find((job) => job.id === selectedReviewJobId)}
            onBack={() => setCurrentScreen('jobs')}
            onApprove={approveReview}
            onReject={rejectReview}
            readOnly={reviewReadOnly}
          />
        )}

        {currentUser && currentScreen === 'worker-log' && currentUser.role !== 'worker' && (
          <WorkerLogUpdateScreen
            categories={
              currentUser.role === 'client'
                ? (selectedWorker?.serviceType ? [selectedWorker.serviceType] : services.map(s => s.name))
                : (currentUser.workerCategories || [])
            }
            workers={myWorkers}
            isCompany={currentUser.role === 'company'}
            isClientRequest={currentUser.role === 'client'}
            initialClientName={currentUser.name}
            onBack={() => setCurrentScreen(currentUser.role === 'client' ? 'profile' : 'jobs')}
            onSubmit={handleWorkerLogNewUpdate}
          />
        )}

        {currentUser && currentScreen === 'workers' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <WorkersScreen
              workers={currentUser.role === 'client' ? companyCatalog : filteredWorkers}
              onOpenProfile={handleProfileOpen}
              title={currentUser.role === 'client' ? 'Companies' : 'Workers'}
              emptyText={
                currentUser.role === 'client'
                  ? 'No companies match your search or selected service.'
                  : 'No workers match your search.'
              }
              onBack={
                currentUser.role === 'client' && clientWorkersFromServices
                  ? () => {
                    setClientWorkersFromServices(false);
                    setSelectedServiceFilter('');
                    setSearchQuery('');
                    setCurrentScreen('services');
                  }
                  : undefined
              }
            />
          </div>
        )}

        {currentUser && currentScreen === 'services' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <ServicesScreen services={filteredServices} onSelectService={jumpToWorkersByService} />
          </div>
        )}

        {currentUser && currentScreen === 'contracts' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <ContractsScreen
              role={currentUser.role}
              contracts={myContracts}
              occurrences={selectedContractOccurrences}
              initialExpandedOccurrenceId={focusedOccurrenceId}
              onFocusedOccurrenceHandled={() => setFocusedOccurrenceId(null)}
              workerOptions={contractWorkerOptions}
              selectedContractId={selectedContractId}
              onSelectContract={setSelectedContractId}
              onCreateYearlyContract={handleCreateYearlyContract}
              onDeleteContract={handleDeleteContract}
              onStartOccurrence={handleStartOccurrence}
              onSubmitOccurrence={handleSubmitOccurrence}
              onApproveOccurrence={handleApproveOccurrence}
              onRejectOccurrence={handleRejectOccurrence}
              onMarkMissed={handleMarkOccurrenceMissed}
            />
          </div>
        )}

        {currentUser && currentScreen === 'account' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <AccountScreen
              user={currentUser}
              onBack={() => setCurrentScreen('home')}
              onSaveProfile={handleSaveProfile}
              onClearDemoData={handleClearDemoData}
              onLogout={handleLogout}
              onOpenAuth={() => {
                setAuthMode('signin');
                setCurrentScreen('auth');
              }}
            />
          </div>
        )}
        {currentUser && currentScreen === 'notifications' && (
          <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
            <NotificationsScreen
              notifications={visibleNotifications}
              role={currentUser?.role}
              onBack={() => setCurrentScreen('home')}
              onMarkAllRead={markRoleNotificationsRead}
              onMarkRead={markNotificationRead}
            />
          </div>
        )}

        {currentUser?.role === 'client' && isClientMenuOpen && (
          <div className="absolute inset-0 z-50">
            <button
              type="button"
              onClick={() => setIsClientMenuOpen(false)}
              className="absolute inset-0 bg-black/35"
              aria-label="Close menu"
            />
            <aside className="absolute top-0 right-0 h-full w-[82%] max-w-xs bg-white border-l border-gray-100 shadow-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Menu</p>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-4">{currentUser.name}</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('home')}
                  className="w-full text-left rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={openNotifications}
                  className="w-full text-left rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Notifications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClientWorkersFromServices(false);
                    setSelectedServiceFilter('');
                    setSearchQuery('');
                    setCurrentScreen('services');
                  }}
                  className="w-full text-left rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Services
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('jobs')}
                  className="w-full text-left rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  My Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('account')}
                  className="w-full text-left rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {currentUser && !['profile', 'auth', 'review-work', 'account', 'notifications', 'welcome', 'worker-setup', 'worker-log'].includes(currentScreen) && (
          <BottomNav
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            role={currentUser?.role}
            navItems={isCompanyAccount ? companyNavItems : currentUser?.role === 'client' ? clientNavItems : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default App;
