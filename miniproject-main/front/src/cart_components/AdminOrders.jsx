// import { useEffect, useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// // 🎨 테이블 스타일
// const tableStyle = {
//   width: "100%",
//   borderCollapse: "collapse",
//   marginTop: "20px",
//   textAlign: "center"
// };

// const thTdStyle = {
//   border: "1px solid #ddd",
//   padding: "8px"
// };

// const AdminOrders = () => {
//   const { user, isLogin } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     if (!isLogin || user.admin !== 1) {
//       alert("관리자만 접근할 수 있습니다.");
//       navigate("/");
//       return;
//     }

//     fetchOrders();
//   }, [isLogin, user, navigate]);

//   const fetchOrders = async () => {
//     try {
//       const response = await fetch("http://localhost:8080/order/admin", {
//         method: "GET",
//         credentials: "include" // 세션 전달
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         alert(err.error || "주문 조회 실패");
//         return;
//       }

//       const data = await response.json();

//       // 주문일 기준 최신순 정렬
//       const sortedOrders = data.sort(
//         (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
//       );

//       setOrders(sortedOrders);
//     } catch (err) {
//       console.error("주문 조회 실패:", err);
//     }
//   };

//   return (
//     <div style={{ maxWidth: "1000px", margin: "50px auto" }}>
//       <h2>전체 주문 내역 (관리자)</h2>
//       {orders.length === 0 ? (
//         <p>주문 내역이 없습니다.</p>
//       ) : (
//         <table style={tableStyle}>
//           <thead>
//             <tr style={{ backgroundColor: "#f2f2f2" }}>
//               <th style={thTdStyle}>주문번호</th>
//               <th style={thTdStyle}>회원ID</th>
//               <th style={thTdStyle}>상품명</th>
//               <th style={thTdStyle}>수량</th>
//               <th style={thTdStyle}>총액</th>
//               <th style={thTdStyle}>주문일</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order, orderIndex) =>
//               order.items.map((item, itemIndex) => (
//                 <tr
//                   key={`order-${order.orderId || orderIndex}-item-${
//                     item.orderItemId || itemIndex
//                   }`}
//                 >
//                   {/* 첫 번째 상품 row에만 주문번호, 회원ID, 총액, 주문일 표시 */}
//                   {itemIndex === 0 && (
//                     <>
//                       <td style={thTdStyle} rowSpan={order.items.length}>
//                         {order.orderId}
//                       </td>
//                       <td style={thTdStyle} rowSpan={order.items.length}>
//                         {order.userId}
//                       </td>
//                     </>
//                   )}
//                   <td style={{ ...thTdStyle, textAlign: "left" }}>{item.pName}</td>
//                   <td style={thTdStyle}>{item.amount}</td>
//                   {itemIndex === 0 && (
//                     <>
//                       <td style={thTdStyle} rowSpan={order.items.length}>
//                         {order.totalAmount.toLocaleString()}원
//                       </td>
//                       <td style={thTdStyle} rowSpan={order.items.length}>
//                         {new Date(order.orderDate).toLocaleString()}
//                       </td>
//                     </>
//                   )}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default AdminOrders;

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  textAlign: "center"
};

const thTdStyle = {
  border: "1px solid #ddd",
  padding: "8px"
};

const imageStyle = {
  width: "60px",
  height: "60px",
  objectFit: "cover"
};

const AdminOrders = () => {
  const { user, isLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isLogin || user.admin !== 1) {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/");
      return;
    }
    fetchOrders();
  }, [isLogin, user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8080/order/admin", {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "주문 조회 실패");
        return;
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("주문 조회 실패:", err);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "50px auto" }}>
      <h2>전체 주문 내역 (관리자)</h2>
      
      {orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thTdStyle}>주문번호</th>
              <th style={thTdStyle}>회원ID</th>
              <th style={thTdStyle}>상품명</th>
              <th style={thTdStyle}>이미지</th>
              <th style={thTdStyle}>수량</th>
              <th style={thTdStyle}>총액</th>
              <th style={thTdStyle}>주문일</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const itemCount = order.items.length;

              return order.items.map((item, index) => (
                <tr key={`order-${order.orderId}-item-${item.orderItemId}`}>
                  {index === 0 && (
                    <>
                      <td style={thTdStyle} rowSpan={itemCount}>{order.orderId}</td>
                      <td style={thTdStyle} rowSpan={itemCount}>{order.userId}</td>
                    </>
                  )}

                  <td style={thTdStyle}>{item.pName}</td>
                  <td style={thTdStyle}>
                    <img src={`http://localhost:8080${item.pImage}` || "/default-image.png"} alt="" style={imageStyle} />
                  </td>
                  
                  <td style={thTdStyle}>{item.amount}</td>

                  {index === 0 && (
                    <>
                      <td style={thTdStyle} rowSpan={itemCount}>{order.totalAmount.toLocaleString()}원</td>
                      <td style={thTdStyle} rowSpan={itemCount}>{new Date(order.orderDate).toLocaleString()}</td>
                    </>
                  )}
                </tr>
              ));
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
