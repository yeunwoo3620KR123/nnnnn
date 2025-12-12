import { useContext, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


function AdminPage () {
    const { user, isLogin } = useContext(AuthContext);
    const navigate = useNavigate ();

    function productclick() {
        navigate('/addproduct')
    }
    function editProduct(){
        navigate('/editproduct')
    }


    useEffect (() => {
        if (!isLogin) 
            return;  

        if (!isLogin || user?.admin !== 1) {
            alert ("접근할 권한이 없습니다");
            navigate("/");
        }
    }, [user, isLogin, navigate]);

    if (!user || user.admin !== 1) return null;

    return (
        <div style={{maxWidth:"500px", margin:"50px auto", textAlign:"center"}}>

        <h1>관리자 전용 페이지입니다</h1>

        <button className="btn" onClick={productclick}>상품 등록창으로 이동</button>
        <button className="btn" onClick={editProduct}>재고 수정창으로 이동</button>
        </div>


    )
}


export default AdminPage