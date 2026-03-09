import { createContext, useContext, useState } from 'react'

const Ctx = createContext()

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('se_token'))
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('se_user') || 'null'))

    const login = (token, user) => {
        localStorage.setItem('se_token', token)
        localStorage.setItem('se_user', JSON.stringify(user))
        setToken(token); setUser(user)
    }
    const logout = () => {
        localStorage.removeItem('se_token')
        localStorage.removeItem('se_user')
        setToken(null); setUser(null)
    }
    return <Ctx.Provider value={{ token, user, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)