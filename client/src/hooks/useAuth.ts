// Disabled authentication system - no more popups or freezing
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}
