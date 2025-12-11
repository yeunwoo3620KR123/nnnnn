import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const storedUser = localStorage.getItem("user");
            
            if (!storedUser) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/users", { 
                    credentials: "include" 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        // 세션이 유효함
                        setUser(data.user);
                        setIsLogin(true);
                        // localStorage도 최신 정보로 업데이트
                        localStorage.setItem("user", JSON.stringify(data.user));
                    } else {
                        // 세션이 없음 - localStorage 정리
                        localStorage.removeItem("user");
                        setIsLogin(false);
                        setUser(null);
                    }
                } else {
                    // 세션 만료됨 - localStorage 정리
                    localStorage.removeItem("user");
                    setIsLogin(false);
                    setUser(null);
                }
            } catch (error) {
                console.error("세션 확인 오류:", error);
                // 에러 발생 시 localStorage 정리
                localStorage.removeItem("user");
                setIsLogin(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (id, pw) => {
        try {
            const res = await fetch("http://localhost:8080/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ id, pw }),
            });
            const data = await res.json();

            if (data.result) {
                const userRes = await fetch("http://localhost:8080/users", {
                    credentials: 'include',
                });
                const userData = await userRes.json();

                if (userData?.user) {
                    setIsLogin(true);
                    setUser(userData.user);
                    localStorage.setItem("user", JSON.stringify(userData.user));
                }
            }
            return data.result;
        } catch (err) {
            console.log("로그인 실패", err);
            return false;
        }
    };

    const logout = async () => {
        try {
            const res = await fetch("http://localhost:8080/users/logout", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            
            if (data.result) {
                setIsLogin(false);
                setUser(null);
                localStorage.removeItem("user");
            }
        } catch (error) {
            console.error("로그아웃 오류:", error);
            // 에러가 발생해도 클라이언트 측 로그아웃 처리
            setIsLogin(false);
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    return (
        <AuthContext.Provider value={{ isLogin, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
export { AuthContext };