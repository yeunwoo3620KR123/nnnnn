import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function MainPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userNickname, setUserNickname] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/users/", { credentials: 'include'})
        .then(res => {
            if (!res.ok) throw new Error("로그인이 필요합니다");
            return res.json();
        })
        .then(data => setUser(data.user))
        .catch(err => {
                alert(err.message);
                navigate('/login'); 
            });
        }, [navigate]);

    function settingsClick () {
        navigate('/settings');
    }

    if (!user) return <div>Loading...</div>

    return (
        <div style={{maxWidth:'600px', margin:'50px auto', textAlign:'center'}}>
            <h1 style={{marginBottom:'10px'}}>마이 페이지</h1>
            {user.admin == 1? (
                <p style={{color:'#666', marginBottom:'40px'}}>반갑습니다, 관리자 <strong>{user?.nickname}</strong>님!</p>
            ) : (
                <p style={{color:'#666', marginBottom:'40px'}}>반갑습니다, <strong>{user?.nickname}</strong>님!</p>
            )}  
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div className="card" style={{padding:'30px', cursor:'pointer'}} onClick={() => navigate('/settings')}>
                    <h3 style={{marginBottom:'10px'}}>⚙️ 회원 설정</h3>
                    <p style={{fontSize:'14px', color:'#888'}}>내 정보 수정 및 탈퇴</p>
                </div>

                <div className="card" style={{padding:'30px', cursor:'pointer'}} onClick={() => navigate('/cart')}>
                    <h3 style={{marginBottom:'10px'}}>🛒 장바구니</h3>
                    <p style={{fontSize:'14px', color:'#888'}}>담아둔 상품 확인</p>
                </div>

                
                {/* 회원용 주문 조회 버튼 (모든 회원) */}
                <div className="card" style={{ padding: '30px', cursor: 'pointer' }} onClick={() => navigate('/myorders')}>
                    <h3>📦 내 주문 조회</h3>
                    <p style={{ color: '#888' }}>내 주문 내역 확인</p>
                </div>


{/* 관리자 전용 버튼들 */}
                {user.admin === 1 && (
                    <>
                        {/* 관리자 페이지 */}
                        <div className="card" style={{ padding: '30px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                            <h3>🛠 관리자 페이지</h3>
                            <p style={{ color: '#888' }}>상품 등록 및 관리</p>
                        </div>

                        {/* 관리자용 주문 조회 버튼 */}
                        <div className="card" style={{ padding: '30px', cursor: 'pointer' }} onClick={() => navigate('/adminorder')}>
                            <h3>📦 주문 조회 (관리자)</h3>
                            <p style={{ color: '#888' }}>모든 주문 내역 확인</p>
                        </div>
                    </>
                )}


            </div>
        </div>
    )
}

export default MainPage