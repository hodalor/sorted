import { useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
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

  const loadCore = async () => {
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
      setStatusMessage(error.message);
    }
  };

  const loadProviders = async (status) => {
    try {
      const providerData = await apiGet(`/services/providers?status=${status}`);
      setProviders(providerData.items);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  useEffect(() => {
    loadCore();
  }, []);

  useEffect(() => {
    loadProviders(providerTab);
  }, [providerTab]);

  const handleProviderStatus = async (providerId, status) => {
    try {
      await apiPatch(`/providers/${providerId}/status`, { status });
      await Promise.all([loadProviders(providerTab), loadCore()]);
      setStatusMessage(`Provider ${status} successfully.`);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleCategoryCreate = async () => {
    try {
      await apiPost('/categories', categoryForm);
      setCategoryForm({ name: '', icon: '' });
      const categoryData = await apiGet('/categories');
      setCategories(categoryData.items);
      setStatusMessage('Category created successfully.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    try {
      await apiDelete(`/categories/${categoryId}`);
      const categoryData = await apiGet('/categories');
      setCategories(categoryData.items);
      setStatusMessage('Category removed successfully.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleCountryCreate = async () => {
    try {
      await apiPost('/countries', countryForm);
      setCountryForm({ name: '', code: '', dialingCode: '', currencySymbol: '' });
      const countryData = await apiGet('/countries');
      setCountries(countryData.items);
      setStatusMessage('Country created successfully.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleCountryDelete = async (countryId) => {
    try {
      await apiDelete(`/countries/${countryId}`);
      const countryData = await apiGet('/countries');
      setCountries(countryData.items);
      setStatusMessage('Country removed successfully.');
    } catch (error) {
      setStatusMessage(error.message);
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
      const response = await apiPatch(`/settings/${platform}`, platformSettings[platform]);
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
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
        <Topbar title={title} subtitle={subtitle} statusMessage={statusMessage} />
        <main className="admin-content">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
