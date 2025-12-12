import {useState,useEffect, useContext } from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const Order = () => {
  const { isLogin, user, logout } = useContext(AuthContext);
  const userId = user?.id;
  const [items, setItems] = useState([]);
  const [selectPay, setSelectPay] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [deliveryName, setDeliveryName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isSameAddress, setIsSameAddress] = useState(false);

  useEffect(() => {
      if(location.state?.selectedItems){
        setItems(location.state.selectedItems);
      } else {
        alert('주문할 상품이 없습니다. 다시 선택해주세요.');
        navigate('/cart');
      }
    }, [location, navigate]);

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        setZipCode(data.zonecode);
        setAddress(addr);
        document.getElementById('detailAddress').focus();
      }
    }).open();
  };
  async function pass(){
    if (!isLogin || !userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!zipCode || !address) {
      alert('배송지 주소를 입력해주세요');
      return;
    }
    if (!deliveryName) {
      alert('배송지명을 입력해주세요');
      return;
    }
    if (!recipient) {
      alert('받는 분을 입력해주세요');
      return;
    }
    if (!phone) {
      alert('연락처를 입력해주세요');
      return;
    }
    if (!selectPay) {
      alert('결제 방법을 선택해주세요');
      return;
    }

    try {
      const orderData = {
        userId: userId,
        zipCode,
        address,
        detailAddress,
        deliveryName,
        recipient,
        phone,
        deliveryMessage,
        paymentMethod: selectPay,
        items,
        totalAmount
      };

      const response = await fetch('http://localhost:8080/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('주문이 완료되었습니다!');
        navigate('/done', { state: { orderId: result.orderId } });
      } else {
        alert(result.error || '주문 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('주문 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  }
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.amount, 0);

  const userInfo = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8080/order/info/${userId}`); 
      
      if (response.ok) {
        const data = await response.json();
        setRecipient(data.name || '');
        setPhone(data.phone || '');
      } else {
        console.log("정보 조회 실패");
      }
    } catch (error) {
      console.error('API 호출 에러:', error);
    }
  };

    const handleSameAddressCheck = (e) => {
      setIsSameAddress(e.target.checked);
      if (e.target.checked) {
        userInfo();
      } else {
        setRecipient('');
        setPhone('');
      }
    };

    
  return (
    <div style={{maxWidth:'600px', margin:'0 auto'}}>
    <h2 style={{textAlign:'center', marginBottom:'30px'}}>주문 / 결제</h2>
        <div  style={{marginBottom:'40px'}} className="section shipping-info">
          <h3 style={{borderBottom:'2px solid #ddd', paddingBottom:'10px'}}>배송지 정보</h3>
          <label>
            <input type="checkbox" onChange={handleSameAddressCheck} /> 정보 불러오기<br/>
          </label>
        <div style={{display:'flex', gap:'10px'}}>
                <input className="input" type="text" value={zipCode} readOnly placeholder="우편번호" style={{width:'150px'}}/>
                <button className="btn" type="button" onClick={openAddressSearch} style={{backgroundColor:'#666'}}>주소 검색</button>
        </div>
        <input className="input" type="text" value={address} readOnly placeholder="주소"/>
            <input className="input" type="text" id="detailAddress" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="상세주소 입력"/>
            
            <div style={{display:'flex', gap:'10px'}}>
                <input className="input" type="text" placeholder="배송지명 (예: 우리집)" value={deliveryName} onChange={(e)=>setDeliveryName(e.target.value)}/>
                <input className="input" type="text" placeholder="받는 분" value={recipient} onChange={(e)=>setRecipient(e.target.value)}/>
            </div>
            <input className="input" type="text" placeholder="연락처 (- 없이 입력)" value={phone} onChange={(e)=>setPhone(e.target.value)}/>
        </div>
        <div>
            <h2>배송 요청사항</h2>
            <select className="input" value={deliveryMessage} 
              onChange={(e)=>setDeliveryMessage(e.target.value)}>
                <option value="">배송메시지를 선택해주세요.</option>
                <option value="문앞에 놔주세요">문앞에 놔주세요</option>
                <option value="배송함에 놔주세요">배송함에 놔주세요</option>
                <option value="경비실에 놔주세요">경비실에 놔주세요</option>
                <option value="직접수령">직접수령</option>
            </select>
            <div style={{marginBottom:'40px'}}>
              <div style={{marginBottom:'40px'}}>
                <h3 style={{borderBottom:'2px solid #ddd', paddingBottom:'10px'}}>주문 상품</h3>
                  {items.length === 0 ? (
                    <div style={{marginBottom:'40px'}}>
                      <p>장바구니가 비었습니다.</p>
                    </div>
                  ):(
                    <ul style={{marginTop:'15px', padding:'0', border:'1px solid #eee', borderRadius:'8px'}}>
                      {items.map((item)=>(
                        <li key={item.id}>
                          <div>
                            <img src={`http://localhost:8080${item.image}`} alt={item.name}
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover'
                            }}/>
                          </div>
                          <div>
                            <span style={{fontWeight:'bold'}}>
                              {item.name} x {item.amount}개
                            </span>
                            <span style={{fontWeight:'bold'}}>
                              {(item.price * item.amount).toLocaleString()}원
                            </span>
                            <div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>    
            </div>
            <div style={{marginBottom:'40px'}}>
            <h3 style={{borderBottom:'2px solid #ddd', paddingBottom:'10px'}}>결제 수단</h3>
            <div style={{display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'15px'}} onChange={(e) => setSelectPay(e.target.value)}>
                {['신용카드', '계좌이체', '휴대폰결제', '네이버페이', '카카오페이'].map((pay) => (
                    <label key={pay} style={{padding:'10px 20px', border:'1px solid #ddd', borderRadius:'20px', cursor:'pointer', backgroundColor: selectPay === pay ? '#e0f7fa' : 'white'}}>
                        <input type="radio" value={pay} name="pay" style={{marginRight:'5px'}}/> {pay}
                    </label>
                ))}
            </div>
            </div>
            <div style={{textAlign:'center', padding:'30px', backgroundColor:'#f9f9f9', borderRadius:'10px'}}>
            <h2 style={{color:'var(--main-color)', marginBottom:'20px'}}>총 결제금액: {totalAmount.toLocaleString()}원</h2>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
              <button className="btn" style={{backgroundColor:'#aaa', width:'150px'}} onClick={()=>window.history.back()}>취소</button>
              <button className="btn" style={{width:'200px'}} onClick={pass}>결제하기</button>
            </div>
            </div>
        </div>
    </div>
  )
}

export default Order
