import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import Sidebar from './components/Sidebar';
import LoadingDots from './components/LoadingDots';
import Topbar from './components/Topbar';
import Toast from './components/Toast';
import OverviewPage from './pages/OverviewPage';
import UsersPage from './pages/UsersPage';
import ProvidersPage from './pages/ProvidersPage';
import BookingsPage from './pages/BookingsPage';
import ReviewsPage from './pages/ReviewsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './styles/admin.css';

function App() {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [providerTab, setProviderTab] = useState('pending');
  const [settingsTab, setSettingsTab] = useState('general');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ general: {}, mobile: {}, web: {} });
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [countryForm, setCountryForm] = useState({
    name: '',
    code: '',
    dialingCode: '',
    currencySymbol: '',
  });
  const [statusMessage, setStatusMessage] = useState('Loading admin data...');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    providerStatus: '',
    categoryCreate: false,
    categoryDelete: '',
    countryCreate: false,
    countryDelete: '',
    platformSave: '',
  });

  const showToast = (type, message, title) => {
    setStatusMessage(message);
    setToast({
      id: Date.now(),
      type,
      title:
        title ||
        {
          success: 'Success',
          error: 'Error',
          warning: 'Warning',
          info: 'Notice',
        }[type] ||
        'Notice',
      message,
    });
  };

  const titles = useMemo(
    () => ({
      overview: ['Overview', 'Quick metrics and recent records'],
      users: ['Users', 'All registered users'],
      providers: ['Providers', 'Pending, approved, and rejected KYC'],
      bookings: ['Bookings', 'Booking records across the system'],
      reviews: ['Reviews', 'Ratings and comments'],
      reports: ['Reports', 'Revenue and platform summary'],
      settings: ['Settings', 'Manage categories and client settings'],
    }),
    []
  );

  const loadCore = useCallback(async () => {
    try {
      const [dashboardData, userData, bookingData, reviewData, categoryData, countryData, generalData, mobileData, webData] =
        await Promise.all([
          apiGet('/dashboard/overview'),
          apiGet('/users'),
          apiGet('/bookings'),
          apiGet('/reviews'),
          apiGet('/categories'),
          apiGet('/countries'),
          apiGet('/settings/general'),
          apiGet('/settings/mobile'),
          apiGet('/settings/web'),
        ]);

      setDashboard(dashboardData);
      setUsers(userData.items);
      setBookings(bookingData.items);
      setReviews(reviewData.items);
      setCategories(categoryData.items);
      setCountries(countryData.items);
      setPlatformSettings({ general: generalData.values, mobile: mobileData.values, web: webData.values });
      setStatusMessage('Admin synced successfully.');
    } catch (error) {
      showToast('error', error.message);
    }
  }, []);

  const loadProviders = useCallback(async (status) => {
    try {
      const providerData = await apiGet(`/services/providers?status=${status}`);
      setProviders(providerData.items);
    } catch (error) {
      showToast('error', error.message);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    loadProviders(providerTab);
  }, [loadProviders, providerTab]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleProviderStatus = async (providerId, status) => {
    try {
      setActionLoading((current) => ({
        ...current,
        providerStatus: `${providerId}-${status}`,
      }));
      await apiPatch(`/providers/${providerId}/status`, { status });
      await Promise.all([loadProviders(providerTab), loadCore()]);
      showToast('success', `Provider ${status} successfully.`);
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((current) => ({
        ...current,
        providerStatus: '',
      }));
    }
  };

  const handleCategoryCreate = async () => {
    try {
      setActionLoading((current) => ({
        ...current,
        categoryCreate: true,
      }));
      await apiPost('/categories', categoryForm);
      setCategoryForm({ name: '', icon: '' });
      const categoryData = await apiGet('/categories');
      setCategories(categoryData.items);
      showToast('success', 'Category created successfully.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((current) => ({
        ...current,
        categoryCreate: false,
      }));
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    try {
      setActionLoading((current) => ({
        ...current,
        categoryDelete: categoryId,
      }));
      await apiDelete(`/categories/${categoryId}`);
      const categoryData = await apiGet('/categories');
      setCategories(categoryData.items);
      showToast('success', 'Category removed successfully.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((current) => ({
        ...current,
        categoryDelete: '',
      }));
    }
  };

  const handleCountryCreate = async () => {
    try {
      setActionLoading((current) => ({
        ...current,
        countryCreate: true,
      }));
      await apiPost('/countries', countryForm);
      setCountryForm({ name: '', code: '', dialingCode: '', currencySymbol: '' });
      const countryData = await apiGet('/countries');
      setCountries(countryData.items);
      showToast('success', 'Country created successfully.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((current) => ({
        ...current,
        countryCreate: false,
      }));
    }
  };

  const handleCountryDelete = async (countryId) => {
    try {
      setActionLoading((current) => ({
        ...current,
        countryDelete: countryId,
      }));
      await apiDelete(`/countries/${countryId}`);
      const countryData = await apiGet('/countries');
      setCountries(countryData.items);
      showToast('success', 'Country removed successfully.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((current) => ({
        ...current,
        countryDelete: '',
      }));
    }
  };

  const handlePlatformChange = (platform, key, value) => {
    setPlatformSettings((current) => ({
      ...current,
      [platform]: {
        ...current[platform],
        [key]: typeof current[platform][key] === 'boolean' ? value === 'true' : value,
      },
    }));
  };

  const handlePlatformSave = async (platform) => {
    try {
      setActionLoading((current) => ({
        ...current,
        platformSave: platform,
      }));
      const response = await apiPatch(`/settings/${platform}`, platformSettings[platform]);
      showToast('success', response.message);
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setActionLoading((current) => ({
        ...current,
        platformSave: '',
      }));
    }
  };

  const renderPage = () => {
    switch (activeMenu) {
      case 'users':
        return <UsersPage users={users} />;
      case 'providers':
        return (
          <ProvidersPage
            activeTab={providerTab}
            onTabChange={setProviderTab}
            providers={providers}
            actionLoading={actionLoading}
            onStatusChange={handleProviderStatus}
          />
        );
      case 'bookings':
        return <BookingsPage bookings={bookings} />;
      case 'reviews':
        return <ReviewsPage reviews={reviews} />;
      case 'reports':
        return <ReportsPage dashboard={dashboard} />;
      case 'settings':
        return (
          <SettingsPage
            activeTab={settingsTab}
            onTabChange={setSettingsTab}
            categories={categories}
            categoryForm={categoryForm}
            onCategoryChange={(event) =>
              setCategoryForm((current) => ({
                ...current,
                [event.target.name]: event.target.value,
              }))
            }
            onCategoryCreate={handleCategoryCreate}
            onCategoryDelete={handleCategoryDelete}
            countries={countries}
            countryForm={countryForm}
            actionLoading={actionLoading}
            onCountryChange={(event) =>
              setCountryForm((current) => ({
                ...current,
                [event.target.name]: event.target.value,
              }))
            }
            onCountryCreate={handleCountryCreate}
            onCountryDelete={handleCountryDelete}
            platformSettings={platformSettings}
            onPlatformChange={handlePlatformChange}
            onPlatformSave={handlePlatformSave}
          />
        );
      case 'overview':
      default:
        return <OverviewPage dashboard={dashboard} />;
    }
  };

  const [title, subtitle] = titles[activeMenu] || titles.overview;

  return (
    <div className="admin-shell">
      <Sidebar activeMenu={activeMenu} onChange={setActiveMenu} />
      <div className="admin-content-shell">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Topbar title={title} subtitle={subtitle} statusMessage={statusMessage} />
        <main className="admin-content">
          {!dashboard && activeMenu === 'overview' ? (
            <div className="panel loading-panel">
              <LoadingDots />
              <p className="panel-copy">Loading admin data</p>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
