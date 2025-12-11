import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

function Header() {
    const { isLogin, user, logout } = useContext(AuthContext);
    const [search, setSearch] = useState("");
    const [data, setData] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProducts() {
            const response = await fetch('http://localhost:8080/pro/products');
            const result = await response.json();
            setData(Array.isArray(result[0]) ? result[0] : result);
        }
        fetchProducts();
    }, []);
    const handleLogout = async () => {
        await logout();
        alert('로그아웃 되었습니다.');
        navigate('/');
    };

    function onClick() {
        const filterData = data.filter(item =>
        (item.pName || "").toLowerCase().includes((search || "").toLowerCase())
    );

    navigate(`/search?keyword=${search}`);
    setSearchResult(filterData);
    }

    return (

        <header className="header">
            <div className="logo">
                <Link to="/" style={{textDecoration:'none', color:'var(--main-color)'}}>SORA MARKET</Link>
            </div>
            <div style={{display:'flex', gap:'5px', flexGrow: 1, maxWidth:'400px', margin:'0 20px'}}>
                <input 
                    type="text" 
                    className="input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="상품을 검색하세요" />
                <button className="btn" value={search} onClick={onClick}>🔍</button> 
            </div>
            <nav className="nav">
                {isLogin ? (
                    <>
                        <span style={{ fontWeight: 'bold', color:'var(--main-color)' }}>{user?.nickname || "사용자"}님</span>
                        <Link to="/cart">장바구니</Link>
                        <Link to="/mypage">마이페이지</Link>
                        <button className="btn" style={{padding:'5px 10px', fontSize:'12px'}} onClick={handleLogout}>로그아웃</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">로그인</Link>
                        <Link to="/regist">회원가입</Link>
                        <Link to="/cart">장바구니</Link>
                    </>
                )}
            </nav>
        </header>
    )
}
export default Header;