import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, AdminState, SignupData, User } from "@/types"
import { authService } from "@/services/auth.service"
import { registerUserTokenGetter, registerAdminTokenGetter } from "@/lib/api"

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null })

                try {
                    const response = await authService.login(email, password)
                    if (response.success && response.user) {
                        set({ 
                          user: response.user, 
                          token: response.token || null,
                          isAuthenticated: true, 
                          isLoading: false 
                        })
                        return { success: true, user: response.user }
                    } else {
                        set({ error: response.error || 'Invalid credentials', isLoading: false })
                        return { success: false, error: response.error || 'Invalid credentials' }
                    }
                } catch (error: unknown) {
                    const msg = error instanceof Error ? error.message : 'Server error'
                    set({ error: msg, isLoading: false })
                    
                    // Auto-clear error after 5 seconds
                    setTimeout(() => {
                      if (get().error === msg) set({ error: null })
                    }, 5000)

                    return { success: false, error: msg }
                }
            },

            signup: async (userData: SignupData) => {
                set({ isLoading: true, error: null })

                try {
                    const response = await authService.register(userData)
                    if (response.success && response.user) {
                        set({ 
                          user: response.user, 
                          token: response.token || null,
                          isAuthenticated: true, 
                          isLoading: false 
                        })
                        return { success: true, user: response.user }
                    } else {
                        set({ error: response.error || 'Registration failed', isLoading: false })
                        return { success: false, error: response.error || 'Registration failed' }
                    }
                } catch (error: any) {
                    const msg = error.message || 'Server error'
                    set({ error: msg, isLoading: false })

                    // Auto-clear error after 5 seconds
                    setTimeout(() => {
                      if (get().error === msg) set({ error: null })
                    }, 5000)

                    return { success: false, error: msg }
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false, error: null })
            },

            updateProfile: (updates: Partial<User>) => {
                const currentUser = get().user
                if (currentUser) {
                set({ user: { ...currentUser, ...updates } })
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

// Register a live in-memory token getter so api.ts never has to wait
// for Zustand's persist middleware to flush to localStorage.
registerUserTokenGetter(() => useAuthStore.getState().token)

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAdminAuthenticated: false,
      isLoading: false,
      error: null,

      adminLogin: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.adminLogin(email, password)
          if (response.success && response.admin) {
            set({ 
              admin: response.admin, 
              token: response.token || null,
              isAdminAuthenticated: true, 
              isLoading: false 
            })
            return { success: true }
          } else {
            set({ error: response.error || 'Invalid admin credentials', isLoading: false })
            return { success: false, error: response.error || 'Invalid admin credentials' }
          }
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Server error'
          set({ error: msg, isLoading: false })

          // Auto-clear error after 5 seconds
          setTimeout(() => {
            if (get().error === msg) set({ error: null })
          }, 5000)

          return { success: false, error: msg }
        }
      },

      adminLogout: () => {
        set({ admin: null, token: null, isAdminAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAdminAuthenticated: state.isAdminAuthenticated
      })
    }
  )
)

// Register a live in-memory token getter for the admin store too.
registerAdminTokenGetter(() => useAdminStore.getState().token)
