import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function DeleteUser() {
    const [userId, setUserId] = useState("");
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); // ★ AuthContext에서 logout 가져오기

    async function deleteUsers() {
        if (!window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        const res = await fetch ("http://localhost:8080/users/delete", {
            method: "DELETE",
            headers: { "Content-Type":"application/json" },
            credentials: "include"  // ★ 로그인 세션 쿠키 보내기
        });

        const data = await res.json();
        if (data.result) {
            alert("회원 삭제 완료");

            await logout();          // ★ 전역 상태(user, isLoggedIn) 값 초기화
            navigate("/login");      // ★ 로그인 페이지 이동
        } else {
            alert("삭제 실패");
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '20px', color: '#ff6b6b' }}>회원 탈퇴</h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>탈퇴를 원하시면 아이디를 입력해주세요.</p>

            <input 
                className="input" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                placeholder="삭제할 아이디 입력" 
                style={{ marginBottom: '15px' }}
            /> 
            
            <button className="btn" style={{ width: '100%', backgroundColor: '#ff6b6b' }} onClick={deleteUsers}>
                회원정보 삭제
            </button>
        </div>
    )
}

export default DeleteUser;