import { useNavigate } from 'react-router-dom';

function ProductList({ products }) {
  const navigate = useNavigate();
  
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>상품이 없습니다.</h2>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{marginBottom: '20px'}}>베스트 상품</h2>
      <div className="grid">
        {products.map((product) => (
          <div key={product.id} className="card" onClick={() => navigate(`/detail/${product.id}`)}>
            
            <img 
              src={product.image} 
              alt={product.name} 
              className="card-img"
            />
            
            <div className="card-body">
              <div className="card-title">{product.name}</div>
              <div className="card-desc">{product.brand}</div>
              <div className="card-price">{Number(product.price).toLocaleString()}원</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;