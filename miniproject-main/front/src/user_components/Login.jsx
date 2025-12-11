import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Context에서 login 정보 가져오기
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    // 그냥 Context에서 전부 끌어와서 쓸거라 위에거 필요 없음 오히려 저장값 불러올 때 에러남
     async function handleLogin() {
    // Context의 login 함수에 id, pw만 넘김
    const success = await login(id, pw);

    if (success) {
        navigate('/mypage'); // 로그인 성공 시 메인페이지로 이동
    } else {
        alert("아이디 또는 비밀번호가 일치하지 않습니다");
    }
}

    return (
         // 레이아웃을 위해 최대 너비 제한
        <div style={{maxWidth:'400px', margin:'50px auto'}}>
            <h1 style={{textAlign:'center', marginBottom:'20px'}}>로그인</h1>
            
            <div style={{marginBottom:'10px'}}>
                <input className="input" placeholder="아이디" onChange={(e) => setId(e.target.value)} />
            </div>
            <div style={{marginBottom:'20px'}}>
                <input className="input" type="password" placeholder="비밀번호" onChange={(e) => setPw(e.target.value)} />
            </div>
            
            <button className="btn" style={{width:'100%', marginBottom:'10px'}} onClick={handleLogin}>로그인</button>
            <button className="btn" style={{width:'100%', backgroundColor:'#aaa'}} onClick={() => navigate('/regist')}>회원가입</button>
        </div>
    )
}

export default Login
