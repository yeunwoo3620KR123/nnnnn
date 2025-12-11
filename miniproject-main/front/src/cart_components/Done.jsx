import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Done = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
        navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{textAlign:'center', marginTop:'100px'}}>
      <div style={{fontSize:'80px'}}>🎉</div>
      <h1 style={{margin:'20px 0', color:'var(--main-color)'}}>주문이 완료되었습니다!</h1>
      <p style={{fontSize:'18px', color:'#666'}}>잠시 후 메인 페이지로 이동합니다...</p>
      
      <button className="btn" style={{marginTop:'30px'}} onClick={() => navigate('/')}>
        지금 바로 홈으로 가기
      </button>
    </div>
  )
}

export default Done