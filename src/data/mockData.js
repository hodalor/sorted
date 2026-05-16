const categories = [];

const appSettings = {
  general: {
    otpProvider: 'firebase',
  },
  mobile: {
    allowProviderOnboarding: true,
    showMessagesTab: true,
    compactCards: true,
  },
  web: {
    compactMenu: true,
    stickyBottomMenu: true,
    showProviderPrompt: true,
  },
};

const countries = [];

const appUsers = [];

const providers = [];

const services = [];

const bookings = [];

const reviews = [];

module.exports = {
  categories,
  countries,
  providers,
  services,
  bookings,
  appUsers,
  reviews,
  appSettings,
};
