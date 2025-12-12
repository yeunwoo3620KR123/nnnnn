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

const MyOrders = () => {
const { user, isLogin } = useContext(AuthContext);
const navigate = useNavigate();
const [orders, setOrders] = useState([]);

useEffect(() => {
if (!isLogin) {
    alert("로그인이 필요합니다.");
    navigate("/login");
    return;
}
fetchOrders();
}, [isLogin, user]);

const fetchOrders = async () => {
try {
    const response = await fetch(
    `http://localhost:8080/order/user/${user.id}`
    );

    if (!response.ok) {
    const err = await response.json();
    alert(err.error || "주문 조회 실패");
    return;
    }

    const data = await response.json();
    console.log(data)
    const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    setOrders(sorted);

} catch (err) {
    console.error("주문 조회 실패:", err);
}
};

return (
<div style={{ maxWidth: "900px", margin: "50px auto" }}>
    
    <h2>내 주문 내역</h2>

    {orders.length === 0 ? (
    <p>주문 내역이 없습니다.</p>
    ) : (
    <table style={tableStyle}>
        <thead>
        <tr>
            <th style={thTdStyle}>주문번호</th>
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
        {/* 첫 번째 상품일 때만 주문번호, 총액, 주문일에 rowSpan 적용 */}
        {index === 0 && (
          <td style={thTdStyle} rowSpan={itemCount}>{order.orderId}</td>
        )}

        <td style={thTdStyle}>{item.pName}</td>

        <td style={thTdStyle}>
          <img
            src={`http://localhost:8080${item.image}` || "/default-image.png"}
            alt=""
            style={imageStyle}
          />
        </td>

        <td style={thTdStyle}>{item.amount}</td>

        {index === 0 && (
          <td style={thTdStyle} rowSpan={itemCount}>{order.totalAmount.toLocaleString()}원</td>
        )}
        {index === 0 && (
          <td style={thTdStyle} rowSpan={itemCount}>{new Date(order.orderDate).toLocaleString()}</td>
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

export default MyOrders;