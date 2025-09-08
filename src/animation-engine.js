// 動畫引擎 - 負責渲染各種動畫效果
class AnimationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    this.width = canvas.width;
    this.height = canvas.height;
    this.startTime = performance.now();
    this.isRunning = false;
    this.animationId = null;
  }

  // 開始動畫
  start() {
    this.isRunning = true;
    this.startTime = performance.now();
    this.animate();
  }

  // 停止動畫
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // 重新開始動畫
  restart() {
    this.stop();
    this.start();
  }

  // 動畫循環
  animate() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;

    this.render(elapsed);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // 渲染單幀
  render(timestamp) {
    // 清除畫布 - 確保透明背景
    this.clearCanvasWithTransparency();

    // 渲染動畫幀
    this.renderFrame(timestamp);
  }

  // 清除畫布並確保透明背景
  clearCanvasWithTransparency() {
    // 保存當前狀態
    this.ctx.save();

    // 設定合成模式為清除
    this.ctx.globalCompositeOperation = 'clear';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 恢復合成模式
    this.ctx.globalCompositeOperation = 'source-over';

    // 恢復狀態
    this.ctx.restore();
  }

  // 渲染動畫幀（由子類實現）
  renderFrame(timestamp) {
    // 預設實現 - 空白
  }

  // 設定動畫參數
  setParams(params) {
    this.params = { ...params };
  }

  // 獲取當前幀的 DataURL - 確保透明背景
  getFrameDataURL() {
    try {
      // 確保 Canvas 有透明背景
      const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;

      // 檢查並確保透明像素真正透明
      for (let i = 0; i < data.length; i += 4) {
        // 如果 alpha 值很低，設為完全透明
        if (data[i + 3] < 10) {
          data[i] = 0;     // R
          data[i + 1] = 0; // G
          data[i + 2] = 0; // B
          data[i + 3] = 0; // A
        }
      }

      // 創建新的 Canvas 來輸出
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = this.width;
      outputCanvas.height = this.height;
      const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });

      // 確保透明背景
      outputCtx.clearRect(0, 0, this.width, this.height);
      outputCtx.putImageData(imageData, 0, 0);

      // 🔧 生成 DataURL 並驗證格式
      const dataURL = outputCanvas.toDataURL('image/png');

      // 驗證 DataURL 格式
      if (!dataURL || !dataURL.startsWith('data:image/png;base64,')) {
        console.error('❌ DataURL 格式無效:', dataURL ? dataURL.substring(0, 50) + '...' : 'null');
        throw new Error('生成的 DataURL 格式無效');
      }

      // 驗證 Base64 數據長度
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
      if (base64Data.length < 100) {
        console.error('❌ Base64 數據太短:', base64Data.length, 'bytes');
        throw new Error('生成的 PNG 數據太短，可能損壞');
      }

      console.log(`✅ 幀 DataURL 生成成功，Base64 長度: ${base64Data.length} bytes`);
      return dataURL;

    } catch (error) {
      console.error('❌ 生成 DataURL 失敗:', error);
      // 返回一個最小的透明 PNG 作為備用
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }
}

// 圓形動畫引擎
class CircleAnimationEngine extends AnimationEngine {
  constructor(canvas) {
    super(canvas);

    // 預設參數
    this.params = {
      color: '#ff3b30',
      size: 40,
      type: 'bounce',
      speed: 1000
    };
  }

  renderFrame(timestamp) {
    const progress = (timestamp % this.params.speed) / this.params.speed;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = this.params.size;

    // 保存當前狀態
    this.ctx.save();

    // 應用旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }

    // 設定顏色和線條樣式
    this.ctx.strokeStyle = this.params.strokeColor || this.params.color || '#cc2e24';
    this.ctx.fillStyle = this.params.fillColor || this.params.color || '#ff3b30';
    this.ctx.lineWidth = this.params.strokeWidth || 4;

    switch (this.params.shape) {
      // 基本形狀
      case 'circle':
        this.renderCircle(centerX, centerY, size, progress);
        break;
      case 'square':
        this.renderSquare(centerX, centerY, size, progress);
        break;
      case 'rectangle':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawRectangle);
        break;
      case 'triangle':
        this.renderTriangle(centerX, centerY, size, progress);
        break;
      case 'diamond':
        this.renderDiamond(centerX, centerY, size, progress);
        break;
      case 'pentagon':
        this.renderPentagon(centerX, centerY, size, progress);
        break;
      case 'hexagon':
        this.renderHexagon(centerX, centerY, size, progress);
        break;
      case 'octagon':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawOctagon);
        break;

      // 箭頭系列
      case 'arrow-right':
        this.renderArrowRight(centerX, centerY, size, progress);
        break;
      case 'arrow-left':
        this.renderArrowLeft(centerX, centerY, size, progress);
        break;
      case 'arrow-up':
        this.renderArrowUp(centerX, centerY, size, progress);
        break;
      case 'arrow-down':
        this.renderArrowDown(centerX, centerY, size, progress);
        break;
      case 'arrow-double':
        this.renderArrowDouble(centerX, centerY, size, progress);
        break;
      case 'arrow-curved':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowCurved);
        break;
      case 'arrow-block':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowBlock);
        break;
      case 'arrow-chevron':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowChevron);
        break;

      // 流程圖形狀
      case 'process':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawProcess);
        break;
      case 'decision':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawDecision);
        break;
      case 'document':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawDocument);
        break;
      case 'database':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawDatabase);
        break;
      case 'cloud':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawCloud);
        break;
      case 'cylinder':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawCylinder);
        break;

      // 標註形狀
      case 'callout-round':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawCalloutRound);
        break;
      case 'callout-square':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawCalloutSquare);
        break;
      case 'callout-cloud':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawCalloutCloud);
        break;
      case 'banner':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawBanner);
        break;
      case 'ribbon':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawRibbon);
        break;

      // 特殊形狀
      case 'star':
        this.renderStar(centerX, centerY, size, progress);
        break;
      case 'star-4':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawStar4);
        break;
      case 'star-6':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawStar6);
        break;
      case 'heart':
        this.renderHeart(centerX, centerY, size, progress);
        break;
      case 'cross':
        this.renderCross(centerX, centerY, size, progress);
        break;
      case 'line':
        this.renderLine(centerX, centerY, size, progress);
        break;
      case 'lightning':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawLightning);
        break;
      case 'gear':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawGear);
        break;

      // 幾何圖形
      case 'parallelogram':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawParallelogram);
        break;
      case 'trapezoid':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawTrapezoid);
        break;
      case 'ellipse':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawEllipse);
        break;
      case 'arc':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawArc);
        break;
      case 'sector':
        this.renderGenericShape(centerX, centerY, size, progress, this.drawSector);
        break;

      default:
        this.renderCircle(centerX, centerY, size, progress);
    }

    // 恢復狀態
    this.ctx.restore();
  }

  // 渲染不同形狀的方法
  renderCircle(centerX, centerY, size, progress) {
    switch (this.params.type) {
      case 'bounce':
        this.renderCircleBounce(centerX, centerY, size, progress);
        break;
      case 'pulse':
        this.renderCirclePulse(centerX, centerY, size, progress);
        break;
      case 'rotate':
        this.renderCircleRotate(centerX, centerY, size, progress);
        break;
      case 'swing':
        this.renderCircleSwing(centerX, centerY, size, progress);
        break;
    }
  }

  renderSquare(centerX, centerY, size, progress) {
    switch (this.params.type) {
      case 'bounce':
        this.renderSquareBounce(centerX, centerY, size, progress);
        break;
      case 'pulse':
        this.renderSquarePulse(centerX, centerY, size, progress);
        break;
      case 'rotate':
        this.renderSquareRotate(centerX, centerY, size, progress);
        break;
      case 'swing':
        this.renderSquareSwing(centerX, centerY, size, progress);
        break;
    }
  }

  renderTriangle(centerX, centerY, size, progress) {
    switch (this.params.type) {
      case 'bounce':
        this.renderTriangleBounce(centerX, centerY, size, progress);
        break;
      case 'pulse':
        this.renderTrianglePulse(centerX, centerY, size, progress);
        break;
      case 'rotate':
        this.renderTriangleRotate(centerX, centerY, size, progress);
        break;
      case 'swing':
        this.renderTriangleSwing(centerX, centerY, size, progress);
        break;
    }
  }

  renderStar(centerX, centerY, size, progress) {
    switch (this.params.type) {
      case 'bounce':
        this.renderStarBounce(centerX, centerY, size, progress);
        break;
      case 'pulse':
        this.renderStarPulse(centerX, centerY, size, progress);
        break;
      case 'rotate':
        this.renderStarRotate(centerX, centerY, size, progress);
        break;
      case 'swing':
        this.renderStarSwing(centerX, centerY, size, progress);
        break;
    }
  }

  renderHeart(centerX, centerY, size, progress) {
    switch (this.params.type) {
      case 'bounce':
        this.renderHeartBounce(centerX, centerY, size, progress);
        break;
      case 'pulse':
        this.renderHeartPulse(centerX, centerY, size, progress);
        break;
      case 'rotate':
        this.renderHeartRotate(centerX, centerY, size, progress);
        break;
      case 'swing':
        this.renderHeartSwing(centerX, centerY, size, progress);
        break;
    }
  }

  // 新增形狀渲染方法
  renderDiamond(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawDiamond);
  }

  renderPentagon(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawPentagon);
  }

  renderHexagon(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawHexagon);
  }

  renderArrowRight(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowRight);
  }

  renderArrowLeft(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowLeft);
  }

  renderArrowUp(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowUp);
  }

  renderArrowDown(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowDown);
  }

  renderArrowDouble(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawArrowDouble);
  }

  renderCross(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawCross);
  }

  renderLine(centerX, centerY, size, progress) {
    this.renderGenericShape(centerX, centerY, size, progress, this.drawLine);
  }

  // 通用形狀渲染方法
  renderGenericShape(centerX, centerY, size, progress, drawFunction) {
    switch (this.params.type) {
      case 'bounce':
        this.renderGenericBounce(centerX, centerY, size, progress, drawFunction);
        break;
      case 'pulse':
        this.renderGenericPulse(centerX, centerY, size, progress, drawFunction);
        break;
      case 'rotate':
        this.renderGenericRotate(centerX, centerY, size, progress, drawFunction);
        break;
      case 'swing':
        this.renderGenericSwing(centerX, centerY, size, progress, drawFunction);
        break;
      case 'fade':
        this.renderGenericFade(centerX, centerY, size, progress, drawFunction);
        break;
      case 'slide':
        this.renderGenericSlide(centerX, centerY, size, progress, drawFunction);
        break;
      case 'zoom':
        this.renderGenericZoom(centerX, centerY, size, progress, drawFunction);
        break;
      case 'spin':
        this.renderGenericSpin(centerX, centerY, size, progress, drawFunction);
        break;
      default:
        this.renderGenericBounce(centerX, centerY, size, progress, drawFunction);
    }
  }

  // ===== 圓形動畫 =====
  renderCircleBounce(centerX, centerY, radius, progress) {
    const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
    const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
    const y = centerY - 60 + eased * 120;

    const squish = 1 + (0.2 * (1 - Math.abs(0.5 - progress) * 2));
    const ry = radius / squish;
    const rx = radius * squish;

    this.ctx.save();
    this.ctx.translate(centerX, y);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  renderCirclePulse(centerX, centerY, radius, progress) {
    const scale = 0.7 + 0.6 * Math.sin(progress * Math.PI * 2);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(progress * Math.PI * 2);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  renderCircleRotate(centerX, centerY, radius, progress) {
    const angle = progress * Math.PI * 2;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 旋轉指示線
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(radius * 0.7, 0);
    this.ctx.stroke();
    this.ctx.restore();
  }

  renderCircleSwing(centerX, centerY, radius, progress) {
    const swingAngle = Math.sin(progress * Math.PI * 2) * 0.5;
    const swingX = centerX + Math.sin(swingAngle) * 80;
    const swingY = centerY + Math.cos(swingAngle) * 30;

    this.ctx.save();
    this.ctx.translate(swingX, swingY);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  // ===== 正方形動畫 =====
  renderSquareBounce(centerX, centerY, size, progress) {
    const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
    const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
    const y = centerY - 60 + eased * 120;

    const squish = 1 + (0.2 * (1 - Math.abs(0.5 - progress) * 2));
    const height = size / squish;
    const width = size * squish;

    this.ctx.save();
    this.ctx.translate(centerX, y);
    this.ctx.beginPath();
    this.ctx.rect(-width/2, -height/2, width, height);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  renderSquarePulse(centerX, centerY, size, progress) {
    const scale = 0.7 + 0.6 * Math.sin(progress * Math.PI * 2);
    const scaledSize = size * scale;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(progress * Math.PI * 2);
    this.ctx.beginPath();
    this.ctx.rect(-scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  renderSquareRotate(centerX, centerY, size, progress) {
    const angle = progress * Math.PI * 2;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.rect(-size/2, -size/2, size, size);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 旋轉指示線
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(size * 0.35, 0);
    this.ctx.stroke();
    this.ctx.restore();
  }

  renderSquareSwing(centerX, centerY, size, progress) {
    const swingAngle = Math.sin(progress * Math.PI * 2) * 0.5;
    const swingX = centerX + Math.sin(swingAngle) * 80;
    const swingY = centerY + Math.cos(swingAngle) * 30;

    this.ctx.save();
    this.ctx.translate(swingX, swingY);
    this.ctx.beginPath();
    this.ctx.rect(-size/2, -size/2, size, size);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  // ===== 三角形動畫 =====
  renderTriangleBounce(centerX, centerY, size, progress) {
    const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
    const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
    const y = centerY - 60 + eased * 120;

    const squish = 1 + (0.2 * (1 - Math.abs(0.5 - progress) * 2));
    const height = size / squish;
    const width = size * squish;

    this.ctx.save();
    this.ctx.translate(centerX, y);
    this.drawTriangle(0, 0, width);
    this.ctx.restore();
  }

  renderTrianglePulse(centerX, centerY, size, progress) {
    const scale = 0.7 + 0.6 * Math.sin(progress * Math.PI * 2);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(progress * Math.PI * 2);
    this.drawTriangle(0, 0, size * scale);
    this.ctx.restore();
  }

  renderTriangleRotate(centerX, centerY, size, progress) {
    const angle = progress * Math.PI * 2;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.drawTriangle(0, 0, size);
    this.ctx.restore();
  }

  renderTriangleSwing(centerX, centerY, size, progress) {
    const swingAngle = Math.sin(progress * Math.PI * 2) * 0.5;
    const swingX = centerX + Math.sin(swingAngle) * 80;
    const swingY = centerY + Math.cos(swingAngle) * 30;

    this.ctx.save();
    this.ctx.translate(swingX, swingY);
    this.drawTriangle(0, 0, size);
    this.ctx.restore();
  }

  drawTriangle(x, y, size) {
    const height = size * Math.sqrt(3) / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - height/2);
    this.ctx.lineTo(x - size/2, y + height/2);
    this.ctx.lineTo(x + size/2, y + height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // ===== 星形動畫 =====
  renderStarBounce(centerX, centerY, size, progress) {
    const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
    const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
    const y = centerY - 60 + eased * 120;

    this.ctx.save();
    this.ctx.translate(centerX, y);
    this.drawStar(0, 0, size);
    this.ctx.restore();
  }

  renderStarPulse(centerX, centerY, size, progress) {
    const scale = 0.7 + 0.6 * Math.sin(progress * Math.PI * 2);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(progress * Math.PI * 2);
    this.drawStar(0, 0, size * scale);
    this.ctx.restore();
  }

  renderStarRotate(centerX, centerY, size, progress) {
    const angle = progress * Math.PI * 2;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.drawStar(0, 0, size);
    this.ctx.restore();
  }

  renderStarSwing(centerX, centerY, size, progress) {
    const swingAngle = Math.sin(progress * Math.PI * 2) * 0.5;
    const swingX = centerX + Math.sin(swingAngle) * 80;
    const swingY = centerY + Math.cos(swingAngle) * 30;

    this.ctx.save();
    this.ctx.translate(swingX, swingY);
    this.drawStar(0, 0, size);
    this.ctx.restore();
  }

  drawStar(x, y, size) {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;

    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // ===== 愛心動畫 =====
  renderHeartBounce(centerX, centerY, size, progress) {
    const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
    const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
    const y = centerY - 60 + eased * 120;

    this.ctx.save();
    this.ctx.translate(centerX, y);
    this.drawHeart(0, 0, size);
    this.ctx.restore();
  }

  renderHeartPulse(centerX, centerY, size, progress) {
    const scale = 0.7 + 0.6 * Math.sin(progress * Math.PI * 2);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(progress * Math.PI * 2);
    this.drawHeart(0, 0, size * scale);
    this.ctx.restore();
  }

  renderHeartRotate(centerX, centerY, size, progress) {
    const angle = progress * Math.PI * 2;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.drawHeart(0, 0, size);
    this.ctx.restore();
  }

  renderHeartSwing(centerX, centerY, size, progress) {
    const swingAngle = Math.sin(progress * Math.PI * 2) * 0.5;
    const swingX = centerX + Math.sin(swingAngle) * 80;
    const swingY = centerY + Math.cos(swingAngle) * 30;

    this.ctx.save();
    this.ctx.translate(swingX, swingY);
    this.drawHeart(0, 0, size);
    this.ctx.restore();
  }

  drawHeart(x, y, size) {
    const scale = size / 40;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 5 * scale);
    this.ctx.bezierCurveTo(x, y + 2 * scale, x - 4 * scale, y - 2 * scale, x - 8 * scale, y + 2 * scale);
    this.ctx.bezierCurveTo(x - 12 * scale, y + 6 * scale, x - 12 * scale, y + 10 * scale, x - 8 * scale, y + 14 * scale);
    this.ctx.bezierCurveTo(x - 4 * scale, y + 18 * scale, x, y + 22 * scale, x, y + 22 * scale);
    this.ctx.bezierCurveTo(x, y + 22 * scale, x + 4 * scale, y + 18 * scale, x + 8 * scale, y + 14 * scale);
    this.ctx.bezierCurveTo(x + 12 * scale, y + 10 * scale, x + 12 * scale, y + 6 * scale, x + 8 * scale, y + 2 * scale);
    this.ctx.bezierCurveTo(x + 4 * scale, y - 2 * scale, x, y + 2 * scale, x, y + 5 * scale);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // ===== 通用動畫方法 =====
  renderGenericBounce(centerX, centerY, size, progress, drawFunction) {
    const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
    const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
    const y = centerY - 60 + eased * 120;

    this.ctx.save();
    this.ctx.translate(centerX, y);

    // 應用靜態旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
    }

    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  renderGenericPulse(centerX, centerY, size, progress, drawFunction) {
    const scale = 0.7 + 0.6 * Math.sin(progress * Math.PI * 2);
    // 確保透明度變化不會產生白邊
    const alpha = 0.6 + 0.4 * Math.abs(Math.sin(progress * Math.PI * 2));
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.translate(centerX, centerY);

    // 應用靜態旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
    }

    this.ctx.globalAlpha = alpha;
    drawFunction.call(this, 0, 0, size * scale);
    this.ctx.restore();
  }

  renderGenericRotate(centerX, centerY, size, progress, drawFunction) {
    const animationAngle = progress * Math.PI * 2;
    const staticAngle = this.params.rotation ? (this.params.rotation * Math.PI) / 180 : 0;
    const totalAngle = animationAngle + staticAngle;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(totalAngle);
    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  renderGenericSwing(centerX, centerY, size, progress, drawFunction) {
    const swingAngle = Math.sin(progress * Math.PI * 2) * 0.5;
    const swingX = centerX + Math.sin(swingAngle) * 80;
    const swingY = centerY + Math.cos(swingAngle) * 30;

    this.ctx.save();
    this.ctx.translate(swingX, swingY);

    // 應用靜態旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
    }

    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  renderGenericFade(centerX, centerY, size, progress, drawFunction) {
    // 確保淡出到完全透明，而不是白色
    const alpha = 0.1 + 0.9 * Math.abs(Math.sin(progress * Math.PI * 2));
    this.ctx.save();

    // 設定透明合成模式
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.translate(centerX, centerY);

    // 應用靜態旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
    }

    this.ctx.globalAlpha = alpha;

    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  renderGenericSlide(centerX, centerY, size, progress, drawFunction) {
    const slideX = centerX + Math.sin(progress * Math.PI * 2) * 100;
    this.ctx.save();
    this.ctx.translate(slideX, centerY);

    // 應用靜態旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
    }

    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  renderGenericZoom(centerX, centerY, size, progress, drawFunction) {
    const scale = 0.5 + 1.0 * Math.sin(progress * Math.PI * 2);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);

    // 應用靜態旋轉
    if (this.params.rotation && this.params.rotation !== 0) {
      this.ctx.rotate((this.params.rotation * Math.PI) / 180);
    }

    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  renderGenericSpin(centerX, centerY, size, progress, drawFunction) {
    const animationAngle = progress * Math.PI * 4; // 雙倍旋轉速度
    const staticAngle = this.params.rotation ? (this.params.rotation * Math.PI) / 180 : 0;
    const totalAngle = animationAngle + staticAngle;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(totalAngle);
    drawFunction.call(this, 0, 0, size);
    this.ctx.restore();
  }

  // ===== 形狀繪製方法 =====
  drawDiamond(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size/2);
    this.ctx.lineTo(x + size/2, y);
    this.ctx.lineTo(x, y + size/2);
    this.ctx.lineTo(x - size/2, y);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawPentagon(x, y, size) {
    const radius = size / 2;
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawHexagon(x, y, size) {
    const radius = size / 2;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 6;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArrowRight(x, y, size) {
    const width = size;
    const height = size * 0.6;
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/4);
    this.ctx.lineTo(x + width/4, y - height/4);
    this.ctx.lineTo(x + width/4, y - height/2);
    this.ctx.lineTo(x + width/2, y);
    this.ctx.lineTo(x + width/4, y + height/2);
    this.ctx.lineTo(x + width/4, y + height/4);
    this.ctx.lineTo(x - width/2, y + height/4);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArrowLeft(x, y, size) {
    const width = size;
    const height = size * 0.6;
    this.ctx.beginPath();
    this.ctx.moveTo(x + width/2, y - height/4);
    this.ctx.lineTo(x - width/4, y - height/4);
    this.ctx.lineTo(x - width/4, y - height/2);
    this.ctx.lineTo(x - width/2, y);
    this.ctx.lineTo(x - width/4, y + height/2);
    this.ctx.lineTo(x - width/4, y + height/4);
    this.ctx.lineTo(x + width/2, y + height/4);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArrowUp(x, y, size) {
    const width = size * 0.6;
    const height = size;
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/4, y + height/2);
    this.ctx.lineTo(x - width/4, y - height/4);
    this.ctx.lineTo(x - width/2, y - height/4);
    this.ctx.lineTo(x, y - height/2);
    this.ctx.lineTo(x + width/2, y - height/4);
    this.ctx.lineTo(x + width/4, y - height/4);
    this.ctx.lineTo(x + width/4, y + height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArrowDown(x, y, size) {
    const width = size * 0.6;
    const height = size;
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/4, y - height/2);
    this.ctx.lineTo(x - width/4, y + height/4);
    this.ctx.lineTo(x - width/2, y + height/4);
    this.ctx.lineTo(x, y + height/2);
    this.ctx.lineTo(x + width/2, y + height/4);
    this.ctx.lineTo(x + width/4, y + height/4);
    this.ctx.lineTo(x + width/4, y - height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArrowDouble(x, y, size) {
    const width = size;
    const height = size * 0.4;

    // 左箭頭
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y);
    this.ctx.lineTo(x - width/4, y - height/2);
    this.ctx.lineTo(x - width/4, y - height/4);
    this.ctx.lineTo(x + width/4, y - height/4);
    this.ctx.lineTo(x + width/4, y - height/2);
    this.ctx.lineTo(x + width/2, y);
    this.ctx.lineTo(x + width/4, y + height/2);
    this.ctx.lineTo(x + width/4, y + height/4);
    this.ctx.lineTo(x - width/4, y + height/4);
    this.ctx.lineTo(x - width/4, y + height/2);
    this.ctx.closePath();

    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawCross(x, y, size) {
    const thickness = size * 0.2;
    const length = size;

    this.ctx.beginPath();
    // 垂直線
    this.ctx.moveTo(x - thickness/2, y - length/2);
    this.ctx.lineTo(x + thickness/2, y - length/2);
    this.ctx.lineTo(x + thickness/2, y + length/2);
    this.ctx.lineTo(x - thickness/2, y + length/2);
    this.ctx.closePath();

    // 水平線
    this.ctx.moveTo(x - length/2, y - thickness/2);
    this.ctx.lineTo(x + length/2, y - thickness/2);
    this.ctx.lineTo(x + length/2, y + thickness/2);
    this.ctx.lineTo(x - length/2, y + thickness/2);
    this.ctx.closePath();

    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawLine(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x - size/2, y);
    this.ctx.lineTo(x + size/2, y);
    this.ctx.stroke();
  }

  // ===== 新增形狀繪製方法 =====

  // 基本形狀
  drawRectangle(x, y, size) {
    const width = size * 1.5;
    const height = size;
    this.ctx.beginPath();
    this.ctx.rect(x - width/2, y - height/2, width, height);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawOctagon(x, y, size) {
    const radius = size / 2;
    this.ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // 箭頭系列
  drawArrowCurved(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x - size/2, y);
    this.ctx.quadraticCurveTo(x, y - size/3, x + size/3, y);
    this.ctx.lineTo(x + size/4, y - size/4);
    this.ctx.moveTo(x + size/3, y);
    this.ctx.lineTo(x + size/4, y + size/4);
    this.ctx.stroke();
  }

  drawArrowBlock(x, y, size) {
    const width = size;
    const height = size * 0.6;
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/3, y - height/4);
    this.ctx.lineTo(x + width/6, y - height/4);
    this.ctx.lineTo(x + width/6, y - height/2);
    this.ctx.lineTo(x + width/2, y);
    this.ctx.lineTo(x + width/6, y + height/2);
    this.ctx.lineTo(x + width/6, y + height/4);
    this.ctx.lineTo(x - width/3, y + height/4);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArrowChevron(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x - size/3, y - size/3);
    this.ctx.lineTo(x + size/3, y);
    this.ctx.lineTo(x - size/3, y + size/3);
    this.ctx.stroke();
  }

  // 流程圖形狀
  drawProcess(x, y, size) {
    const width = size * 1.2;
    const height = size * 0.8;
    this.ctx.beginPath();
    this.ctx.rect(x - width/2, y - height/2, width, height);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawDecision(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size/2);
    this.ctx.lineTo(x + size/2, y);
    this.ctx.lineTo(x, y + size/2);
    this.ctx.lineTo(x - size/2, y);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawDocument(x, y, size) {
    const width = size;
    const height = size * 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/2);
    this.ctx.lineTo(x + width/2, y - height/2);
    this.ctx.lineTo(x + width/2, y + height/3);
    this.ctx.quadraticCurveTo(x + width/4, y + height/2, x, y + height/3);
    this.ctx.quadraticCurveTo(x - width/4, y + height/2, x - width/2, y + height/3);
    this.ctx.lineTo(x - width/2, y - height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawDatabase(x, y, size) {
    const width = size;
    const height = size * 1.2;
    const ellipseHeight = height * 0.2;

    this.ctx.beginPath();
    // 上橢圓
    this.ctx.ellipse(x, y - height/2 + ellipseHeight/2, width/2, ellipseHeight/2, 0, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 側邊
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/2 + ellipseHeight/2);
    this.ctx.lineTo(x - width/2, y + height/2 - ellipseHeight/2);
    this.ctx.moveTo(x + width/2, y - height/2 + ellipseHeight/2);
    this.ctx.lineTo(x + width/2, y + height/2 - ellipseHeight/2);
    this.ctx.stroke();

    // 下橢圓
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + height/2 - ellipseHeight/2, width/2, ellipseHeight/2, 0, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawCloud(x, y, size) {
    const radius = size / 6;
    this.ctx.beginPath();
    // 主體圓形
    this.ctx.arc(x, y, radius * 2, 0, 2 * Math.PI);
    this.ctx.arc(x - radius * 1.5, y, radius * 1.5, 0, 2 * Math.PI);
    this.ctx.arc(x + radius * 1.5, y, radius * 1.5, 0, 2 * Math.PI);
    this.ctx.arc(x - radius, y - radius, radius, 0, 2 * Math.PI);
    this.ctx.arc(x + radius, y - radius, radius, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawCylinder(x, y, size) {
    const width = size;
    const height = size * 1.2;
    const ellipseHeight = height * 0.15;

    // 上橢圓
    this.ctx.beginPath();
    this.ctx.ellipse(x, y - height/2, width/2, ellipseHeight, 0, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 側邊
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/2);
    this.ctx.lineTo(x - width/2, y + height/2);
    this.ctx.moveTo(x + width/2, y - height/2);
    this.ctx.lineTo(x + width/2, y + height/2);
    this.ctx.stroke();

    // 下橢圓
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + height/2, width/2, ellipseHeight, 0, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // 標註形狀
  drawCalloutRound(x, y, size) {
    const radius = size / 2;
    // 主圓形
    this.ctx.beginPath();
    this.ctx.arc(x, y - size/6, radius * 0.8, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 指向線
    this.ctx.beginPath();
    this.ctx.moveTo(x - radius/3, y + radius/3);
    this.ctx.lineTo(x - radius/2, y + radius);
    this.ctx.lineTo(x, y + radius/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawCalloutSquare(x, y, size) {
    const width = size * 0.8;
    const height = size * 0.6;

    // 主方形
    this.ctx.beginPath();
    this.ctx.rect(x - width/2, y - height/2 - size/6, width, height);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 指向三角
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/6, y + height/2 - size/6);
    this.ctx.lineTo(x, y + size/2);
    this.ctx.lineTo(x + width/6, y + height/2 - size/6);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawCalloutCloud(x, y, size) {
    // 雲形主體
    const radius = size / 8;
    this.ctx.beginPath();
    this.ctx.arc(x, y - size/6, radius * 2, 0, 2 * Math.PI);
    this.ctx.arc(x - radius * 1.2, y - size/6, radius * 1.2, 0, 2 * Math.PI);
    this.ctx.arc(x + radius * 1.2, y - size/6, radius * 1.2, 0, 2 * Math.PI);
    this.ctx.arc(x - radius/2, y - size/3, radius * 0.8, 0, 2 * Math.PI);
    this.ctx.arc(x + radius/2, y - size/3, radius * 0.8, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 小泡泡
    this.ctx.beginPath();
    this.ctx.arc(x - radius, y + radius, radius * 0.4, 0, 2 * Math.PI);
    this.ctx.arc(x - radius/2, y + radius * 1.5, radius * 0.2, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawBanner(x, y, size) {
    const width = size * 1.2;
    const height = size * 0.6;

    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/2);
    this.ctx.lineTo(x + width/3, y - height/2);
    this.ctx.lineTo(x + width/2, y);
    this.ctx.lineTo(x + width/3, y + height/2);
    this.ctx.lineTo(x - width/2, y + height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawRibbon(x, y, size) {
    const width = size * 1.4;
    const height = size * 0.5;

    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/2);
    this.ctx.lineTo(x + width/2, y - height/2);
    this.ctx.lineTo(x + width/3, y);
    this.ctx.lineTo(x + width/2, y + height/2);
    this.ctx.lineTo(x - width/2, y + height/2);
    this.ctx.lineTo(x - width/3, y);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // 特殊形狀
  drawStar4(x, y, size) {
    const outerRadius = size / 2;
    const innerRadius = size / 4;
    this.ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawStar6(x, y, size) {
    const radius = size / 2;
    // 上三角
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - radius);
    this.ctx.lineTo(x - radius * 0.866, y + radius/2);
    this.ctx.lineTo(x + radius * 0.866, y + radius/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 下三角
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + radius);
    this.ctx.lineTo(x + radius * 0.866, y - radius/2);
    this.ctx.lineTo(x - radius * 0.866, y - radius/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawLightning(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x - size/4, y - size/2);
    this.ctx.lineTo(x + size/6, y - size/2);
    this.ctx.lineTo(x - size/6, y - size/6);
    this.ctx.lineTo(x + size/4, y - size/6);
    this.ctx.lineTo(x - size/8, y + size/6);
    this.ctx.lineTo(x + size/8, y + size/6);
    this.ctx.lineTo(x + size/4, y + size/2);
    this.ctx.lineTo(x - size/6, y + size/2);
    this.ctx.lineTo(x + size/6, y + size/6);
    this.ctx.lineTo(x - size/4, y + size/6);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawGear(x, y, size) {
    const outerRadius = size / 2;
    const innerRadius = size / 3;
    const teeth = 8;

    this.ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i * Math.PI) / teeth;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }

    // 中心圓
    this.ctx.beginPath();
    this.ctx.arc(x, y, innerRadius / 2, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // 幾何圖形
  drawParallelogram(x, y, size) {
    const width = size * 1.2;
    const height = size * 0.8;
    const skew = width * 0.2;

    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2 + skew, y - height/2);
    this.ctx.lineTo(x + width/2 + skew, y - height/2);
    this.ctx.lineTo(x + width/2 - skew, y + height/2);
    this.ctx.lineTo(x - width/2 - skew, y + height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawTrapezoid(x, y, size) {
    const topWidth = size * 0.6;
    const bottomWidth = size * 1.2;
    const height = size * 0.8;

    this.ctx.beginPath();
    this.ctx.moveTo(x - topWidth/2, y - height/2);
    this.ctx.lineTo(x + topWidth/2, y - height/2);
    this.ctx.lineTo(x + bottomWidth/2, y + height/2);
    this.ctx.lineTo(x - bottomWidth/2, y + height/2);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawEllipse(x, y, size) {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, size/2, size/3, 0, 0, 2 * Math.PI);
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawArc(x, y, size) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, size/2, 0, Math.PI);
    this.ctx.stroke();
  }

  drawSector(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, size/2, -Math.PI/4, Math.PI/4);
    this.ctx.closePath();
    if (this.params.filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }
}

// 動畫幀生成器
class FrameGenerator {
  constructor(animationEngine) {
    this.engine = animationEngine;
    this.frames = [];
  }

  // 生成動畫幀序列
  async generateFrames(params, onProgress = null) {
    const { fps, duration } = params;
    const frameCount = fps * duration;
    const frameDelay = 1000 / fps;

    this.frames = [];
    this.engine.setParams(params);

    for (let i = 0; i < frameCount; i++) {
      const timestamp = (i / fps) * 1000;

      // 渲染當前幀
      this.engine.render(timestamp);

      // 獲取幀數據
      const dataURL = this.engine.getFrameDataURL();
      this.frames.push({
        index: i,
        timestamp: timestamp,
        dataURL: dataURL,
        filename: `luna-frame-${i.toString().padStart(3, '0')}.png`
      });

      // 回調進度
      if (onProgress) {
        onProgress(i + 1, frameCount);
      }

      // 讓瀏覽器有時間更新 UI
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    return this.frames;
  }

  // 下載所有幀 (已棄用 - 使用輸出管理器)
  async downloadFrames(onProgress = null) {
    console.warn('⚠️ downloadFrames 方法已棄用，請使用輸出管理器的 savePNGFrames');

    // 為了向後相容，返回幀數據而不是下載
    if (onProgress) {
      onProgress(this.frames.length, this.frames.length);
    }

    console.log(`📁 ${this.frames.length} 個幀已準備好，請使用輸出管理器保存`);
    return this.frames;
  }

  // 獲取幀數據 (用於輸出管理器)
  getFramesData() {
    return this.frames;
  }

  // 清除幀數據
  clearFrames() {
    this.frames = [];
  }
}

// 匯出類別
window.AnimationEngine = AnimationEngine;
window.CircleAnimationEngine = CircleAnimationEngine;
window.FrameGenerator = FrameGenerator;
