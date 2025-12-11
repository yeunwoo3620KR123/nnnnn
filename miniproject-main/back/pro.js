const express = require('express');
const pool = require('./db');
const router = express.Router();

// [GET /products] 상품 전체 목록
router.get('/products', async (req, res) => {
  try {
    const rows = await pool.query("SELECT pId, pName, pPrice, description, pcategory, img, stock, brand FROM products");
    const products = rows.map(row => ({
      id: row.pId,
      name: row.pName,
      price: row.pPrice,
      description: row.description,
      category: row.pcategory,
      image: `http://localhost:8080${row.img}`,
      stock: row.stock,
      brand: row.brand
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// [GET /products/:pId] 상품 상세
router.get('/products/:pId', async (req, res) => {
  try {
    const productId = req.params.pId;
    const rows = await pool.query("SELECT pId, pName, pPrice, description, pcategory,img, stock, brand FROM products WHERE pId = ?", [productId]);

    if (rows.length === 0) return res.status(404).json({});

    const product = rows[0];
    res.json({
      id: product.pId,
      name: product.pName,
      price: product.pPrice,
      description: product.description,
      category: product.pcategory,
      image: `http://localhost:8080${product.img}`,
      stock: product.stock,
      brand: product.brand
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
});



// GET /reviews 리뷰 전체 목록 
router.get('/reviews', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.review_id,
        r.id AS id, 
        r.pId, 
        r.content, 
        r.date, 
        r.rating,
        u.nickname,
        u.gender,
        u.dob
      FROM review r
      LEFT JOIN users u ON r.id = u.id
      ORDER BY r.date DESC
    `;

    const rows = await pool.query(query);

    const reviews = rows.map(row => ({
      review_id: row.review_id,
      id: row.id,
      pId: row.pId,
      content: row.content,
      userName: row.nickname,
      date: row.date,
      gender: row.gender,
      dob: row.dob, // ✅ 연령별 통계를 위해 추가
      rating: row.rating
    }));

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

router.post('/addreview', async (req, res) => {
  try {
    // ✅ 세션 확인
    if (!req.session.user) {
      return res.status(401).json({ 
        result: false, 
        message: "로그인이 필요합니다." 
      });
    }

    const userId = req.session.user.id;
    const userNickname = req.session.user.nickname;

    const { productId, content, rating } = req.body;

    // 유효성 검사
    if (!productId || !content || !rating) {
      return res.status(400).json({ 
        result: false, 
        message: "필수 정보를 입력해주세요." 
      });
    }

    const safeDate = new Date().toISOString().slice(0, 10);

    // 리뷰 저장
    await pool.query(
      "INSERT INTO review (id, nickname, pId, content, date, rating) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, userNickname, productId, content, safeDate, rating]
    );

    // 업데이트된 리뷰 목록 반환
    const query = `
      SELECT 
        r.review_id, r.id AS id, r.pId, r.content, r.date, r.rating,
        u.nickname, u.gender, u.dob
      FROM review r
      LEFT JOIN users u ON r.id = u.id
      ORDER BY r.date DESC
    `;

    const rows = await pool.query(query);

    const updatedReviews = rows.map(row => ({
      review_id: row.review_id,
      id: row.id,
      pId: row.pId,
      content: row.content,
      userName: row.nickname,
      date: row.date,
      gender: row.gender,
      dob: row.dob,
      rating: row.rating
    }));

    res.status(201).json({ result: true, reviews: updatedReviews });
  } catch (err) {
    console.error("리뷰 저장 오류:", err);
    res.status(500).json({ 
      result: false, 
      message: "서버 오류", 
      error: err.message 
    });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { pId, id, amount, img, pName, pPrice } = req.body;

    console.log('장바구니 추가 요청:', { pId, id, amount, pName, pPrice });

    const existing = await pool.query(
      'SELECT * FROM cart WHERE id = ? AND pId = ?',
      [id, pId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart SET amount = amount + ? WHERE id = ? AND pId = ?',
        [amount, id, pId]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (id, pId, pName, pPrice, amount, img) VALUES (?, ?, ?, ?, ?, ?)',
        [id, pId, pName, pPrice, amount, img]
      );
    }

    res.json({ result: true, message: '장바구니에 추가되었습니다' });
  } catch (error) {
    console.error('장바구니 추가 오류:', error);
    res.status(500).json({ result: false, error: '장바구니 추가 실패' });
  }
});

router.post('/buynow', async (req, res) => {
  try {
    const { pId, id, amount, img, pName, pPrice } = req.body;

    const existing = await pool.query(
      'SELECT * FROM cart WHERE id = ? AND pId = ?',
      [id, pId]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart SET amount = amount + ? WHERE id = ? AND pId = ?',
        [amount, id, pId]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (id, pId, pName, pPrice, amount, img) VALUES (?, ?, ?, ?, ?, ?)',
        [id, pId, pName, pPrice, amount, img]
      );
    }
    res.json({ result: true, message: '장바구니에 추가되었습니다' });
  } catch (error) {
    res.status(500).json({ result: false, error: '장바구니 추가 실패' });
  }
});

module.exports = router;
