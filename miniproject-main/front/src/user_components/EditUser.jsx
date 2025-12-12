import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";



function EditUser() {
    const { user, logout } = useContext(AuthContext);
    const userId = user?.id;
    const [pw, setPw] = useState("");
    const [nickname, setNickname] = useState(""); 
    const [name, setName] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState("");

    async function updateUsers() {
        if (!userId) {
            alert("로그인이 필요합니다.")
            return;
        }

    const res = await fetch("http://localhost:8080/users/edit", {
        method: "PUT",
        headers: { "Content-Type":"application/json" },
        credentials: "include", 
        body: JSON.stringify({
            user_pw: pw,
            user_nickname:nickname,
            user_name: name,
            user_gender: gender,
            user_dob: dob,
            user_phone: phone

        })
    });

        
    const data = await res.json();
        if (data.result) {
            alert("회원 정보 수정 완료. 다시 로그인 해주세요.");
            await logout();                 
            window.location.href = "/login";
        } else {
            alert("수정 실패");
        }    
    }        

    return (

    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>회원정보 수정</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>닉네임 변경</label>
            <input className="input" value={nickname} placeholder="변경할 닉네임" onChange={(e)=>setNickname(e.target.value)} />
        </div>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>비밀번호 변경</label>
            <input className="input" type="password" value={pw} placeholder="변경할 비밀번호" onChange={(e)=>setPw(e.target.value)} />
        </div>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>생년월일</label>
            <input value={dob} type="date" placeholder="YYYY-MM-DD" onChange={(e)=>setDob(e.target.value)}/> 
        </div>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>이름</label>
            <input className="input" value={name} placeholder="이름" onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>성별</label>
            <div style={{ display: 'flex', gap: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <label style={{ cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="M" onChange={(e)=>setGender(e.target.value)} /> 남성
                </label>
                <label style={{ cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="F" onChange={(e)=>setGender(e.target.value)} /> 여성
                </label>
            </div>
        </div>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>전화번호</label>
            <input className="input" type="tel" value={phone} placeholder="010-0000-0000" onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button className="btn" style={{ marginTop: '20px' }} onClick={updateUsers}>수정하기</button>
    </div>
</div>


);
}
    export default EditUser