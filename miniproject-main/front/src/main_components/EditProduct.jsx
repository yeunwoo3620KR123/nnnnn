import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../context/AuthContext';

function ProductItem({ item, onUpdate }) {
    const [localStock, setLocalStock] = useState(''); 

    return (
        <div className="card2">
            <img 
                src={item.image} 
                alt={item.name} 
                className="card-img"
            />
            <p>상품명: {item.name}</p>
            <p>상품 설명: {item.description}</p>
            <p>카테고리: {item.category}</p>
            <p>가격: {item.price}</p>
            <p>현재 재고: {item.stock}</p>
            
            <input 
                className="input" 
                type="number" 
                placeholder="수량"
                value={localStock} // 입력창에 보여질 값
                onChange={(e) => setLocalStock(e.target.value)}
            />
            <button className="btn" onClick={() => onUpdate(item.id, localStock)}>
                수정
            </button>
        </div>
    );
}

function Editprouct() {
    const { user } = useContext(AuthContext);

    function back() {
        history.back();
    }

    const [list, setList] = useState([]);

    useEffect(() => {
        async function load() {
            const response = await fetch(`http://localhost:8080/main/dbprod`);
            const data = await response.json();
            setList(data);
        }
        load();
    }, []);

    function update(pId, stock) {
        if (!stock) {
            alert("수량을 입력해주세요.");
            return;
        }

        fetch("http://localhost:8080/main/dbprod", {
            method: "PUT",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pId, stock })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert(`재고가 ${stock}개로 수정되었습니다.`);

                setList(list.map(item => item.id === pId ? { ...item, stock } : item));
            } else {
                alert("재고 수정 실패");
            }
        })
        .catch(err => console.error(err));
    }

    return(
        <>
            <h2 style={{marginBottom: '20px'}}>상품 관리(재고수정)</h2>
            <button className="btn" onClick={back}>이전</button>
            <div className="grid" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                {list.map(item => (
                    <ProductItem 
                        key={item.id} 
                        item={item} 
                        onUpdate={update} 
                    />
                ))}
            </div>     
        </>
    )
}
export default Editprouct;