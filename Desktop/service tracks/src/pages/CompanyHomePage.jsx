import WorkerDashboardScreen from '../components/WorkerDashboardScreen';

function CompanyHomePage({
  completedJobs,
  pendingRequests,
  rating,
  upcomingJob,
  activeJobsCount,
  workers,
  isCompany,
  onAddWorker,
  onNavigate,
  onOpenRequests
}) {
  return (
    <WorkerDashboardScreen
      completedJobs={completedJobs}
      pendingRequests={pendingRequests}
      rating={rating}
      upcomingJob={upcomingJob}
      activeJobsCount={activeJobsCount}
      workers={workers}
      isCompany={isCompany}
      onAddWorker={onAddWorker}
      onNavigate={onNavigate}
      onOpenRequests={onOpenRequests}
    />
  );
}

export default CompanyHomePage;
