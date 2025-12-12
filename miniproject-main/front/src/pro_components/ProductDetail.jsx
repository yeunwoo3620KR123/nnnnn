import { useState, useContext} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProductDetail({ products, reviews, onAddReview,onAddToCart}) {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const { user, isLogin } = useContext(AuthContext);
  const userId = user?.id;
  const [quantity, setQuantity] = useState(1);

  const productReviews = Array.isArray(reviews) 
    ? reviews.filter(r => String(r.pId) === productId)
    : [];
    
  const product = products?.find(p => String(p.id) === productId);

  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
    : 0;

  const handleQuantityButton = (type) => {
    if (!product) return;
    setQuantity(prev => {
      if (type === 'plus' && prev < product.stock) return prev + 1;
      else if (type === 'minus' && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleQuantityChange = (event) => {
    if (!product) return;
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= product.stock) setQuantity(value);
    else if (value < 1) setQuantity(1);
  };

  const renderStars = (score) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} style={{ color: i <= score ? '#FFD700' : '#E0E0E0' }}>★</span>);
    }
    return stars;
  };

  const renderStarSelect = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => setRating(i)}
          style={{ cursor: 'pointer', color: i <= rating ? '#FFD700' : '#E0E0E0', fontSize:'24px' }}
        >★</span>
      );
    }
    return <div style={{marginBottom:'10px'}}>{stars} <span style={{fontSize:'14px'}}>({rating}점)</span></div>;
  };

  const handleSubmitReview = async () => {
    if (!isLogin || !userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) { 
      alert("리뷰 내용을 입력해주세요."); 
      return; 
    }
    if (rating === 0) {
        alert("별점을 선택해주세요.");
        return;
    }
    await onAddReview(productId, rating, reviewComment);
    setReviewComment('');
    setRating(0);
  };

  if (!product) {
    return (
      <div style={{textAlign:'center', padding:'50px'}}>
        <h1>상품을 찾을 수 없습니다.</h1>
        <button className="btn" onClick={() => navigate('/')}>목록으로</button>
      </div>
    );
  }

  const moveCart = async () => {
    if (!isLogin || !userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
        const response = await fetch('http://localhost:8080/pro/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                pId: product.id,
                id: userId,
                amount: quantity,
                img: product.image,
                pName: product.name,
                pPrice: product.price
            })
        });
        
        const data = await response.json();
        
        if (data.result) {
            alert('장바구니에 담겼습니다.');
            const goToCart = window.confirm('장바구니로 이동하시겠습니까?');
            if (goToCart) {
                navigate('/cart');
            }
        } else {
            alert('장바구니 담는중 오류 발생');
        }
    } catch (error) {
        console.error('장바구니 추가 오류:', error);
        alert('장바구니 추가 실패');
    }
}

const buyNow = async () => {
  if (!isLogin || !userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
  }
  
  try {
      const response = await fetch('http://localhost:8080/pro/buynow', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
              pId: product.id,
              id: userId,
              amount: quantity,
              pName: product.name,
              pPrice: product.price
          })
      });
      
      const data = await response.json();

      if (!response.ok) {
          alert('오류가 발생했습니다.');
          return;
      }
      
      if (data.result) {
          const imagePath = product.image.replace('http://localhost:8080', '');
          
          navigate('/order', { 
              state: { 
                  selectedItems: [{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: imagePath,
                      amount: quantity,
                      stock: product.stock
                  }]
              }
          });
      } else {
          alert(data.message || '오류가 발생했습니다.');
      }
  } catch (error) {
      console.error('오류:', error);
      alert('오류가 발생했습니다.');
  }
}

const calculateAgeStats = (reviews) => {
  const stats = { '10대': 0, '20대': 0, '30대': 0, '40대': 0, '50대 이상': 0 };
  const total = reviews.length;

  if (total === 0) return null;

  reviews.forEach(review => {
    if (!review.dob) return; 

    const birthDate = new Date(review.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    if (age < 20) stats['10대']++;
    else if (age < 30) stats['20대']++;
    else if (age < 40) stats['30대']++;
    else if (age < 50) stats['40대']++;
    else stats['50대 이상']++;
  });

  const percentages = {};
  for (const group in stats) {
    percentages[group] = Math.round((stats[group] / total) * 100);
  }
  
  return percentages;
};

const ageStats = calculateAgeStats(productReviews);

  return (
    <div style={{padding:'20px'}}>
      <button className="btn" style={{backgroundColor:'#aaa', marginBottom:'20px'}} onClick={() => navigate('/')}>← 목록으로</button>

      <div style={{display:'flex', flexWrap:'wrap', gap:'40px', marginBottom:'50px'}}>
        <div style={{flex:1, minWidth:'300px'}}>
            <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius:'12px', border:'1px solid #eee' }} />
        </div>

        <div style={{flex:1, minWidth:'300px'}}>
            <h4 style={{color:'#888'}}>{product.brand}</h4>
            <h1 style={{fontSize:'32px', margin:'10px 0'}}>{product.name}</h1>
            <p style={{fontSize:'24px', fontWeight:'bold', color:'var(--main-color)'}}>
                {product.price ? product.price.toLocaleString() : 0}원
            </p>
            
            {product.stock === 0 ? <p style={{color:'red'}}>❌ 품절</p> : product.stock <= 5 ? <p style={{color:'orange'}}>🔥 품절 임박</p> : null}
            
            <p style={{margin:'20px 0', lineHeight:'1.6'}}>{product.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>수량:</span>
                <button className="btn" style={{padding:'5px 10px'}} onClick={() => handleQuantityButton('minus')}>-</button>
                <input className="input" type="number" value={quantity} onChange={handleQuantityChange} style={{width:'60px', textAlign:'center', margin:'0 5px'}} />
                <button className="btn" style={{padding:'5px 10px'}} onClick={() => handleQuantityButton('plus')}>+</button>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
                <button 
                    className="btn" 
                    style={{flex:1, 
                    backgroundColor:'#fff', 
                    color:'var(--main-color)', 
                    border:'2px solid var(--main-color)'}} 
                    onClick={moveCart}>
                    장바구니
                </button>
                <button 
                    className="btn" 
                    style={{flex:1}} 
                    onClick={buyNow}>
                    바로 구매
                </button>
            </div>
        </div>
      </div>

      <hr style={{border:'0', borderTop:'1px solid #eee', margin:'40px 0'}} />

      {/* 리뷰 영역 */}
      <div>
        <h3>리뷰 ({productReviews.length}) ★{averageRating.toFixed(1)}</h3>
        
{ageStats && (
  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
    <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#555' }}>연령별 선호도</h4>
    
    {Object.entries(ageStats).map(([ageGroup, percent]) => (
      // 퍼센트가 0보다 클 때만 표시
      percent > 0 && (
        <div key={ageGroup} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
          {/* 라벨 (예: 20대) */}
          <span style={{ width: '60px', fontWeight: 'bold' }}>{ageGroup}</span>
          
          {/* 막대 그래프 배경 */}
          <div style={{ flex: 1, height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', marginRight: '10px' }}>
            {/* 실제 퍼센트 막대 (메인 컬러 사용) */}
            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#6B9AC4' }}></div>
          </div>
          
          {/* 퍼센트 숫자 */}
          <span style={{ width: '30px', textAlign: 'right', color: '#666' }}>{percent}%</span>
        </div>
      )
    ))}
  </div>
)}

        <div style={{backgroundColor:'#f9f9f9', padding:'20px', borderRadius:'12px', margin:'20px 0'}}>
            {renderStarSelect()}
            <div style={{display:'flex', gap:'10px'}}>
                <textarea className="input" style={{flex:1}} placeholder="리뷰를 남겨주세요..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                <button className="btn" onClick={handleSubmitReview}>등록</button>
            </div>
        </div>

        {productReviews.map((review, index) => (
          <div key={index} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                <strong>{review.userName || '익명'} {review.gender === 'M' ? '♂️' : '♀️'}</strong>
                <span style={{color:'#888', fontSize:'12px'}}>{new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div>{renderStars(review.rating)} <span style={{color:'#888'}}>({review.rating})</span></div>
            <p style={{marginTop:'10px'}}>{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductDetail;