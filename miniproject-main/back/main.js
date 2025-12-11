const express = require('express');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const router = express.Router();


const storage = multer.diskStorage ({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); //uploads 폴더가 프로젝트 루트에 있어야 됨
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // 파일명 중복 방지
    }
});

const upload = multer({ storage });

router.get('/search', async (req, res) => {
    const keyword = req.query.keyword || "";
    
    let sql = "SELECT * FROM products";
    let params = [];

    if (keyword) {
        sql += " WHERE pName LIKE ? OR pcategory LIKE ?";
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const pp = await pool.query(sql, params);

    const result = pp.map(item => ({
        ...item,
        img: item.img ? `http://localhost:8080${item.img}` : null
    }));
    
    res.send(result);
});

router.post('/addmain', upload.single('image'), async(req,res)=> {
      // (관리자 체크)
    if (!req.session.user || req.session.user.admin !== 1) {
        return res.status(403).json({
            result: false,
            message: "관리자만 접근 가능합니다"
        });
    }
    const pId = 'p' + Date.now();
    const { pName, pPrice, brand, description,pcategory, stock } = req.body; // req.body 내용들 선언 및 등록

    // 필수 값 체크

    if (!pName || !pPrice) {
        return res.status(400).json({ message: "상품명과 가격을 적어주세요" });

    }

    try{
        const price = parseInt(pPrice);
        const stockNum = parseInt(stock) || 0;

        let imgPath = null;
        if (req.file) {
            imgPath = '/uploads/' + req.file.filename;
        }

    await pool.query(
        'INSERT INTO products(pId, pName, brand,pPrice,description,pcategory,stock,img) VALUES(?,?,?,?,?,?,?,?)',
        [pId, pName, brand, price, description || '',pcategory || '', stockNum, imgPath]
    );

    res.json({message: "상품등록 완료", pId});
} catch (err) {
    console.error("상품 등록 에러:", err);
    res.status(500).json({message:"서버 에러", error: err.message});
}
});

//상품db
router.get('/products',async(req,res) => {
    const rows = await pool.query('SELECT * FROM `products`');
    res.send(rows);
})

//새상품db
router.get('/pnew',async(req,res) => {
    const rows = await pool.query('SELECT * FROM `pnew`');
    res.send(rows);
})

module.exports = router;