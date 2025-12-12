import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductList from './pro_components/ProductList.jsx';
import ProductDetail from './pro_components/ProductDetail.jsx';
import Order from './cart_components/Order'
import Cart from './cart_components/Cart'
import Done from './cart_components/Done'
import Header from './main_components/Header.jsx';
import Addproduct from './main_components/Addproduct.jsx'
import Search from './main_components/Search.jsx'
import AdminPage from './main_components/AdminPage';
import Login from './user_components/Login'
import Regist from './user_components/Regist.jsx';
import Settings from './user_components/Settings'
import EditUser from './user_components/EditUser'
import DeleteUser from './user_components/DeleteUser'
import MyPage from './user_components/MyPage.jsx'
import AuthProvider from './context/AuthContext.jsx';
import EditProuct from './main_components/EditProduct.jsx';
import MyOrders from './cart_components/MyOrders.jsx';
import AdminOrders from './cart_components/AdminOrder.jsx';

import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  useEffect(() => {
    if (userId) {
      setIsLoggedIn(true);
    }
  }, [userId]);

  const handleLogin = (id, name) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    setIsLoggedIn(true);
    setUserId(id);
    setUserName(name);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserId('');
    setUserName('');
    alert("로그아웃 되었습니다.");
  };

  const handleAddToCart = (productId, amount) => {
  const targetProduct = products.find(p => String(p.id) === String(productId));

    if (!targetProduct) {
        console.error("상품 정보를 찾을 수 없습니다.");
        return;
    }

    console.log(`장바구니 담기: ${targetProduct.name}, 가격: ${targetProduct.price}, 수량: ${amount}`);

    fetch('http://localhost:8080/pro/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pId: productId,
        id: userId,
        amount: amount,
        pName: targetProduct.name,   
        pPrice: targetProduct.price, 
        img: targetProduct.image     
      })
    })
    .then(res => res.json())
    .then(data => {
      if(data.result) {
        if(window.confirm("장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?")) {
        }
      } else {
        alert("장바구니 담기 실패");
      }
    })
    .catch(err => {
        console.error(err);
        alert("오류가 발생했습니다.");
    });
  };
  
const handleAddReview = async (productId, rating, content) => {
  try {
    const response = await fetch('http://localhost:8080/pro/addreview', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        productId,
        rating,
        content,
        userName: userName,
      })
    });
    
    const data = await response.json();
    
    if (data.result) {
      // ★ 리뷰 추가 성공 후 전체 리뷰 다시 불러오기
      const reviewsResponse = await fetch('http://localhost:8080/pro/reviews');
      const updatedReviews = await reviewsResponse.json();
      setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);
      
      alert("리뷰 작성이 완료되었습니다.");
    } else {
      alert("리뷰 작성 실패.");
    }
  } catch (error) {
    console.error("리뷰 작성 중 오류 발생:", error);
    alert("리뷰 작성 실패.");
  }
};

const handleProductAdded = async () => {
    try {
      const response = await fetch('http://localhost:8080/pro/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("상품 로딩 실패:", error);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:8080/pro/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("상품 로딩 실패:", error);
        setProducts([]);
      }
    }

    async function fetchReviews() {
      try {
        const response = await fetch('http://localhost:8080/pro/reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("리뷰 로딩 실패:", error);
      }
    }

    fetchProducts();
    fetchReviews();
  }, []);

  return (
    <AuthProvider>
    <BrowserRouter>
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
      <div className="container">
        <Routes>
          <Route path="/" element={<ProductList products={products} />} />
          <Route path="/detail/:productId" element={
            <ProductDetail
              products={products}
              reviews={reviews}
              onAddReview={handleAddReview}
              onAddToCart={handleAddToCart}
              userId={userId}/>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<Order />} />
          <Route path="/done" element={<Done />} />
          <Route path="/search" element={<Search />} />
          <Route path="/addproduct" element={<Addproduct onProductAdded={handleProductAdded} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/regist" element={<Regist />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/edit" element={<EditUser />} />
          <Route path="/settings/delete" element={<DeleteUser />} />
          <Route path='/admin' element={<AdminPage />} />
          <Route path='/editproduct' element={<EditProuct/>}/>
          <Route path='/adminorder' element={<AdminOrders/>}/>
          <Route path='/myorders' element={<MyOrders/>}/>
        </Routes>
      </div>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App