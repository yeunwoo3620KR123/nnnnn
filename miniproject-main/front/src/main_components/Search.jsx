import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Search() {
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get("keyword") || "";

    useEffect(() => {
        if (!keyword.trim()) {
            setResult([]);
            return;
        }

        async function load() {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/main/search?keyword=${keyword}`);
                const data = await response.json();
                setResult(data);
            } catch (error) {
                console.error("검색 오류:", error);
                setResult([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [keyword]);

    return (
        <>
            <h2>검색 결과: "{keyword}"</h2>
            <div className="grid">
                {loading && <p>검색 중...</p>}
                {!loading && result.length === 0 && <p>검색 결과 없음</p>}
                {result.map(item => (
                    <div key={item.pId} className="card">
                        <img 
                            src={item.img}
                            alt={item.pName} 
                            className="card-img"
                        />
                        <div className="card-body">
                            <div className="card-title">{item.pName}</div>
                            {item.category && <div className="card-category">{item.category}</div>}
                            <div className="card-price">{Number(item.pPrice).toLocaleString()}원</div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Search;