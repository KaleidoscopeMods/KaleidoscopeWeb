function initHomePage() {
    // === 1. 基础变量获取 ===
    const bgm = document.getElementById('bgm');
    const musicBtn = document.getElementById('music-control');
    const musicText = musicBtn ? musicBtn.querySelector('.music-text') : null;
    const items = document.querySelectorAll('.gallery-item');
    const pagination = document.getElementById('gallery-pagination');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const heroContent = document.querySelector('.hero-content') || document.querySelector('.hero');
    
    let currentIndex = 0;
    let isPlaying = false;
    let autoPlayTimer = null;
    // === 季节检测与 BGM 切换逻辑 ===
    function autoSwitchBGMBySeason() {
        const month = new Date().getMonth() + 1; // getMonth() 返回 0-11，所以要 +1
        let seasonMusic = "";

        // 根据月份划分季节（以北半球常规划分为例）
        if (month >= 3 && month <= 5) {
            seasonMusic = "spring.opus";
        } else if (month >= 6 && month <= 8) {
            seasonMusic = "summer.opus";
        } else if (month >= 9 && month <= 11) {
            seasonMusic = "autumn.opus";
        } else {
            seasonMusic = "winter.opus"; // 12, 1, 2 月
        }

        // 拼接路径并设置给 audio 标签
        if (bgm) {
            bgm.src = `music/${seasonMusic}`;
            bgm.load(); // 重新加载音频文件
            console.log(`当前月份为 ${month}月，已自动加载季节 BGM: ${seasonMusic}`);
        }
    }

    // 在页面加载时立即执行一次
    autoSwitchBGMBySeason();
    
    // === 2. 音乐播放逻辑 (核心修复) ===
    function updateMusicUI(playing) {
        if (!musicBtn || !musicText) return;
        if (playing) {
            musicBtn.classList.add('playing');
            musicBtn.classList.remove('muted');
            musicText.innerText = "BGM: ON";
        } else {
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('muted');
            musicText.innerText = "BGM: OFF";
        }
    }

    function tryPlay() {
        if (isPlaying || !bgm) return;
        bgm.play().then(() => {
            isPlaying = true;
            updateMusicUI(true);
        }).catch((err) => {
            console.log("等待用户交互以播放音频...");
        });
    }

    if (musicBtn && bgm) {
        // 初始尝试播放
        window.addEventListener('load', tryPlay);
        
        // 全局点击激活音频上下文
        document.addEventListener('click', () => {
            if (!isPlaying) tryPlay();
        }, { once: true });

        // 手动开关
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgm.paused) {
                bgm.play();
                isPlaying = true;
                updateMusicUI(true);
            } else {
                bgm.pause();
                isPlaying = false;
                updateMusicUI(false);
            }
        });
    }

    // === 3. Gallery 逻辑 (修复初始化堆叠) ===
    // 先创建线段
    if (pagination && items.length > 0) {
        pagination.innerHTML = ''; // 清空可能存在的旧内容，防止重复生成
        items.forEach((_, index) => {
         const line = document.createElement('div');
         line.classList.add('pagination-line');
            line.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡干扰 3D 容器
                currentIndex = index;
                  updateGallery();
                resetAutoPlay();
          });
         pagination.appendChild(line);
       });
    }

    const lines = document.querySelectorAll('.pagination-line');

    function updateGallery() {
    if (items.length === 0) return;

          items.forEach((item, index) => {
         item.classList.remove('active', 'next', 'prev');
          item.style.pointerEvents = (index === currentIndex) ? 'auto' : 'none'; 
          
          if (index === currentIndex) {
              item.classList.add('active');
          } else if (index === (currentIndex + 1) % items.length) {
             item.classList.add('next');
         } else if (index === (currentIndex - 1 + items.length) % items.length) {
              item.classList.add('prev');
          }
        });

        if (lines.length > 0) {
            lines.forEach((line, index) => {
                line.classList.toggle('active', index === currentIndex);
            });
        }
    }

    // === 4. 自动切换与事件绑定 ===
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            currentIndex = (currentIndex + 1) % items.length;
            updateGallery();
        }, 10000);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateGallery();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateGallery();
            resetAutoPlay();
        });
    }

    // 初始化画廊状态
    updateGallery();
    startAutoPlay();

    // === 5. 滚动特效与观察器 ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    window.addEventListener('scroll', () => {
        if (!heroContent) return;
        const scrollProgress = window.scrollY / (window.innerHeight * 0.1);
        heroContent.style.opacity = scrollProgress > 1 ? '0' : '1';
        heroContent.style.pointerEvents = scrollProgress > 1 ? 'none' : 'auto';
    });
    
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        // 1. 监听滚动显示/隐藏
        window.addEventListener('scroll', () => {
            // 当滚动超过半屏高度时显示
            if (window.scrollY > window.innerHeight * 0.5) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // 2. 点击平滑回顶
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.warn("未找到 id 为 'back-to-top' 的按钮，请检查 HTML。");
    }
    
    // === 开发者气泡详情逻辑 (增强版) ===
    const devCards = document.querySelectorAll('.dev-card');

    devCards.forEach(card => {
       // 1. 点击头像卡片激活气泡
       card.addEventListener('click', (e) => {
          // 如果点击的是内部的B站链接，则不执行气泡切换逻辑
           if (e.target.closest('.bubble-bili')) return;

        // 如果点击的已经是激活的卡片，则不执行任何操作（由关闭按钮处理关闭）
        if (card.classList.contains('active')) return;

        // --- 核心逻辑：单选模式 ---
        // 先移除所有卡片的 active 状态
        devCards.forEach(c => c.classList.remove('active'));
        
        // 给当前点击的卡片加上 active 状态
        card.classList.add('active');
    });

      // 2. 点击气泡内的关闭按钮关闭气泡
      const closeBtn = card.querySelector('.close-bubble');
       if (closeBtn) {
           closeBtn.addEventListener('click', (e) => {
              e.stopPropagation(); // 阻止事件冒泡，防止触发卡片的点击事件
               card.classList.remove('active');
          });
       }
    });

    // 3. 点击卡片和气泡以外的任意位置，关闭所有气泡
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dev-card')) {
          devCards.forEach(card => card.classList.remove('active'));
      }
    });
    
    function scrollToDevSection() {
    const target = document.getElementById('developers-section');
    if (!target) return;

    // 获取目标元素相对于页面顶部的距离
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    
    // 设置偏移量：如果你希望标题往下一一点，就减去一个小一点的值；反之亦然
    // 建议减去 50 到 100 之间的值
    const offset = 60; 

    window.scrollTo({
        top: targetPosition - offset,
        behavior: 'smooth'
    });
}

    const SECRET_SEQUENCE = [1, 5, 2, 4, 3]; // 密码序列  
    let secretProgress = 0;                    // 当前进度  
    let secretRevealed = false;                // 是否已触发  
    const secretWrapper = document.getElementById('secret-dev-wrapper');  
    const secretCard = document.getElementById('dev-card-secret');  
  
    // --- 监听五位开发者头像的点击，追踪序列 ---  
    devCards.forEach(card => {  
        card.addEventListener('click', () => {  
            // 如果已经触发过彩蛋，则不再追踪  
            if (secretRevealed) return;  
  
            const clickedIndex = parseInt(card.dataset.index);  
  
            // 忽略非 1-5 的卡片（包括站长卡片 data-index=6）  
            if (isNaN(clickedIndex) || clickedIndex < 1 || clickedIndex > 5) return;  
  
            if (clickedIndex === SECRET_SEQUENCE[secretProgress]) {  
                // ✅ 点击正确！推进序列  
                secretProgress++;  
  
                // 给正确的卡片加一个轻微的视觉反馈  
                card.classList.add('secret-hint');  
                setTimeout(() => card.classList.remove('secret-hint'), 400);  
  
                console.log(`🔑 彩蛋进度: ${secretProgress}/${SECRET_SEQUENCE.length}`);  
  
                // 🎉 序列完成！触发彩蛋！  
                if (secretProgress === SECRET_SEQUENCE.length) {  
                    secretRevealed = true;  
                    if (secretWrapper) {  
                        secretWrapper.classList.add('revealed');  
                        console.log('🎉 彩蛋触发！站长驾到！');  
                    }  
                }  
            } else if (clickedIndex === SECRET_SEQUENCE[0]) {  
                // 点的是序列第一个元素，重新开始计数  
                secretProgress = 1;  
                card.classList.add('secret-hint');  
                setTimeout(() => card.classList.remove('secret-hint'), 400);  
            } else {  
                // ❌ 点错了，重置进度  
                secretProgress = 0;  
            }  
        });  
    });  
  
    // --- 站长卡片的气泡交互 ---  
    // （由于站长卡片也是 .dev-card，上面已有的通用 click handler 会自动处理气泡的显示/隐藏）  
    // 这里只需要额外处理：点击页面空白区域时也要关闭站长气泡  
    document.addEventListener('click', (e) => {  
        if (secretCard && !e.target.closest('#dev-card-secret') && !e.target.closest('.dev-card')) {  
            secretCard.classList.remove('active');  
        }  
    });
}

// 暴露给外部调用
window.__initHomePage = initHomePage;