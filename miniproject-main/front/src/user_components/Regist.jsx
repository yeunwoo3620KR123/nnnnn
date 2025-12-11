import { useState } from "react";
import { useNavigate } from "react-router-dom"; 

function Regist() {
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [dob, setDob] = useState("");
    const [name, setName] = useState("");
    const [gender,setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [nickname, setNickname] = useState("");
    
    


    function regist() {

    if (!nickname) 
        return alert("닉네임을 기입해주세요");
    if (!id) 
        return alert("아이디를 기입해주세요");
    if (!pw) 
        return alert("비밀번호를 기입해주세요");
    if (!dob) 
        return alert("생년월일을 선택해 주세요");
    if (!name) 
        return alert("성함을 기입해주세요");
    if (!gender) 
        return alert("성별을 선택해주세요");
    if (!phone) 
        return alert("전화번호를 기입해주세요");

        fetch("http://localhost:8080/users/regist",{
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                id:id,
                pw:pw,
                dob:dob,
                name:name,
                gender:gender,
                phone:phone,
                nickname:nickname
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.result) {
                alert("회원가입 완료")
                navigate('/login')
            }
            else {
                alert("이미 존재하는 아이디입니다")
            }
        })
    }

    return (
        <div style={{maxWidth:'500px', margin:'0 auto'}}>
            <h1 style={{textAlign:'center', marginBottom:'30px'}}>회원가입</h1>

            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <input className="input" placeholder="닉네임" onChange={(e)=>setNickname(e.target.value)} />
                <input className="input" placeholder="아이디" onChange={(e)=>setId(e.target.value)} />
                <input className="input" type="password" placeholder="비밀번호" onChange={(e)=>setPw(e.target.value)} />
            <input className="input" placeholder="이름" onChange={(e)=>setName(e.target.value)} />
            <div style={{display:'flex', gap:'10px'}}>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}/>
                <label><input type="radio" name="gender" value="M" onChange={(e)=>setGender(e.target.value)} /> 남성</label>
                <label><input type="radio" name="gender" value="F" onChange={(e)=>setGender(e.target.value)} /> 여성</label>
            </div>
            
                <input className="input" type="tel" placeholder="전화번호 (010-0000-0000)" onChange={(e) => setPhone(e.target.value)} />
                <button className="btn" style={{marginTop:'20px', width:'100%'}} onClick={regist}>가입하기</button>
            </div>
        </div>
    )
}

export default Regist